import React, { useState } from 'react';
import { Search, Briefcase, MapPin, Globe, ExternalLink, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { useCVStore } from '../../store/useCVStore';
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
      let platformQuery = '';
      if (activePlatform === 'linkedin') platformQuery = ' site:linkedin.com/jobs';
      else if (activePlatform === 'kariyer') platformQuery = ' site:kariyer.net';
      else if (activePlatform === 'indeed') platformQuery = ' site:indeed.com';

      const searchTerm = `${query} ${location} ${platformQuery} iş ilanları`.trim();
      const response = await fetch(`https://s.jina.ai/${encodeURIComponent(searchTerm)}`, {
        headers: { 
          'Accept': 'application/json',
          'X-With-Images-Summary': 'true' 
        }
      });
      
      if (response.status === 401 || response.status === 402) {
        throw new Error('API LIMIT: Ücretsiz API limiti doldu veya anahtar gerekli.');
      }
      
      const data = await response.json();
      
      // Clean up and format results
      const formattedJobs = (data.data || []).map(job => {
        let source = 'İlan';
        if (job.url.includes('linkedin')) source = 'LinkedIn';
        else if (job.url.includes('kariyer.net')) source = 'Kariyer.net';
        else if (job.url.includes('indeed')) source = 'Indeed';
        
        return { ...job, source };
      });

      setJobs(formattedJobs);
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
        <Sparkles size={24} color="var(--primary)" />
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

      <div className="step-skip">
        <button onClick={onNext} className="btn-outline">
          İlanım Var, Direkt CV Hazırla <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
