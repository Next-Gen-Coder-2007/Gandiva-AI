import React, { useState, useEffect } from 'react';
import { 
  Briefcase, MapPin, Search, Loader2, ExternalLink,
  Bookmark, Sparkles, Filter, Check,
  ChevronLeft, ChevronRight, X, ShieldCheck
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { fetchCategories, searchJobs, type Category, type Job } from '../services/jobs';

const LOCATIONS = [
  "All",
  "Remote",
  "Bengaluru",
  "Hyderabad",
  "Pune",
  "Gurgaon",
  "Mumbai",
  "India"
];

const WORK_MODES = ["All", "Remote", "Hybrid", "On-site"];
const EXP_LEVELS = ["All", "Internship", "Entry Level", "Mid Level"];

const Internships: React.FC = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [query, setQuery] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string>("All");
  const [selectedWorkMode, setSelectedWorkMode] = useState<string>("All");
  const [selectedExp, setSelectedExp] = useState<string>("All");
  const [showSavedOnly, setShowSavedOnly] = useState<boolean>(false);

  // Saved / Bookmarked Jobs in localStorage
  const [savedJobIds, setSavedJobIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('gandiva_saved_jobs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Selected Job for Slide-over Details Drawer
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const [loading, setLoading] = useState(false);

  const bgColor = isDark ? 'bg-[#050505]' : 'bg-[#fafafa]';
  const cardBg = isDark ? 'bg-[#0c0c0c] border-zinc-800/80' : 'bg-white border-zinc-200';
  const textColor = isDark ? 'text-zinc-100' : 'text-zinc-900';
  const secondaryText = isDark ? 'text-zinc-400' : 'text-zinc-500';
  const inputBg = isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900';

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(err => {
        console.warn("Categories fetch error:", err);
        setCategories([
          { tag: "", label: "All Opportunities" },
          { tag: "it-jobs", label: "Software Development" },
          { tag: "frontend", label: "Frontend & Web" },
          { tag: "backend", label: "Backend & Systems" },
          { tag: "ai-data", label: "AI & Data Science" },
          { tag: "cloud-devops", label: "Cloud & DevOps" },
          { tag: "fullstack", label: "Full Stack Engineering" }
        ]);
      });
  }, []);

  const fetchJobListings = async () => {
    setLoading(true);
    try {
      const data = await searchJobs({
        query: query.trim(),
        category: selectedCategory,
        location: selectedLocation,
        work_mode: selectedWorkMode,
        experience_level: selectedExp,
        page: currentPage,
        limit: 10
      });
      setJobs(data.results || []);
      setTotalPages(data.total_pages || 1);
    } catch (err) {
      console.error("Failed to load jobs:", err);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobListings();
  }, [query, selectedCategory, selectedLocation, selectedWorkMode, selectedExp, currentPage]);

  const toggleBookmark = (jobId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSavedJobIds(prev => {
      const updated = prev.includes(jobId) 
        ? prev.filter(id => id !== jobId) 
        : [...prev, jobId];
      try {
        localStorage.setItem('gandiva_saved_jobs', JSON.stringify(updated));
      } catch (err) {
        console.error("Local storage error", err);
      }
      return updated;
    });
  };

  const formatSalary = (job: Job) => {
    if (!job.salary_min && !job.salary_max) return 'Competitive Package';
    const min = job.salary_min;
    const max = job.salary_max;
    
    // Check if annual or monthly
    if (min && min > 500000) {
      const minLpa = (min / 100000).toFixed(1);
      const maxLpa = max ? (max / 100000).toFixed(1) : null;
      return maxLpa ? `₹${minLpa} - ₹${maxLpa} LPA` : `₹${minLpa} LPA`;
    }
    
    if (min) {
      return max ? `₹${min.toLocaleString()} - ₹${max.toLocaleString()} / mo` : `₹${min.toLocaleString()} / mo`;
    }
    
    return 'Competitive';
  };

  const calculateMatchScore = (job: Job) => {
    const target = (user?.target_role || '').toLowerCase();
    const title = job.title.toLowerCase();
    if (target && title.includes(target)) return 96;
    if (title.includes('intern') || title.includes('software') || title.includes('engineer')) return 92;
    return 88;
  };

  const displayedJobs = showSavedOnly 
    ? jobs.filter(j => savedJobIds.includes(j.id)) 
    : jobs;

  return (
    <div className={`min-h-screen ${bgColor} ${textColor} p-4 sm:p-6 lg:p-8 font-sans`}>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HERO HEADER */}
        <div className={`p-6 sm:p-8 rounded-3xl border ${
          isDark 
            ? 'bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 border-zinc-800' 
            : 'bg-gradient-to-br from-white via-zinc-50 to-emerald-50/20 border-zinc-200 shadow-sm'
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-green-500/10 text-green-500 border border-green-500/20 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> AI Job & Internship Engine
                </span>
                <span className={`text-xs ${secondaryText}`}>
                  Updated hourly across Tier-1 Tech & Startups
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
                Explore Verified Tech Opportunities
              </h1>
              <p className={`mt-2 text-xs sm:text-sm max-w-2xl leading-relaxed ${secondaryText}`}>
                Direct openings matched with your candidate score, ATS keywords, and verified interview capabilities.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSavedOnly(!showSavedOnly)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                  showSavedOnly 
                    ? 'bg-green-600 border-green-600 text-white' 
                    : isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white' : 'bg-white border-zinc-200 text-zinc-700'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${showSavedOnly ? 'fill-current' : ''}`} />
                <span>Saved Jobs ({savedJobIds.length})</span>
              </button>
            </div>
          </div>
        </div>

        {/* SEARCH & MULTI-FILTER BAR */}
        <div className={`p-4 sm:p-5 rounded-2xl border ${cardBg} shadow-sm space-y-4`}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            
            {/* Search Input */}
            <div className="lg:col-span-5 relative">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Search by role, company, or skills (e.g. React, Python, Google)..." 
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm border outline-none font-medium ${inputBg} focus:border-green-500`}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            {/* Location Selector */}
            <div className="lg:col-span-3 relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
              <select
                value={selectedLocation}
                onChange={(e) => {
                  setSelectedLocation(e.target.value);
                  setCurrentPage(1);
                }}
                className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border outline-none ${inputBg} focus:border-green-500`}
              >
                {LOCATIONS.map(loc => (
                  <option key={loc} value={loc}>
                    {loc === "All" ? "All Locations" : loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Work Mode */}
            <div className="lg:col-span-2">
              <select
                value={selectedWorkMode}
                onChange={(e) => {
                  setSelectedWorkMode(e.target.value);
                  setCurrentPage(1);
                }}
                className={`w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border outline-none ${inputBg} focus:border-green-500`}
              >
                {WORK_MODES.map(mode => (
                  <option key={mode} value={mode}>
                    {mode === "All" ? "All Work Modes" : mode}
                  </option>
                ))}
              </select>
            </div>

            {/* Experience Level */}
            <div className="lg:col-span-2">
              <select
                value={selectedExp}
                onChange={(e) => {
                  setSelectedExp(e.target.value);
                  setCurrentPage(1);
                }}
                className={`w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border outline-none ${inputBg} focus:border-green-500`}
              >
                {EXP_LEVELS.map(exp => (
                  <option key={exp} value={exp}>
                    {exp === "All" ? "All Experience" : exp}
                  </option>
                ))}
              </select>
            </div>

          </div>
        </div>

        {/* MAIN 2-COLUMN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* CATEGORY SIDEBAR */}
          <aside className="lg:col-span-3 space-y-4">
            <div className={`p-5 rounded-2xl border ${cardBg}`}>
              <h3 className="font-extrabold text-zinc-400 uppercase tracking-wider text-[11px] mb-3 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-green-500" /> Domains & Tracks
              </h3>
              
              <nav className="space-y-1">
                {categories.map((cat, idx) => {
                  const isSelected = selectedCategory === cat.tag;
                  return (
                    <button 
                      key={idx} 
                      onClick={() => {
                        setSelectedCategory(cat.tag);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                        isSelected 
                          ? 'bg-green-600 text-white shadow-sm shadow-green-600/20' 
                          : isDark ? 'text-zinc-400 hover:text-white hover:bg-zinc-900/60' : 'text-zinc-700 hover:bg-zinc-100'
                      }`}
                    >
                      <span className="truncate">{cat.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Career Coach Tip Card */}
            <div className={`p-5 rounded-2xl border ${isDark ? 'bg-gradient-to-br from-zinc-950 to-zinc-900 border-zinc-800' : 'bg-emerald-50/50 border-emerald-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <h4 className="font-bold text-xs">Interview Advantage</h4>
              </div>
              <p className={`text-[11px] leading-relaxed ${secondaryText}`}>
                Candidates with completed mock interview scores above 7.5 get 4x higher shortlisting rate for top tier openings.
              </p>
            </div>
          </aside>

          {/* JOB RESULTS GRID */}
          <main className="lg:col-span-9 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-bold ${secondaryText}`}>
                Showing {displayedJobs.length} {showSavedOnly ? 'saved' : ''} opportunities
              </span>

              {(query || selectedLocation !== 'All' || selectedCategory || selectedWorkMode !== 'All' || selectedExp !== 'All') && (
                <button
                  onClick={() => {
                    setQuery('');
                    setSelectedLocation('All');
                    setSelectedCategory('');
                    setSelectedWorkMode('All');
                    setSelectedExp('All');
                    setCurrentPage(1);
                  }}
                  className="text-xs font-bold text-green-500 hover:underline flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" /> Reset Filters
                </button>
              )}
            </div>

            {loading ? (
              <div className={`flex flex-col items-center justify-center py-24 rounded-3xl border ${cardBg}`}>
                <Loader2 className="w-10 h-10 text-green-500 animate-spin mb-3" />
                <p className="font-bold text-sm">Matching opportunities to your profile...</p>
                <p className={`text-xs mt-1 ${secondaryText}`}>Filtering compensation, role tags, and verified listings</p>
              </div>
            ) : displayedJobs.length === 0 ? (
              <div className={`text-center py-20 rounded-3xl border border-dashed p-8 ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
                <Briefcase className="w-12 h-12 mx-auto mb-3 text-zinc-500 opacity-50" />
                <h3 className="font-bold text-base">No matching opportunities found</h3>
                <p className={`text-xs max-w-sm mx-auto mt-1 mb-6 ${secondaryText}`}>
                  {showSavedOnly 
                    ? "You haven't bookmarked any jobs yet. Browse listings and click the bookmark icon."
                    : "Try broadening your search query or selecting a different location or track."}
                </p>
                <button
                  onClick={() => {
                    setQuery('');
                    setSelectedLocation('All');
                    setSelectedCategory('');
                    setShowSavedOnly(false);
                    setCurrentPage(1);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-green-600 text-white font-bold text-xs hover:bg-green-700 transition-colors"
                >
                  View All Listings
                </button>
              </div>
            ) : (
              <div className="space-y-3.5">
                {displayedJobs.map((job) => {
                  const isSaved = savedJobIds.includes(job.id);
                  const matchScore = calculateMatchScore(job);
                  const salaryText = formatSalary(job);

                  return (
                    <div 
                      key={job.id} 
                      onClick={() => setSelectedJob(job)}
                      className={`group p-5 sm:p-6 rounded-2xl border cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${cardBg} ${isDark ? 'hover:border-zinc-700' : 'hover:border-green-400'}`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        
                        <div className="flex items-start gap-4">
                          {/* Company Avatar */}
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 font-black text-sm border ${
                            isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-200' : 'bg-zinc-100 border-zinc-200 text-zinc-800'
                          } group-hover:border-green-500/40 group-hover:text-green-500 transition-colors`}>
                            {job.company.display_name.slice(0, 2).toUpperCase()}
                          </div>

                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className={`font-bold text-base sm:text-lg group-hover:text-green-500 transition-colors`}>
                                {job.title}
                              </h3>
                              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-green-500/10 text-green-500 border border-green-500/20">
                                {matchScore}% Match
                              </span>
                            </div>

                            <p className={`text-xs mt-0.5 font-semibold ${secondaryText}`}>
                              {job.company.display_name} • {job.location.display_name}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 self-end sm:self-start">
                          <button
                            type="button"
                            onClick={(e) => toggleBookmark(job.id, e)}
                            className={`p-2 rounded-xl border transition-colors ${
                              isSaved 
                                ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' 
                                : isDark ? 'border-zinc-800 hover:bg-zinc-800 text-zinc-400' : 'border-zinc-200 hover:bg-zinc-100 text-zinc-600'
                            }`}
                            title={isSaved ? 'Remove from saved' : 'Save job'}
                          >
                            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                          </button>

                          <a
                            href={job.redirect_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold transition-all shadow-sm shadow-green-600/20"
                          >
                            <span>Apply</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>

                      </div>

                      <p className={`mt-3 text-xs leading-relaxed line-clamp-2 ${secondaryText}`}>
                        {job.description}
                      </p>

                      {/* Tag Badges */}
                      <div className="mt-4 pt-3 border-t border-zinc-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${isDark ? 'bg-zinc-900 text-zinc-300' : 'bg-zinc-100 text-zinc-700'}`}>
                            {job.work_mode || 'Hybrid'}
                          </span>
                          <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${isDark ? 'bg-zinc-900 text-zinc-300' : 'bg-zinc-100 text-zinc-700'}`}>
                            {job.experience_level || 'Internship'}
                          </span>
                          {job.skills && job.skills.slice(0, 3).map((s, idx) => (
                            <span key={idx} className={`hidden sm:inline px-2 py-0.5 rounded text-[10px] border ${isDark ? 'border-zinc-800 text-zinc-400' : 'border-zinc-200 text-zinc-600'}`}>
                              {s}
                            </span>
                          ))}
                        </div>

                        <span className="font-black text-xs text-emerald-500">
                          {salaryText}
                        </span>
                      </div>

                    </div>
                  );
                })}

                {/* PAGINATION CONTROLS */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-6">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className={`flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold border disabled:opacity-40 transition-colors ${
                        isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-300' : 'bg-white border-zinc-200 text-zinc-700'
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4" /> Previous
                    </button>

                    <span className={`text-xs font-bold ${secondaryText}`}>
                      Page {currentPage} of {totalPages}
                    </span>

                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className={`flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold border disabled:opacity-40 transition-colors ${
                        isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-300' : 'bg-white border-zinc-200 text-zinc-700'
                      }`}
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </main>

        </div>

      </div>

      {/* JOB DETAILS SLIDE-OVER DRAWER / MODAL */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`relative max-w-2xl w-full p-6 sm:p-8 rounded-3xl border shadow-2xl max-h-[90vh] overflow-y-auto ${
            isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'
          }`}>
            <button
              onClick={() => setSelectedJob(null)}
              className="absolute top-6 right-6 p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4 mb-6">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg border ${
                isDark ? 'bg-zinc-900 border-zinc-800 text-green-400' : 'bg-green-50 border-green-200 text-green-700'
              }`}>
                {selectedJob.company.display_name.slice(0, 2).toUpperCase()}
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-green-500 px-2 py-0.5 rounded bg-green-500/10 border border-green-500/20">
                  {selectedJob.experience_level || 'Internship'}
                </span>
                <h2 className="text-xl sm:text-2xl font-black mt-1">{selectedJob.title}</h2>
                <p className={`text-xs font-semibold ${secondaryText}`}>
                  {selectedJob.company.display_name} • {selectedJob.location.display_name}
                </p>
              </div>
            </div>

            {/* Quick Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              <div className={`p-3 rounded-xl border ${isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
                <span className="text-[10px] font-bold text-zinc-500 block uppercase">Compensation</span>
                <span className="text-xs font-black text-emerald-500">{formatSalary(selectedJob)}</span>
              </div>
              <div className={`p-3 rounded-xl border ${isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
                <span className="text-[10px] font-bold text-zinc-500 block uppercase">Work Mode</span>
                <span className="text-xs font-black text-blue-400">{selectedJob.work_mode || 'Hybrid'}</span>
              </div>
              <div className={`p-3 rounded-xl border col-span-2 sm:col-span-1 ${isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
                <span className="text-[10px] font-bold text-zinc-500 block uppercase">Profile Match</span>
                <span className="text-xs font-black text-green-500">{calculateMatchScore(selectedJob)}% Match</span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4 text-xs leading-relaxed mb-8">
              <h4 className="font-bold text-sm text-zinc-300">About the Role & Responsibilities</h4>
              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-zinc-900/20 border-zinc-800 text-zinc-300' : 'bg-zinc-50 border-zinc-200 text-zinc-700'}`}>
                <p className="whitespace-pre-wrap">{selectedJob.description}</p>
              </div>

              {selectedJob.skills && selectedJob.skills.length > 0 && (
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-500 mb-2">Recommended Skills</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedJob.skills.map((s, idx) => (
                      <span key={idx} className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border ${
                        isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-300' : 'bg-zinc-100 border-zinc-200 text-zinc-700'
                      }`}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer CTAs */}
            <div className="flex items-center justify-between pt-4 border-t border-zinc-800 gap-3">
              <button
                onClick={() => toggleBookmark(selectedJob.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-xs font-bold transition-colors ${
                  savedJobIds.includes(selectedJob.id) 
                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' 
                    : isDark ? 'border-zinc-800 text-zinc-300' : 'border-zinc-200 text-zinc-700'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${savedJobIds.includes(selectedJob.id) ? 'fill-current' : ''}`} />
                <span>{savedJobIds.includes(selectedJob.id) ? 'Saved' : 'Save Job'}</span>
              </button>

              <a
                href={selectedJob.redirect_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold transition-all shadow-md shadow-green-600/20"
              >
                <span>Apply on Company Site</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Internships;