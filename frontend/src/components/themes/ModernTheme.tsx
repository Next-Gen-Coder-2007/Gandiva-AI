import React, { useMemo } from 'react';

interface ThemeProps {
  data: any;
  colorTheme: string;
}

const ModernTheme: React.FC<ThemeProps> = ({ data, colorTheme }) => {
  // Color mappings for the modern theme
  const getPrimaryColor = (color: string) => {
    const colors: Record<string, string> = {
      green: 'text-green-600',
      blue: 'text-blue-600',
      purple: 'text-purple-600',
      rose: 'text-rose-600',
      zinc: 'text-zinc-600'
    };
    return colors[color] || 'text-zinc-600';
  };

  const getSidebarBg = (color: string) => {
    const bgs: Record<string, string> = {
      green: 'bg-green-50',
      blue: 'bg-blue-50',
      purple: 'bg-purple-50',
      rose: 'bg-rose-50',
      zinc: 'bg-zinc-50'
    };
    return bgs[color] || 'bg-zinc-50';
  };

  const getPillClass = (color: string) => {
    const pills: Record<string, string> = {
      green: 'bg-green-100 text-green-700',
      blue: 'bg-blue-100 text-blue-700',
      purple: 'bg-purple-100 text-purple-700',
      rose: 'bg-rose-100 text-rose-700',
      zinc: 'bg-zinc-200 text-zinc-700'
    };
    return pills[color] || 'bg-zinc-200 text-zinc-700';
  };

  const primaryColor = getPrimaryColor(colorTheme);
  const sidebarBg = getSidebarBg(colorTheme);
  const pillClass = getPillClass(colorTheme);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  // Group skills by category
  const groupedSkills = useMemo(() => {
    if (!data.skills || !Array.isArray(data.skills)) return {};
    return data.skills.reduce((acc: Record<string, any[]>, currentSkill: any) => {
      // Default to 'Other' if no category is provided
      const category = currentSkill.category || 'Other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(currentSkill);
      return acc;
    }, {});
  }, [data.skills]);

  return (
    <div className="w-full h-full bg-white text-zinc-900 overflow-y-auto shadow-sm text-sm font-sans flex flex-row">
      
      {/* LEFT COLUMN - SIDEBAR */}
      <div className={`w-1/3 p-6 flex flex-col gap-6 ${sidebarBg}`}>
        
        {/* Contact Info */}
        <section>
          <h2 className={`text-sm font-bold uppercase tracking-wider mb-3 ${primaryColor}`}>Contact</h2>
          <div className="flex flex-col gap-2 text-xs text-zinc-700">
            {data.email && <div className="break-words">{data.email}</div>}
            {data.phone && <div>{data.phone}</div>}
            {data.location && <div>{data.location}</div>}
            {data.linkedin && <a href={data.linkedin} className="hover:underline text-blue-600 truncate">LinkedIn</a>}
            {data.github && <a href={data.github} className="hover:underline text-blue-600 truncate">GitHub</a>}
            {data.portfolio && <a href={data.portfolio} className="hover:underline text-blue-600 truncate">Portfolio</a>}
          </div>
        </section>

        {/* Skills - UPDATED TO HANDLE CATEGORIES */}
        {data.skills && data.skills.length > 0 && (
          <section>
            <h2 className={`text-sm font-bold uppercase tracking-wider mb-3 ${primaryColor}`}>Skills</h2>
            <div className="flex flex-col gap-4">
              {Object.entries(groupedSkills).map(([category, skills]: [string, any], catIndex: number) => (
                <div key={catIndex}>
                  <h3 className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                    {category}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skillItem: any, skillIndex: number) => (
                      <span key={skillIndex} className={`text-xs px-2.5 py-1 rounded-md font-medium ${pillClass}`}>
                        {skillItem.skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Languages */}
        {data.languages && data.languages.length > 0 && (
          <section>
            <h2 className={`text-sm font-bold uppercase tracking-wider mb-3 ${primaryColor}`}>Languages</h2>
            <div className="flex flex-col gap-2 text-xs text-zinc-700">
              {data.languages.map((lang: any, index: number) => (
                <div key={index} className="flex justify-between">
                  <span className="font-semibold text-zinc-800">{lang.language}</span>
                  {lang.proficiency && <span>{lang.proficiency}</span>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certificates */}
        {data.certificates && data.certificates.length > 0 && (
          <section>
            <h2 className={`text-sm font-bold uppercase tracking-wider mb-3 ${primaryColor}`}>Certifications</h2>
            <div className="flex flex-col gap-3 text-xs text-zinc-700">
              {data.certificates.map((cert: any, index: number) => (
                <div key={index}>
                  <div className="font-semibold text-zinc-800">{cert.name}</div>
                  <div className="text-zinc-600">{cert.issuer}</div>
                  {cert.issue_date && <div className="text-zinc-500 mt-0.5">{formatDate(cert.issue_date)}</div>}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* RIGHT COLUMN - MAIN CONTENT */}
      <div className="w-2/3 p-6 flex flex-col gap-6">
        
        {/* Header / Name */}
        <header className="border-b border-zinc-200 pb-4">
          <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tight mb-2">
            {data.full_name || 'Your Name'}
          </h1>
          {/* If you add a "job_title" to your data model later, it goes perfectly here */}
        </header>

        {/* Profile Summary */}
        {data.profile_summary && (
          <section>
            <h2 className={`text-sm font-bold uppercase tracking-wider mb-2 ${primaryColor}`}>Profile</h2>
            <p className="text-xs text-zinc-600 leading-relaxed">
              {data.profile_summary}
            </p>
          </section>
        )}

        {/* Experience */}
        {data.experiences && data.experiences.length > 0 && (
          <section>
            <h2 className={`text-sm font-bold uppercase tracking-wider mb-3 ${primaryColor}`}>Experience</h2>
            <div className="flex flex-col gap-4">
              {data.experiences.map((exp: any, index: number) => (
                <div key={index} className="relative pl-4 border-l-2 border-zinc-200">
                  <div className="absolute w-2 h-2 rounded-full bg-zinc-400 -left-[5px] top-1.5 border-2 border-white"></div>
                  <div className="flex justify-between items-start mb-0.5">
                    <h3 className="font-bold text-zinc-900 text-sm">{exp.role}</h3>
                    <span className="text-xs font-medium text-zinc-500 whitespace-nowrap ml-2">
                      {formatDate(exp.start_date)} - {exp.currently_working ? 'Present' : formatDate(exp.end_date)}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-zinc-700 mb-1">
                    {exp.company} {exp.location && <span className="font-normal text-zinc-500 ml-1">• {exp.location}</span>}
                  </div>
                  {exp.description && (
                    <p className="text-xs text-zinc-600 whitespace-pre-wrap mt-1">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {data.projects && data.projects.length > 0 && (
          <section>
            <h2 className={`text-sm font-bold uppercase tracking-wider mb-3 ${primaryColor}`}>Projects</h2>
            <div className="grid grid-cols-1 gap-4">
              {data.projects.map((proj: any, index: number) => (
                <div key={index} className="bg-zinc-50 rounded-lg p-3 border border-zinc-100">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-zinc-900 text-sm">{proj.title}</h3>
                    <div className="text-xs flex gap-2">
                      {proj.github && <a href={proj.github} className="text-blue-600 hover:underline">Repo</a>}
                      {proj.live_demo && <a href={proj.live_demo} className="text-blue-600 hover:underline">Live</a>}
                    </div>
                  </div>
                  {proj.tech_stack && (
                    <div className={`text-[10px] font-semibold mb-1.5 ${primaryColor}`}>
                      {proj.tech_stack}
                    </div>
                  )}
                  {proj.description && (
                    <p className="text-xs text-zinc-600 whitespace-pre-wrap">{proj.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {data.educations && data.educations.length > 0 && (
          <section>
            <h2 className={`text-sm font-bold uppercase tracking-wider mb-3 ${primaryColor}`}>Education</h2>
            <div className="flex flex-col gap-3">
              {data.educations.map((edu: any, index: number) => (
                <div key={index}>
                  <div className="flex justify-between items-start mb-0.5">
                    <h3 className="font-bold text-zinc-900 text-sm">{edu.institution}</h3>
                    <span className="text-xs font-medium text-zinc-500 whitespace-nowrap ml-2">
                      {formatDate(edu.start_date)} - {formatDate(edu.end_date)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-zinc-600">
                    <span>{edu.degree} {edu.field_of_study ? `in ${edu.field_of_study}` : ''}</span>
                    {edu.grade && <span className="font-medium bg-zinc-100 px-1.5 py-0.5 rounded">Grade: {edu.grade}</span>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {data.achievements && data.achievements.length > 0 && (
          <section>
            <h2 className={`text-sm font-bold uppercase tracking-wider mb-2 ${primaryColor}`}>Achievements</h2>
            <ul className="list-disc list-outside ml-4 text-xs text-zinc-600 flex flex-col gap-1.5">
              {data.achievements.map((ach: any, index: number) => (
                <li key={index}>
                  <strong className="text-zinc-800">{ach.title}</strong>
                  {ach.description && <span>: {ach.description}</span>}
                </li>
              ))}
            </ul>
          </section>
        )}

      </div>
    </div>
  );
};

export default ModernTheme;