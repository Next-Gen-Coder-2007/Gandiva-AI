import React from 'react';
import ProfessionalTheme from './themes/ProfessionalTheme';
import ModernTheme from './themes/ModernTheme';
import CreativeTheme from './themes/CreativeTheme';
import MinimalTheme from './themes/MinimalTheme';

interface ResumePreviewProps {
  data: any;
  layoutTheme?: string;
  colorTheme?: string;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({ 
  data, 
  layoutTheme = 'professional', 
  colorTheme = 'green' 
}) => {
  if (!data) {
    return (
      <div className="flex h-full w-full items-center justify-center text-zinc-400 bg-white shadow-sm p-8">
        <p>Loading preview...</p>
      </div>
    );
  }

  const themeProps = { data, colorTheme };

  switch (layoutTheme.toLowerCase()) {
    case 'modern':
      return <ModernTheme {...themeProps} />;
    case 'creative':
      return <CreativeTheme {...themeProps} />;
    case 'minimal':
      return <MinimalTheme {...themeProps} />;
    case 'professional':
    default:
      return <ProfessionalTheme {...themeProps} />;
  }
};

export default ResumePreview;