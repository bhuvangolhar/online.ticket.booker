function EventCard({ event, onBook }) {
  return (
    <div className="event-card">
      <div className="event-poster">{event.poster}</div>
      <div className="event-content">
        <h3>{event.title}</h3>
        <p className="event-desc">{event.description}</p>
        <div className="event-details">
          <span>📍 {event.venue}</span>
          <span>💵 ₹{event.basePrice}</span>
        </div>
        <div className="event-seats">
          <span>Seats available: <strong>{event.availableSeats}</strong></span>
        </div>
        <button 
          className="book-btn"
          onClick={() => onBook(event)}
          disabled={event.availableSeats === 0}
        >
          {event.availableSeats > 0 ? 'Book Now' : 'Sold Out'}
        </button>
      </div>
    </div>
  );
}

export default EventCard;
