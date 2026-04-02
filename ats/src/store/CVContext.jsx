import React, { createContext, useContext, useState, useEffect } from 'react';

const INITIAL_DATA = {
  theme: 'dark',
  language: 'tr',
  template: 'classic',
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    summary: ''
  },
  experience: [],
  education: [],
  skills: [],
  jobDescription: '',
  suggestions: []
};

const SUMMARY_TEMPLATES = {
  tr: {
    manager: "Deneyimli yönetici ve stratejist. {skills} konularında uzmanlığa sahip, ekip yönetiminde başarılı ve hedef odaklı bir profesyonel.",
    tech: "Teknoloji tutkunu ve çözüm odaklı mühendis. {skills} ekosisteminde derinlemesine bilgi sahibi, ölçeklenebilir sistemler tasarlama tecrübesine sahip.",
    creative: "Vizyoner ve yenilikçi profesyonel. {skills} alanlarında kreatif çözümler üreten, kullanıcı deneyimini ön planda tutan bir tasarımcı."
  },
  en: {
    manager: "Experienced manager and strategist. Expert in {skills}, with a track record of leading teams and achieving business goals.",
    tech: "Technology enthusiast and solution-oriented engineer. Deep knowledge in {skills}, specialized in building scalable and performant architectures.",
    creative: "Visionary and innovative professional. Creating creative solutions in {skills}, with a primary focus on user experience."
  }
};

const SAMPLE_PROFILE_DATA = {
  tr: {
    personalInfo: {
      fullName: 'Ahmet Yılmaz',
      email: 'ahmet.yilmaz@email.com',
      phone: '+90 555 123 45 67',
      location: 'İstanbul, Türkiye',
      website: 'github.com/ahmetyilmaz',
      summary: '8+ yıllık deneyimli Kıdemli Frontend Developer. React, TypeScript ve modern web teknolojilerinde uzmanlık. Ölçeklenebilir mimariler, performans optimizasyonu ve ekip liderliği konularında güçlü yetkinlik. Kullanıcı odaklı, estetik ve yüksek performanslı uygulamalar geliştirme tutkusu.'
    },
    experience: [
      { id: 1, title: 'Kıdemli Yazılım Geliştirici', company: 'Global Tech Solution', date: '2020 - Günümüz', description: 'React ve Next.js kullanarak mikro-frontend mimarisi tasarlandı.\n%30 performans artışı sağlayan optimizasyonlar uygulandı.\n10 kişilik geliştirme ekibine mentorluk yapıldı.' },
      { id: 2, title: 'Frontend Developer', company: 'Startup Hub', date: '2016 - 2020', description: 'Karmaşık dashboard panelleri geliştirildi.\nBirim testleri (Jest) ile kod kapsamı %80 üzerine çıkarıldı.' }
    ],
    skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'AWS', 'Agile', 'English (C1)']
  },
  en: {
    personalInfo: {
      fullName: 'John Doe',
      email: 'john.doe@email.com',
      phone: '+44 777 123 45 67',
      location: 'London, UK',
      website: 'github.com/johndoe',
      summary: 'Senior Software Engineer with 8+ years of experience specializing in Frontend development. Expert in React, TypeScript, and modern ecosystem. Proven track record in building scalable architectures and leading cross-functional teams. Passionate about pixel-perfect UI and high-performance applications.'
    },
    experience: [
      { id: 1, title: 'Senior Software Engineer', company: 'Tech Innovators', date: '2020 - Present', description: 'Designed micro-frontend architecture using React and Next.js.\nImplemented optimizations resulting in a 30% performance boost.\nMentored a team of 10 developers.' },
      { id: 2, title: 'Web Developer', company: 'Creative Agency', date: '2017 - 2020', description: 'Built complex dashboard systems for enterprise clients.\nAchieved 80%+ test coverage using Jest and RTL.' }
    ],
    skills: ['React', 'TypeScript', 'Next.js', 'Tailwind', 'Docker', 'CI/CD', 'System Design']
  }
};

const CVContext = createContext();

