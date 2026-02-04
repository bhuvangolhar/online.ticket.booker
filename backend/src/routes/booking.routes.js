import express from "express";
import { BookingController } from "../controllers/booking.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";
import { USER_ROLES } from "../utils/constants.js";

const router = express.Router();

// User routes
router.post("/", authMiddleware, BookingController.createBooking);
router.get("/my-bookings", authMiddleware, BookingController.getUserBookings);
router.get("/:bookingId", authMiddleware, BookingController.getBooking);
router.post("/:bookingId/confirm", authMiddleware, BookingController.confirmBooking);
router.post("/:bookingId/cancel", authMiddleware, BookingController.cancelBooking);

// Admin routes
router.get(
  "/event/:eventId",
  authMiddleware,
  roleMiddleware([USER_ROLES.ADMIN]),
  BookingController.getEventBookings
);

export default router;
