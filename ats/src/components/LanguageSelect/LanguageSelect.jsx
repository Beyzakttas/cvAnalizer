import React from 'react';
import { useCVStore } from '../../store/useCVStore';
import { Globe, Languages, ArrowRight, Sparkles, Search, CheckCircle, Linkedin } from 'lucide-react';
import './LanguageSelect.css';

export const LanguageSelect = ({ onNext }) => {
  const { cvData, setLanguage } = useCVStore();

  const handleSelect = (lang) => {
    setLanguage(lang);
    onNext();
  };

  return (
    <div className="lang-select-overlay animate-fade-in">
      <div className="lang-select-card glass animate-scale-in">
        <div className="lang-header">
          <div className="lang-logo">
            <Languages size={32} color="white" />
          </div>
          <h1>Hoş Geldiniz / Welcome</h1>
          <p>Lütfen devam etmek istediğiniz dili seçin.</p>
        </div>

        <div className="lang-options">
          <button 
            className={`lang-option glass ${cvData.language === 'tr' ? 'active' : ''}`}
            onClick={() => handleSelect('tr')}
          >
            <span className="flag">🇹🇷</span>
            <div className="lang-info">
              <span className="lang-name">Türkçe</span>
              <span className="lang-desc">Türkiye için optimize edilmiş ATS sistemi</span>
            </div>
          </button>

          <button 
            className={`lang-option glass ${cvData.language === 'en' ? 'active' : ''}`}
            onClick={() => handleSelect('en')}
          >
            <span className="flag">🇬🇧</span>
            <div className="lang-info">
              <span className="lang-name">English</span>
              <span className="lang-desc">ATS optimization for global standards</span>
            </div>
          </button>
        </div>

        <div className="features-showcase animate-fade-in-up">
          <h3>Sistem Yetenekleri / Capabilities</h3>
          <div className="features-grid">
            <div className="feature-item">
              <Sparkles size={18} className="feature-icon" />
              <span>AI Destekli Analiz</span>
            </div>
            <div className="feature-item">
              <Linkedin size={18} className="feature-icon" />
              <span>Tek Tıkla LinkedIn İçe Aktar</span>
            </div>
            <div className="feature-item">
              <Search size={18} className="feature-icon" />
              <span>Otomatik İlan Bulma (Jina)</span>
            </div>
            <div className="feature-item">
              <CheckCircle size={18} className="feature-icon" />
              <span>%100 ATS Dostu Çıktı</span>
            </div>
          </div>
        </div>

        <div className="lang-footer">
          <Sparkles size={16} />
          <span>Dil seçimi CV başlıklarını otomatik olarak yerelleştirir.</span>
        </div>
      </div>
    </div>
  );
};
