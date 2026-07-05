import React from 'react';

interface ThemeProps {
  data: any;
  colorTheme: string;
}

const MinimalTheme: React.FC<ThemeProps> = ({ data, colorTheme }) => {
  // Very subtle accent colors for the minimal theme
  const getAccentColor = (color: string) => {
    const colors: Record<string, string> = {
      green: 'text-green-700',
      blue: 'text-blue-700',
      purple: 'text-purple-700',
      rose: 'text-rose-700',
      zinc: 'text-zinc-500' // Zinc uses a softer gray for minimal
    };
    return colors[color] || 'text-zinc-500';
  };

  const getBorderAccent = (color: string) => {
    const borders: Record<string, string> = {
      green: 'border-green-200',
      blue: 'border-blue-200',
      purple: 'border-purple-200',
      rose: 'border-rose-200',
      zinc: 'border-zinc-200'
    };
    return borders[color] || 'border-zinc-200';
  };

  const accentColor = getAccentColor(colorTheme);
  const borderAccent = getBorderAccent(colorTheme);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <div className="w-full h-full bg-white text-zinc-900 overflow-y-auto shadow-sm p-10 font-sans max-w-4xl mx-auto">
      
      {/* 1. HEADER (Ultra clean, centered) */}
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-light tracking-tight text-zinc-900 mb-3">
          {data.full_name || 'Your Name'}
        </h1>
        <div className="flex flex-wrap justify-center items-center gap-2 text-sm text-zinc-500">
          {data.email && <span>{data.email}</span>}
          {data.email && data.phone && <span>|</span>}
          {data.phone && <span>{data.phone}</span>}
          {(data.email || data.phone) && data.location && <span>|</span>}
          {data.location && <span>{data.location}</span>}
        </div>
        <div className={`flex flex-wrap justify-center gap-4 mt-2 text-sm ${accentColor}`}>
          {data.linkedin && <a href={data.linkedin} className="hover:underline">LinkedIn</a>}
          {data.github && <a href={data.github} className="hover:underline">GitHub</a>}
          {data.portfolio && <a href={data.portfolio} className="hover:underline">Portfolio</a>}
        </div>
      </header>

      <div className="flex flex-col gap-8">
        
        {/* 2. PROFILE SUMMARY */}
        {data.profile_summary && (
          <section className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <h2 className="md:col-span-3 text-sm font-semibold uppercase tracking-widest text-zinc-400 mt-1">
              Summary
            </h2>
            <div className="md:col-span-9">
              <p className="text-sm text-zinc-700 leading-relaxed">
                {data.profile_summary}
              </p>
            </div>
          </section>
        )}

        {/* 3. EXPERIENCE */}
        {data.experiences && data.experiences.length > 0 && (
          <section className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <h2 className="md:col-span-3 text-sm font-semibold uppercase tracking-widest text-zinc-400 mt-1">
              Experience
            </h2>
            <div className="md:col-span-9 flex flex-col gap-6">
              {data.experiences.map((exp: any, index: number) => (
                <div key={index} className="flex flex-col">
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-base font-medium text-zinc-900">{exp.role}</h3>
                    <span className={`text-sm font-medium ${accentColor}`}>
                      {formatDate(exp.start_date)} — {exp.currently_working ? 'Present' : formatDate(exp.end_date)}
                    </span>
                  </div>
                  <div className="text-sm text-zinc-500 mb-2">
                    {exp.company} {exp.location && <span>• {exp.location}</span>}
                  </div>
                  {exp.description && (
                    <p className="text-sm text-zinc-700 whitespace-pre-wrap leading-relaxed">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 4. PROJECTS */}
        {data.projects && data.projects.length > 0 && (
          <section className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <h2 className="md:col-span-3 text-sm font-semibold uppercase tracking-widest text-zinc-400 mt-1">
              Projects
            </h2>
            <div className="md:col-span-9 flex flex-col gap-6">
              {data.projects.map((proj: any, index: number) => (
                <div key={index}>
                  <div className="flex justify-between items-baseline mb-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-medium text-zinc-900">{proj.title}</h3>
                      {proj.tech_stack && (
                        <span className={`text-xs px-2 py-0.5 rounded border ${borderAccent} text-zinc-500`}>
                          {proj.tech_stack}
                        </span>
                      )}
                    </div>
                    <div className={`text-sm flex gap-3 ${accentColor}`}>
                      {proj.github && <a href={proj.github} className="hover:underline">Repo</a>}
                      {proj.live_demo && <a href={proj.live_demo} className="hover:underline">Live</a>}
                    </div>
                  </div>
                  {proj.description && (
                    <p className="text-sm text-zinc-700 whitespace-pre-wrap leading-relaxed">
                      {proj.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 5. EDUCATION */}
        {data.educations && data.educations.length > 0 && (
          <section className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <h2 className="md:col-span-3 text-sm font-semibold uppercase tracking-widest text-zinc-400 mt-1">
              Education
            </h2>
            <div className="md:col-span-9 flex flex-col gap-4">
              {data.educations.map((edu: any, index: number) => (
                <div key={index} className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-medium text-zinc-900">{edu.degree} {edu.field_of_study ? `in ${edu.field_of_study}` : ''}</h3>
                    <p className="text-sm text-zinc-500">{edu.institution}</p>
                    {edu.grade && <p className="text-sm text-zinc-500 mt-0.5">Grade: {edu.grade}</p>}
                  </div>
                  <span className={`text-sm font-medium ${accentColor} whitespace-nowrap`}>
                    {formatDate(edu.start_date)} — {formatDate(edu.end_date)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 6. SKILLS & LANGUAGES (Side by Side in the right column) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <h2 className="md:col-span-3 text-sm font-semibold uppercase tracking-widest text-zinc-400 mt-1">
            Expertise
          </h2>
          <div className="md:col-span-9 grid grid-cols-1 sm:grid-cols-2 gap-8">
            
            {data.skills && data.skills.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-zinc-900 mb-2">Skills</h3>
                <p className="text-sm text-zinc-700 leading-relaxed">
                  {data.skills.map((s: any) => s.skill).join(' • ')}
                </p>
              </div>
            )}

            {data.languages && data.languages.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-zinc-900 mb-2">Languages</h3>
                <div className="flex flex-col gap-1">
                  {data.languages.map((lang: any, index: number) => (
                    <div key={index} className="text-sm text-zinc-700 flex justify-between">
                      <span>{lang.language}</span>
                      {lang.proficiency && <span className="text-zinc-400">{lang.proficiency}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 7. ACHIEVEMENTS & CERTIFICATES */}
        {(data.achievements?.length > 0 || data.certificates?.length > 0) && (
          <section className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <h2 className="md:col-span-3 text-sm font-semibold uppercase tracking-widest text-zinc-400 mt-1">
              Additional
            </h2>
            <div className="md:col-span-9 grid grid-cols-1 sm:grid-cols-2 gap-8">
              
              {data.achievements && data.achievements.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-zinc-900 mb-2">Achievements</h3>
                  <ul className="text-sm text-zinc-700 flex flex-col gap-2">
                    {data.achievements.map((ach: any, index: number) => (
                      <li key={index}>
                        <span className="font-medium text-zinc-900">{ach.title}</span>
                        {ach.description && <span className="block text-zinc-500 mt-0.5">{ach.description}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {data.certificates && data.certificates.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-zinc-900 mb-2">Certifications</h3>
                  <ul className="text-sm text-zinc-700 flex flex-col gap-2">
                    {data.certificates.map((cert: any, index: number) => (
                      <li key={index}>
                        <div className="font-medium text-zinc-900">{cert.name}</div>
                        <div className="text-zinc-500 text-xs mt-0.5">
                          {cert.issuer} {cert.issue_date && `• ${formatDate(cert.issue_date)}`}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default MinimalTheme;