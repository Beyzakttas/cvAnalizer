/**
 * Jina AI Service
 * Dual-purpose utility for searching jobs (s.jina.ai) and reading job pages (r.jina.ai)
 */

const JINA_SEARCH_URL = 'https://s.jina.ai/';
const JINA_READER_URL = 'https://r.jina.ai/';

/**
 * Search for jobs using Jina Search API
 * @param {string} query - The search query
 * @param {string} location - The location
 * @param {string} platform - The platform filter
 * @returns {Promise<Array>} - List of jobs
 */
export const searchJobs = async (query, location = '', platform = 'all') => {
  if (!query) return [];

  let platformQuery = '';
  if (platform === 'linkedin') platformQuery = ' site:linkedin.com/jobs';
  else if (platform === 'kariyer') platformQuery = ' site:kariyer.net';
  else if (platform === 'indeed') platformQuery = ' site:indeed.com';

  const searchTerm = `${query} ${location} ${platformQuery} iş ilanları`.trim();
  
  try {
    const response = await fetch(`${JINA_SEARCH_URL}${encodeURIComponent(searchTerm)}`, {
      headers: {
        'Accept': 'application/json',
        'X-With-Images-Summary': 'true'
      }
    });

    if (response.status === 401 || response.status === 402) {
      throw new Error('API_LIMIT');
    }

    const data = await response.json();
    
    return (data.data || []).map(job => {
      let source = 'İlan';
      if (job.url.includes('linkedin')) source = 'LinkedIn';
      else if (job.url.includes('kariyer.net')) source = 'Kariyer.net';
      else if (job.url.includes('indeed')) source = 'Indeed';
      
      return { ...job, source };
    });
  } catch (error) {
    console.error('Jina Search Error:', error);
    throw error;
  }
};

/**
 * Fetch and clean job description from a URL using Jina Reader API
 * @param {string} url - The job listing URL
 * @returns {Promise<string>} - Cleaned markdown text
 */
export const fetchJobDescription = async (url) => {
  if (!url || !url.startsWith('http')) throw new Error('INVALID_URL');

  try {
    const response = await fetch(`${JINA_READER_URL}${encodeURIComponent(url)}`);
    if (!response.ok) throw new Error('FETCH_FAILED');
    
    const text = await response.text();
    
    // Check for common proxy-block and security errors that LinkedIn/others/Jina return
    if (
      text.includes('Target URL returned error 999') || 
      text.includes('error 403') || 
      text.includes('SecurityCompromiseError') ||
      text.includes('"code":451')
    ) {
      throw new Error('CONTENT_BLOCKED');
    }
    
    // Basic cleaning of Jina markdown artifacts
    return text
      .replace(/\[.*?\]/g, '')
      .replace(/\(http.*?\)/g, '')
      .trim();
  } catch (error) {
    console.error('Jina Reader Error:', error);
    throw error;
  }
};
