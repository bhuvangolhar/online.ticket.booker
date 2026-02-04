import { db, saveCollection } from "../config/db.js";
import { SeatService } from "./seat.service.js";
import { ApiError } from "../utils/ApiError.js";
import { BOOKING_STATUS, SEAT_STATUS } from "../utils/constants.js";

// Generate unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export class BookingService {
  static async createBooking(eventId, seatIds, userId) {
    if (!seatIds || seatIds.length === 0) {
      throw new ApiError(400, "Seat IDs are required");
    }

    // Get event and validate
    const event = db.events.find((e) => e._id === eventId);
    if (!event) {
      throw new ApiError(404, "Event not found");
    }

    // Get seats and validate
    const seats = db.seats.filter((s) => seatIds.includes(s._id) && s.eventId === eventId);
    if (seats.length !== seatIds.length) {
      throw new ApiError(400, "Some seats not found");
    }

    // Calculate total price
    const totalPrice = seats.reduce((sum, seat) => sum + seat.price, 0);

    // Create booking
    const expiryTime = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    const booking = {
      _id: generateId(),
      userId,
      eventId,
      seats: seatIds,
      totalPrice,
      bookingStatus: BOOKING_STATUS.PENDING,
      bookingReference: `BK-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      expiryTime,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Lock seats
    const lockedUntil = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    seats.forEach((seat) => {
      if (seat.status !== SEAT_STATUS.AVAILABLE) {
        throw new ApiError(400, "Could not reserve all seats - some may have been booked");
      }
      seat.status = SEAT_STATUS.LOCKED;
      seat.lockedBy = userId;
      seat.lockedUntil = lockedUntil;
      seat.updatedAt = new Date();
    });

    db.bookings.push(booking);
    saveCollection("bookings");
    saveCollection("seats");

    return {
      _id: booking._id,
      bookingReference: booking.bookingReference,
      eventId,
      seats: seatIds,
      totalPrice,
      bookingStatus: BOOKING_STATUS.PENDING,
      expiryTime,
    };
  }

  static async confirmBooking(bookingId, userId) {
    const booking = db.bookings.find((b) => b._id === bookingId);
    if (!booking) {
      throw new ApiError(404, "Booking not found");
    }

    if (booking.userId !== userId) {
      throw new ApiError(403, "Not authorized to confirm this booking");
    }

    if (booking.bookingStatus !== BOOKING_STATUS.PENDING) {
      throw new ApiError(400, `Booking is already ${booking.bookingStatus}`);
    }

    // Check if booking has expired
    if (new Date() > booking.expiryTime) {
      throw new ApiError(400, "Booking has expired");
    }

    // Book the seats
    await SeatService.bookSeats(booking.eventId, booking.seats, userId, bookingId);

    // Update booking status
    booking.bookingStatus = BOOKING_STATUS.CONFIRMED;
    booking.updatedAt = new Date();

    saveCollection("bookings");

    return {
      _id: booking._id,
      bookingReference: booking.bookingReference,
      bookingStatus: BOOKING_STATUS.CONFIRMED,
    };
  }

  static async cancelBooking(bookingId, userId) {
    const booking = db.bookings.find((b) => b._id === bookingId);
    if (!booking) {
      throw new ApiError(404, "Booking not found");
    }

    if (booking.userId !== userId) {
      throw new ApiError(403, "Not authorized to cancel this booking");
    }

    if (booking.bookingStatus === BOOKING_STATUS.CANCELLED) {
      throw new ApiError(400, "Booking is already cancelled");
    }

    if (booking.bookingStatus === BOOKING_STATUS.EXPIRED) {
      throw new ApiError(400, "Cannot cancel an expired booking");
    }

    // Release the seats
    if (booking.bookingStatus === BOOKING_STATUS.CONFIRMED) {
      booking.seats.forEach((seatId) => {
        const seat = db.seats.find((s) => s._id === seatId);
        if (seat && seat.status === SEAT_STATUS.BOOKED) {
          seat.status = SEAT_STATUS.AVAILABLE;
          seat.bookedBy = null;
          seat.bookingId = null;
          seat.updatedAt = new Date();
        }
      });

      // Restore available seats
      const event = db.events.find((e) => e._id === booking.eventId);
      if (event) {
        event.availableSeats += booking.seats.length;
      }
    } else if (booking.bookingStatus === BOOKING_STATUS.PENDING) {
      // If pending, unlock the seats
      booking.seats.forEach((seatId) => {
        const seat = db.seats.find((s) => s._id === seatId);
        if (seat && seat.status === SEAT_STATUS.LOCKED) {
          seat.status = SEAT_STATUS.AVAILABLE;
          seat.lockedBy = null;
          seat.lockedUntil = null;
          seat.updatedAt = new Date();
        }
      });
    }

    // Update booking status
    booking.bookingStatus = BOOKING_STATUS.CANCELLED;
    booking.updatedAt = new Date();

    saveCollection("bookings");
    saveCollection("seats");
    saveCollection("events");

    return {
      _id: booking._id,
      bookingReference: booking.bookingReference,
      bookingStatus: BOOKING_STATUS.CANCELLED,
    };
  }

  static async getBookingById(bookingId, userId) {
    const booking = db.bookings.find((b) => b._id === bookingId);
    if (!booking) {
      throw new ApiError(404, "Booking not found");
    }

    if (booking.userId !== userId) {
      throw new ApiError(403, "Not authorized to view this booking");
    }

    const event = db.events.find((e) => e._id === booking.eventId);
    const seats = booking.seats.map((sId) => db.seats.find((s) => s._id === sId));

    return {
      ...booking,
      eventId: event || null,
      seats: seats.filter((s) => s),
    };
  }

  static async getUserBookings(userId, filters = {}) {
    let bookings = db.bookings.filter((b) => b.userId === userId);

    if (filters.status) {
      bookings = bookings.filter((b) => b.bookingStatus === filters.status);
    }

    const result = bookings.map((booking) => ({
      ...booking,
      eventId: db.events.find((e) => e._id === booking.eventId),
      seats: booking.seats.map((sId) => db.seats.find((s) => s._id === sId)),
    }));

    return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  static async getEventBookings(eventId, adminId) {
    // Verify admin access
    const event = db.events.find((e) => e._id === eventId);
    if (!event) {
      throw new ApiError(404, "Event not found");
    }

    if (event.createdBy !== adminId) {
      throw new ApiError(403, "Not authorized to view bookings for this event");
    }

    const bookings = db.bookings.filter(
      (b) => b.eventId === eventId && b.bookingStatus !== BOOKING_STATUS.CANCELLED
    );

    const result = bookings.map((booking) => ({
      ...booking,
      userId: db.users.find((u) => u._id === booking.userId),
      seats: booking.seats.map((sId) => db.seats.find((s) => s._id === sId)),
    }));

    return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  static async expireBookings() {
    // Expire pending bookings and release seats
    const now = new Date();
    const expiredBookings = db.bookings.filter(
      (b) => b.bookingStatus === BOOKING_STATUS.PENDING && new Date(b.expiryTime) < now
    );

    expiredBookings.forEach((booking) => {
      // Release locked seats
      booking.seats.forEach((seatId) => {
        const seat = db.seats.find((s) => s._id === seatId);
        if (seat && seat.status === SEAT_STATUS.LOCKED) {
          seat.status = SEAT_STATUS.AVAILABLE;
          seat.lockedBy = null;
          seat.lockedUntil = null;
          seat.updatedAt = new Date();
        }
      });

      // Update booking status
      booking.bookingStatus = BOOKING_STATUS.EXPIRED;
      booking.updatedAt = new Date();
    });

    if (expiredBookings.length > 0) {
      saveCollection("bookings");
      saveCollection("seats");
    }

    return expiredBookings.length;
  }
}
