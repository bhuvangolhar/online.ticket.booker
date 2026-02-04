import { BookingService } from "../services/booking.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export class BookingController {
  static async createBooking(req, res, next) {
    try {
      const { eventId, seatIds } = req.body;
      const userId = req.user._id;

      const booking = await BookingService.createBooking(eventId, seatIds, userId);

      return res.status(201).json(
        new ApiResponse(201, booking, "Booking created successfully")
      );
    } catch (error) {
      next(error);
    }
  }

  static async confirmBooking(req, res, next) {
    try {
      const { bookingId } = req.params;
      const userId = req.user._id;

      const booking = await BookingService.confirmBooking(bookingId, userId);

      return res.status(200).json(
        new ApiResponse(200, booking, "Booking confirmed successfully")
      );
    } catch (error) {
      next(error);
    }
  }

  static async cancelBooking(req, res, next) {
    try {
      const { bookingId } = req.params;
      const userId = req.user._id;

      const booking = await BookingService.cancelBooking(bookingId, userId);

      return res.status(200).json(
        new ApiResponse(200, booking, "Booking cancelled successfully")
      );
    } catch (error) {
      next(error);
    }
  }

  static async getBooking(req, res, next) {
    try {
      const { bookingId } = req.params;
      const userId = req.user._id;

      const booking = await BookingService.getBookingById(bookingId, userId);

      return res.status(200).json(
        new ApiResponse(200, booking, "Booking retrieved successfully")
      );
    } catch (error) {
      next(error);
    }
  }

  static async getUserBookings(req, res, next) {
    try {
      const userId = req.user._id;
      const filters = req.query;

      const bookings = await BookingService.getUserBookings(userId, filters);

      return res.status(200).json(
        new ApiResponse(200, bookings, "User bookings retrieved successfully")
      );
    } catch (error) {
      next(error);
    }
  }

  static async getEventBookings(req, res, next) {
    try {
      const { eventId } = req.params;
      const adminId = req.user._id;

      const bookings = await BookingService.getEventBookings(eventId, adminId);

      return res.status(200).json(
        new ApiResponse(200, bookings, "Event bookings retrieved successfully")
      );
    } catch (error) {
      next(error);
    }
  }
}
