import mongoose from "mongoose";
import { BOOKING_STATUS, PAYMENT_STATUS } from "../utils/constants.js";

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    seats: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Seat",
        required: true,
      },
    ],
    totalPrice: {
      type: Number,
      required: [true, "Total price is required"],
      min: [0, "Price cannot be negative"],
    },
    bookingStatus: {
      type: String,
      enum: [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.CANCELLED, BOOKING_STATUS.EXPIRED],
      default: BOOKING_STATUS.PENDING,
      index: true,
    },
    bookingReference: {
      type: String,
      unique: true,
      sparse: true,
    },
    expiryTime: {
      type: Date,
      required: true, // Booking expires if not confirmed within TTL
      index: true,
    },
  },
  { timestamps: true }
);

// Index for efficient queries
bookingSchema.index({ userId: 1, bookingStatus: 1 });
bookingSchema.index({ eventId: 1, bookingStatus: 1 });
bookingSchema.index({ expiryTime: 1 }, { expireAfterSeconds: 0 }); // TTL for expired bookings

// Generate unique booking reference
bookingSchema.pre("save", async function (next) {
  if (!this.bookingReference) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    this.bookingReference = `BK-${timestamp}-${random}`;
  }
  next();
});

export const Booking = mongoose.model("Booking", bookingSchema);
