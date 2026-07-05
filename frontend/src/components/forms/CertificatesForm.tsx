import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Plus, Trash2 } from 'lucide-react';
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
}

const CertificatesForm: React.FC<Props> = ({ id, data }) => {
  const { isDark } = useTheme();
  
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [formData, setFormData] = useState<Certificate>({ 
    name: '', issuer: '', issue_date: '', credential_id: '', credential_url: '' 
  });

  useEffect(() => {
    if (data && Array.isArray(data)) {
      setCerts(data);
    }
  }, [data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addCert = () => {
    if (formData.name.trim() && formData.issuer.trim()) {
      setCerts([...certs, formData]);
      setFormData({ name: '', issuer: '', issue_date: '', credential_id: '', credential_url: '' });
    }
  };

  const removeCert = (index: number) => setCerts(certs.filter((_, i) => i !== index));

  const handleSave = async () => {
    try {
      await updateResumeCertificates(id, formData)
    } catch (err: any) {
      console.error("Error saving Certificates", err.response?.detail);
    }
  }

  const inputClass = `w-full p-3 rounded-xl border outline-none transition-colors ${
    isDark 
      ? 'bg-black border-zinc-800 text-white focus:border-green-500' 
      : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-green-500'
  }`;

  return (
    <div className="space-y-6">

      {/* Input Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input name="name" placeholder="Name" className={inputClass} value={formData.name} onChange={handleChange} />
        <input name="issuer" placeholder="Issuer" className={inputClass} value={formData.issuer} onChange={handleChange} />
        <input name="issue_date" type="date" className={inputClass} value={formData.issue_date} onChange={handleChange} />
        <input name="credential_id" placeholder="Credential ID" className={inputClass} value={formData.credential_id} onChange={handleChange} />
      </div>
      <input name="credential_url" placeholder="Credential URL" className={inputClass} value={formData.credential_url} onChange={handleChange} />
      
      <button onClick={addCert} className="flex items-center gap-2 w-full justify-center py-3 bg-zinc-900 text-white rounded-xl font-semibold hover:bg-black transition-colors">
        <Plus className="w-4 h-4" /> Add Certificate
      </button>

      {/* Dynamic List */}
      <div className="space-y-2 mt-4">
        {certs.map((c, i) => (
          <div key={i} className={`flex items-center justify-between p-4 rounded-xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
            <div>
              <p className="font-bold">{c.name}</p>
              <p className="text-sm opacity-60">{c.issuer} • {c.issue_date}</p>
            </div>
            <button onClick={() => removeCert(i)} className="text-red-500 hover:text-red-600">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {certs.length > 0 && (
        <button onClick={handleSave} className="w-full py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors">
          Save All Certificates
        </button>
      )}
    </div>
  );
};

export default CertificatesForm;