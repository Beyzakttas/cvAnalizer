import React, { useRef } from 'react';
import { useCVStore } from '../../store/useCVStore';
import { Printer, ArrowLeft, Mail, Phone, MapPin, Globe, List, LayoutGrid } from 'lucide-react';
import './ATSPreview.css';
import './ModernTemplate.css';

const TRANSLATIONS = {
  tr: {
    summary: 'PROFESYONEL ÖZET',
    experience: 'İŞ DENEYİMİ',
    education: 'EĞİTİM',
    skills: 'YETENEKLER',
    download: 'PDF Olarak Kaydet / Yazdır',
    back: 'Düzenlemeye Dön',
    title: 'ATS Uyumlu Önizleme'
  },
  en: {
    summary: 'PROFESSIONAL SUMMARY',
    experience: 'WORK EXPERIENCE',
    education: 'EDUCATION',
    skills: 'SKILLS',
    download: 'Save as PDF / Print',
    back: 'Back to Edit',
    title: 'ATS-Optimized Preview'
  }
};

export const ATSPreview = ({ onBack }) => {
  const { cvData, setLanguage, setTemplate } = useCVStore();
  const printRef = React.useRef(null);
  
  // Safe Translation initialization
  const lang = cvData?.language || 'tr';
  const t = TRANSLATIONS[lang] || TRANSLATIONS.tr;
  const currentTemplate = cvData.template || 'classic';

  const handlePrint = () => {
    if (printRef.current) {
      window.print();
    }
  };

  if (!cvData?.personalInfo) return <div className="glass">Veri yüklenemedi.</div>;

  return (
    <div className="ats-preview-container">
      <div className="preview-controls glass animate-fade-in">
        <div className="controls-text">
          <h2>CV Önizleme</h2>
          <span className="controls-badge">{lang === 'tr' ? 'Türkçe' : 'English'} · {currentTemplate === 'classic' ? 'Klasik' : 'Modern'}</span>
        </div>
        <div className="controls-actions">
          <div className="template-switcher" title="Şablon Seç">
            <button onClick={() => setTemplate('classic')} className={`btn-mini ${currentTemplate === 'classic' ? 'active' : ''}`} title="Klasik"><List size={15} /></button>
            <button onClick={() => setTemplate('modern')} className={`btn-mini ${currentTemplate === 'modern' ? 'active' : ''}`} title="Modern"><LayoutGrid size={15} /></button>
          </div>

          {lang === 'tr' ? (
            <button onClick={() => setLanguage('en')} className="btn-english-cv">🇬🇧 EN</button>
          ) : (
            <button onClick={() => setLanguage('tr')} className="btn-turkish-cv">🇹🇷 TR</button>
          )}

          <button onClick={handlePrint} className="btn-primary btn-print">
            <Printer size={16} /> PDF
          </button>
        </div>
      </div>

      <div className="cv-document-wrapper glass">
        <div className={`cv-document ${currentTemplate}`} id="printable-cv" ref={printRef}>
          <header className="cv-header">
            <h1>{cvData.personalInfo.fullName || 'Ad Soyad'}</h1>
            <div className="cv-contact">
              {cvData.personalInfo.email && <span><Mail size={12} /> {cvData.personalInfo.email}</span>}
              {cvData.personalInfo.phone && <span><Phone size={12} /> {cvData.personalInfo.phone}</span>}
              {cvData.personalInfo.location && <span><MapPin size={12} /> {cvData.personalInfo.location}</span>}
              {cvData.personalInfo.website && <span><Globe size={12} /> {cvData.personalInfo.website}</span>}
            </div>
          </header>

          {cvData.personalInfo.summary && (
            <section className="cv-section">
              <h2 className="section-title">{t.summary}</h2>
              <p>{cvData.personalInfo.summary}</p>
            </section>
          )}

          {cvData.experience.length > 0 && (
            <section className="cv-section">
              <h2 className="section-title">{t.experience}</h2>
              {cvData.experience.map((exp, i) => (
                <div key={i} className="cv-item">
                  <div className="cv-item-header">
                    <strong>{exp.title}</strong>
                    <span>{exp.date}</span>
                  </div>
                  <div className="cv-item-sub">
                    <em>{exp.company}</em>
                  </div>
                  <div className="cv-item-desc">
                    {exp.description.split('\n').map((line, li) => (
                      <p key={li}>• {line}</p>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          )}

          {cvData.education.length > 0 && (
            <section className="cv-section">
              <h2 className="section-title">{t.education}</h2>
              {cvData.education.map((edu, i) => (
                <div key={i} className="cv-item">
                  <div className="cv-item-header">
                    <strong>{edu.degree}</strong>
                    <span>{edu.date}</span>
                  </div>
                  <div className="cv-item-sub">
                    <em>{edu.school}</em>
                  </div>
                </div>
              ))}
            </section>
          )}

          {cvData.skills.length > 0 && (
            <section className="cv-section">
              <h2 className="section-title">{t.skills}</h2>
              <p className="skills-line">{cvData.skills.join(' • ')}</p>
            </section>
          )}
        </div>
      </div>

      <div className="form-actions no-print">
        <button onClick={onBack} className="btn-outline">
          <ArrowLeft size={20} /> {t.back}
        </button>
      </div>
    </div>
  );
};
