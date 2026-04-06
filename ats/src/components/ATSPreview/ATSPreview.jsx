import React, { useRef, useState } from 'react';
import { useCVStore } from '../../store/CVContext';
import { Printer, ArrowLeft, Mail, Phone, MapPin, Globe, List, LayoutGrid, Edit3, Check } from 'lucide-react';
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

// Sub-components for better organization
const CVHeader = ({ personalInfo, isEditMode, updatePersonalInfo }) => (
  <header className="cv-header">
    <h1 
      contentEditable={isEditMode}
      suppressContentEditableWarning
      onBlur={(e) => updatePersonalInfo({ fullName: e.target.innerText })}
      className={isEditMode ? 'editable-field' : ''}
    >
      {personalInfo.fullName || 'Ad Soyad'}
    </h1>
    <div className="cv-contact">
      {personalInfo.email && (
        <span 
          contentEditable={isEditMode} 
          suppressContentEditableWarning
          onBlur={(e) => updatePersonalInfo({ email: e.target.innerText })}
          className={isEditMode ? 'editable-field' : ''}
        >
          <Mail size={12} /> {personalInfo.email}
        </span>
      )}
      {personalInfo.phone && (
        <span 
          contentEditable={isEditMode} 
          suppressContentEditableWarning
          onBlur={(e) => updatePersonalInfo({ phone: e.target.innerText })}
          className={isEditMode ? 'editable-field' : ''}
        >
          <Phone size={12} /> {personalInfo.phone}
        </span>
      )}
      {personalInfo.location && (
        <span 
          contentEditable={isEditMode} 
          suppressContentEditableWarning
          onBlur={(e) => updatePersonalInfo({ location: e.target.innerText })}
          className={isEditMode ? 'editable-field' : ''}
        >
          <MapPin size={12} /> {personalInfo.location}
        </span>
      )}
      {personalInfo.website && (
        <span 
          contentEditable={isEditMode} 
          suppressContentEditableWarning
          onBlur={(e) => updatePersonalInfo({ website: e.target.innerText })}
          className={isEditMode ? 'editable-field' : ''}
        >
          <Globe size={12} /> {personalInfo.website}
        </span>
      )}
    </div>
  </header>
);

const CVSection = ({ title, className = '', children }) => (
  <section className={`cv-section ${className}`}>
    <h2 className="section-title">{title}</h2>
    {children}
  </section>
);

const CVExperienceItem = ({ exp, isEditMode, updateExperience }) => (
  <div className="cv-item">
    <div className="cv-item-header">
      <strong 
        contentEditable={isEditMode}
        suppressContentEditableWarning
        onBlur={(e) => updateExperience(exp.id, { title: e.target.innerText })}
        className={isEditMode ? 'editable-field' : ''}
      >
        {exp.title}
      </strong>
      <span 
        contentEditable={isEditMode}
        suppressContentEditableWarning
        onBlur={(e) => updateExperience(exp.id, { date: e.target.innerText })}
        className={isEditMode ? 'editable-field' : ''}
      >
        {exp.date}
      </span>
    </div>
    <div className="cv-item-sub">
      <em 
        contentEditable={isEditMode}
        suppressContentEditableWarning
        onBlur={(e) => updateExperience(exp.id, { company: e.target.innerText })}
        className={isEditMode ? 'editable-field' : ''}
      >
        {exp.company}
      </em>
    </div>
    <div className="cv-item-desc">
      <div 
        contentEditable={isEditMode}
        suppressContentEditableWarning
        onBlur={(e) => updateExperience(exp.id, { description: e.target.innerText })}
        className={isEditMode ? 'editable-field' : ''}
      >
        {exp.description.split('\n')
          .filter(line => line.trim() !== '')
          .map((line, li) => (
            <p key={li}>• {line}</p>
          ))}
      </div>
    </div>
  </div>
);

const CVEducationItem = ({ edu, isEditMode, updateEducation }) => (
  <div className="cv-item">
    <div className="cv-item-header">
      <strong 
        contentEditable={isEditMode}
        suppressContentEditableWarning
        onBlur={(e) => updateEducation(edu.id, { degree: e.target.innerText })}
        className={isEditMode ? 'editable-field' : ''}
      >
        {edu.degree}
      </strong>
      <span 
        contentEditable={isEditMode}
        suppressContentEditableWarning
        onBlur={(e) => updateEducation(edu.id, { date: e.target.innerText })}
        className={isEditMode ? 'editable-field' : ''}
      >
        {edu.date}
      </span>
    </div>
    <div className="cv-item-sub">
      <em 
        contentEditable={isEditMode}
        suppressContentEditableWarning
        onBlur={(e) => updateEducation(edu.id, { school: e.target.innerText })}
        className={isEditMode ? 'editable-field' : ''}
      >
        {edu.school}
      </em>
    </div>
  </div>
);

