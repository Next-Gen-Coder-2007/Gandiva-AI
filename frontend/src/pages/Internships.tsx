import React from 'react';
import { Briefcase, MapPin, DollarSign, Filter, Search, ChevronRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Internships: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Internships & Jobs</h1>
          <p className={`mt-1 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            AI-matched opportunities based on your skills and profile.
          </p>
        </div>
        <button className={`px-4 py-2 rounded-xl border flex items-center gap-2 font-medium transition-colors ${
          isDark ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700' : 'bg-white border-zinc-200 hover:bg-zinc-50'
        }`}>
          <Filter className="w-4 h-4" /> Filter
        </button>
      </div>

      <div className={`relative flex items-center p-2 rounded-2xl border ${isDark ? 'bg-zinc-950/50 border-zinc-800' : 'bg-white border-zinc-200'}`}>
        <Search className="w-5 h-5 ml-3 text-zinc-400" />
        <input 
          type="text" 
          placeholder="Search roles, companies, or skills..." 
          className="w-full bg-transparent p-2 outline-none ml-2"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        <div className="hidden lg:block space-y-6">
          <h3 className="font-bold">Categories</h3>
          <div className="space-y-2">
            {['Software Engineering', 'Data Science', 'Product Design', 'Marketing'].map(cat => (
              <button key={cat} className="block w-full text-left text-sm text-zinc-500 hover:text-green-500 transition-colors">
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <h2 className="text-lg font-bold">Recommended for you</h2>
          {[1, 2, 3].map((item) => (
            <div 
              key={item} 
              className={`p-6 rounded-2xl border transition-all hover:shadow-lg ${
                isDark ? 'bg-zinc-950/50 border-zinc-800 hover:border-zinc-700' : 'bg-white border-zinc-200 hover:border-green-500/30'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? 'bg-zinc-900' : 'bg-zinc-100'}`}>
                    <Briefcase className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Software Engineering Intern</h3>
                    <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Company Name • Remote</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-green-500 bg-green-500/10 px-3 py-1 rounded-full">
                  95% Match
                </span>
              </div>
              
              <div className="mt-6 flex gap-6">
                <div className="flex items-center gap-1 text-sm text-zinc-500">
                  <DollarSign className="w-4 h-4" /> $5k - $8k / mo
                </div>
                <div className="flex items-center gap-1 text-sm text-zinc-500">
                  <MapPin className="w-4 h-4" /> Hybrid / New York
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
                <button className="flex items-center gap-1 text-sm font-semibold hover:text-green-500 transition-colors">
                  View Details <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Internships;