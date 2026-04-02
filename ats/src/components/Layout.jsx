import React from 'react';
import { User, FileText, Settings, ShieldCheck, Download, Mail, Globe, Search, Briefcase, GraduationCap, Award } from 'lucide-react';
import { ThemeToggle } from './common/ThemeToggle';
import './Layout.css';

export const Layout = ({ children, activeStep, onStepChange }) => {
  const steps = [
    { id: 'SEARCH', icon: <Search size={20} />, label: 'İş Bul' },
    { id: 'PROFILE', icon: <User size={20} />, label: 'Profil' },
    { id: 'ANALYZER', icon: <FileText size={20} />, label: 'İş İlanı' },
    { id: 'TAILOR', icon: <ShieldCheck size={20} />, label: 'Analiz' },
    { id: 'EXPORT', icon: <Download size={20} />, label: 'Dışa Aktar' },
  ];

  return (
    <div className="layout-wrapper">
      <nav className="sidebar glass">
        <div className="logo">
          <div className="logo-icon">ATS</div>
          <span className="logo-text">CV Builder</span>
        </div>
        <div className="nav-items">
          {steps.map((step) => (
            <button
              key={step.id}
              className={`nav-item ${activeStep === step.id ? 'active' : ''}`}
              onClick={() => onStepChange(step.id)}
            >
              <span className="icon-wrapper">{step.icon}</span>
              <span className="nav-label">{step.label}</span>
            </button>
          ))}
        </div>
        <div className="sidebar-footer">
          <ThemeToggle />
          <div className="footer-links" style={{ marginTop: '1.5rem' }}>
            <Mail size={16} />
            <Globe size={16} />
            <Search size={16} />
          </div>
        </div>
      </nav>
      <main className="main-content">
        <header className="top-header glass">
          <div className="header-info">
            <span className="cv-brand">ATS Dostu CV Oluşturucu</span>
            <h1>{steps.find(s => s.id === activeStep)?.label}</h1>
          </div>
          <div className="user-profile">
            <div className="avatar">BA</div>
          </div>
        </header>
        <div className="content-area">
          {children}
        </div>
      </main>
    </div>
  );
};
