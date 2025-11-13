import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import HomePage from './pages/HomePage';
import EventDetailPage from './pages/EventDetailPage';
import SummaryPage from './pages/SummaryPage';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/event/:eventId" element={<EventDetailPage />} />
          <Route path="/event/:eventId/summary" element={<SummaryPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App
