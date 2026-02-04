import { useState } from 'react';
import Home from './pages/Home';
import Bookings from './pages/Bookings';
import Navbar from './components/Navbar';
import './styles/global.css';

function App() {
  const [currentView, setCurrentView] = useState('home');

  return (
    <div className="app">
      <Navbar currentView={currentView} onViewChange={setCurrentView} />
      {currentView === 'home' ? <Home /> : <Bookings />}
    </div>
  );
}

export default App;
