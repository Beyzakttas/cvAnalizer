import React, { useState } from 'react';
import { X, Sparkles, Link, CheckCircle, Loader, AlertCircle, User } from 'lucide-react';
import { parseLinkedInText } from '../../utils/linkedinParser';
import './LinkedInImport.css';

export const LinkedInImportModal = ({ isOpen, onClose, onImport }) => {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');
  const [preview, setPreview] = useState(null);

  if (!isOpen) return null;

  const handleScrape = async () => {
    if (!url.trim()) return;
    
    setStatus('loading');
    setErrorMsg('');
    
    try {
      // Use Jina AI reader to scrape LinkedIn profile
      const jinaUrl = `https://r.jina.ai/${encodeURIComponent(url.trim())}`;
      const response = await fetch(jinaUrl, {
        headers: { 'Accept': 'text/plain' }
      });
      
      if (!response.ok) throw new Error('Profil alınamadı.');
      
      const text = await response.text();
      
      if (text.length < 100) throw new Error('Profil içeriği okunamadı. LinkedIn gizlilik ayarlarınızı kontrol edin.');
      
      // Parse the scraped text
      const parsed = parseLinkedInText(text);
      
      if (!parsed || !parsed.personalInfo?.fullName) {
        throw new Error('Profil verisi ayrıştırılamadı. Lütfen genel profil linki olduğundan emin olun.');
      }
      
      setPreview(parsed);
      setStatus('success');
      
    } catch (err) {
      console.error('LinkedIn scrape error:', err);
      setErrorMsg(err.message || 'Bir hata oluştu. Profil herkese açık olduğundan emin olun.');
      setStatus('error');
    }
  };

  const handleConfirm = () => {
    if (preview) {
      onImport(preview);
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleScrape();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass animate-scale-in">
        <header className="modal-header">
          <div className="header-title">
            <Sparkles size={20} color="var(--primary)" />
            <h3>LinkedIn Profil İçe Aktarma</h3>
          </div>
          <button onClick={onClose} className="btn-close"><X size={20} /></button>
        </header>

        <div className="modal-body">
          {status === 'idle' || status === 'error' ? (
            <>
              <p className="modal-desc">
                LinkedIn profil linkinizi yapıştırın. Jina AI ile verileriniz otomatik çekilecek.
              </p>
              
              <div className="url-scrape-input">
                <Link size={18} color="var(--text-muted)" />
                <input
                  type="url"
                  placeholder="https://www.linkedin.com/in/kullanici-adi/"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                />
              </div>

              {status === 'error' && (
                <div className="scrape-error">
                  <AlertCircle size={16} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="scrape-tips">
                <p>💡 Profil bağlantısının <strong>herkese açık</strong> olduğundan emin olun.</p>
                <p>📋 Örnek: <code>linkedin.com/in/kullanici-adi</code></p>
              </div>
            </>
          ) : status === 'loading' ? (
            <div className="scrape-loading">
              <Loader size={40} className="spin" />
              <h3>Profil Çekiliyor...</h3>
              <p>Jina AI profilinizi analiz ediyor, lütfen bekleyin.</p>
            </div>
          ) : status === 'success' && preview ? (
            <div className="scrape-preview">
              <div className="preview-success-banner">
                <CheckCircle size={20} color="#10b981" />
                <span>Profil başarıyla okundu!</span>
              </div>
              <div className="preview-card">
                <div className="preview-avatar">
                  <User size={28} />
                </div>
                <div className="preview-info">
                  <h3>{preview.personalInfo?.fullName || 'Ad Soyad'}</h3>
                  <p>{preview.personalInfo?.email || ''}</p>
                  {preview.experience?.length > 0 && (
                    <span className="preview-badge">{preview.experience.length} deneyim bulundu</span>
                  )}
                  {preview.skills?.length > 0 && (
                    <span className="preview-badge skills">{preview.skills.length} yetenek bulundu</span>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <footer className="modal-footer">
          <button onClick={onClose} className="btn-outline">İptal</button>
          {(status === 'idle' || status === 'error') && (
            <button 
              onClick={handleScrape} 
              disabled={!url.trim()}
              className="btn-primary"
            >
              <Link size={16} /> Profili Çek
            </button>
          )}
          {status === 'success' && (
            <button onClick={handleConfirm} className="btn-primary">
              <CheckCircle size={16} /> Profile Aktar
            </button>
          )}
        </footer>
      </div>
    </div>
  );
};
