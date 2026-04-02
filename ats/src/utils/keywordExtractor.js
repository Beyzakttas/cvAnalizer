const STOP_WORDS_TR = new Set([
  've', 'bir', 'bu', 'da', 'de', 'için', 'ile', 'o', 'ise', 'ki', 'mi', 'ne', 'şey', 'veya', 'ya', 'şu',
  'çok', 'daha', 'en', 'ise', 'her', 'hiç', 'kendi', 'gibi', 'bazı', 'tüm', 'ancak', 'belki', 'fakat'
]);

const TECH_KEYWORDS = new Set([
  'javascript', 'typescript', 'react', 'node.js', 'nodenext', 'python', 'java', 'c#', 'sql', 'nosql', 'mongodb', 'postgresql',
  'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'cloud', 'devops', 'agile', 'scrum', 'backend', 'frontend', 'fullstack',
  'api', 'rest', 'graphql', 'next.js', 'vue', 'angular', 'sass', 'css', 'html', 'git', 'ci/cd', 'unit test', 'integration'
]);

export const extractKeywords = (text) => {
  if (!text) return [];
  
  const words = text.toLowerCase()
    .replace(/[^\w\sğüşıöç+]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2 && !STOP_WORDS_TR.has(word));

  const frequencies = {};
  words.forEach(word => {
    frequencies[word] = (frequencies[word] || 0) + 1;
  });

  // Also check for specific tech keywords that might be multi-word or need exact match
  const foundTech = Array.from(TECH_KEYWORDS).filter(k => text.toLowerCase().includes(k));
  
  const sortedKeywords = Object.entries(frequencies)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(entry => entry[0]);

  return Array.from(new Set([...foundTech, ...sortedKeywords]));
};
