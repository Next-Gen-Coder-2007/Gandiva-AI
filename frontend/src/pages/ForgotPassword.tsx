import React, { useState, useEffect, useRef } from 'react';
import { Mail, ArrowLeft, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { sendOtp, verifyOtp, resetPassword } from '../services/forgot-password';

type Step = 1 | 2 | 3 | 4;

const ForgotPassword: React.FC = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  
  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(""), 5000);
    return () => clearTimeout(timer);
  }, [error]);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await sendOtp(email);
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) {
      setError("Please enter a valid OTP");
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      await verifyOtp(email, otp);
      setStep(3);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Invalid or expired OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      await resetPassword(email, otp, newPassword);
      setStep(4);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`relative min-h-screen flex items-center justify-center p-4 sm:p-6 overflow-hidden font-sans transition-colors duration-300 ${isDark ? 'bg-black text-zinc-100' : 'bg-zinc-50 text-zinc-900'}`}>
      
      {error && (
        <div className="fixed top-5 right-5 z-[9999] bg-red-500 text-white px-4 py-3 rounded-xl shadow-lg animate-in fade-in slide-in-from-top-2">
          {error}
        </div>
      )}

      <div className="absolute inset-0 bg-[radial-gradient(#22c55e15_1px,transparent_1px)] [background-size:24px_24px] opacity-60"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-green-500/20 rounded-full blur-[100px] sm:blur-[120px] pointer-events-none"></div>
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] sm:w-[300px] sm:h-[300px] rounded-full blur-[80px] pointer-events-none ${isDark ? 'bg-green-400/10' : 'bg-green-400/20'}`}></div>
      
      <div className={`relative z-10 w-full max-w-md p-6 sm:p-10 rounded-3xl shadow-2xl transition-all duration-500 ${isDark ? 'bg-zinc-950/90 border border-zinc-800/80 backdrop-blur-xl' : 'bg-white/90 border border-zinc-200 backdrop-blur-xl'}`}>
        
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">Reset Password</h2>
              <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                Enter your email and we'll send you an OTP
              </p>
            </div>
            <form onSubmit={handleRequestOtp} className="space-y-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className={`h-5 w-5 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-green-500/50 ${isDark ? 'bg-black border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:border-green-500/50' : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-green-500'}`}
                  required
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={loading || !email}
                className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(34,197,94,0.2)] hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </form>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">Verify OTP</h2>
              <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                Enter the 6-digit code sent to <span className="font-semibold">{email}</span>
              </p>
            </div>
            <form onSubmit={handleVerifyOtp} className="space-y-8">
              
              <div className="flex gap-2 justify-center">
                {[...Array(6)].map((_, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      inputRefs.current[i] = el;
                    }}
                    type="text"
                    maxLength={1}
                    value={otp[i] || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/[^0-9]/.test(val)) return;
                      
                      const newOtp = otp.split('');
                      newOtp[i] = val;
                      setOtp(newOtp.join(''));

                      if (val !== '' && i < 5) {
                        inputRefs.current[i + 1]?.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !otp[i] && i > 0) {
                        inputRefs.current[i - 1]?.focus();
                      }
                    }}
                    className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-green-500/50 ${
                      isDark 
                        ? 'bg-black border-zinc-800 text-white focus:border-green-500' 
                        : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-green-500'
                    }`}
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(34,197,94,0.2)] disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify Code"}
              </button>
              
              <button 
                type="button" 
                onClick={() => setStep(1)}
                className="w-full text-sm font-medium text-zinc-500 hover:text-green-500"
              >
                Change email address
              </button>
            </form>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">New Password</h2>
              <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                Create a strong new password
              </p>
            </div>
            <form onSubmit={handleResetPassword} className="space-y-4">
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className={`h-5 w-5 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New Password"
                  className={`w-full pl-10 pr-12 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-green-500/50 ${isDark ? 'bg-black border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:border-green-500/50' : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-green-500'}`}
                  required
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-green-500 transition-colors p-2"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className={`h-5 w-5 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`} />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm New Password"
                  className={`w-full pl-10 pr-12 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-green-500/50 ${isDark ? 'bg-black border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:border-green-500/50' : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-green-500'}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-green-500 transition-colors p-2"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || !newPassword || !confirmPassword}
                className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(34,197,94,0.2)] hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-4"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          </div>
        )}

        {step === 4 && (
          <div className="text-center py-4 animate-in zoom-in-95 duration-500">
            <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-4">Password Reset!</h2>
            <p className={`text-sm mb-8 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              Your password has been changed successfully.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(34,197,94,0.2)] hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] active:scale-[0.98]"
            >
              Back to Login
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="mt-8 text-center">
            <Link 
              to="/login" 
              className={`inline-flex items-center gap-2 text-sm font-medium transition-colors hover:text-green-500 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}
            >
              <ArrowLeft className="w-4 h-4" /> Back to log in
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;