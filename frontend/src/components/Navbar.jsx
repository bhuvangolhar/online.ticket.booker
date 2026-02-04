function Navbar({ currentView, onViewChange }) {
  const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
  
  return (
    <nav className="navbar">
      <div className="nav-left">
        <h2 className="logo">🎫 TicketHub</h2>
      </div>
      <div className="nav-center">
        <button 
          className={`nav-btn ${currentView === 'home' ? 'active' : ''}`}
          onClick={() => onViewChange('home')}
        >
          🏠 Browse Events
        </button>
        <button 
          className={`nav-btn ${currentView === 'bookings' ? 'active' : ''}`}
          onClick={() => onViewChange('bookings')}
        >
          📦 My Bookings ({bookings.length})
        </button>
      </div>
      <div className="nav-right">
        <span className="booking-count">
          Total: <strong>{bookings.length}</strong>
        </span>
      </div>
    </nav>
  );
}

export default Navbar;
