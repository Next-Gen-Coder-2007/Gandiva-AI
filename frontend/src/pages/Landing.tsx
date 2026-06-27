import Navbar from '../components/Landing/Navbar';
import Hero from '../components/Landing/Hero';
import Features from '../components/Landing/Features';
import Footer from '../components/Landing/Footer';
import { useTheme } from '../context/ThemeContext';
import TechStack from '../components/Landing/TechStack';

const Landing = () => {
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-black text-zinc-100' : 'bg-zinc-50 text-zinc-900'}`}>
      <Navbar />
      <Hero />
      <Features />
      <TechStack />
      <Footer />
    </div>
  );
};

export default Landing;