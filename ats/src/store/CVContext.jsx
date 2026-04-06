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
  suggestions: [],
  savedVersions: []
};

const SUMMARY_TEMPLATES = {
  tr: {
    manager: "Stratejik vizyon sahibi, sonuç odaklı ve deneyimli yönetici. {skills} alanlarında derin uzmanlığa sahip olup, karmaşık projeleri yönetme, çapraz fonksiyonlu ekiplere liderlik etme ve operasyonel verimliliği artırma konularında kanıtlanmış bir başarı geçmişine sahiptir. Değişen pazar koşullarına hızla uyum saglayan, analitik düşünme yeteneği gelişmiş ve kurumsal hedeflere ulaşmada proaktif bir profesyonel.",
    tech: "Yenilikçi teknolojilere tutkuyla bağlı, çözüm odaklı ve kıdemli teknoloji uzmanı. {skills} ekosisteminde geniş kapsamlı teknik bilgi birikimine sahip olup, yüksek performanslı ve ölçeklenebilir sistem mimarileri tasarlama, geliştirme ve optimize etme konusunda deneyimlidir. Kod kalitesine önem veren, güncel yazılım disiplinlerini titizlikle uygulayan ve karmaşık teknik zorlukları yaratıcı mühendislik çözümleriyle aşabilen bir disipline sahiptir.",
    creative: "Vizyoner, yenilikçi ve estetik duyarlılığı yüksek tasarım profesyoneli. {skills} alanlarında yaratıcı konseptler geliştirme, kullanıcı deneyimini (UX) modern tasarım trendleriyle harmanlama ve marka kimliğini güçlendiren dijital varlıklar oluşturma konusunda uzmandır. Tasarımı bir problem çözme aracı olarak gören, detaylara önem veren ve kullanıcı merkezli yaklaşımlarla etkileyici görsel hikayeler yaratan bir yaratıcı liderdir."
  },
  en: {
    manager: "Strategic visionary and results-driven senior leader with extensive expertise in {skills}. Proven track record of managing complex projects, leading cross-functional teams, and driving operational excellence. Highly adaptable professional with strong analytical thinking skills, dedicated to achieving organizational objectives through proactive leadership and effective stakeholder management.",
    tech: "Passionate and solution-oriented technology expert with deep knowledge in the {skills} ecosystem. Specialized in designing, developing, and optimizing high-performance, scalable system architectures. Dedicated to code quality and best practices, with a creative approach to overcoming complex technical challenges through innovative engineering solutions.",
    creative: "Visionary and innovative design professional with a high aesthetic sensibility. Expert in developing creative concepts within {skills}, blending user experience (UX) with modern design trends to create impactful digital assets. Approaching design as a problem-solving tool with a keen eye for detail and a focus on crafting compelling visual stories through user-centric methodologies."
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
        jobDescription: '', // Reset on refresh/load
        suggestions: [], // Reset on refresh/load
        personalInfo: { ...INITIAL_DATA.personalInfo, ...(parsed.personalInfo || {}) },
        experience: Array.isArray(parsed.experience) ? parsed.experience : [],
        education: Array.isArray(parsed.education) ? parsed.education : [],
        skills: Array.isArray(parsed.skills) ? parsed.skills : [],
        savedVersions: Array.isArray(parsed.savedVersions) ? parsed.savedVersions : [],
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

  const updateExperience = (id, updatedExp) => {
    setCvData(prev => ({
      ...prev,
      experience: prev.experience.map(e => e.id === id ? { ...e, ...updatedExp } : e)
    }));
  };

  const updateEducation = (id, updatedEdu) => {
    setCvData(prev => ({
      ...prev,
      education: prev.education.map(e => e.id === id ? { ...e, ...updatedEdu } : e)
    }));
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

  const importData = (data) => {
    try {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      setCvData({ ...INITIAL_DATA, ...parsed });
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  };

  const saveVersion = (name) => {
    const newVersion = {
      id: Date.now(),
      name,
      lastModified: new Date().toISOString(),
      personalInfo: { ...cvData.personalInfo },
      experience: [...cvData.experience],
      education: [...cvData.education],
      skills: [...cvData.skills]
    };
    setCvData(prev => ({
      ...prev,
      savedVersions: [...prev.savedVersions, newVersion]
    }));
  };

  const loadVersion = (id) => {
    const version = cvData.savedVersions.find(v => v.id === id);
    if (!version) return;
    setCvData(prev => ({
      ...prev,
      personalInfo: { ...version.personalInfo },
      experience: [...version.experience],
      education: [...version.education],
      skills: [...version.skills]
    }));
  };

  const deleteVersion = (id) => {
    setCvData(prev => ({
      ...prev,
      savedVersions: prev.savedVersions.filter(v => v.id !== id)
    }));
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
      updateExperience,
      addEducation,
      removeEducation,
      updateEducation,
      saveVersion,
      loadVersion,
      deleteVersion,
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

// Also export as useCVStore for backward compatibility and semantic clarity
export const useCVStore = useCVContext;
