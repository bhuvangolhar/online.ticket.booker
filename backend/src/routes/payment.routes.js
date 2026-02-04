import express from "express";
import { PaymentController } from "../controllers/payment.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";
import { USER_ROLES } from "../utils/constants.js";

const router = express.Router();

// User routes
router.post("/", authMiddleware, PaymentController.initiatePayment);
router.post("/:paymentId/process", authMiddleware, PaymentController.processPayment);
router.get("/:paymentId/status", authMiddleware, PaymentController.getPaymentStatus);
router.get("/my-payments", authMiddleware, PaymentController.getUserPayments);
router.post("/:paymentId/retry", authMiddleware, PaymentController.retryPayment);
router.get("/booking/:bookingId", authMiddleware, PaymentController.getPaymentsByBooking);

// Admin routes
router.get(
  "/event/:eventId/revenue",
  authMiddleware,
  roleMiddleware([USER_ROLES.ADMIN]),
  PaymentController.getEventRevenue
);

export default router;
