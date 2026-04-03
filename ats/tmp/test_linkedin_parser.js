
import { parseLinkedInText } from '../src/utils/linkedinParser.js';

const sampleText = `
# John Doe
Software Engineer at Google

## About
Experienced software engineer with a passion for building scalable web applications.

## Experience
Software Engineer
Google
Jan 2020 - Present
- Working on Google Search
- Improved performance by 20%

Senior Frontend Developer
Meta
Jan 2018 - Dec 2019
- Led the React team

## Education
Stanford University
Master of Science in Computer Science
2015 - 2017

## Skills
JavaScript, React, Node.js, Python
`;

const result = parseLinkedInText(sampleText);
console.log(JSON.stringify(result, null, 2));
