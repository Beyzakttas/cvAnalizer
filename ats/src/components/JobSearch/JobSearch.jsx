import React, { useState } from 'react';
import { Search, Briefcase, MapPin, Globe, ExternalLink, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { useCVStore } from '../../store/CVContext';
import { searchJobs } from '../../utils/jinaService';
import './JobSearch.css';

export const JobSearch = ({ onAnalyzeJob, onNext }) => {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [activePlatform, setActivePlatform] = useState('all');
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const PLATFORMS = [
    { id: 'all', name: 'Tümü', icon: <Globe size={16} /> },
    { id: 'linkedin', name: 'LinkedIn', icon: <img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" width="16" height="16" alt="LI" /> },
    { id: 'kariyer', name: 'Kariyer.net', icon: <Briefcase size={16} /> },
    { id: 'indeed', name: 'Indeed', icon: <Search size={16} /> }
  ];

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;
    
    setIsLoading(true);
    setJobs([]);
    try {
      const results = await searchJobs(query, location, activePlatform);
      setJobs(results);
    } catch (err) {
      console.warn('Search error - showing fallback:', err);
      // Premium Demo Fallback
      setJobs([
        { title: `${query || 'Yazılım Geliştirici'} - İstanbul`, url: `https://www.google.com/search?q=${encodeURIComponent(query + ' ilanları')}`, description: 'Bu bir örnek ilandır. Jina Search API limiti aşıldığı için gösterilmektedir.', source: 'Demo' },
        { title: `Kıdemli ${query || 'Mühendis'}`, url: `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(query)}`, description: 'Aradığınız kriterlere uygun güncel ilanları görmek için yandaki butona tıklayabilirsiniz.', source: 'LinkedIn' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="job-search-container">
      <header className="search-header glass animate-fade-in">
        <h1>İş İlanı Gezgini</h1>
        <p>Yapay zeka desteğiyle binlerce ilan arasından size en uygun olanı bulun.</p>
        
        <div className="platform-tabs">
          {PLATFORMS.map(p => (
            <button 
              key={p.id}
              className={`platform-tab ${activePlatform === p.id ? 'active' : ''}`}
              onClick={() => setActivePlatform(p.id)}
            >
              {p.icon}
              <span>{p.name}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="search-box">
          <div className="input-group">
            <Briefcase size={18} />
            <input 
              placeholder="Pozisyon (örn: Frontend Developer)" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="input-group">
            <MapPin size={18} />
            <input 
              placeholder="Şehir (örn: İstanbul)" 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" /> : 'İlanları Bul'}
          </button>
        </form>
      </header>

      <div className="results-grid">
        {jobs.length > 0 ? (
          jobs.map((job, i) => (
            <div key={i} className="job-card glass animate-scale-in" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="job-card-header">
                <h3>{job.title}</h3>
                <span className="source-tag">{job.source || 'İlan'}</span>
              </div>
              <p className="job-snippet">{job.description?.substring(0, 150)}...</p>
              <div className="job-card-actions">
                <a href={job.url} target="_blank" rel="noopener noreferrer" className="btn-link">
                  <ExternalLink size={16} /> İlanı Gör
                </a>
                <button onClick={() => onAnalyzeJob(job.url)} className="btn-analyze highlight">
                  <Sparkles size={16} /> Bu İlanı Analize Gönder
                </button>
              </div>
            </div>
          ))
        ) : !isLoading && (
          <div className="empty-search animate-fade-in">
            <Globe size={48} color="var(--text-dim)" />
            <p>Aramak istediğiniz pozisyonu yukarıdan yazarak başlayın.</p>
          </div>
        )}
      </div>

      <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--glass-border)' }}>
        <button type="button" onClick={onNext} className="btn-outline">
          İlanım Var, Direkt CV Hazırla <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