export const ATSPreview = ({ onBack }) => {
  const { 
    cvData, setLanguage, setTemplate, 
    updatePersonalInfo, updateExperience, updateEducation 
  } = useCVStore();
  const [isEditMode, setIsEditMode] = useState(false);
  const printRef = React.useRef(null);
  
  const lang = cvData?.language || 'tr';
  const t = TRANSLATIONS[lang] || TRANSLATIONS.tr;
  const currentTemplate = cvData.template || 'classic';

  // Update document title for better PDF filename and to remove "ATS" from browser headers
  React.useEffect(() => {
    const originalTitle = document.title;
    if (cvData.personalInfo.fullName) {
      document.title = cvData.personalInfo.fullName;
    }
    return () => { document.title = originalTitle; };
  }, [cvData.personalInfo.fullName]);

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
          <span className="controls-badge">
            {lang === 'tr' ? 'Türkçe' : 'English'} · {currentTemplate === 'classic' ? 'Klasik' : 'Modern'}
          </span>
        </div>
        <div className="controls-actions">
          <div className="template-switcher" title="Şablon Seç">
            <button 
              onClick={() => setTemplate('classic')} 
              className={`btn-mini ${currentTemplate === 'classic' ? 'active' : ''}`}
            >
              <List size={15} />
            </button>
            <button 
              onClick={() => setTemplate('modern')} 
              className={`btn-mini ${currentTemplate === 'modern' ? 'active' : ''}`}
            >
              <LayoutGrid size={15} />
            </button>
          </div>

          <button 
            onClick={() => setLanguage(lang === 'tr' ? 'en' : 'tr')} 
            className={lang === 'tr' ? 'btn-english-cv' : 'btn-turkish-cv'}
          >
            {lang === 'tr' ? '🇬🇧 EN' : '🇹🇷 TR'}
          </button>

          <button 
            onClick={() => setIsEditMode(!isEditMode)} 
            className={`btn-edit-mode ${isEditMode ? 'active' : ''}`}
            title={isEditMode ? 'Kaydet' : 'Manuel Düzenle'}
          >
            {isEditMode ? <><Check size={16} /> Kaydet</> : <><Edit3 size={16} /> Manuel Düzenle</>}
          </button>

          <button onClick={handlePrint} className="btn-primary btn-print">
            <Printer size={16} /> PDF
          </button>
        </div>
      </div>

      <div className="cv-document-wrapper glass">
        <div className={`cv-document ${currentTemplate} ${isEditMode ? 'editing' : ''}`} id="printable-cv" ref={printRef}>
          <CVHeader 
            personalInfo={cvData.personalInfo} 
            isEditMode={isEditMode} 
            updatePersonalInfo={updatePersonalInfo} 
          />

          {cvData.personalInfo.summary && (
            <CVSection title={t.summary} className="cv-summary-section">
              <p
                contentEditable={isEditMode}
                suppressContentEditableWarning
                onBlur={(e) => updatePersonalInfo({ summary: e.target.innerText })}
                className={isEditMode ? 'editable-field' : ''}
              >
                {cvData.personalInfo.summary}
              </p>
            </CVSection>
          )}

          {cvData.experience.length > 0 && (
            <CVSection title={t.experience} className="cv-experience-section">
              {cvData.experience.map((exp, i) => (
                <CVExperienceItem 
                  key={exp.id || i} 
                  exp={exp} 
                  isEditMode={isEditMode} 
                  updateExperience={updateExperience} 
                />
              ))}
            </CVSection>
          )}

          {cvData.education.length > 0 && (
            <CVSection title={t.education} className="cv-education-section">
              {cvData.education.map((edu, i) => (
                <CVEducationItem 
                  key={edu.id || i} 
                  edu={edu} 
                  isEditMode={isEditMode} 
                  updateEducation={updateEducation} 
                />
              ))}
            </CVSection>
          )}

          {cvData.skills.length > 0 && (
            <CVSection title={t.skills} className="cv-skills-section">
              <div 
                contentEditable={isEditMode}
                suppressContentEditableWarning
                onBlur={(e) => setSkills(e.target.innerText.split(' • ').map(s => s.trim()))}
                className={`skills-line ${isEditMode ? 'editable-field' : ''}`}
                style={{ display: 'block', width: '100%' }}
              >
                {cvData.skills.join(' • ')}
              </div>
            </CVSection>
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
