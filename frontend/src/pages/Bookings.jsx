import { useState, useEffect } from 'react';
import { getEvents, saveEvents } from '../utils/storage';

function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [cancelMessage, setCancelMessage] = useState('');

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = () => {
    const stored = JSON.parse(localStorage.getItem('bookings') || '[]');
    setBookings(stored);
  };

  const handleCancelBooking = (bookingId) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    // Restore seats to the event
    const events = getEvents();
    const event = events.find(e => e._id === booking.eventId);
    if (event) {
      event.availableSeats += booking.seatsBooked;
      saveEvents(events);
    }

    // Remove booking
    const updated = bookings.filter(b => b.id !== bookingId);
    setBookings(updated);
    localStorage.setItem('bookings', JSON.stringify(updated));

    setCancelMessage(`✅ Booking for "${booking.eventTitle}" cancelled. ${booking.seatsBooked} seat(s) refunded.`);
    setTimeout(() => setCancelMessage(''), 3000);
  };

  return (
    <div className="bookings">
      <div className="bookings-header">
        <h1>🎫 My Bookings</h1>
        <p>Manage your event tickets</p>
      </div>

      {cancelMessage && <div className="success-msg">{cancelMessage}</div>}

      {bookings.length === 0 ? (
        <div className="empty-state">
          <p>No bookings yet. Start booking your favorite events!</p>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map(booking => (
            <div key={booking.id} className="booking-card">
              <div className="booking-info">
                <h3>{booking.eventTitle}</h3>
                <div className="booking-details">
                  <span>📅 {booking.bookingDate}</span>
                  <span>🎟️ {booking.seatsBooked} seat(s)</span>
                  <span>💰 ₹{booking.totalPrice}</span>
                </div>
                <div className="booking-status">
                  <span className="status-badge">{booking.status.toUpperCase()}</span>
                </div>
              </div>
              <button 
                className="cancel-booking-btn"
                onClick={() => {
                  if (window.confirm(`Cancel booking for ${booking.eventTitle}? Refund will be issued.`)) {
                    handleCancelBooking(booking.id);
                  }
                }}
              >
                Cancel Booking
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Bookings;
