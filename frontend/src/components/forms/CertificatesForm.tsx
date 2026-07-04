import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Plus, Trash2 } from 'lucide-react';

const CertificatesForm: React.FC = () => {
  const { isDark } = useTheme();
  const [certs, setCerts] = useState<any[]>([]);
  const [formData, setFormData] = useState({ name: '', issuer: '', issue_date: '', credential_id: '', credential_url: '' });

  const inputClass = `w-full p-3 rounded-xl border outline-none transition-colors ${
    isDark ? 'bg-black border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
  }`;

  const addCert = () => {
    if (formData.name && formData.issuer) {
      setCerts([...certs, formData]);
      setFormData({ name: '', issuer: '', issue_date: '', credential_id: '', credential_url: '' });
    }
  };

  const removeCert = (index: number) => setCerts(certs.filter((_, i) => i !== index));

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold">Certificates</h3>

      {/* Input Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input placeholder="Name" className={inputClass} value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
        <input placeholder="Issuer" className={inputClass} value={formData.issuer} onChange={(e) => setFormData({...formData, issuer: e.target.value})} />
        <input type="date" className={inputClass} value={formData.issue_date} onChange={(e) => setFormData({...formData, issue_date: e.target.value})} />
        <input placeholder="Credential ID" className={inputClass} value={formData.credential_id} onChange={(e) => setFormData({...formData, credential_id: e.target.value})} />
      </div>
      <input placeholder="Credential URL" className={inputClass} value={formData.credential_url} onChange={(e) => setFormData({...formData, credential_url: e.target.value})} />
      
      <button onClick={addCert} className="flex items-center gap-2 w-full justify-center py-3 bg-zinc-900 text-white rounded-xl font-semibold hover:bg-black">
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
            <button onClick={() => removeCert(i)} className="text-red-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>

      <button className="w-full py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700">Save All Certificates</button>
    </div>
  );
};

export default CertificatesForm;