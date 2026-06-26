import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/Landing';
import useLenis from './hooks/useLenis';
import { ThemeProvider } from './context/ThemeContext';
import NotFound from './pages/NotFound';

function App() {
  useLenis();

  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;