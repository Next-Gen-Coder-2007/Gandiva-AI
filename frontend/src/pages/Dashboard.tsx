import React from 'react';
import { Trophy, FileCheck, Brain, Target, AlertCircle, ArrowRight, Briefcase } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();

  const metrics = [
    { label: 'Placement Readiness', value: '81%', icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { label: 'Resume ATS Score', value: '85/100', icon: FileCheck, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Quiz Accuracy', value: '72%', icon: Brain, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Interview Score', value: '68/100', icon: Target, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  const weakSkills = ['System Design', 'Docker', 'GraphQL'];
  const internships = [
    { role: 'SDE Intern', company: 'Google', match: '92%', stipend: '$8k/mo' },
    { role: 'Frontend Intern', company: 'Stripe', match: '88%', stipend: '$7.5k/mo' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Welcome back, {user?.username?.split(' ')[0] || 'Student'}!
        </h1>
        <p className={`mt-1 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
          Here is your AI-generated career acceleration overview.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <div key={i} className={`p-5 rounded-2xl border ${isDark ? 'bg-zinc-950/50 border-zinc-800' : 'bg-white border-zinc-200'}`}>
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 rounded-xl ${m.bg} ${m.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <h3 className={`text-sm font-medium mb-1 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{m.label}</h3>
              <p className="text-2xl font-bold">{m.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Next AI Actions */}
        <div className={`col-span-1 lg:col-span-2 p-6 rounded-2xl border ${isDark ? 'bg-zinc-950/50 border-zinc-800' : 'bg-white border-zinc-200'}`}>
          <h2 className="text-lg font-bold mb-4">Recommended AI Actions</h2>
          <div className="space-y-3">
            <Link to="/interviews" className={`flex items-center justify-between p-4 rounded-xl border transition-colors hover:border-green-500/50 ${isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
              <div>
                <h4 className="font-semibold">Take Mock Interview</h4>
                <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Improve your 68/100 score in technical communication.</p>
              </div>
              <ArrowRight className="w-5 h-5 text-green-500" />
            </Link>
            <Link to="/quizzes" className={`flex items-center justify-between p-4 rounded-xl border transition-colors hover:border-blue-500/50 ${isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
              <div>
                <h4 className="font-semibold">System Design Quiz</h4>
                <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Your weakest skill detected by the AI agent.</p>
              </div>
              <ArrowRight className="w-5 h-5 text-blue-500" />
            </Link>
          </div>
        </div>

        {/* Skill Gaps & Internships */}
        <div className="space-y-6">
          <div className={`p-6 rounded-2xl border ${isDark ? 'bg-zinc-950/50 border-zinc-800' : 'bg-white border-zinc-200'}`}>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" /> Identified Skill Gaps
            </h2>
            <div className="flex flex-wrap gap-2">
              {weakSkills.map(skill => (
                <span key={skill} className={`px-3 py-1 text-sm font-medium rounded-full ${isDark ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                  {skill}
                </span>
              ))}
            </div>
            <button className="mt-4 text-sm font-medium text-green-500 hover:underline">Generate Roadmap →</button>
          </div>

          <div className={`p-6 rounded-2xl border ${isDark ? 'bg-zinc-950/50 border-zinc-800' : 'bg-white border-zinc-200'}`}>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-emerald-500" /> Matched Internships
            </h2>
            <div className="space-y-4">
              {internships.map((job, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-sm">{job.role}</h4>
                    <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{job.company} • {job.stipend}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded">
                      {job.match} Match
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;