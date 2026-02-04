import express from "express";
import { SeatController } from "../controllers/seat.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";
import { USER_ROLES } from "../utils/constants.js";

const router = express.Router();

// Public routes
router.get("/event/:eventId", SeatController.getSeatsByEvent);
router.get("/event/:eventId/available", SeatController.getAvailableSeats);
router.get("/:seatId", SeatController.getSeatById);

// Admin routes
router.post(
  "/event/:eventId",
  authMiddleware,
  roleMiddleware([USER_ROLES.ADMIN]),
  SeatController.createSeats
);

// User routes
router.post("/lock", authMiddleware, SeatController.lockSeats);
router.post("/unlock", authMiddleware, SeatController.unlockSeats);

export default router;
