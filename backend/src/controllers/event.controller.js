import { EventService } from "../services/event.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export class EventController {
  static async createEvent(req, res, next) {
    try {
      const eventData = req.body;
      const adminId = req.user._id;

      const event = await EventService.createEvent(eventData, adminId);

      return res.status(201).json(
        new ApiResponse(201, event, "Event created successfully")
      );
    } catch (error) {
      next(error);
    }
  }

  static async getEvent(req, res, next) {
    try {
      const { eventId } = req.params;

      const event = await EventService.getEventById(eventId);

      return res.status(200).json(
        new ApiResponse(200, event, "Event retrieved successfully")
      );
    } catch (error) {
      next(error);
    }
  }

  static async getAllEvents(req, res, next) {
    try {
      const filters = req.query;

      const events = await EventService.getAllEvents(filters);

      return res.status(200).json(
        new ApiResponse(200, events, "Events retrieved successfully")
      );
    } catch (error) {
      next(error);
    }
  }

  static async updateEvent(req, res, next) {
    try {
      const { eventId } = req.params;
      const updateData = req.body;
      const adminId = req.user._id;

      const event = await EventService.updateEvent(eventId, updateData, adminId);

      return res.status(200).json(
        new ApiResponse(200, event, "Event updated successfully")
      );
    } catch (error) {
      next(error);
    }
  }

  static async deleteEvent(req, res, next) {
    try {
      const { eventId } = req.params;
      const adminId = req.user._id;

      const result = await EventService.deleteEvent(eventId, adminId);

      return res.status(200).json(
        new ApiResponse(200, result, "Event deleted successfully")
      );
    } catch (error) {
      next(error);
    }
  }

  static async searchEvents(req, res, next) {
    try {
      const { query } = req.query;

      const events = await EventService.searchEvents(query);

      return res.status(200).json(
        new ApiResponse(200, events, "Search results retrieved successfully")
      );
    } catch (error) {
      next(error);
    }
  }

  static async getEventStats(req, res, next) {
    try {
      const { eventId } = req.params;

      const stats = await EventService.getEventStats(eventId);

      return res.status(200).json(
        new ApiResponse(200, stats, "Event stats retrieved successfully")
      );
    } catch (error) {
      next(error);
    }
  }
}
