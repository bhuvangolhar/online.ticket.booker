const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/ticket-booker";
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRY = process.env.JWT_EXPIRY || "7d";
const NODE_ENV = process.env.NODE_ENV || "development";

export const DB_CONSTANTS = {
  MONGODB_URI,
  PORT,
  JWT_SECRET,
  JWT_EXPIRY,
  NODE_ENV,
};

export const USER_ROLES = {
  USER: "USER",
  ADMIN: "ADMIN",
};

export const BOOKING_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  CANCELLED: "CANCELLED",
  EXPIRED: "EXPIRED",
};

export const PAYMENT_STATUS = {
  PENDING: "PENDING",
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
};

export const SEAT_STATUS = {
  AVAILABLE: "AVAILABLE",
  BOOKED: "BOOKED",
  LOCKED: "LOCKED",
};

export const TICKET_TYPES = {
  MOVIE: "MOVIE",
  BUS: "BUS",
  TRAIN: "TRAIN",
  EVENT: "EVENT",
};

export const SEAT_LOCK_EXPIRY = 10 * 60 * 1000; // 10 minutes in milliseconds
