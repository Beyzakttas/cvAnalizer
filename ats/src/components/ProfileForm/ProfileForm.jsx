import React, { useState, useRef } from 'react';
import { useCVStore } from '../../store/useCVStore';
import { 
  User, Mail, Phone, MapPin, Plus, Trash2, ArrowRight, 
  Sparkles, Wand2, CloudDownload, CloudUpload, Zap, Trash
} from 'lucide-react';
import { LinkedInImportModal } from './LinkedInImportModal';
import './ProfileForm.css';

export const ProfileForm = ({ onNext }) => {
  const { 
    cvData, updatePersonalInfo, addExperience, removeExperience, 
    setSkills, fillSampleData, generateAISummary,
    exportData, importData
  } = useCVStore();
  
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [showAiMenu, setShowAiMenu] = useState(false);
  const [newExp, setNewExp] = useState({ title: '', company: '', date: '', description: '' });
  const fileInputRef = useRef(null);

  const handlePersonalInfoChange = (e) => {
    updatePersonalInfo({ [e.target.name]: e.target.value });
  };

  const handleImportData = (data) => {
    if (!data) return;
    // Import all personal info fields
    if (data.personalInfo) {
      const pi = data.personalInfo;
      if (pi.fullName)  updatePersonalInfo({ fullName: pi.fullName });
      if (pi.email)     updatePersonalInfo({ email: pi.email });
      if (pi.phone)     updatePersonalInfo({ phone: pi.phone });
      if (pi.location)  updatePersonalInfo({ location: pi.location });
      if (pi.website)   updatePersonalInfo({ website: pi.website });
      if (pi.summary)   updatePersonalInfo({ summary: pi.summary });
    }
    // Import experience
    if (data.experience?.length > 0) {
      data.experience.forEach(exp => addExperience(exp));
    }
    // Merge skills (avoid duplicates)
    if (data.skills?.length > 0) {
      const merged = [...new Set([...cvData.skills, ...data.skills])];
      setSkills(merged);
    }
    setIsImportModalOpen(false);
  };

  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        importData(parsed);
      } catch (err) {
        alert('Geçersiz dosya formatı.');
      }
    };
    reader.readAsText(file);
  };

  const handleAddExp = () => {
    if (newExp.title && newExp.company) {
      addExperience({ ...newExp, id: Date.now() });
      setNewExp({ title: '', company: '', date: '', description: '' });
    }
  };

  return (
    <div className="profile-form-container">
      <div className="profile-header glass animate-fade-in">
        <div className="header-text">
          <h1>Profil Bilgileri</h1>
          <p>Kişisel bilgilerinizi ve deneyimlerinizi eksiksiz doldurun.</p>
        </div>
        <div className="header-actions">
          <button onClick={fillSampleData} className="btn-magic">
            <Zap size={18} /> Örnek Veri
          </button>
          <button onClick={() => setIsImportModalOpen(true)} className="btn-outline">
            <Sparkles size={18} /> LinkedIn İçe Aktar
          </button>
        </div>
      </div>

      <div className="profile-grid">
        <section className="form-section glass animate-fade-in">
          <div className="section-title">
            <User size={20} /> <h2>Kişisel Bilgiler</h2>
          </div>
          <div className="input-grid">
            <div className="input-group">
              <label>Ad Soyad</label>
              <input name="fullName" value={cvData.personalInfo.fullName || ''} onChange={handlePersonalInfoChange} placeholder="Örn: Beyza Aktaş" />
            </div>
            <div className="input-group">
              <label>E-posta</label>
              <input name="email" value={cvData.personalInfo.email || ''} onChange={handlePersonalInfoChange} placeholder="Örn: beyza@example.com" />
            </div>
            <div className="input-group">
              <label>Telefon</label>
              <input name="phone" value={cvData.personalInfo.phone || ''} onChange={handlePersonalInfoChange} placeholder="+90 5XX XXX XX XX" />
            </div>
            <div className="input-group">
              <label>Konum</label>
              <input name="location" value={cvData.personalInfo.location || ''} onChange={handlePersonalInfoChange} placeholder="İstanbul, Türkiye" />
            </div>
          </div>

          <div className="input-group full-width">
            <div className="label-with-ai">
              <label>Profesyonel Özet</label>
              <div className="ai-menu-container">
                <button 
                  className="btn-ai-gen" 
                  onClick={() => setShowAiMenu(!showAiMenu)}
                >
                  <Wand2 size={14} /> AI ile Yaz
                </button>
                {showAiMenu && (
                  <div className="ai-dropdown glass animate-scale-in">
                    <button onClick={() => { generateAISummary('manager'); setShowAiMenu(false); }}>👔 Yönetici Stili</button>
                    <button onClick={() => { generateAISummary('tech'); setShowAiMenu(false); }}>💻 Teknik Stil</button>
                    <button onClick={() => { generateAISummary('creative'); setShowAiMenu(false); }}>🎨 Kreatif Stil</button>
                  </div>
                )}
              </div>
            </div>
            <textarea 
              name="summary"
              value={cvData.personalInfo.summary || ''}
              onChange={handlePersonalInfoChange}
              placeholder="Kısa bir kariyer özeti yazın veya AI ile oluşturun..."
              rows={4}
            />
          </div>
        </section>

        <section className="form-section glass animate-fade-in delay-100">
          <div className="section-title">
            <Plus size={20} /> <h2>İş Deneyimi</h2>
          </div>
          <div className="experience-list">
            {cvData.experience.map((exp) => (
              <div key={exp.id} className="experience-card">
                <div className="exp-info">
                  <h3>{exp.title} - {exp.company}</h3>
                  <span>{exp.date}</span>
                </div>
                <button onClick={() => removeExperience(exp.id)} className="btn-icon danger"><Trash2 size={18} /></button>
              </div>
            ))}
          </div>
          <div className="add-experience-compact">
            <div className="input-grid">
              <input placeholder="Pozisyon" value={newExp.title} onChange={e => setNewExp({...newExp, title: e.target.value})} />
              <input placeholder="Şirket" value={newExp.company} onChange={e => setNewExp({...newExp, company: e.target.value})} />
              <input placeholder="Tarih" value={newExp.date} onChange={e => setNewExp({...newExp, date: e.target.value})} />
            </div>
            <button onClick={handleAddExp} className="btn-secondary"><Plus size={16} /> Ekle</button>
          </div>
        </section>
      </div>

      <div className="profile-footer-settings glass animate-fade-in-up">
        <div className="footer-info">
          <CloudDownload size={20} color="var(--primary)" />
          <div>
            <h3>Veri Yönetimi</h3>
            <p>JSON yedeği ile CV verilerinizi saklayın.</p>
          </div>
        </div>
        <div className="footer-actions">
          <input type="file" ref={fileInputRef} onChange={handleImportFile} style={{ display: 'none' }} accept=".json" />
          <button onClick={() => fileInputRef.current.click()} className="btn-outline-mini">
            <CloudUpload size={14} /> Geri Yükle
          </button>
          <button onClick={exportData} className="btn-primary-mini">
            <CloudDownload size={14} /> Yedekle
          </button>
        </div>
      </div>

      <div className="step-actions">
        <button onClick={onNext} className="btn-primary-large">
          Analiz Adımına Geç <ArrowRight size={20} />
        </button>
      </div>

      {isImportModalOpen && (
        <LinkedInImportModal 
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)} 
          onImport={handleImportData} 
        />
      )}
    </div>
  );
};
