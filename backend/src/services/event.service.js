import { db, saveCollection } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";

// Generate unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export class EventService {
  static async createEvent(eventData, adminId) {
    const {
      title,
      description,
      ticketType,
      venue,
      startDateTime,
      endDateTime,
      basePrice,
      totalSeats,
    } = eventData;

    // Validate input
    if (
      !title ||
      !description ||
      !ticketType ||
      !venue ||
      !startDateTime ||
      !endDateTime ||
      !basePrice ||
      !totalSeats
    ) {
      throw new ApiError(400, "All fields are required");
    }

    // Validate dates
    if (new Date(startDateTime) >= new Date(endDateTime)) {
      throw new ApiError(400, "Start date must be before end date");
    }

    // Create event
    const event = {
      _id: generateId(),
      title,
      description,
      ticketType,
      venue,
      startDateTime: new Date(startDateTime),
      endDateTime: new Date(endDateTime),
      basePrice,
      totalSeats,
      availableSeats: totalSeats,
      createdBy: adminId,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    db.events.push(event);
    saveCollection("events");

    return event;
  }

  static async getEventById(eventId) {
    const event = db.events.find((e) => e._id === eventId);
    if (!event) {
      throw new ApiError(404, "Event not found");
    }
    return event;
  }

  static async getAllEvents(filters = {}) {
    let events = db.events.filter((e) => e.isActive === true);

    if (filters.ticketType) {
      events = events.filter((e) => e.ticketType === filters.ticketType);
    }

    if (filters.venue) {
      events = events.filter((e) => e.venue.toLowerCase().includes(filters.venue.toLowerCase()));
    }

    if (filters.search) {
      const search = filters.search.toLowerCase();
      events = events.filter(
        (e) =>
          e.title.toLowerCase().includes(search) ||
          e.description.toLowerCase().includes(search) ||
          e.venue.toLowerCase().includes(search)
      );
    }

    return events.sort((a, b) => new Date(a.startDateTime) - new Date(b.startDateTime));
  }

  static async updateEvent(eventId, updateData, adminId) {
    const event = db.events.find((e) => e._id === eventId);
    if (!event) {
      throw new ApiError(404, "Event not found");
    }

    if (event.createdBy !== adminId) {
      throw new ApiError(403, "Not authorized to update this event");
    }

    const { title, description, basePrice, venue, startDateTime, endDateTime } = updateData;

    if (title) event.title = title;
    if (description) event.description = description;
    if (basePrice) event.basePrice = basePrice;
    if (venue) event.venue = venue;
    if (startDateTime) event.startDateTime = new Date(startDateTime);
    if (endDateTime) event.endDateTime = new Date(endDateTime);
    event.updatedAt = new Date();

    saveCollection("events");
    return event;
  }

  static async deleteEvent(eventId, adminId) {
    const event = db.events.find((e) => e._id === eventId);
    if (!event) {
      throw new ApiError(404, "Event not found");
    }

    if (event.createdBy !== adminId) {
      throw new ApiError(403, "Not authorized to delete this event");
    }

    // Soft delete
    event.isActive = false;
    event.updatedAt = new Date();
    saveCollection("events");

    return { message: "Event deleted successfully" };
  }

  static async searchEvents(query) {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const searchTerm = query.toLowerCase();
    return db.events
      .filter(
        (e) =>
          e.isActive &&
          (e.title.toLowerCase().includes(searchTerm) ||
            e.description.toLowerCase().includes(searchTerm) ||
            e.venue.toLowerCase().includes(searchTerm))
      )
      .slice(0, 50);
  }

  static async getEventStats(eventId) {
    const event = db.events.find((e) => e._id === eventId);
    if (!event) {
      throw new ApiError(404, "Event not found");
    }

    const eventSeats = db.seats.filter((s) => s.eventId === eventId);
    const bookedSeats = eventSeats.filter((s) => s.status === "BOOKED").length;
    const lockedSeats = eventSeats.filter((s) => s.status === "LOCKED").length;

    return {
      totalSeats: event.totalSeats,
      availableSeats: event.availableSeats,
      bookedSeats,
      lockedSeats,
    };
  }
}
