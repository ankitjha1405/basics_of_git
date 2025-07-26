// TailorApply Background Service Worker
console.log('TailorApply background script loaded');

// Installation handler
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Open onboarding on first install
    chrome.tabs.create({
      url: chrome.runtime.getURL('onboarding.html')
    });
  }
});

// Message handler for communication between content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request);
  
  switch (request.action) {
    case 'extractJobData':
      handleJobDataExtraction(request.data, sendResponse);
      return true; // Will respond asynchronously
      
    case 'generateResume':
      handleResumeGeneration(request.data, sendResponse);
      return true;
      
    case 'generateCoverLetter':
      handleCoverLetterGeneration(request.data, sendResponse);
      return true;
      
    case 'checkATSScore':
      handleATSScoring(request.data, sendResponse);
      return true;
      
    default:
      sendResponse({ error: 'Unknown action' });
  }
});

// Job data extraction handler
async function handleJobDataExtraction(data, sendResponse) {
  try {
    // This would integrate with your AI service for JD parsing
    const extractedData = await extractJobDescription(data);
    sendResponse({ success: true, data: extractedData });
  } catch (error) {
    console.error('Job data extraction error:', error);
    sendResponse({ error: error.message });
  }
}

// Resume generation handler
async function handleResumeGeneration(data, sendResponse) {
  try {
    const generatedResume = await generateOptimizedResume(data);
    sendResponse({ success: true, resume: generatedResume });
  } catch (error) {
    console.error('Resume generation error:', error);
    sendResponse({ error: error.message });
  }
}

// Cover letter generation handler
async function handleCoverLetterGeneration(data, sendResponse) {
  try {
    const coverLetter = await generateCoverLetter(data);
    sendResponse({ success: true, coverLetter: coverLetter });
  } catch (error) {
    console.error('Cover letter generation error:', error);
    sendResponse({ error: error.message });
  }
}

// ATS scoring handler
async function handleATSScoring(data, sendResponse) {
  try {
    const score = await calculateATSScore(data);
    sendResponse({ success: true, score: score });
  } catch (error) {
    console.error('ATS scoring error:', error);
    sendResponse({ error: error.message });
  }
}

// AI Service Integration Functions
async function extractJobDescription(jobData) {
  // This would call your AI API to parse job descriptions
  // For now, returning mock data
  return {
    title: jobData.title || 'Software Engineer',
    company: jobData.company || 'Tech Company',
    keywords: ['JavaScript', 'React', 'Node.js', 'API', 'Frontend'],
    requirements: jobData.requirements || [],
    responsibilities: jobData.responsibilities || [],
    skills: ['JavaScript', 'React', 'CSS', 'HTML', 'Git']
  };
}

async function generateOptimizedResume(data) {
  // This would integrate with your AI service for resume optimization
  // For now, returning mock optimized resume
  return {
    personalInfo: data.userProfile.personalInfo,
    summary: 'ATS-optimized professional summary...',
    experience: data.userProfile.experience.map(exp => ({
      ...exp,
      bullets: exp.bullets.map(bullet => 
        optimizeBulletForKeywords(bullet, data.jobKeywords)
      )
    })),
    skills: prioritizeSkills(data.userProfile.skills, data.jobKeywords),
    atsScore: 92
  };
}

async function generateCoverLetter(data) {
  // This would integrate with your AI service for cover letter generation
  return {
    content: `Dear Hiring Manager,

I am excited to apply for the ${data.jobTitle} position at ${data.company}. Your commitment to innovation and technical excellence aligns perfectly with my passion for building scalable software solutions.

In my previous roles, I have successfully ${data.achievements.join(', ')}, directly addressing the key requirements outlined in your job posting. My experience with ${data.relevantSkills.join(', ')} positions me well to contribute to your team's continued success.

I would welcome the opportunity to discuss how my background in software development can contribute to ${data.company}'s mission. Thank you for your consideration.

Best regards,
${data.userName}`,
    suggestions: ['Consider adding specific metrics', 'Customize company research section']
  };
}

async function calculateATSScore(resumeData) {
  // This would integrate with your ATS scoring algorithm
  const keywordMatch = calculateKeywordMatch(resumeData.keywords, resumeData.jobKeywords);
  const formatScore = calculateFormatScore(resumeData);
  const completenessScore = calculateCompletenessScore(resumeData);
  
  const totalScore = Math.round((keywordMatch + formatScore + completenessScore) / 3);
  
  return {
    totalScore: totalScore,
    keywordMatch: keywordMatch,
    formatScore: formatScore,
    completenessScore: completenessScore,
    suggestions: generateImprovementSuggestions(resumeData)
  };
}

// Helper functions
function optimizeBulletForKeywords(bullet, keywords) {
  // Simple keyword optimization logic
  let optimized = bullet;
  keywords.forEach(keyword => {
    if (!optimized.toLowerCase().includes(keyword.toLowerCase())) {
      // Logic to naturally incorporate keywords
    }
  });
  return optimized;
}

function prioritizeSkills(userSkills, jobKeywords) {
  return userSkills.sort((a, b) => {
    const aRelevant = jobKeywords.some(keyword => 
      keyword.toLowerCase().includes(a.toLowerCase()));
    const bRelevant = jobKeywords.some(keyword => 
      keyword.toLowerCase().includes(b.toLowerCase()));
    
    if (aRelevant && !bRelevant) return -1;
    if (!aRelevant && bRelevant) return 1;
    return 0;
  });
}

function calculateKeywordMatch(resumeKeywords, jobKeywords) {
  const matches = jobKeywords.filter(keyword => 
    resumeKeywords.some(rKeyword => 
      rKeyword.toLowerCase().includes(keyword.toLowerCase())
    )
  );
  return Math.round((matches.length / jobKeywords.length) * 100);
}

function calculateFormatScore(resumeData) {
  // Basic format scoring logic
  let score = 100;
  if (!resumeData.personalInfo) score -= 10;
  if (!resumeData.experience || resumeData.experience.length === 0) score -= 20;
  if (!resumeData.skills || resumeData.skills.length === 0) score -= 15;
  return Math.max(score, 0);
}

function calculateCompletenessScore(resumeData) {
  // Basic completeness scoring logic
  let score = 0;
  if (resumeData.personalInfo) score += 20;
  if (resumeData.experience && resumeData.experience.length > 0) score += 30;
  if (resumeData.skills && resumeData.skills.length > 0) score += 20;
  if (resumeData.education && resumeData.education.length > 0) score += 15;
  if (resumeData.projects && resumeData.projects.length > 0) score += 15;
  return score;
}

function generateImprovementSuggestions(resumeData) {
  const suggestions = [];
  
  if (!resumeData.personalInfo) {
    suggestions.push('Add contact information');
  }
  
  if (!resumeData.experience || resumeData.experience.length === 0) {
    suggestions.push('Add work experience section');
  }
  
  if (!resumeData.skills || resumeData.skills.length < 5) {
    suggestions.push('Add more relevant skills');
  }
  
  return suggestions;
}