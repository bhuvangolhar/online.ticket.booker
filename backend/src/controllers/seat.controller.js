import { SeatService } from "../services/seat.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export class SeatController {
  static async createSeats(req, res, next) {
    try {
      const { eventId } = req.params;
      const seatsData = req.body;
      const adminId = req.user._id;

      const seats = await SeatService.createSeats(eventId, seatsData, adminId);

      return res.status(201).json(
        new ApiResponse(201, seats, "Seats created successfully")
      );
    } catch (error) {
      next(error);
    }
  }

  static async getAvailableSeats(req, res, next) {
    try {
      const { eventId } = req.params;

      const seats = await SeatService.getAvailableSeats(eventId);

      return res.status(200).json(
        new ApiResponse(200, seats, "Available seats retrieved successfully")
      );
    } catch (error) {
      next(error);
    }
  }

  static async getSeatsByEvent(req, res, next) {
    try {
      const { eventId } = req.params;

      const seats = await SeatService.getSeatsByEvent(eventId);

      return res.status(200).json(
        new ApiResponse(200, seats, "Seats retrieved successfully")
      );
    } catch (error) {
      next(error);
    }
  }

  static async lockSeats(req, res, next) {
    try {
      const { eventId } = req.params;
      const { seatIds } = req.body;
      const userId = req.user._id;

      const result = await SeatService.lockSeats(eventId, seatIds, userId);

      return res.status(200).json(
        new ApiResponse(200, result, "Seats locked successfully")
      );
    } catch (error) {
      next(error);
    }
  }

  static async unlockSeats(req, res, next) {
    try {
      const { seatIds } = req.body;
      const userId = req.user._id;

      const result = await SeatService.unlockSeats(seatIds, userId);

      return res.status(200).json(
        new ApiResponse(200, result, "Seats unlocked successfully")
      );
    } catch (error) {
      next(error);
    }
  }

  static async getSeatById(req, res, next) {
    try {
      const { seatId } = req.params;

      const seat = await SeatService.getSeatById(seatId);

      return res.status(200).json(
        new ApiResponse(200, seat, "Seat retrieved successfully")
      );
    } catch (error) {
      next(error);
    }
  }
}
