/**
 * Enhanced LinkedIn Profile Parser
 * Handles content from Jina AI reader (r.jina.ai)
 * Extracts: name, email, phone, location, summary, experience, education, skills
 */
export const parseLinkedInText = (text) => {
  if (!text || text.length < 50) return null;

  const data = {
    personalInfo: { fullName: '', email: '', phone: '', location: '', website: '', summary: '' },
    experience: [],
    education: [],
    skills: []
  };

  // Clean up Jina markdown artifacts
  const cleanText = text
    .replace(/#+\s/g, '')           // Remove markdown headers
    .replace(/\*\*/g, '')           // Remove bold markers
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove markdown links
    .replace(/---+/g, '')           // Remove dividers
    .trim();

  const lines = cleanText.split('\n').map(l => l.trim()).filter(l => l.length > 1);

  // --- 1. Extract Email ---
  const emailMatch = cleanText.match(/[\w._%+-]+@[\w.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) data.personalInfo.email = emailMatch[0];

  // --- 2. Extract Phone ---
  const phoneMatch = cleanText.match(/(\+?\d[\d\s\-().]{7,15}\d)/);
  if (phoneMatch) data.personalInfo.phone = phoneMatch[0].trim();

  // --- 3. Extract LinkedIn URL ---
  const linkedinMatch = cleanText.match(/linkedin\.com\/in\/[\w-]+/i);
  if (linkedinMatch) data.personalInfo.website = 'https://www.' + linkedinMatch[0];

  // --- 4. Extract Full Name ---
  // Usually the first non-URL, non-header line
  for (const line of lines) {
    if (
      line.length > 2 && line.length < 80 &&
      !line.includes('linkedin') && !line.includes('http') &&
      !line.includes('@') && !line.match(/^\d/) &&
      !line.toLowerCase().includes('experience') &&
      !line.toLowerCase().includes('education') &&
      !line.toLowerCase().includes('skills')
    ) {
      data.personalInfo.fullName = line;
      break;
    }
  }

  // --- 5. Section Detection ---
  const SECTION_HEADERS = {
    about:      /(about|hakkımda|profil özeti|summary|özet)/i,
    experience: /(experience|deneyim|iş deneyimi|work history)/i,
    education:  /(education|eğitim|öğrenim)/i,
    skills:     /(skills|yetenekler|yetkinlikler|competencies)/i,
    languages:  /(languages|diller)/i,
  };

  let currentSection = '';
  let aboutLines = [];
  let currentExpBlock = null;
  let currentEduBlock = null;

  // Date pattern: "2020 - 2023", "Jan 2020 - Mar 2022", "2021 – Present"
  const DATE_PATTERN = /(\d{4}|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Oca|Şub|Mar|Nis|May|Haz|Tem|Ağu|Eyl|Eki|Kas|Ara)\b[\w\s,]*)[\s]*[-–—][\s]*(\d{4}|Present|Günümüz|present|günümüz|halen|Halen|devam)/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lower = line.toLowerCase();

    // Detect section changes
    let sectionChanged = false;
    for (const [section, regex] of Object.entries(SECTION_HEADERS)) {
      if (regex.test(lower) && line.length < 60) {
        // Save previous block
        if (currentExpBlock?.title) data.experience.push(currentExpBlock);
        if (currentEduBlock?.degree) data.education.push(currentEduBlock);
        currentExpBlock = null;
        currentEduBlock = null;
        currentSection = section;
        sectionChanged = true;
        break;
      }
    }
    if (sectionChanged) continue;

    // --- About Section ---
    if (currentSection === 'about') {
      if (line.length > 20) aboutLines.push(line);
    }

    // --- Experience Section ---
    else if (currentSection === 'experience') {
      const dateMatch = line.match(DATE_PATTERN);

      if (dateMatch && currentExpBlock) {
        // Date line - attach to current block
        currentExpBlock.date = line.replace(/\s+/g, ' ').trim();
      } else if (line.length > 3 && line.length < 100 && !dateMatch) {
        const nextLine = lines[i + 1] || '';
        const isTitle = !line.startsWith('•') && !line.startsWith('-');

        if (isTitle) {
          // Save previous block
          if (currentExpBlock?.title && currentExpBlock?.company) {
            data.experience.push({ ...currentExpBlock, id: Date.now() + Math.random() });
          }
          currentExpBlock = { title: '', company: '', date: '', description: '', id: Date.now() };

          if (currentExpBlock.title === '') {
            currentExpBlock.title = line;
          } else if (currentExpBlock.company === '') {
            currentExpBlock.company = line;
          }
        } else if (currentExpBlock) {
          currentExpBlock.description = (currentExpBlock.description + '\n' + line.replace(/^[•\-]\s*/, '')).trim();
        }
      } else if (currentExpBlock && line.startsWith('•') || line.startsWith('-')) {
        if (currentExpBlock) {
          currentExpBlock.description = (currentExpBlock.description + '\n' + line.replace(/^[•\-]\s*/, '')).trim();
        }
      }
    }

    // --- Education Section ---
    else if (currentSection === 'education') {
      if (line.length > 3 && line.length < 150) {
        if (!currentEduBlock) {
          currentEduBlock = { degree: '', school: '', date: '', id: Date.now() };
          currentEduBlock.school = line;
        } else if (!currentEduBlock.degree) {
          currentEduBlock.degree = line;
        } else if (!currentEduBlock.date && line.match(DATE_PATTERN)) {
          currentEduBlock.date = line;
          data.education.push({ ...currentEduBlock });
          currentEduBlock = null;
        }
      }
    }

    // --- Skills Section ---
    else if (currentSection === 'skills') {
      // Skills can be comma-separated, bullet-pointed, or one per line
      const cleaned = line.replace(/^[•\-*]\s*/, '').trim();
      if (cleaned.includes(',')) {
        cleaned.split(',').forEach(s => {
          const skill = s.trim();
          if (skill.length > 1 && skill.length < 50) data.skills.push(skill);
        });
      } else if (cleaned.length > 1 && cleaned.length < 50) {
        data.skills.push(cleaned);
      }
    }
  }

  // Save last open blocks
  if (currentExpBlock?.title) {
    data.experience.push({ ...currentExpBlock, id: Date.now() });
  }
  if (currentEduBlock?.degree || currentEduBlock?.school) {
    data.education.push({ ...currentEduBlock, id: Date.now() });
  }

  // Set summary from about section
  if (aboutLines.length > 0) {
    data.personalInfo.summary = aboutLines.slice(0, 5).join(' ').substring(0, 800);
  }

  // Deduplicate skills
  data.skills = [...new Set(data.skills)].filter(s => s.length > 1).slice(0, 40);

  // Limit experience and education
  data.experience = data.experience.slice(0, 15);
  data.education = data.education.slice(0, 5);

  // If nothing was found at all, return null
  if (!data.personalInfo.fullName && data.skills.length === 0 && data.experience.length === 0) {
    return null;
  }

  return data;
};
