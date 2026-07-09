import React, { useState, useEffect } from 'react';
import { Briefcase, MapPin, DollarSign, Search, Loader2, ExternalLink } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { fetchCategories, searchJobs, type Category, type Job } from '../services/jobs';

const Internships: React.FC = () => {
  const { isDark } = useTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [query, setQuery] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const bgColor = isDark ? 'bg-zinc-950' : 'bg-zinc-50';
  const cardBg = isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-zinc-200';
  const textColor = isDark ? 'text-white' : 'text-zinc-900';
  const secondaryText = isDark ? 'text-zinc-400' : 'text-zinc-600';

  useEffect(() => {
    fetchCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    searchJobs(query, selectedCategory)
      .then(data => setJobs(data.results || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [query, selectedCategory]);

  return (
    <div className={`min-h-screen ${bgColor} ${isDark ? 'text-zinc-100' : 'text-zinc-900'} p-4 sm:p-8`}>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h1 className={`text-3xl font-extrabold tracking-tight ${textColor}`}>Explore Opportunities</h1>
          <p className={`mt-2 ${secondaryText}`}>
            AI-matched career paths and internships tailored to your profile.
          </p>
        </div>

        {/* Search Bar */}
        <div className={`flex items-center p-2 rounded-2xl border ${cardBg} shadow-sm`}>
          <Search className="w-5 h-5 ml-3 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Search by role, skills, or company..." 
            className="w-full bg-transparent p-1 outline-none ml-2 text-md"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Sidebar */}
          <aside className="hidden lg:block space-y-4">
            <h3 className="font-semibold text-zinc-500 uppercase tracking-wider text-xs">Filter by Category</h3>
            <nav className="space-y-1">
              <button 
                onClick={() => setSelectedCategory("")}
                className={`block w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition ${selectedCategory === "" ? "bg-green-500 text-white" : "hover:bg-zinc-200 dark:hover:bg-zinc-800"}`}
              >
                All Opportunities
              </button>
              {categories.map(cat => (
                <button 
                  key={cat.tag} 
                  onClick={() => setSelectedCategory(cat.tag)}
                  className={`block w-full text-left px-4 py-2.5 rounded-xl text-sm transition ${selectedCategory === cat.tag ? "bg-green-500/10 text-green-500 font-bold" : "hover:bg-zinc-200 dark:hover:bg-zinc-800"}`}
                >
                  {cat.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Results */}
          <main className="lg:col-span-3 space-y-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="w-10 h-10 text-green-500 animate-spin" />
                <p className={`${secondaryText} animate-pulse`}>Scanning the market for you...</p>
              </div>
            ) : jobs.length > 0 ? (
              jobs.map((job) => (
                <div key={job.id} className={`group p-6 rounded-2xl border transition-all hover:shadow-md ${cardBg} ${isDark ? 'hover:border-zinc-700' : 'hover:border-green-300'}`}>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'} group-hover:bg-green-500/10 transition`}>
                        <Briefcase className="w-7 h-7 text-green-500" />
                      </div>
                      <div>
                        <h3 className={`font-bold text-xl ${textColor}`}>{job.title}</h3>
                        <p className={secondaryText}>{job.company.display_name}</p>
                      </div>
                    </div>
                    <a href={job.redirect_url} target="_blank" rel="noopener noreferrer" className={`p-2 rounded-full ${isDark ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100'}`}>
                      <ExternalLink className="w-5 h-5 text-zinc-400" />
                    </a>
                  </div>
                  
                  <p className={`mt-4 text-sm ${secondaryText} line-clamp-2 leading-relaxed`}>
                    {job.description.replace(/<[^>]*>?/gm, '')}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-4 text-sm">
                    <span className={`flex items-center gap-1.5 px-3 py-1 ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'} rounded-full font-medium`}>
                      <MapPin className="w-4 h-4 text-green-500" /> {job.location.display_name.split(',')[0]}
                    </span>
                    <span className={`flex items-center gap-1.5 px-3 py-1 ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'} rounded-full font-medium`}>
                      <DollarSign className="w-4 h-4 text-green-500" /> {job.salary_min ? `$${job.salary_min}` : 'Competitive'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20">
                <p className={secondaryText}>No jobs found for this search. Try adjusting your filters.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Internships;