export const CVProvider = ({ children }) => {
  const [cvData, setCvData] = useState(() => {
    const saved = localStorage.getItem('ats_cv_data');
    if (!saved) return INITIAL_DATA;
    try {
      const parsed = JSON.parse(saved);
      return {
        ...INITIAL_DATA,
        ...parsed,
        personalInfo: { ...INITIAL_DATA.personalInfo, ...(parsed.personalInfo || {}) },
        experience: Array.isArray(parsed.experience) ? parsed.experience : [],
        education: Array.isArray(parsed.education) ? parsed.education : [],
        skills: Array.isArray(parsed.skills) ? parsed.skills : [],
        suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
        theme: parsed.theme || 'dark'
      };
    } catch (e) {
      return INITIAL_DATA;
    }
  });

  useEffect(() => {
    localStorage.setItem('ats_cv_data', JSON.stringify(cvData));
    if (cvData.theme) {
      document.documentElement.setAttribute('data-theme', cvData.theme);
      document.body.setAttribute('data-theme', cvData.theme);
      document.body.className = cvData.theme;
    }
  }, [cvData]);

  const toggleTheme = () => {
    setCvData(prev => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }));
  };

  const updatePersonalInfo = (info) => {
    setCvData(prev => ({ ...prev, personalInfo: { ...prev.personalInfo, ...info } }));
  };

  const setJobDescription = (jd) => {
    setCvData(prev => ({ ...prev, jobDescription: jd }));
  };

  const setSkills = (skills) => {
    setCvData(prev => ({ ...prev, skills: Array.isArray(skills) ? skills : [] }));
  };

  const addSkill = (skill) => {
    if (!skill) return;
    setCvData(prev => {
      if (prev.skills.includes(skill)) return prev;
      return { ...prev, skills: [...prev.skills, skill] };
    });
  };

  const removeSkill = (skill) => {
    setCvData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  const addExperience = (exp) => {
    setCvData(prev => ({ ...prev, experience: [...prev.experience, { ...exp, id: Date.now() }] }));
  };

  const removeExperience = (id) => {
    setCvData(prev => ({ ...prev, experience: prev.experience.filter(e => e.id !== id) }));
  };

  const addEducation = (edu) => {
    setCvData(prev => ({ ...prev, education: [...prev.education, { ...edu, id: Date.now() }] }));
  };

  const removeEducation = (id) => {
    setCvData(prev => ({ ...prev, education: prev.education.filter(e => e.id !== id) }));
  };

  const setLanguage = (lang) => {
    setCvData(prev => ({ ...prev, language: lang }));
  };

  const fillSampleData = () => {
    const data = SAMPLE_PROFILE_DATA[cvData.language] || SAMPLE_PROFILE_DATA.tr;
    setCvData(prev => ({
      ...prev,
      personalInfo: { ...data.personalInfo },
      experience: [...data.experience],
      skills: [...data.skills]
    }));
  };

  const setSuggestions = (suggestions) => {
    setCvData(prev => ({ ...prev, suggestions }));
  };

  const applySuggestion = (id) => {
    const suggestion = cvData.suggestions?.find(s => s.id === id);
    if (!suggestion) return;

    if (suggestion.type === 'summary') {
      updatePersonalInfo({ summary: suggestion.newValue });
    } else if (suggestion.type === 'experience') {
      setCvData(prev => ({
        ...prev,
        experience: prev.experience.map(e => e.id === suggestion.expId ? { ...e, description: suggestion.newValue } : e)
      }));
    }
    
    setCvData(prev => ({
      ...prev,
      suggestions: prev.suggestions.filter(s => s.id !== id)
    }));
  };

  const setTemplate = (template) => {
    setCvData(prev => ({ ...prev, template }));
  };

  const generateAISummary = (style) => {
    const lang = cvData.language || 'tr';
    const template = SUMMARY_TEMPLATES[lang][style] || SUMMARY_TEMPLATES[lang].tech;
    const skillsList = cvData.skills.length > 0 ? cvData.skills.slice(0, 5).join(', ') : '...';
    const finalSummary = template.replace('{skills}', skillsList);
    updatePersonalInfo({ summary: finalSummary });
  };

  const exportData = () => {
    const dataStr = JSON.stringify(cvData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'ats_cv_backup.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importData = (jsonStr) => {
    try {
      const parsed = JSON.parse(jsonStr);
      setCvData({ ...INITIAL_DATA, ...parsed });
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  };

  return (
    <CVContext.Provider value={{ 
      cvData, 
      toggleTheme, 
      setLanguage,
      setTemplate,
      fillSampleData,
      generateAISummary,
      exportData,
      importData,
      updatePersonalInfo, 
      setJobDescription, 
      setSkills,
      addSkill,
      removeSkill,
      addExperience, 
      removeExperience, 
      addEducation,
      removeEducation,
      setSuggestions, 
      applySuggestion 
    }}>
      {children}
    </CVContext.Provider>
  );
};

export const useCVContext = () => {
  const context = useContext(CVContext);
  if (!context) throw new Error('useCVContext must be used within a CVProvider');
  return context;
};
