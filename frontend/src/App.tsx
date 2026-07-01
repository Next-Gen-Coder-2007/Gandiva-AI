import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/Landing';
import useLenis from './hooks/useLenis';
import { ThemeProvider } from './context/ThemeContext';
import NotFound from './pages/NotFound';
import Login from './pages/Login';
import Register from './pages/Register';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Layout from './components/Main/Layout';
import ForgotPassword from './pages/ForgotPassword';
import ResumeBuilder from './pages/ResumeBuilder';
import ResumeAnalyser from './pages/ResumeAnalyser';
import Quizzes from './pages/Quizzes';
import Internships from './pages/Internships';
import Interviews from './pages/Interviews';
import Roadmaps from './pages/Roadmaps';

function App() {
  useLenis();

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route element={
              <ProtectedRoute/>
            }>
              <Route element={
                <Layout />
              }>
                <Route path='/dashboard' element={<Dashboard />} />
                <Route path='/resume-builder' element={<ResumeBuilder />} />
                <Route path='/resume-analyzer' element={<ResumeAnalyser />} />
                <Route path='/quizzes' element={<Quizzes />} />
                <Route path='/interviews' element={<Interviews />} />
                <Route path='/roadmaps' element={<Roadmaps />} />
                <Route path='/internships' element={<Internships />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;