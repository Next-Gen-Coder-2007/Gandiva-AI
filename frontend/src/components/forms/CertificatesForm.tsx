import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Plus, Trash2, Loader2 } from 'lucide-react'; // Added Loader2
import { updateResumeCertificates } from '../../services/resume';

interface Certificate {
  name: string;
  issuer: string;
  issue_date: string;
  credential_id: string;
  credential_url: string;
}

interface Props {
  id: number;
  data: Certificate[] | null;
  onUpdate: (data: any) => void;
}

const CertificatesForm: React.FC<Props> = ({ id, data, onUpdate }) => {
  const { isDark } = useTheme();
  
  const [certs, setCerts] = useState<Certificate[]>(data || []);
  const [current, setCurrent] = useState<Certificate>({ 
    name: '', issuer: '', issue_date: '', credential_id: '', credential_url: '' 
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (field: keyof Certificate, value: string) => {
    setCurrent({ ...current, [field]: value });
    if (saveStatus !== 'idle') setSaveStatus('idle');
  };

  const addCert = () => {
    if (current.name.trim() && current.issuer.trim()) {
      const updatedList = [...certs, current];
      setCerts(updatedList);
      onUpdate(updatedList);
      setCurrent({ name: '', issuer: '', issue_date: '', credential_id: '', credential_url: '' });
      setSaveStatus('idle');
    }
  };

  const removeCert = (index: number) => {
    const updatedList = certs.filter((_, i) => i !== index);
    setCerts(updatedList);
    onUpdate(updatedList);
    setSaveStatus('idle');
  }

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');

    try {
      await updateResumeCertificates(id, certs);
      setSaveStatus('success');
      
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
      
    } catch (err: any) {
      console.error("Error saving Certificates:", err.response?.detail || err.message);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  }

  const inputClass = `w-full p-3 rounded-xl border outline-none transition-colors ${
    isDark 
      ? 'bg-black border-zinc-800 text-white focus:border-green-500' 
      : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-green-500'
  }`;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input name="name" placeholder="Name" className={inputClass} value={current.name} onChange={(e) => handleInputChange('name', e.target.value)} />
        <input name="issuer" placeholder="Issuer" className={inputClass} value={current.issuer} onChange={(e) => handleInputChange('issuer', e.target.value)} />
        <input name="issue_date" type="date" className={inputClass} value={current.issue_date} onChange={(e) => handleInputChange('issue_date', e.target.value)} />
        <input name="credential_id" placeholder="Credential ID" className={inputClass} value={current.credential_id} onChange={(e) => handleInputChange('credential_id', e.target.value)} />
      </div>
      <input name="credential_url" placeholder="Credential URL" className={inputClass} value={current.credential_url} onChange={(e) => handleInputChange('credential_url', e.target.value)} />
      
      <button 
        onClick={addCert}          
        className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold transition-colors ${
            isDark
              ? 'bg-white text-black hover:bg-zinc-200'
              : 'bg-black text-white hover:bg-zinc-600'
          }`}
      >
        <Plus className="w-4 h-4" /> Add Certificate
      </button>

      <div className="space-y-2 mt-4">
        {certs.map((c, i) => (
          <div key={i} className={`flex items-center justify-between p-4 rounded-xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
            <div>
              <p className="font-bold">{c.name}</p>
              <p className="text-sm opacity-60">{c.issuer} {c.issue_date && `• ${c.issue_date}`}</p>
            </div>
            <button onClick={() => removeCert(i)} className="text-red-500 hover:text-red-600">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {certs.length > 0 && (
        <div className="space-y-3 mt-6">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className={`flex items-center justify-center gap-2 w-full py-4 rounded-xl font-bold transition-all ${
              isSaving 
                ? 'bg-green-600/70 cursor-not-allowed text-white' 
                : 'bg-green-600 hover:bg-green-700 text-white active:scale-95'
            }`}
          >
            {isSaving && <Loader2 className="w-5 h-5 animate-spin" />}
            {isSaving ? 'Saving Certificates...' : 'Save All Certificates'}
          </button>

          {saveStatus === 'success' && (
            <p className="text-green-500 text-sm text-center font-medium animate-pulse">
              Certificates saved successfully!
            </p>
          )}
          {saveStatus === 'error' && (
            <p className="text-red-500 text-sm text-center font-medium">
              Failed to save certificates. Please try again.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default CertificatesForm;