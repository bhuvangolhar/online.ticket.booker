import mongoose from "mongoose";
import { TICKET_TYPES } from "../utils/constants.js";

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    ticketType: {
      type: String,
      enum: [TICKET_TYPES.MOVIE, TICKET_TYPES.BUS, TICKET_TYPES.TRAIN, TICKET_TYPES.EVENT],
      required: [true, "Ticket type is required"],
      index: true,
    },
    venue: {
      type: String,
      required: [true, "Venue is required"],
    },
    startDateTime: {
      type: Date,
      required: [true, "Start date and time is required"],
      index: true,
    },
    endDateTime: {
      type: Date,
      required: [true, "End date and time is required"],
    },
    basePrice: {
      type: Number,
      required: [true, "Base price is required"],
      min: [0, "Price cannot be negative"],
    },
    totalSeats: {
      type: Number,
      required: [true, "Total seats is required"],
      min: [1, "Must have at least 1 seat"],
    },
    availableSeats: {
      type: Number,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

eventSchema.index({ startDateTime: 1, isActive: 1 });
eventSchema.index({ ticketType: 1, isActive: 1 });
eventSchema.index({ createdBy: 1 });

export const Event = mongoose.model("Event", eventSchema);
