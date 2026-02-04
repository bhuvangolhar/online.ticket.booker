import { db, saveCollection } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";
import { PAYMENT_STATUS, BOOKING_STATUS } from "../utils/constants.js";

// Generate unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Simulate payment gateway processing
function processPaymentGateway(amount, paymentMethod) {
  // In real world, this would call Stripe, PayPal, Razorpay, etc.
  // For demo, we'll simulate success rate
  const successRate = 0.95; // 95% success rate
  return Math.random() < successRate;
}

export class PaymentService {
  static async initiatePayment(bookingId, userId, paymentMethod) {
    if (!["card", "wallet", "upi"].includes(paymentMethod)) {
      throw new ApiError(400, "Invalid payment method");
    }

    const booking = db.bookings.find((b) => b._id === bookingId);
    if (!booking) {
      throw new ApiError(404, "Booking not found");
    }

    if (booking.userId !== userId) {
      throw new ApiError(403, "Not authorized for this booking");
    }

    if (booking.bookingStatus !== "confirmed") {
      throw new ApiError(400, "Booking must be confirmed before payment");
    }

    // Check if payment already exists
    const existingPayment = db.payments.find(
      (p) => p.bookingId === bookingId && p.paymentStatus !== PAYMENT_STATUS.FAILED
    );

    if (existingPayment) {
      throw new ApiError(400, "Payment already in progress for this booking");
    }

    const payment = {
      _id: generateId(),
      bookingId,
      userId,
      amount: booking.totalPrice,
      paymentMethod,
      paymentStatus: PAYMENT_STATUS.PENDING,
      transactionId: null,
      failureReason: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    db.payments.push(payment);
    saveCollection("payments");

    return {
      _id: payment._id,
      bookingId,
      amount: booking.totalPrice,
      paymentStatus: PAYMENT_STATUS.PENDING,
    };
  }

  static async processPayment(paymentId, userId) {
    const payment = db.payments.find((p) => p._id === paymentId);
    if (!payment) {
      throw new ApiError(404, "Payment not found");
    }

    if (payment.userId !== userId) {
      throw new ApiError(403, "Not authorized for this payment");
    }

    if (payment.paymentStatus !== PAYMENT_STATUS.PENDING) {
      throw new ApiError(400, `Payment is already ${payment.paymentStatus}`);
    }

    // Process payment through gateway
    const isSuccessful = processPaymentGateway(payment.amount, payment.paymentMethod);

    payment.updatedAt = new Date();

    if (isSuccessful) {
      payment.paymentStatus = PAYMENT_STATUS.COMPLETED;
      payment.transactionId = `TXN-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

      // Update booking status
      const booking = db.bookings.find((b) => b._id === payment.bookingId);
      if (booking) {
        booking.bookingStatus = "completed";
        booking.updatedAt = new Date();
      }

      saveCollection("payments");
      saveCollection("bookings");

      return {
        _id: payment._id,
        paymentStatus: PAYMENT_STATUS.COMPLETED,
        transactionId: payment.transactionId,
        amount: payment.amount,
      };
    } else {
      payment.paymentStatus = PAYMENT_STATUS.FAILED;
      payment.failureReason = "Payment declined by provider";

      saveCollection("payments");

      throw new ApiError(402, "Payment failed. Please try again or use a different payment method");
    }
  }

  static async getPaymentDetails(paymentId, userId) {
    const payment = db.payments.find((p) => p._id === paymentId);
    if (!payment) {
      throw new ApiError(404, "Payment not found");
    }

    if (payment.userId !== userId) {
      throw new ApiError(403, "Not authorized to view this payment");
    }

    const booking = db.bookings.find((b) => b._id === payment.bookingId);

    return {
      ...payment,
      booking: booking || null,
    };
  }

  static async getUserPayments(userId) {
    const payments = db.payments.filter((p) => p.userId === userId);

    const result = payments.map((payment) => ({
      ...payment,
      booking: db.bookings.find((b) => b._id === payment.bookingId),
    }));

    return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  static async getEventPayments(eventId, adminId) {
    // Verify admin access
    const event = db.events.find((e) => e._id === eventId);
    if (!event) {
      throw new ApiError(404, "Event not found");
    }

    if (event.createdBy !== adminId) {
      throw new ApiError(403, "Not authorized to view payments for this event");
    }

    // Get all bookings for this event
    const eventBookings = db.bookings.filter((b) => b.eventId === eventId);

    // Get payments for these bookings
    const payments = db.payments.filter((p) =>
      eventBookings.some((b) => b._id === p.bookingId)
    );

    const result = payments.map((payment) => ({
      ...payment,
      booking: db.bookings.find((b) => b._id === payment.bookingId),
      user: db.users.find((u) => u._id === payment.userId),
    }));

    return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  static async getPaymentStatistics(eventId, adminId) {
    // Verify admin access
    const event = db.events.find((e) => e._id === eventId);
    if (!event) {
      throw new ApiError(404, "Event not found");
    }

    if (event.createdBy !== adminId) {
      throw new ApiError(403, "Not authorized to view statistics for this event");
    }

    // Get all bookings for this event
    const eventBookings = db.bookings.filter((b) => b.eventId === eventId);

    // Get payments for these bookings
    const payments = db.payments.filter((p) =>
      eventBookings.some((b) => b._id === p.bookingId)
    );

    const completedPayments = payments.filter((p) => p.paymentStatus === PAYMENT_STATUS.COMPLETED);
    const totalRevenue = completedPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalTransactions = completedPayments.length;

    return {
      totalPaymentCount: payments.length,
      completedPaymentCount: completedPayments.length,
      failedPaymentCount: payments.filter((p) => p.paymentStatus === PAYMENT_STATUS.FAILED).length,
      pendingPaymentCount: payments.filter((p) => p.paymentStatus === PAYMENT_STATUS.PENDING)
        .length,
      totalRevenue,
      averageTransactionAmount:
        totalTransactions > 0 ? totalRevenue / totalTransactions : 0,
    };
  }

  static async refundPayment(paymentId, userId, adminId) {
    const payment = db.payments.find((p) => p._id === paymentId);
    if (!payment) {
      throw new ApiError(404, "Payment not found");
    }

    // Check authorization - either user or event admin
    let isAuthorized = payment.userId === userId;

    if (!isAuthorized) {
      const booking = db.bookings.find((b) => b._id === payment.bookingId);
      const event = db.events.find((e) => e._id === booking.eventId);
      isAuthorized = event && event.createdBy === adminId;
    }

    if (!isAuthorized) {
      throw new ApiError(403, "Not authorized to refund this payment");
    }

    if (payment.paymentStatus !== PAYMENT_STATUS.COMPLETED) {
      throw new ApiError(400, "Only completed payments can be refunded");
    }

    // Process refund
    payment.paymentStatus = PAYMENT_STATUS.REFUNDED;
    payment.updatedAt = new Date();

    // Update booking status
    const booking = db.bookings.find((b) => b._id === payment.bookingId);
    if (booking) {
      booking.bookingStatus = "refunded";
      booking.updatedAt = new Date();
    }

    saveCollection("payments");
    saveCollection("bookings");

    return {
      _id: payment._id,
      paymentStatus: PAYMENT_STATUS.REFUNDED,
      amount: payment.amount,
    };
  }
}
