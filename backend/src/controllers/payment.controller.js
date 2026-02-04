import { PaymentService } from "../services/payment.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export class PaymentController {
  static async initiatePayment(req, res, next) {
    try {
      const { bookingId, paymentMethod } = req.body;
      const userId = req.user._id;

      const payment = await PaymentService.initiatePayment(
        bookingId,
        userId,
        paymentMethod
      );

      return res.status(201).json(
        new ApiResponse(201, payment, "Payment initiated successfully")
      );
    } catch (error) {
      next(error);
    }
  }

  static async processPayment(req, res, next) {
    try {
      const { paymentId } = req.params;
      const userId = req.user._id;
      const gatewayResponse = req.body;

      const payment = await PaymentService.processPayment(
        paymentId,
        userId,
        gatewayResponse
      );

      return res.status(200).json(
        new ApiResponse(200, payment, "Payment processed successfully")
      );
    } catch (error) {
      next(error);
    }
  }

  static async getPaymentStatus(req, res, next) {
    try {
      const { paymentId } = req.params;
      const userId = req.user._id;

      const payment = await PaymentService.getPaymentStatus(paymentId, userId);

      return res.status(200).json(
        new ApiResponse(200, payment, "Payment status retrieved successfully")
      );
    } catch (error) {
      next(error);
    }
  }

  static async getUserPayments(req, res, next) {
    try {
      const userId = req.user._id;

      const payments = await PaymentService.getUserPayments(userId);

      return res.status(200).json(
        new ApiResponse(200, payments, "User payments retrieved successfully")
      );
    } catch (error) {
      next(error);
    }
  }

  static async getPaymentsByBooking(req, res, next) {
    try {
      const { bookingId } = req.params;

      const payments = await PaymentService.getPaymentsByBooking(bookingId);

      return res.status(200).json(
        new ApiResponse(200, payments, "Payment records retrieved successfully")
      );
    } catch (error) {
      next(error);
    }
  }

  static async retryPayment(req, res, next) {
    try {
      const { paymentId } = req.params;
      const userId = req.user._id;

      const payment = await PaymentService.retryPayment(paymentId, userId);

      return res.status(201).json(
        new ApiResponse(201, payment, "Payment retry initiated successfully")
      );
    } catch (error) {
      next(error);
    }
  }

  static async getEventRevenue(req, res, next) {
    try {
      const { eventId } = req.params;
      const adminId = req.user._id;

      const revenue = await PaymentService.getEventRevenue(eventId, adminId);

      return res.status(200).json(
        new ApiResponse(200, revenue, "Event revenue retrieved successfully")
      );
    } catch (error) {
      next(error);
    }
  }
}
