import React from 'react';

interface ResumePreviewProps {
  data: any;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({ data }) => {
  if (!data) {
    return (
      <div className="flex h-full w-full items-center justify-center text-zinc-400">
        <p>Loading preview...</p>
      </div>
    );
  }

  // Helper to format dates from YYYY-MM-DD to "Mon YYYY"
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    // Forces a physical paper look (white bg, black text) regardless of app theme
    <div className="w-full h-full bg-white text-zinc-900 overflow-y-auto shadow-sm p-8 text-sm font-sans">
      
      {/* 1. HEADER (Personal Info) */}
      <header className="text-center mb-6 border-b-2 border-zinc-300 pb-4">
        <h1 className="text-3xl font-bold uppercase tracking-wider mb-2">
          {data.full_name || 'Your Name'}
        </h1>
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-zinc-600 text-xs">
          {data.email && <span>{data.email}</span>}
          {data.email && data.phone && <span>•</span>}
          {data.phone && <span>{data.phone}</span>}
          {(data.email || data.phone) && data.location && <span>•</span>}
          {data.location && <span>{data.location}</span>}
        </div>
        <div className="flex flex-wrap justify-center gap-4 mt-2 text-zinc-600 text-xs">
          {data.linkedin && <a href={data.linkedin} className="hover:underline text-blue-700">LinkedIn</a>}
          {data.github && <a href={data.github} className="hover:underline text-blue-700">GitHub</a>}
          {data.portfolio && <a href={data.portfolio} className="hover:underline text-blue-700">Portfolio</a>}
        </div>
      </header>

      {/* 2. PROFILE SUMMARY */}
      {data.profile_summary && (
        <section className="mb-5">
          <h2 className="text-lg font-bold uppercase tracking-widest text-zinc-800 border-b border-zinc-200 mb-2">Summary</h2>
          <p className="text-zinc-700 leading-relaxed text-xs">{data.profile_summary}</p>
        </section>
      )}

      {/* 3. EXPERIENCE */}
      {data.experiences && data.experiences.length > 0 && (
        <section className="mb-5">
          <h2 className="text-lg font-bold uppercase tracking-widest text-zinc-800 border-b border-zinc-200 mb-2">Experience</h2>
          <div className="flex flex-col gap-4">
            {data.experiences.map((exp: any, index: number) => (
              <div key={index}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-semibold text-zinc-900">{exp.role}</h3>
                  <span className="text-xs font-medium text-zinc-600">
                    {formatDate(exp.start_date)} - {exp.currently_working ? 'Present' : formatDate(exp.end_date)}
                  </span>
                </div>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-sm text-zinc-700 italic">{exp.company}</span>
                  {exp.location && <span className="text-xs text-zinc-500">{exp.location}</span>}
                </div>
                {exp.description && (
                  <p className="text-xs text-zinc-700 mt-1 whitespace-pre-wrap">{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. EDUCATION */}
      {data.educations && data.educations.length > 0 && (
        <section className="mb-5">
          <h2 className="text-lg font-bold uppercase tracking-widest text-zinc-800 border-b border-zinc-200 mb-2">Education</h2>
          <div className="flex flex-col gap-3">
            {data.educations.map((edu: any, index: number) => (
              <div key={index}>
                <div className="flex justify-between items-baseline">
                  <h3 className="font-semibold text-zinc-900">{edu.institution}</h3>
                  <span className="text-xs font-medium text-zinc-600">
                    {formatDate(edu.start_date)} - {formatDate(edu.end_date)}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-zinc-700">
                  <span>{edu.degree} {edu.field_of_study ? `in ${edu.field_of_study}` : ''}</span>
                  {edu.grade && <span className="text-xs text-zinc-500">Grade: {edu.grade}</span>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. PROJECTS */}
      {data.projects && data.projects.length > 0 && (
        <section className="mb-5">
          <h2 className="text-lg font-bold uppercase tracking-widest text-zinc-800 border-b border-zinc-200 mb-2">Projects</h2>
          <div className="flex flex-col gap-3">
            {data.projects.map((proj: any, index: number) => (
              <div key={index}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-semibold text-zinc-900">
                    {proj.title} 
                    {proj.tech_stack && <span className="font-normal text-zinc-500 text-xs ml-2">| {proj.tech_stack}</span>}
                  </h3>
                  <div className="text-xs flex gap-2">
                    {proj.github && <a href={proj.github} className="text-blue-700 hover:underline">Repo</a>}
                    {proj.live_demo && <a href={proj.live_demo} className="text-blue-700 hover:underline">Live</a>}
                  </div>
                </div>
                {proj.description && <p className="text-xs text-zinc-700 whitespace-pre-wrap">{proj.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. SKILLS & LANGUAGES (2-Column Layout) */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        {data.skills && data.skills.length > 0 && (
          <section>
            <h2 className="text-lg font-bold uppercase tracking-widest text-zinc-800 border-b border-zinc-200 mb-2">Skills</h2>
            <div className="flex flex-wrap gap-1">
              {data.skills.map((skill: any, index: number) => (
                <span key={index} className="text-xs bg-zinc-100 text-zinc-800 px-2 py-1 rounded">
                  {skill.skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {data.languages && data.languages.length > 0 && (
          <section>
            <h2 className="text-lg font-bold uppercase tracking-widest text-zinc-800 border-b border-zinc-200 mb-2">Languages</h2>
            <ul className="list-disc list-inside text-xs text-zinc-700">
              {data.languages.map((lang: any, index: number) => (
                <li key={index}>
                  <span className="font-medium">{lang.language}</span> 
                  {lang.proficiency && <span className="text-zinc-500"> ({lang.proficiency})</span>}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {/* 7. ACHIEVEMENTS & CERTIFICATES */}
      <div className="grid grid-cols-2 gap-4">
        {data.achievements && data.achievements.length > 0 && (
          <section>
            <h2 className="text-lg font-bold uppercase tracking-widest text-zinc-800 border-b border-zinc-200 mb-2">Achievements</h2>
            <ul className="list-disc list-inside text-xs text-zinc-700 flex flex-col gap-1">
              {data.achievements.map((ach: any, index: number) => (
                <li key={index}>
                  <span className="font-medium text-zinc-900">{ach.title}</span>
                  {ach.description && <span className="block pl-4 text-zinc-500">{ach.description}</span>}
                </li>
              ))}
            </ul>
          </section>
        )}

        {data.certificates && data.certificates.length > 0 && (
          <section>
            <h2 className="text-lg font-bold uppercase tracking-widest text-zinc-800 border-b border-zinc-200 mb-2">Certifications</h2>
            <ul className="text-xs text-zinc-700 flex flex-col gap-2">
              {data.certificates.map((cert: any, index: number) => (
                <li key={index}>
                  <div className="font-medium text-zinc-900">{cert.name}</div>
                  <div className="text-zinc-500 flex justify-between">
                    <span>{cert.issuer}</span>
                    {cert.issue_date && <span>{formatDate(cert.issue_date)}</span>}
                  </div>
                  {cert.credential_url && (
                    <a href={cert.credential_url} className="text-blue-700 hover:underline">View Credential</a>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
};

export default ResumePreview;