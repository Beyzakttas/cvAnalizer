import { extractKeywords } from './keywordExtractor';

export const generateSuggestions = (cvData, jdText) => {
  const jdKeywords = extractKeywords(jdText);
  const cvText = `${cvData.personalInfo.summary} ${cvData.experience.map(e => e.description).join(' ')}`;
  const missing = jdKeywords.filter(k => !cvText.toLowerCase().includes(k.toLowerCase())).slice(0, 5);

  const suggestions = [];

  // 1. Summary Suggestion
  if (missing.length > 0) {
    suggestions.push({
      id: 's1',
      type: 'summary',
      title: 'Özet Bilgi Güncellemesi',
      description: `Profil özetinizde "${missing[0]}" ve "${missing[1] || ''}" yeteneklerini vurgulamak eşleşme oranınızı artırır.`,
      newValue: `${cvData.personalInfo.summary} ${missing.slice(0, 2).map(k => k.charAt(0).toUpperCase() + k.slice(1)).join(' ve ')} konularında deneyimli.`
    });
  }

  // 2. Experience Suggestions (Generic but tailored to missing keywords)
  cvData.experience.forEach((exp, index) => {
    const relevantKeywords = missing.slice(2 + index, 4 + index);
    if (relevantKeywords.length > 0) {
      suggestions.push({
        id: `e${exp.id}`,
        type: 'experience',
        expId: exp.id,
        title: `${exp.company} Deneyimi İçin Öneri`,
        description: `Bu pozisyon altındaki maddelere "${relevantKeywords.join(', ')}" teknolojilerini nasıl kullandığınızı ekleyin.`,
        newValue: `${exp.description}\n${relevantKeywords.map(k => k.charAt(0).toUpperCase() + k.slice(1)).join(', ')} süreçlerini yönettim ve optimize ettim.`
      });
    }
  });

  return suggestions;
};
