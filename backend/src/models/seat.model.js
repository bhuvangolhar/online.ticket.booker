import mongoose from "mongoose";
import { SEAT_STATUS } from "../utils/constants.js";

const seatSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    seatNumber: {
      type: String,
      required: [true, "Seat number is required"],
    },
    row: {
      type: String,
      required: [true, "Row is required"],
    },
    column: {
      type: Number,
      required: [true, "Column is required"],
    },
    status: {
      type: String,
      enum: [SEAT_STATUS.AVAILABLE, SEAT_STATUS.BOOKED, SEAT_STATUS.LOCKED],
      default: SEAT_STATUS.AVAILABLE,
      index: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    lockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    lockedUntil: {
      type: Date,
      default: null,
    },
    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },
  },
  { timestamps: true }
);

// Compound index for efficient seat queries
seatSchema.index({ eventId: 1, status: 1 });
seatSchema.index({ eventId: 1, seatNumber: 1 }, { unique: true });
seatSchema.index({ eventId: 1, row: 1, column: 1 }, { unique: true });
seatSchema.index({ lockedUntil: 1 }, { expireAfterSeconds: 0 }); // TTL for expired locks

export const Seat = mongoose.model("Seat", seatSchema);
