import { useState, useEffect } from 'react';
import { getEvents, saveEvents } from '../utils/storage';
import { sampleEvents } from '../data/initEvents';
import EventCard from '../components/EventCard';
import '../styles/global.css';

function Home() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [bookingModal, setBookingModal] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState(1);
  const [bookingMessage, setBookingMessage] = useState('');

  useEffect(() => {
    let storedEvents = getEvents();
    if (storedEvents.length === 0) {
      saveEvents(sampleEvents);
      storedEvents = sampleEvents;
    }
    setEvents(storedEvents);
  }, []);

  const handleBookClick = (event) => {
    setSelectedEvent(event);
    setBookingModal(true);
    setBookingMessage('');
  };

  const handleConfirmBooking = () => {
    if (!selectedEvent) return;

    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const booking = {
      id: Date.now(),
      eventId: selectedEvent._id,
      eventTitle: selectedEvent.title,
      seatsBooked: selectedSeats,
      totalPrice: selectedEvent.basePrice * selectedSeats,
      bookingDate: new Date().toLocaleString(),
      status: 'confirmed'
    };

    bookings.push(booking);
    localStorage.setItem('bookings', JSON.stringify(bookings));

    const updatedEvents = events.map(e => 
      e._id === selectedEvent._id 
        ? { ...e, availableSeats: e.availableSeats - selectedSeats }
        : e
    );
    setEvents(updatedEvents);
    saveEvents(updatedEvents);

    setBookingMessage(`✅ Booking confirmed! ${selectedSeats} seat(s) for ${selectedEvent.title}`);
    setTimeout(() => {
      setBookingModal(false);
      setBookingMessage('');
      setSelectedSeats(1);
    }, 2000);
  };

  return (
    <div className="home">
      <div className="header">
        <h1>🎫 Online Ticket Booker</h1>
        <p>Book tickets for movies, events, concerts, and more</p>
      </div>

      <div className="events-container">
        {events.map(event => (
          <EventCard 
            key={event._id} 
            event={event}
            onBook={handleBookClick}
          />
        ))}
      </div>

      {bookingModal && selectedEvent && (
        <div className="modal-overlay" onClick={() => setBookingModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedEvent.title}</h2>
              <button className="close-btn" onClick={() => setBookingModal(false)}>✕</button>
            </div>
            
            <div className="modal-body">
              <p><strong>Venue:</strong> {selectedEvent.venue}</p>
              <p><strong>Date:</strong> {new Date(selectedEvent.startDateTime).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {new Date(selectedEvent.startDateTime).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</p>
              <p><strong>Price per seat:</strong> ₹{selectedEvent.basePrice}</p>
              <p><strong>Available seats:</strong> {selectedEvent.availableSeats}</p>

              <div className="seat-selector">
                <label>Number of seats:</label>
                <input 
                  type="number" 
                  min="1" 
                  max={selectedEvent.availableSeats}
                  value={selectedSeats}
                  onChange={(e) => setSelectedSeats(Math.max(1, parseInt(e.target.value) || 1))}
                />
              </div>

              <div className="price-display">
                <strong>Total: ₹{selectedEvent.basePrice * selectedSeats}</strong>
              </div>

              {bookingMessage && <p className="success-msg">{bookingMessage}</p>}

              <div className="modal-actions">
                <button 
                  className="confirm-btn"
                  onClick={handleConfirmBooking}
                  disabled={selectedSeats > selectedEvent.availableSeats}
                >
                  Confirm Booking
                </button>
                <button className="cancel-btn" onClick={() => setBookingModal(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
