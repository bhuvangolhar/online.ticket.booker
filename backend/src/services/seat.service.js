import { db, saveCollection } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";
import { SEAT_STATUS, SEAT_LOCK_EXPIRY } from "../utils/constants.js";

// Generate unique ID for local storage
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export class SeatService {
  static async createSeats(eventId, seatsData, adminId) {
    // Verify event exists and user is admin/creator
    const event = db.events.find((e) => e._id === eventId);
    if (!event) {
      throw new ApiError(404, "Event not found");
    }

    if (event.createdBy !== adminId) {
      throw new ApiError(403, "Not authorized to create seats for this event");
    }

    // Validate seats data
    if (!seatsData || seatsData.length === 0) {
      throw new ApiError(400, "Seats data is required");
    }

    if (seatsData.length > event.totalSeats) {
      throw new ApiError(400, "Number of seats exceeds event capacity");
    }

    const seats = seatsData.map((seat) => ({
      _id: generateId(),
      ...seat,
      eventId,
      status: SEAT_STATUS.AVAILABLE,
      lockedBy: null,
      lockedUntil: null,
      bookedBy: null,
      bookingId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    db.seats.push(...seats);
    saveCollection("seats");

    return seats;
  }

  static async getAvailableSeats(eventId) {
    const event = db.events.find((e) => e._id === eventId);
    if (!event) {
      throw new ApiError(404, "Event not found");
    }

    return db.seats
      .filter((s) => s.eventId === eventId && s.status === SEAT_STATUS.AVAILABLE)
      .map((s) => ({
        _id: s._id,
        seatNumber: s.seatNumber,
        row: s.row,
        column: s.column,
        price: s.price,
      }));
  }

  static async getSeatsByEvent(eventId) {
    const event = db.events.find((e) => e._id === eventId);
    if (!event) {
      throw new ApiError(404, "Event not found");
    }

    return db.seats
      .filter((s) => s.eventId === eventId)
      .map((s) => ({
        _id: s._id,
        seatNumber: s.seatNumber,
        row: s.row,
        column: s.column,
        status: s.status,
        price: s.price,
      }));
  }

  static async lockSeats(eventId, seatIds, userId) {
    if (!seatIds || seatIds.length === 0) {
      throw new ApiError(400, "Seat IDs are required");
    }

    const event = db.events.find((e) => e._id === eventId);
    if (!event) {
      throw new ApiError(404, "Event not found");
    }

    // Check all seats exist and are available
    const seats = db.seats.filter((s) => seatIds.includes(s._id) && s.eventId === eventId);
    if (seats.length !== seatIds.length) {
      throw new ApiError(400, "Some seats not found");
    }

    const unavailableSeats = seats.filter((s) => s.status !== SEAT_STATUS.AVAILABLE);
    if (unavailableSeats.length > 0) {
      throw new ApiError(400, "Some seats are not available");
    }

    // Lock seats
    const lockedUntil = new Date(Date.now() + SEAT_LOCK_EXPIRY);
    seats.forEach((seat) => {
      seat.status = SEAT_STATUS.LOCKED;
      seat.lockedBy = userId;
      seat.lockedUntil = lockedUntil;
      seat.updatedAt = new Date();
    });

    saveCollection("seats");

    return {
      lockedSeats: seatIds,
      lockedUntil,
      message: "Seats locked successfully",
    };
  }

  static async unlockSeats(seatIds, userId) {
    if (!seatIds || seatIds.length === 0) {
      throw new ApiError(400, "Seat IDs are required");
    }

    let unlockedCount = 0;
    db.seats.forEach((seat) => {
      if (
        seatIds.includes(seat._id) &&
        seat.status === SEAT_STATUS.LOCKED &&
        seat.lockedBy === userId
      ) {
        seat.status = SEAT_STATUS.AVAILABLE;
        seat.lockedBy = null;
        seat.lockedUntil = null;
        seat.updatedAt = new Date();
        unlockedCount++;
      }
    });

    saveCollection("seats");

    return {
      unlockedSeats: unlockedCount,
      message: "Seats unlocked successfully",
    };
  }

  static async bookSeats(eventId, seatIds, userId, bookingId) {
    if (!seatIds || seatIds.length === 0) {
      throw new ApiError(400, "Seat IDs are required");
    }

    // Check seats are locked by user
    const seats = db.seats.filter((s) => seatIds.includes(s._id) && s.eventId === eventId);
    if (seats.length !== seatIds.length) {
      throw new ApiError(400, "Some seats not found");
    }

    const unlockedSeats = seats.filter(
      (s) => s.status !== SEAT_STATUS.LOCKED || s.lockedBy !== userId
    );
    if (unlockedSeats.length > 0) {
      throw new ApiError(400, "Some seats are not locked by you");
    }

    // Book seats
    seats.forEach((seat) => {
      seat.status = SEAT_STATUS.BOOKED;
      seat.bookedBy = userId;
      seat.bookingId = bookingId;
      seat.lockedBy = null;
      seat.lockedUntil = null;
      seat.updatedAt = new Date();
    });

    // Update event available seats
    const event = db.events.find((e) => e._id === eventId);
    if (event) {
      event.availableSeats -= seatIds.length;
    }

    saveCollection("seats");
    saveCollection("events");

    return {
      bookedSeats: seatIds.length,
      message: "Seats booked successfully",
    };
  }

  static async getSeatById(seatId) {
    const seat = db.seats.find((s) => s._id === seatId);
    if (!seat) {
      throw new ApiError(404, "Seat not found");
    }
    return seat;
  }

  static async expireLockedSeats() {
    // Clean up expired locks
    const now = new Date();
    let expiredCount = 0;

    db.seats.forEach((seat) => {
      if (
        seat.status === SEAT_STATUS.LOCKED &&
        seat.lockedUntil &&
        new Date(seat.lockedUntil) < now
      ) {
        seat.status = SEAT_STATUS.AVAILABLE;
        seat.lockedBy = null;
        seat.lockedUntil = null;
        seat.updatedAt = new Date();
        expiredCount++;
      }
    });

    if (expiredCount > 0) {
      saveCollection("seats");
    }

    return { expiredCount };
  }
}