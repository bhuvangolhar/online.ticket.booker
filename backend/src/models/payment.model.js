import mongoose from "mongoose";
import { PAYMENT_STATUS } from "../utils/constants.js";

const paymentSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    paymentStatus: {
      type: String,
      enum: [PAYMENT_STATUS.PENDING, PAYMENT_STATUS.SUCCESS, PAYMENT_STATUS.FAILED],
      default: PAYMENT_STATUS.PENDING,
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ["CREDIT_CARD", "DEBIT_CARD", "NET_BANKING", "UPI", "WALLET"],
      required: [true, "Payment method is required"],
    },
    transactionId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    gatewayResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    failureReason: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

paymentSchema.index({ userId: 1, paymentStatus: 1 });
paymentSchema.index({ bookingId: 1 });
paymentSchema.index({ createdAt: 1 });

export const Payment = mongoose.model("Payment", paymentSchema);
