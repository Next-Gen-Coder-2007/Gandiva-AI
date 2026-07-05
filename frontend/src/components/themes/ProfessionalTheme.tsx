import React from 'react';

interface ThemeProps {
  data: any;
  colorTheme: string;
}

const ProfessionalTheme: React.FC<ThemeProps> = ({ data, colorTheme }) => {
  // Helper to map the color string to actual Tailwind text colors
  const getColorClass = (color: string) => {
    const colors: Record<string, string> = {
      green: 'text-green-700',
      blue: 'text-blue-700',
      purple: 'text-purple-700',
      rose: 'text-rose-700',
      zinc: 'text-zinc-700'
    };
    return colors[color] || 'text-zinc-700';
  };

  const getBorderClass = (color: string) => {
    const borders: Record<string, string> = {
      green: 'border-green-700',
      blue: 'border-blue-700',
      purple: 'border-purple-700',
      rose: 'border-rose-700',
      zinc: 'border-zinc-700'
    };
    return borders[color] || 'border-zinc-700';
  };

  const primaryColor = getColorClass(colorTheme);
  const primaryBorder = getBorderClass(colorTheme);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <div className="w-full h-full bg-white text-zinc-900 overflow-y-auto shadow-sm p-8 text-sm font-serif">
      
      {/* 1. HEADER */}
      <header className={`text-center mb-6 border-b-2 ${primaryBorder} pb-4`}>
        <h1 className={`text-3xl font-bold uppercase tracking-wider mb-2 ${primaryColor}`}>
          {data.full_name || 'Your Name'}
        </h1>
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-zinc-700 text-xs font-sans">
          {data.email && <span>{data.email}</span>}
          {data.email && data.phone && <span>•</span>}
          {data.phone && <span>{data.phone}</span>}
          {(data.email || data.phone) && data.location && <span>•</span>}
          {data.location && <span>{data.location}</span>}
        </div>
        <div className="flex flex-wrap justify-center gap-4 mt-2 text-zinc-600 text-xs font-sans">
          {data.linkedin && <a href={data.linkedin} className={`hover:underline ${primaryColor}`}>LinkedIn</a>}
          {data.github && <a href={data.github} className={`hover:underline ${primaryColor}`}>GitHub</a>}
          {data.portfolio && <a href={data.portfolio} className={`hover:underline ${primaryColor}`}>Portfolio</a>}
        </div>
      </header>

      {/* 2. PROFILE SUMMARY */}
      {data.profile_summary && (
        <section className="mb-5">
          <h2 className={`text-lg font-bold uppercase tracking-widest border-b mb-2 ${primaryBorder} ${primaryColor}`}>Summary</h2>
          <p className="text-zinc-800 leading-relaxed text-xs">{data.profile_summary}</p>
        </section>
      )}

      {/* 3. EXPERIENCE */}
      {data.experiences && data.experiences.length > 0 && (
        <section className="mb-5">
          <h2 className={`text-lg font-bold uppercase tracking-widest border-b mb-2 ${primaryBorder} ${primaryColor}`}>Experience</h2>
          <div className="flex flex-col gap-4">
            {data.experiences.map((exp: any, index: number) => (
              <div key={index}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold text-zinc-900">{exp.role}</h3>
                  <span className="text-xs font-medium text-zinc-700">
                    {formatDate(exp.start_date)} - {exp.currently_working ? 'Present' : formatDate(exp.end_date)}
                  </span>
                </div>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-sm text-zinc-800 italic">{exp.company}</span>
                  {exp.location && <span className="text-xs text-zinc-600">{exp.location}</span>}
                </div>
                {exp.description && (
                  <p className="text-xs text-zinc-800 mt-1 whitespace-pre-wrap">{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. EDUCATION */}
      {data.educations && data.educations.length > 0 && (
        <section className="mb-5">
          <h2 className={`text-lg font-bold uppercase tracking-widest border-b mb-2 ${primaryBorder} ${primaryColor}`}>Education</h2>
          <div className="flex flex-col gap-3">
            {data.educations.map((edu: any, index: number) => (
              <div key={index}>
                <div className="flex justify-between items-baseline">
                  <h3 className="font-bold text-zinc-900">{edu.institution}</h3>
                  <span className="text-xs font-medium text-zinc-700">
                    {formatDate(edu.start_date)} - {formatDate(edu.end_date)}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-zinc-800">
                  <span>{edu.degree} {edu.field_of_study ? `in ${edu.field_of_study}` : ''}</span>
                  {edu.grade && <span className="text-xs text-zinc-600">Grade: {edu.grade}</span>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. PROJECTS */}
      {data.projects && data.projects.length > 0 && (
        <section className="mb-5">
          <h2 className={`text-lg font-bold uppercase tracking-widest border-b mb-2 ${primaryBorder} ${primaryColor}`}>Projects</h2>
          <div className="flex flex-col gap-3">
            {data.projects.map((proj: any, index: number) => (
              <div key={index}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold text-zinc-900">
                    {proj.title} 
                    {proj.tech_stack && <span className="font-normal text-zinc-600 text-xs ml-2 font-sans">| {proj.tech_stack}</span>}
                  </h3>
                  <div className="text-xs flex gap-2 font-sans">
                    {proj.github && <a href={proj.github} className={`${primaryColor} hover:underline`}>Repo</a>}
                    {proj.live_demo && <a href={proj.live_demo} className={`${primaryColor} hover:underline`}>Live</a>}
                  </div>
                </div>
                {proj.description && <p className="text-xs text-zinc-800 whitespace-pre-wrap">{proj.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. SKILLS, LANGUAGES, ACHIEVEMENTS, CERTS */}
      <div className="grid grid-cols-2 gap-4">
        {data.skills && data.skills.length > 0 && (
          <section className="mb-5">
            <h2 className={`text-lg font-bold uppercase tracking-widest border-b mb-2 ${primaryBorder} ${primaryColor}`}>Skills</h2>
            <div className="flex flex-wrap gap-1 font-sans">
              {data.skills.map((skill: any, index: number) => (
                <span key={index} className="text-xs text-zinc-800 font-medium">
                  {skill.skill}{index < data.skills.length - 1 ? ', ' : ''}
                </span>
              ))}
            </div>
          </section>
        )}

        {data.languages && data.languages.length > 0 && (
          <section className="mb-5">
            <h2 className={`text-lg font-bold uppercase tracking-widest border-b mb-2 ${primaryBorder} ${primaryColor}`}>Languages</h2>
            <ul className="list-disc list-inside text-xs text-zinc-800">
              {data.languages.map((lang: any, index: number) => (
                <li key={index}>
                  <span className="font-medium">{lang.language}</span> 
                  {lang.proficiency && <span className="text-zinc-600"> - {lang.proficiency}</span>}
                </li>
              ))}
            </ul>
          </section>
        )}

        {data.achievements && data.achievements.length > 0 && (
          <section>
            <h2 className={`text-lg font-bold uppercase tracking-widest border-b mb-2 ${primaryBorder} ${primaryColor}`}>Achievements</h2>
            <ul className="list-disc list-inside text-xs text-zinc-800 flex flex-col gap-1">
              {data.achievements.map((ach: any, index: number) => (
                <li key={index}>
                  <span className="font-bold text-zinc-900">{ach.title}</span>
                  {ach.description && <span className="block pl-4 text-zinc-700 mt-0.5">{ach.description}</span>}
                </li>
              ))}
            </ul>
          </section>
        )}

        {data.certificates && data.certificates.length > 0 && (
          <section>
            <h2 className={`text-lg font-bold uppercase tracking-widest border-b mb-2 ${primaryBorder} ${primaryColor}`}>Certifications</h2>
            <ul className="text-xs text-zinc-800 flex flex-col gap-2">
              {data.certificates.map((cert: any, index: number) => (
                <li key={index}>
                  <div className="font-bold text-zinc-900">{cert.name}</div>
                  <div className="text-zinc-600 flex justify-between">
                    <span>{cert.issuer}</span>
                    {cert.issue_date && <span>{formatDate(cert.issue_date)}</span>}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProfessionalTheme;