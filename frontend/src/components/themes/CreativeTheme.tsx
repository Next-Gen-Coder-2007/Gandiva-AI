import React from 'react';

interface ThemeProps {
  data: any;
  colorTheme: string;
}

const CreativeTheme: React.FC<ThemeProps> = ({ data, colorTheme }) => {
  // Mapping for the solid background header
  const getHeaderBg = (color: string) => {
    const bgs: Record<string, string> = {
      green: 'bg-green-600',
      blue: 'bg-blue-600',
      purple: 'bg-purple-600',
      rose: 'bg-rose-600',
      zinc: 'bg-zinc-800'
    };
    return bgs[color] || 'bg-zinc-800';
  };

  // Mapping for accent text/borders
  const getAccentColor = (color: string) => {
    const colors: Record<string, string> = {
      green: 'text-green-600 border-green-600',
      blue: 'text-blue-600 border-blue-600',
      purple: 'text-purple-600 border-purple-600',
      rose: 'text-rose-600 border-rose-600',
      zinc: 'text-zinc-800 border-zinc-800'
    };
    return colors[color] || 'text-zinc-800 border-zinc-800';
  };

  // Mapping for skill pills
  const getPillStyle = (color: string) => {
    const pills: Record<string, string> = {
      green: 'border-green-200 text-green-700 bg-green-50',
      blue: 'border-blue-200 text-blue-700 bg-blue-50',
      purple: 'border-purple-200 text-purple-700 bg-purple-50',
      rose: 'border-rose-200 text-rose-700 bg-rose-50',
      zinc: 'border-zinc-300 text-zinc-800 bg-zinc-100'
    };
    return pills[color] || 'border-zinc-300 text-zinc-800 bg-zinc-100';
  };

  const headerBg = getHeaderBg(colorTheme);
  const accentColor = getAccentColor(colorTheme);
  const pillStyle = getPillStyle(colorTheme);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <div className="w-full h-full bg-white text-zinc-900 overflow-y-auto shadow-sm font-sans flex flex-col">
      
      {/* FULL-WIDTH HEADER */}
      <header className={`w-full px-8 py-10 ${headerBg} text-white flex flex-col justify-center items-center text-center`}>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4 drop-shadow-sm uppercase">
          {data.full_name || 'Your Name'}
        </h1>
        
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-white/90 text-sm font-medium">
          {data.email && <span>{data.email}</span>}
          {data.email && data.phone && <span className="opacity-50">•</span>}
          {data.phone && <span>{data.phone}</span>}
          {(data.email || data.phone) && data.location && <span className="opacity-50">•</span>}
          {data.location && <span>{data.location}</span>}
        </div>
        
        <div className="flex flex-wrap justify-center gap-6 mt-4 text-white/80 text-sm">
          {data.linkedin && <a href={data.linkedin} className="hover:text-white transition-colors underline underline-offset-4 decoration-white/40 hover:decoration-white">LinkedIn</a>}
          {data.github && <a href={data.github} className="hover:text-white transition-colors underline underline-offset-4 decoration-white/40 hover:decoration-white">GitHub</a>}
          {data.portfolio && <a href={data.portfolio} className="hover:text-white transition-colors underline underline-offset-4 decoration-white/40 hover:decoration-white">Portfolio</a>}
        </div>
      </header>

      {/* TWO-COLUMN GRID */}
      <div className="flex-1 grid grid-cols-12 gap-8 p-8">
        
        {/* LEFT COLUMN (Narrow) */}
        <div className="col-span-12 sm:col-span-4 flex flex-col gap-8">
          
          {/* Education */}
          {data.educations && data.educations.length > 0 && (
            <section>
              <h2 className={`text-xl font-black uppercase tracking-widest mb-4 border-b-4 pb-1 inline-block ${accentColor}`}>
                Education
              </h2>
              <div className="flex flex-col gap-4">
                {data.educations.map((edu: any, index: number) => (
                  <div key={index}>
                    <h3 className="font-bold text-zinc-900 text-sm leading-tight">{edu.degree}</h3>
                    {edu.field_of_study && <p className="text-sm font-medium text-zinc-700">{edu.field_of_study}</p>}
                    <p className="text-xs text-zinc-500 mt-1">{edu.institution}</p>
                    <p className="text-xs font-semibold text-zinc-400 mt-0.5">
                      {formatDate(edu.start_date)} - {formatDate(edu.end_date)}
                    </p>
                    {edu.grade && <p className="text-xs text-zinc-500 mt-1">Grade: {edu.grade}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Skills */}
          {data.skills && data.skills.length > 0 && (
            <section>
              <h2 className={`text-xl font-black uppercase tracking-widest mb-4 border-b-4 pb-1 inline-block ${accentColor}`}>
                Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {data.skills.map((skill: any, index: number) => (
                  <span key={index} className={`text-xs px-3 py-1.5 rounded-full border font-semibold ${pillStyle}`}>
                    {skill.skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Languages */}
          {data.languages && data.languages.length > 0 && (
            <section>
              <h2 className={`text-xl font-black uppercase tracking-widest mb-4 border-b-4 pb-1 inline-block ${accentColor}`}>
                Languages
              </h2>
              <div className="flex flex-col gap-2 text-sm text-zinc-700">
                {data.languages.map((lang: any, index: number) => (
                  <div key={index} className="flex flex-col">
                    <span className="font-bold text-zinc-900">{lang.language}</span>
                    {lang.proficiency && <span className="text-xs text-zinc-500">{lang.proficiency}</span>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Certifications */}
          {data.certificates && data.certificates.length > 0 && (
            <section>
              <h2 className={`text-xl font-black uppercase tracking-widest mb-4 border-b-4 pb-1 inline-block ${accentColor}`}>
                Certificates
              </h2>
              <div className="flex flex-col gap-3 text-sm">
                {data.certificates.map((cert: any, index: number) => (
                  <div key={index}>
                    <div className="font-bold text-zinc-900">{cert.name}</div>
                    <div className="text-xs text-zinc-600">{cert.issuer}</div>
                    {cert.issue_date && <div className="text-xs text-zinc-400 mt-0.5">{formatDate(cert.issue_date)}</div>}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* RIGHT COLUMN (Wide) */}
        <div className="col-span-12 sm:col-span-8 flex flex-col gap-8">
          
          {/* Summary */}
          {data.profile_summary && (
            <section>
              <h2 className={`text-xl font-black uppercase tracking-widest mb-4 border-b-4 pb-1 inline-block ${accentColor}`}>
                Profile
              </h2>
              <p className="text-sm text-zinc-700 leading-relaxed font-medium">
                {data.profile_summary}
              </p>
            </section>
          )}

          {/* Experience */}
          {data.experiences && data.experiences.length > 0 && (
            <section>
              <h2 className={`text-xl font-black uppercase tracking-widest mb-4 border-b-4 pb-1 inline-block ${accentColor}`}>
                Experience
              </h2>
              <div className="flex flex-col gap-6">
                {data.experiences.map((exp: any, index: number) => (
                  <div key={index} className="group relative">
                    <div className="flex justify-between items-end mb-1">
                      <h3 className="font-bold text-lg text-zinc-900 leading-none">{exp.role}</h3>
                      <span className="text-xs font-bold text-zinc-400 whitespace-nowrap ml-4">
                        {formatDate(exp.start_date)} - {exp.currently_working ? 'Present' : formatDate(exp.end_date)}
                      </span>
                    </div>
                    <div className={`text-sm font-bold mb-2 ${accentColor.split(' ')[0]}`}>
                      {exp.company} {exp.location && <span className="text-zinc-400 font-normal ml-1">| {exp.location}</span>}
                    </div>
                    {exp.description && (
                      <p className="text-sm text-zinc-600 whitespace-pre-wrap leading-relaxed">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Projects */}
          {data.projects && data.projects.length > 0 && (
            <section>
              <h2 className={`text-xl font-black uppercase tracking-widest mb-4 border-b-4 pb-1 inline-block ${accentColor}`}>
                Projects
              </h2>
              <div className="flex flex-col gap-5">
                {data.projects.map((proj: any, index: number) => (
                  <div key={index} className="border-l-4 pl-4 border-zinc-200">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="font-bold text-base text-zinc-900">{proj.title}</h3>
                      <div className="text-xs font-medium flex gap-3">
                        {proj.github && <a href={proj.github} className="text-zinc-400 hover:text-zinc-900 underline underline-offset-2">Repo</a>}
                        {proj.live_demo && <a href={proj.live_demo} className="text-zinc-400 hover:text-zinc-900 underline underline-offset-2">Live Demo</a>}
                      </div>
                    </div>
                    {proj.tech_stack && (
                      <div className={`text-xs font-bold mb-1.5 ${accentColor.split(' ')[0]}`}>
                        {proj.tech_stack}
                      </div>
                    )}
                    {proj.description && (
                      <p className="text-sm text-zinc-600 whitespace-pre-wrap leading-relaxed">{proj.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Achievements */}
          {data.achievements && data.achievements.length > 0 && (
            <section>
              <h2 className={`text-xl font-black uppercase tracking-widest mb-4 border-b-4 pb-1 inline-block ${accentColor}`}>
                Achievements
              </h2>
              <ul className="list-square list-inside text-sm text-zinc-700 flex flex-col gap-2">
                {data.achievements.map((ach: any, index: number) => (
                  <li key={index} className="marker:text-zinc-400">
                    <strong className="text-zinc-900">{ach.title}</strong>
                    {ach.description && <span className="block pl-5 text-zinc-500 mt-0.5">{ach.description}</span>}
                  </li>
                ))}
              </ul>
            </section>
          )}

        </div>
      </div>
    </div>
  );
};

export default CreativeTheme;