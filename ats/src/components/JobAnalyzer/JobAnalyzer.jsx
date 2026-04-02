import React, { useState, useEffect } from 'react';
import { useCVStore } from '../../store/useCVStore';
import { extractKeywords } from '../../utils/keywordExtractor';
import { Search, Sparkles, Link as LinkIcon, ArrowRight, ArrowLeft, CheckCircle, Plus } from 'lucide-react';
import './JobAnalyzer.css';

export const JobAnalyzer = ({ onNext, onBack, initialUrl }) => {
  const { cvData, setJobDescription, setSkills, addSkill } = useCVStore();
  const [jdText, setJdText] = useState(cvData.jobDescription || '');
  const [jobUrl, setJobUrl] = useState(initialUrl || '');
  const [keywords, setKeywords] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  // Trigger search if a URL was passed from the explorer
  useEffect(() => {
    if (initialUrl) {
      handleFetchUrl(initialUrl);
    }
  }, [initialUrl]);

  const handleFetchUrl = async (url) => {
    const targetUrl = url || jobUrl;
    if (!targetUrl || !targetUrl.startsWith('http')) return;

    setIsFetching(true);
    try {
      const response = await fetch(`https://r.jina.ai/${encodeURIComponent(targetUrl)}`);
      const text = await response.text();
      const cleanText = text.replace(/\[.*?\]/g, '').replace(/\(http.*?\)/g, '');
      setJdText(cleanText);
      const extracted = extractKeywords(cleanText);
      setKeywords(extracted);
      setJobDescription(cleanText);
    } catch (err) {
      console.error('Fetch error:', err);
      alert('İçerik alınamadı. Lütfen manuel yapıştırın.');
    } finally {
      setIsFetching(false);
    }
  };

  const handleAnaliz = () => {
    setIsAnalyzing(true);
    const extracted = extractKeywords(jdText);
    setKeywords(extracted);
    setJobDescription(jdText);
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 1500);
  };

  const userSkills = cvData.skills.map(s => s.toLowerCase());
  const missingKeywords = keywords.filter(k => !userSkills.includes(k.toLowerCase()));
  const matchingKeywords = keywords.filter(k => userSkills.includes(k.toLowerCase()));

  const handleQuickAdd = (skill) => {
    addSkill(skill);
  };

  return (
    <div className="job-analyzer-container">
      <div className="analyzer-grid">
        <div className="input-section glass">
          <div className="url-input-group">
            <LinkIcon size={20} />
            <input 
              type="text" 
              placeholder="İlan Linki (LinkedIn, Kariyer.net vb.)" 
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
            />
            <button 
              onClick={() => handleFetchUrl()} 
              disabled={isFetching}
              className="btn-fetch"
            >
              {isFetching ? 'Çekiliyor...' : 'Metni Çek'}
            </button>
          </div>

          <textarea 
            placeholder="Veya iş tanımını buraya direkt yapıştırın..."
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            className="jd-textarea"
          />

          <button onClick={handleAnaliz} className="btn-primary-large" disabled={isAnalyzing}>
            {isAnalyzing ? <span className="loader" /> : <><Sparkles size={20} /> Analiz Et</>}
          </button>
        </div>

        <div className="analysis-results">
          {isAnalyzing ? (
            <div className="analyzing-state glass animate-pulse">
              <Search size={48} className="spin" />
              <h3>Analiz Ediliyor...</h3>
              <p>Yapay zeka anahtar kelimeleri ve gereksinimleri çıkarıyor.</p>
            </div>
          ) : keywords.length > 0 ? (
            <div className="results-content glass animate-fade-in">
              <div className="results-header">
                <CheckCircle color="#10b981" />
                <h3>{keywords.length} Anahtar Kelime Bulundu</h3>
              </div>
              
              <div className="keyword-section">
                <h4>Eksik / Önerilen Yetenekler</h4>
                <div className="keyword-list">
                  {missingKeywords.map((k, i) => (
                    <div key={i} className="keyword-tag missing">
                      <span>{k}</span>
                      <button onClick={() => handleQuickAdd(k)} title="CV'ye Ekle">
                        <Plus size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="keyword-section matching">
                <h4>CV'nizde Bulunanlar</h4>
                <div className="keyword-list">
                  {matchingKeywords.length > 0 ? (
                    matchingKeywords.map((k, i) => (
                      <span key={i} className="keyword-tag match">{k}</span>
                    ))
                  ) : (
                    <p className="dim-text">Henüz eşleşen ortak kelime yok.</p>
                  )}
                </div>
              </div>

              <button onClick={onNext} className="btn-next-step">
                Analize Devam Et <ArrowRight size={20} />
              </button>
            </div>
          ) : (
            <div className="empty-results glass">
              <Search size={48} />
              <p>Henüz analiz yapılmadı. İlan metnini girip butona basın.</p>
            </div>
          )}
        </div>
      </div>

      <div className="step-actions">
        <button onClick={onBack} className="btn-back">
          <ArrowLeft size={18} /> Geri
        </button>
      </div>
    </div>
  );
};
