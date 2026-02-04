import express from "express";
import { EventController } from "../controllers/event.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";
import { USER_ROLES } from "../utils/constants.js";

const router = express.Router();

// Public routes
router.get("/", EventController.getAllEvents);
router.get("/search", EventController.searchEvents);
router.get("/:eventId", EventController.getEvent);
router.get("/:eventId/stats", EventController.getEventStats);

// Admin routes
router.post(
  "/",
  authMiddleware,
  roleMiddleware([USER_ROLES.ADMIN]),
  EventController.createEvent
);
router.put(
  "/:eventId",
  authMiddleware,
  roleMiddleware([USER_ROLES.ADMIN]),
  EventController.updateEvent
);
router.delete(
  "/:eventId",
  authMiddleware,
  roleMiddleware([USER_ROLES.ADMIN]),
  EventController.deleteEvent
);

export default router;
