import React, { useState, useEffect } from 'react';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { loginUser } from '../services/auth';

const Login: React.FC = () => {
  const { isDark } = useTheme();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await loginUser(email, password);

      console.log("Login Success:", data);
    } catch (err: any) {
      setError(
        err.response?.data?.detail || "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!error) return;

    const timer = setTimeout(() => {
      setError("");
    }, 5000);

    return () => clearTimeout(timer);
  }, [error]);

  return (
    <div className={`relative min-h-screen flex items-center justify-center p-4 sm:p-6 overflow-hidden font-sans transition-colors duration-300 ${isDark ? 'bg-black text-zinc-100' : 'bg-zinc-50 text-zinc-900'}`}>
      {error && (
        <div className="fixed top-5 right-5 z-[9999] bg-red-500 text-white px-4 py-3 rounded-xl">
          {error}
        </div>
      )}
      <div className="absolute inset-0 bg-[radial-gradient(#22c55e15_1px,transparent_1px)] [background-size:24px_24px] opacity-60"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-green-500/20 rounded-full blur-[100px] sm:blur-[120px] pointer-events-none"></div>
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] sm:w-[300px] sm:h-[300px] rounded-full blur-[80px] pointer-events-none ${isDark ? 'bg-green-400/10' : 'bg-green-400/20'}`}></div>
      <div className={`relative z-10 w-full max-w-md p-6 sm:p-10 rounded-3xl shadow-2xl ${isDark ? 'bg-zinc-950/90 border border-zinc-800/80 backdrop-blur-xl' : 'bg-white/90 border border-zinc-200 backdrop-blur-xl'}`}>
        
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">Welcome Back</h2>
          <p className={`text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
            Sign in to continue cracking those placements
          </p>
        </div>

        <button type="button" className={`w-full flex items-center justify-center gap-3 py-3 px-4 mb-6 rounded-xl border font-semibold transition-all duration-200 ${isDark ? 'bg-black border-zinc-800 hover:bg-zinc-900 text-white' : 'bg-zinc-50 border-zinc-200 hover:bg-zinc-100 text-zinc-900'}`}>
          <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span className="truncate">Continue with Google</span>
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className={`flex-1 h-px ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`}></div>
          <span className={`text-xs font-medium uppercase tracking-wider ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>Or</span>
          <div className={`flex-1 h-px ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`}></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className={`h-5 w-5 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`} />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              placeholder="Email address"
              className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-green-500/50 ${isDark ? 'bg-black border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:border-green-500/50' : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-green-500'}`}
              required
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className={`h-5 w-5 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`} />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              placeholder="Password"
              className={`w-full pl-10 pr-12 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-green-500/50 ${isDark ? 'bg-black border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:border-green-500/50' : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-green-500'}`}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center justify-center text-zinc-500 hover:text-green-500 transition-colors p-2"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-end pt-1">
            <Link 
              to="/forgot-password" 
              className={`text-sm font-medium transition-colors hover:text-green-500 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(34,197,94,0.2)] hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] active:scale-[0.98] sm:hover:-translate-y-0.5 mt-2"
          >
            {loading ? "Signing In..." : "Sign In"} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className={`text-center text-sm mt-8 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
          New here?{' '}
          <Link 
            to="/register" 
            className="font-bold text-green-500 hover:text-green-400 transition-colors"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;