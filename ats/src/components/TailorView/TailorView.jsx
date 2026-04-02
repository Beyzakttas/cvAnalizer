import React, { useMemo, useEffect } from 'react';
import { useCVStore } from '../../store/useCVStore';
import { extractKeywords } from '../../utils/keywordExtractor';
import { generateSuggestions } from '../../utils/suggestionEngine';
import { ShieldCheck, AlertCircle, CheckCircle, Info, ArrowRight, ArrowLeft, Lightbulb, Zap, PlusCircle, XCircle } from 'lucide-react';
import './TailorView.css';

export const TailorView = ({ onNext, onBack }) => {
  const { cvData, setSuggestions, applySuggestion } = useCVStore();

  const analysis = useMemo(() => {
    try {
      if (!cvData.jobDescription) return { matched: [], missing: [], score: 0 };

      const jdKeywords = extractKeywords(cvData.jobDescription) || [];
      const cvSummary = cvData.personalInfo?.summary || '';
      const cvExpDesc = cvData.experience?.map(e => e.description).filter(Boolean).join(' ') || '';
      const cvText = `${cvSummary} ${cvExpDesc}`.toLowerCase();
      const cvKeywords = extractKeywords(cvText) || [];

      const matched = jdKeywords.filter(k => cvKeywords.includes(k.toLowerCase()) || cvText.includes(k.toLowerCase()));
      const missing = jdKeywords.filter(k => !matched.includes(k));
      
      const totalKeywords = jdKeywords.length || 1;
      const score = Math.min(Math.round((matched.length / totalKeywords) * 100), 100) || 0;

      return { matched, missing, score };
    } catch (error) {
      console.error('TailorView Analysis Error:', error);
      return { matched: [], missing: [], score: 0 };
    }
  }, [cvData.jobDescription, cvData.experience, cvData.personalInfo]);

  useEffect(() => {
    try {
      const hasSuggestions = Array.isArray(cvData.suggestions) && cvData.suggestions.length > 0;
      if (cvData.jobDescription && !hasSuggestions) {
        const newSuggestions = generateSuggestions(cvData, cvData.jobDescription);
        if (newSuggestions) setSuggestions(newSuggestions);
      }
    } catch (e) {
      console.error('Suggestion Generation Error:', e);
    }
  }, [cvData.jobDescription]);

  if (!cvData.jobDescription) {
    return (
      <div className="tailor-view-empty glass animate-fade-in">
        <Info size={40} color="var(--primary)" />
        <h3>İlan Analizi Hazır Değil</h3>
        <p>Lütfen önce "İş İlanı" adımında bir ilan metni veya linki ekleyin.</p>
        <button onClick={onBack} className="btn-primary" style={{ marginTop: '1.5rem' }}>Geri Dön</button>
      </div>
    );
  }

  return (
    <div className="tailor-view-container">
      <div className="score-panel glass animate-fade-in">
        <div className="score-circle">
          <div className="score-inner">
            <span className="score-value">{analysis.score}%</span>
            <span className="score-label">ATS Skoru</span>
          </div>
          <svg className="progress-ring">
            <circle
              className="progress-ring-circle"
              strokeWidth="8"
              stroke="var(--primary)"
              fill="transparent"
              r="70"
              cx="80"
              cy="80"
              style={{ strokeDasharray: `${(analysis.score / 100) * 440} 440` }}
            />
          </svg>
        </div>
        <div className="score-info">
          <h3>Eşleşme Durumu</h3>
          <p>
            {analysis.score > 80 ? 'Harika! CV\'niz bu ilan için oldukça güçlü.' : 
             analysis.score > 50 ? 'Geliştirilebilir. Eksik anahtar kelimeleri ekleyerek şansınızı artırın.' : 
             'Düşük Eşleşme. Deneyimlerinizi ilandaki terimlerle yeniden ifade etmelisiniz.'}
          </p>
        </div>
      </div>

      {cvData.suggestions.length > 0 && (
        <section className="suggestions-approval-panel glass animate-fade-in delay-100">
          <div className="panel-header">
            <Zap size={24} color="#f59e0b" />
            <h3>Akıllı İyileştirme Önerileri</h3>
            <span className="badge">{cvData.suggestions.length} Öneri</span>
          </div>
          <div className="suggestion-cards">
            {cvData.suggestions.map((s) => (
              <div key={s.id} className="suggestion-card glass-dark">
                <div className="suggestion-body">
                  <h4>{s.title}</h4>
                  <p>{s.description}</p>
                </div>
                <div className="suggestion-actions">
                  <button onClick={() => applySuggestion(s.id)} className="btn-apply">
                    <PlusCircle size={16} /> CV'ye Uygula
                  </button>
                  <button onClick={() => setSuggestions(cvData.suggestions.filter(x => x.id !== s.id))} className="btn-dismiss">
                    <XCircle size={16} /> Yoksay
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="analysis-grid">
        <section className="keywords-grid-panel glass animate-fade-in-left delay-200">
          <div className="panel-header">
            <AlertCircle size={20} color="var(--danger)" />
            <h3>Eksik Anahtar Kelimeler</h3>
          </div>
          <div className="keyword-tags">
            {analysis.missing.map((k, i) => (
              <span key={i} className="keyword-tag missing">{k}</span>
            ))}
          </div>
        </section>

        <section className="keywords-grid-panel glass animate-fade-in-right delay-100">
          <div className="panel-header">
            <CheckCircle size={20} color="var(--accent)" />
            <h3>Eşleşen Kelimeler</h3>
          </div>
          <div className="keyword-tags">
            {analysis.matched.map((k, i) => (
              <span key={i} className="keyword-tag matched">{k}</span>
            ))}
          </div>
        </section>
      </div>

      <section className="suggestions-panel glass animate-fade-in delay-200">
        <div className="panel-header">
          <Lightbulb size={24} color="#fcd34d" />
          <h3>İyileştirme Önerileri</h3>
        </div>
        <ul className="suggestion-list">
          <li>
            <Info size={16} /> 
            <strong>Özet Bilgi:</strong> Profesyonel özetinize <u>{analysis.missing.slice(0, 2).join(', ')}</u> terimlerini eklemeyi unutmayın.
          </li>
          <li>
            <Info size={16} /> 
            <strong>Deneyimler:</strong> İş deneyimi açıklamalarınızda <u>{analysis.missing.slice(2, 4).join(', ')}</u> kullanımını artırın.
          </li>
          <li>
            <Info size={16} /> 
            <strong>Format:</strong> ATS sistemlerinin %30'u tablolardan geçemez. Mevcut formatınızda tablo bulunmadığı için güvendesiniz.
          </li>
        </ul>
      </section>

      <div className="form-actions">
        <button onClick={onBack} className="btn-outline">
          <ArrowLeft size={20} /> Geri
        </button>
        <button onClick={onNext} className="btn-primary">
          Dışa Aktar & Onayla <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};
