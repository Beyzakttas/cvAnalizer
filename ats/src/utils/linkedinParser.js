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

  // Clean up Jina markdown artifacts and common LinkedIn noise
  const cleanLines = text
    .split('\n')
    .map(line => line.trim())
    .filter(line => {
      const lower = line.toLowerCase();
      // Remove Jina AI artifacts and LinkedIn meta-info
      if (lower.startsWith('markdown content:') || lower.startsWith('url:') || lower.startsWith('title:')) return false;
      if (lower.includes('jina ai') || lower.includes('reader') || lower.includes('url: http')) return false;
      if (lower === '1st' || lower === '2nd' || lower === '3rd+' || lower === 'follow') return false;
      if (lower.includes('degree connection') || lower.includes('followers')) return false;
      if (lower.startsWith('![') || lower.startsWith('[') && lower.endsWith(']')) return false; // Images/Icons
      return line.length > 0;
    });

  const fullText = cleanLines.join('\n');
  const cleanTextForRegex = fullText.replace(/#+\s/g, '').replace(/\*\*/g, '');

  // --- 1. Extract Email ---
  const emailMatch = fullText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) data.personalInfo.email = emailMatch[0];

  // --- 2. Extract Phone ---
  // More specific phone regex to avoid matching dates or random numbers
  const phoneMatch = fullText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  if (phoneMatch) data.personalInfo.phone = phoneMatch[0].trim();

  // --- 3. Extract LinkedIn URL ---
  const linkedinMatch = fullText.match(/linkedin\.com\/in\/[\w-]+/i);
  if (linkedinMatch) data.personalInfo.website = 'https://www.' + linkedinMatch[0];

  // --- 4. Extract Full Name ---
  // Priority: The very first non-noise line is usually the name
  const nameCandidates = cleanLines.filter(line => {
    const l = line.toLowerCase().replace(/[#*]/g, '').trim();
    if (l.length < 2 || l.length > 50) return false;
    if (l.includes('linkedin') || l.includes('http') || l.includes('jina') || l.includes('reader') || l.includes('markdown content')) return false;
    if (l.includes('degree') || l.includes('connection') || l.includes('follow') || l.includes('üyelik')) return false;
    if (l.includes('remove photo') || l.includes('skip to') || l.includes('toggle') || l.includes('navigation')) return false;
    if (l.includes('search') || l.includes('mesaj') || l.includes('bildirimler') || l.includes('ana sayfa')) return false;
    if (['experience', 'education', 'skills', 'about', 'hakkımda', 'hakkında', 'deneyim', 'yetenekler', 'profil', 'deneyimler', 'photo', 'search'].includes(l)) return false;
    if (l.match(/^\d/)) return false; // Starts with digit
    return true;
  });

  if (nameCandidates.length > 0) {
    data.personalInfo.fullName = nameCandidates[0].replace(/[#*]/g, '').trim();
  }

  // --- 5. Section Detection ---
  const SECTION_HEADERS = {
    about:      /(about|hakkımda|hakkında|profil özeti|summary|özet|about me|professional summary)/i,
    experience: /(experience|deneyim|deneyimler|iş deneyimi|iş tecrübesi|work history|professional experience)/i,
    education:  /(education|eğitim|öğrenim|öğrenim bilgileri|eğitim bilgileri|academic history)/i,
    skills:     /(skills|yetenekler|yetkinlikler|competencies|skills & endorsements|yetenekler ve onaylar)/i,
  };

  let currentSection = '';
  let aboutLines = [];
  let currentExpBlock = null;
  let currentEduBlock = null;

  // Date pattern: Jan 2020 - Jan 2023, 2020 - 2023, 2021 – Present, Oca 2020 - Şub 2023
  const DATE_PATTERN = /(\d{4}|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Oca|Şub|Mar|Nis|May|Haz|Tem|Ağu|Eyl|Eki|Kas|Ara)\b[\w\s,]*)[\s]*[-–—][\s]*(\d{4}|Present|Günümüz|present|günümüz|halen|Halen|devam)/i;

  for (let i = 0; i < cleanLines.length; i++) {
    let line = cleanLines[i].replace(/[#*]/g, '').trim();
    const lower = line.toLowerCase();

    // Skip section headers
    let isHeader = false;
    for (const [section, regex] of Object.entries(SECTION_HEADERS)) {
      if (regex.test(lower) && line.length < 50) {
        // Save previous blocks
        if (currentExpBlock?.title) data.experience.push(currentExpBlock);
        if (currentEduBlock?.school) data.education.push(currentEduBlock);
        currentExpBlock = null;
        currentEduBlock = null;
        currentSection = section;
        isHeader = true;
        break;
      }
    }
    if (isHeader) continue;

    if (currentSection === 'about') {
      if (line.length > 5) aboutLines.push(line);
    } 
    
    else if (currentSection === 'experience') {
      const dateMatch = line.match(DATE_PATTERN);
      
      if (dateMatch) {
         if (currentExpBlock) currentExpBlock.date = line;
      } else if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
         if (currentExpBlock) {
           const point = line.replace(/^[•\-*]\s*/, '').trim();
           if (point) {
             currentExpBlock.description = (currentExpBlock.description + (currentExpBlock.description ? '\n' : '') + point).trim();
           }
         }
      } else if (line.length > 2 && line.length < 120) {
        // If we don't have a title yet, or if this line looks like a new title
        if (!currentExpBlock || (currentExpBlock.title && currentExpBlock.company && !dateMatch)) {
          if (currentExpBlock?.title) data.experience.push(currentExpBlock);
          currentExpBlock = { title: line, company: '', date: '', description: '', id: Date.now() + i };
        } else if (currentExpBlock && !currentExpBlock.company) {
          currentExpBlock.company = line;
        }
      }
    }

    else if (currentSection === 'education') {
      const dateMatch = line.match(DATE_PATTERN);
      if (dateMatch) {
        if (currentEduBlock) currentEduBlock.date = line;
      } else if (line.length > 2 && line.length < 120) {
        if (!currentEduBlock || (currentEduBlock.school && currentEduBlock.degree)) {
          if (currentEduBlock?.school) data.education.push(currentEduBlock);
          currentEduBlock = { school: line, degree: '', date: '', id: Date.now() + i };
        } else if (currentEduBlock && !currentEduBlock.degree) {
          currentEduBlock.degree = line;
        }
      }
    }

    else if (currentSection === 'skills') {
      const cleaned = line.replace(/^[•\-*]\s*/, '').trim();
      if (cleaned.includes(',')) {
        cleaned.split(',').forEach(s => {
          const skill = s.trim();
          if (skill.length > 1 && skill.length < 60) data.skills.push(skill);
        });
      } else if (cleaned.length > 1 && cleaned.length < 60) {
        data.skills.push(cleaned);
      }
    }
  }

  // Final push removals
  if (currentExpBlock?.title) data.experience.push(currentExpBlock);
  if (currentEduBlock?.school) data.education.push(currentEduBlock);

  // Set summary
  if (aboutLines.length > 0) {
    data.personalInfo.summary = aboutLines.slice(0, 8).join(' ').substring(0, 1000);
  }

  // Filter out common noise from experience/education
  data.experience = data.experience.filter(exp => {
    const t = exp.title.toLowerCase();
    return !t.includes('deneyim') && !t.includes('experience') && !t.includes('skills') && t.length > 2;
  });

  data.education = data.education.filter(edu => {
    const s = edu.school.toLowerCase();
    return !s.includes('eğitim') && !s.includes('education') && s.length > 2;
  });


  // Fallback: If no name found, use the first cleaned line that isn't a section header
  if (!data.personalInfo.fullName && cleanLines.length > 0) {
    data.personalInfo.fullName = cleanLines[0].replace(/[#*]/g, '');
  }

  return data;
};

