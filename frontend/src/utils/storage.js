export const getEvents = () => {
  const stored = localStorage.getItem('events');
  return stored ? JSON.parse(stored) : [];
};

export const saveEvents = (events) => {
  localStorage.setItem('events', JSON.stringify(events));
};

export const getBookings = () => {
  const stored = localStorage.getItem('bookings');
  return stored ? JSON.parse(stored) : [];
};

export const saveBookings = (bookings) => {
  localStorage.setItem('bookings', JSON.stringify(bookings));
};

export const addBooking = (booking) => {
  const bookings = getBookings();
  bookings.push(booking);
  saveBookings(bookings);
  return booking;
};

export const updateEventSeats = (eventId, seatsBooked) => {
  const events = getEvents();
  const event = events.find(e => e._id === eventId);
  if (event) {
    event.availableSeats -= seatsBooked;
    saveEvents(events);
  }
};

export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
