import React, { useState, useEffect } from 'react';
import { 
  User, Shield, Eye, EyeOff, Save, Sun, Moon, BrainCircuit, 
  Briefcase, ChevronRight, GraduationCap, Building2, BookOpen, 
  Award, CheckCircle2, AlertCircle, Loader2
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, updateUserProfile, type UserProfile } from '../services/auth';
import { changePassword } from '../services/forgot-password';

const Settings: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const { user, checkAuth } = useAuth();

  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState<UserProfile>({
    id: 0,
    username: '',
    email: '',
    full_name: '',
    target_role: '',
    college: '',
    branch: '',
    cgpa: undefined,
    year: '',
    bio: '',
    interview_tone_preference: 'Encouraging & Helpful'
  });

  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const tabs = [
    { id: 'profile', label: 'Career Profile', icon: User, desc: 'Target role, academic credentials, and bio' },
    { id: 'ai-settings', label: 'AI Preferences', icon: BrainCircuit, desc: 'Mock interviewer persona and feedback style' },
    { id: 'security', label: 'Security & Auth', icon: Shield, desc: 'Password and credential management' },
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoadingProfile(true);
    try {
      const data = await getUserProfile();
      setProfile(data);
    } catch (error) {
      console.error("Failed to load profile:", error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleProfileChange = (field: keyof UserProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      const updated = await updateUserProfile({
        full_name: profile.full_name,
        target_role: profile.target_role,
        college: profile.college,
        branch: profile.branch,
        cgpa: profile.cgpa ? Number(profile.cgpa) : undefined,
        year: profile.year,
        bio: profile.bio,
        interview_tone_preference: profile.interview_tone_preference
      });
      setProfile(updated);
      await checkAuth();
      setMessage({ text: 'Career profile updated successfully!', type: 'success' });
    } catch (error: any) {
      setMessage({ text: error.response?.data?.detail || 'Failed to save changes. Please try again.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSecurity = async () => {
    if (!password) return;
    if (password.length < 6) {
      setMessage({ text: 'Password must be at least 6 characters long.', type: 'error' });
      return;
    }
    if (password !== confirmPassword) {
      setMessage({ text: 'Passwords do not match.', type: 'error' });
      return;
    }

    setIsSaving(true);
    setMessage(null);
    try {
      await changePassword(password);
      setMessage({ text: 'Password changed successfully!', type: 'success' });
      setPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setMessage({ text: error.response?.data?.detail || 'Failed to update password.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8 font-sans">
      
      {/* Header */}
      <div className="border-b pb-6 border-zinc-200 dark:border-zinc-800">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Account & Career Settings</h1>
        <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
          Personalize your Gandiva AI career accelerator, placement goals, and preferences.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 shrink-0 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setMessage(null); }}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl font-semibold text-left transition-all ${
                  isActive
                    ? isDark 
                      ? 'bg-zinc-900 text-green-400 border border-green-500/30 shadow-sm' 
                      : 'bg-green-50 text-green-700 border border-green-200 shadow-sm'
                    : isDark ? 'text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${isActive ? 'bg-green-500/10' : 'bg-zinc-500/10'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm block">{tab.label}</span>
                  </div>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 shrink-0" />}
              </button>
            );
          })}
        </aside>

        {/* Form Content Area */}
        <div className="flex-1 w-full space-y-6">
          
          {message && (
            <div className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-semibold animate-in fade-in duration-200 border ${
              message.type === 'success' 
                ? 'bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400' 
                : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
            }`}>
              {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
              <span>{message.text}</span>
            </div>
          )}

          {isLoadingProfile ? (
            <div className={`p-12 rounded-3xl border flex flex-col items-center justify-center ${isDark ? 'bg-zinc-950/50 border-zinc-800' : 'bg-white border-zinc-200'}`}>
              <Loader2 className="w-8 h-8 text-green-500 animate-spin mb-3" />
              <p className="text-sm font-medium text-zinc-500">Loading settings...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: CAREER PROFILE */}
              {activeTab === 'profile' && (
                <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm space-y-6 ${isDark ? 'bg-zinc-950/50 border-zinc-800' : 'bg-white border-zinc-200'}`}>
                  <div>
                    <h2 className="text-lg font-bold">Career & Academic Profile</h2>
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      Used by the AI layer to customize your roadmaps, resume feedback, and matched job suggestions.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-80">Full Name</label>
                      <input 
                        type="text"
                        value={profile.full_name || ''} 
                        onChange={(e) => handleProfileChange('full_name', e.target.value)}
                        placeholder="e.g. Alex Johnson"
                        className={`w-full p-3 rounded-xl border text-sm outline-none transition-colors ${isDark ? 'bg-zinc-900 border-zinc-800 focus:border-green-500' : 'bg-zinc-50 border-zinc-200 focus:border-green-500'}`} 
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-80">Target Role / Career Goal</label>
                      <div className="relative flex items-center">
                        <Briefcase className="absolute left-3.5 w-4 h-4 text-zinc-400" />
                        <input 
                          type="text"
                          value={profile.target_role || ''} 
                          onChange={(e) => handleProfileChange('target_role', e.target.value)}
                          placeholder="e.g. Senior Full Stack Engineer"
                          className={`w-full p-3 pl-10 rounded-xl border text-sm outline-none transition-colors ${isDark ? 'bg-zinc-900 border-zinc-800 focus:border-green-500' : 'bg-zinc-50 border-zinc-200 focus:border-green-500'}`} 
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-80">College / University</label>
                      <div className="relative flex items-center">
                        <Building2 className="absolute left-3.5 w-4 h-4 text-zinc-400" />
                        <input 
                          type="text"
                          value={profile.college || ''} 
                          onChange={(e) => handleProfileChange('college', e.target.value)}
                          placeholder="e.g. Stanford University / IIT Delhi"
                          className={`w-full p-3 pl-10 rounded-xl border text-sm outline-none transition-colors ${isDark ? 'bg-zinc-900 border-zinc-800 focus:border-green-500' : 'bg-zinc-50 border-zinc-200 focus:border-green-500'}`} 
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-80">Branch / Major</label>
                      <div className="relative flex items-center">
                        <BookOpen className="absolute left-3.5 w-4 h-4 text-zinc-400" />
                        <input 
                          type="text"
                          value={profile.branch || ''} 
                          onChange={(e) => handleProfileChange('branch', e.target.value)}
                          placeholder="e.g. Computer Science & Engineering"
                          className={`w-full p-3 pl-10 rounded-xl border text-sm outline-none transition-colors ${isDark ? 'bg-zinc-900 border-zinc-800 focus:border-green-500' : 'bg-zinc-50 border-zinc-200 focus:border-green-500'}`} 
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-80">CGPA / GPA</label>
                      <div className="relative flex items-center">
                        <Award className="absolute left-3.5 w-4 h-4 text-zinc-400" />
                        <input 
                          type="number"
                          step="0.01"
                          min="0"
                          max="10"
                          value={profile.cgpa ?? ''} 
                          onChange={(e) => handleProfileChange('cgpa', e.target.value ? parseFloat(e.target.value) : undefined)}
                          placeholder="e.g. 8.85 or 3.9"
                          className={`w-full p-3 pl-10 rounded-xl border text-sm outline-none transition-colors ${isDark ? 'bg-zinc-900 border-zinc-800 focus:border-green-500' : 'bg-zinc-50 border-zinc-200 focus:border-green-500'}`} 
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-80">Graduation Year / Status</label>
                      <div className="relative flex items-center">
                        <GraduationCap className="absolute left-3.5 w-4 h-4 text-zinc-400" />
                        <input 
                          type="text"
                          value={profile.year || ''} 
                          onChange={(e) => handleProfileChange('year', e.target.value)}
                          placeholder="e.g. 2026 or Final Year"
                          className={`w-full p-3 pl-10 rounded-xl border text-sm outline-none transition-colors ${isDark ? 'bg-zinc-900 border-zinc-800 focus:border-green-500' : 'bg-zinc-50 border-zinc-200 focus:border-green-500'}`} 
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-80">Career Bio / Summary</label>
                    <textarea 
                      rows={4}
                      value={profile.bio || ''} 
                      onChange={(e) => handleProfileChange('bio', e.target.value)}
                      placeholder="Share a brief overview of your technical interests, notable achievements, and what you're working towards..."
                      className={`w-full p-3.5 rounded-xl border text-sm outline-none transition-colors resize-none ${isDark ? 'bg-zinc-900 border-zinc-800 focus:border-green-500' : 'bg-zinc-50 border-zinc-200 focus:border-green-500'}`} 
                    />
                  </div>

                  <div className="flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <button 
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold text-sm transition-all shadow-md shadow-green-600/20 active:scale-95 disabled:opacity-50"
                    >
                      {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Profile Changes</>}
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: AI PREFERENCES */}
              {activeTab === 'ai-settings' && (
                <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm space-y-6 ${isDark ? 'bg-zinc-950/50 border-zinc-800' : 'bg-white border-zinc-200'}`}>
                  <div>
                    <h2 className="text-lg font-bold">AI Mentor & Interview Persona</h2>
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      Adjust how the AI recruiter evaluates your answers and guides your preparation.
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                      <div>
                        <h4 className="font-bold text-sm">Mock Interview Feedback Style</h4>
                        <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                          Choose the interviewer personality during assessment evaluations.
                        </p>
                      </div>
                      <select 
                        value={profile.interview_tone_preference || 'Encouraging & Helpful'}
                        onChange={(e) => handleProfileChange('interview_tone_preference', e.target.value)}
                        className={`p-2.5 rounded-xl border text-sm outline-none cursor-pointer ${isDark ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-300 text-zinc-900'}`}
                      >
                        <option value="Encouraging & Helpful">Encouraging & Constructive</option>
                        <option value="Strict & Professional">Strict FAANG / Wall Street Bar</option>
                        <option value="Deep Technical & Concise">Deep Technical & Concise</option>
                      </select>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                      <div>
                        <h4 className="font-bold text-sm">Interface Appearance</h4>
                        <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                          Toggle between Dark and Light mode
                        </p>
                      </div>
                      <button 
                        onClick={toggleTheme} 
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                          isDark ? 'bg-zinc-800 text-amber-400 hover:bg-zinc-700' : 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200'
                        }`}
                      >
                        {isDark ? <><Sun className="w-4 h-4" /> Switch to Light</> : <><Moon className="w-4 h-4" /> Switch to Dark</>}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <button 
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold text-sm transition-all shadow-md shadow-green-600/20 active:scale-95 disabled:opacity-50"
                    >
                      {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save AI Preferences</>}
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: SECURITY */}
              {activeTab === 'security' && (
                <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm space-y-6 ${isDark ? 'bg-zinc-950/50 border-zinc-800' : 'bg-white border-zinc-200'}`}>
                  <div>
                    <h2 className="text-lg font-bold">Security & Password</h2>
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      Update your login password and manage access security.
                    </p>
                  </div>

                  <div className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-80">Email Account</label>
                      <input 
                        type="text" 
                        disabled
                        value={user?.email || ''}
                        className={`w-full p-3 rounded-xl border text-sm opacity-60 cursor-not-allowed ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-100 border-zinc-200'}`} 
                      />
                    </div>

                    <div className="relative">
                      <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-80">New Password</label>
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter minimum 6 characters"
                        className={`w-full p-3 pr-12 rounded-xl border text-sm outline-none transition-colors ${isDark ? 'bg-zinc-900 border-zinc-800 focus:border-green-500' : 'bg-zinc-50 border-zinc-200 focus:border-green-500'}`} 
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-9 text-zinc-400 hover:text-green-500"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-80">Confirm New Password</label>
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter your new password"
                        className={`w-full p-3 rounded-xl border text-sm outline-none transition-colors ${isDark ? 'bg-zinc-900 border-zinc-800 focus:border-green-500' : 'bg-zinc-50 border-zinc-200 focus:border-green-500'}`} 
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <button 
                      onClick={handleSaveSecurity}
                      disabled={isSaving || !password || !confirmPassword}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold text-sm transition-all shadow-md shadow-green-600/20 active:scale-95 disabled:opacity-50"
                    >
                      {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</> : <><Save className="w-4 h-4" /> Update Password</>}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

        </div>

      </div>

    </div>
  );
};

export default Settings;