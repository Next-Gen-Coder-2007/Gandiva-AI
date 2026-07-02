import React, { useState } from 'react';
import { User, Shield, Eye, EyeOff, Save, Sun, Moon, BrainCircuit, Briefcase, ChevronRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { changePassword } from '../services/forgot-password';

const Settings: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const tabs = [
    { id: 'profile', label: 'Career Profile', icon: User },
    { id: 'ai-settings', label: 'AI Preferences', icon: BrainCircuit },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  const handleSave = async () => {
    if (activeTab !== 'security') return;
    
    setIsLoading(true);
    setMessage(null);

    try {
      await changePassword(password);
      setMessage({ text: 'Password updated successfully!', type: 'success' });
      setPassword('');
      console.log("Password Updated!");
    } catch (error: any) {
      setMessage({ text: 'Failed to update password. Please try again.', type: 'error' });
      console.log(error.response.data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Account Settings</h1>
        <p className={`mt-1 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
          Manage your GandivaAI profile, preferences, and security.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 shrink-0 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all ${
                  activeTab === tab.id
                    ? isDark ? 'bg-zinc-900 text-green-400' : 'bg-green-50 text-green-600'
                    : 'text-zinc-500 hover:bg-zinc-500/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </div>
                {activeTab === tab.id && <ChevronRight className="w-4 h-4" />}
              </button>
            );
          })}
        </aside>

        <div className="flex-1 space-y-6">
          {activeTab === 'profile' && (
            <div className={`p-8 rounded-2xl border ${isDark ? 'bg-zinc-950/50 border-zinc-800' : 'bg-white border-zinc-200'}`}>
              <h2 className="text-xl font-bold mb-6">Career Profile</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2 opacity-80">Full Name</label>
                  <input className={`w-full p-3 rounded-xl border outline-none focus:border-green-500 transition-colors ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`} defaultValue="John Student" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 opacity-80">Target Role</label>
                  <div className="relative flex items-center">
                    <Briefcase className="absolute left-3 w-5 h-5 text-zinc-400" />
                    <input className={`w-full p-3 pl-10 rounded-xl border outline-none focus:border-green-500 transition-colors ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`} placeholder="e.g. Software Engineer" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai-settings' && (
            <div className={`p-8 rounded-2xl border ${isDark ? 'bg-zinc-950/50 border-zinc-800' : 'bg-white border-zinc-200'}`}>
              <h2 className="text-xl font-bold mb-6">AI Configuration</h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Mock Interview Tone</h4>
                    <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Set your preferred feedback style</p>
                  </div>
                  <select className={`p-2.5 rounded-lg border outline-none cursor-pointer ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
                    <option>Encouraging & Helpful</option>
                    <option>Strict & Professional</option>
                  </select>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-zinc-500/10">
                  <div>
                    <h4 className="font-semibold">System Theme</h4>
                    <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Switch between light and dark mode</p>
                  </div>
                  <button onClick={toggleTheme} className={`p-2.5 rounded-xl transition-all ${isDark ? 'bg-zinc-800 text-yellow-400 hover:bg-zinc-700' : 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200'}`}>
                    {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className={`p-8 rounded-2xl border ${isDark ? 'bg-zinc-950/50 border-zinc-800' : 'bg-white border-zinc-200'}`}>
              <h2 className="text-xl font-bold mb-6">Account Security</h2>
              <div className="space-y-6">
                <div className="relative">
                  <label className="block text-sm font-medium mb-2 opacity-80">Update Password</label>
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full p-3 rounded-xl border outline-none pr-12 focus:border-green-500 transition-colors ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`} 
                    placeholder="Enter new password" 
                  />
                  <button 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[35px] p-2 text-zinc-400 hover:text-green-500 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4">
            {message && (
              <div className={`p-3 rounded-lg text-sm ${
                message.type === 'success' 
                  ? 'bg-green-500/10 text-green-500' 
                  : 'bg-red-500/10 text-red-500'
              }`}>
                {message.text}
              </div>
            )}
            
            <div className="flex justify-end">
              <button 
                onClick={handleSave}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-semibold transition-all active:scale-[0.98] disabled:opacity-50"
                disabled={isLoading || (activeTab === 'security' && !password)}
              >
                {isLoading ? 'Saving...' : <><Save className="w-4 h-4" /> Save Changes</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;