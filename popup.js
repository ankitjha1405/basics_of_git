// TailorApply Popup Script
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Popup loaded');
  
  // Initialize popup
  await initializePopup();
  
  // Set up event listeners
  setupEventListeners();
});

async function initializePopup() {
  try {
    // Check current tab for job detection
    await checkJobDetection();
    
    // Load user profile status
    await loadProfileStatus();
    
    // Load application statistics
    await loadApplicationStats();
    
  } catch (error) {
    console.error('Error initializing popup:', error);
  }
}

async function checkJobDetection() {
  try {
    // Get current active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab) {
      updateJobDetectionUI(false, 'No active tab found');
      return;
    }
    
    // Check if current page is a job posting
    const isJobPage = checkIfJobPage(tab.url);
    
    if (isJobPage) {
      // Try to extract basic job info from the page
      try {
        const jobInfo = await chrome.tabs.sendMessage(tab.id, { action: 'getJobInfo' });
        if (jobInfo && jobInfo.title) {
          updateJobDetectionUI(true, `Job detected: ${jobInfo.title}`);
        } else {
          updateJobDetectionUI(true, 'Job posting detected');
        }
      } catch (error) {
        // Content script might not be loaded yet
        updateJobDetectionUI(true, 'Job posting detected');
      }
    } else {
      updateJobDetectionUI(false, 'No job posting detected');
    }
    
  } catch (error) {
    console.error('Error checking job detection:', error);
    updateJobDetectionUI(false, 'Unable to check page');
  }
}

function checkIfJobPage(url) {
  const jobPagePatterns = [
    /linkedin\.com\/jobs\/view/,
    /naukri\.com\/job-listings/,
    /wellfound\.com\/jobs/,
    /ycombinator\.com\/jobs/,
    /glassdoor\.com\/job-listing/,
    /indeed\.com\/viewjob/,
    /monster\.com\/job-openings/
  ];
  
  return jobPagePatterns.some(pattern => pattern.test(url));
}

function updateJobDetectionUI(isDetected, message) {
  const jobDetection = document.getElementById('job-detection');
  const jobStatus = document.getElementById('job-status');
  const icon = jobDetection.querySelector('.job-detection-icon');
  
  jobDetection.className = 'job-detection';
  
  if (isDetected) {
    jobDetection.classList.add('detected');
    icon.textContent = '✅';
    jobStatus.textContent = message;
  } else {
    jobDetection.classList.add('not-detected');
    icon.textContent = '❌';
    jobStatus.textContent = message;
  }
}

async function loadProfileStatus() {
  try {
    const result = await chrome.storage.local.get(['userProfile', 'masterResume']);
    
    // Update profile status
    const profileStatus = document.getElementById('profile-status');
    const profileIndicator = document.getElementById('profile-indicator');
    
    if (result.userProfile && result.userProfile.personalInfo) {
      profileStatus.textContent = 'Complete';
      profileIndicator.className = 'status-indicator active';
    } else {
      profileStatus.textContent = 'Incomplete';
      profileIndicator.className = 'status-indicator inactive';
    }
    
    // Update resume status
    const resumeStatus = document.getElementById('resume-status');
    const resumeIndicator = document.getElementById('resume-indicator');
    
    if (result.masterResume) {
      resumeStatus.textContent = 'Uploaded';
      resumeIndicator.className = 'status-indicator active';
    } else {
      resumeStatus.textContent = 'Not Uploaded';
      resumeIndicator.className = 'status-indicator inactive';
    }
    
  } catch (error) {
    console.error('Error loading profile status:', error);
  }
}

async function loadApplicationStats() {
  try {
    const result = await chrome.storage.local.get(['applicationHistory', 'atsScores']);
    
    // Update applications count
    const applicationsCount = document.getElementById('applications-count');
    const applications = result.applicationHistory || [];
    applicationsCount.textContent = applications.length;
    
    // Update average ATS score
    const avgATSScore = document.getElementById('avg-ats-score');
    const atsScores = result.atsScores || [];
    
    if (atsScores.length > 0) {
      const average = atsScores.reduce((sum, score) => sum + score, 0) / atsScores.length;
      avgATSScore.textContent = Math.round(average) + '%';
    } else {
      avgATSScore.textContent = '-';
    }
    
  } catch (error) {
    console.error('Error loading application stats:', error);
  }
}

function setupEventListeners() {
  // Open Dashboard
  document.getElementById('open-dashboard').addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('dashboard.html') });
    window.close();
  });
  
  // Upload Resume
  document.getElementById('upload-resume').addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('onboarding.html') });
    window.close();
  });
  
  // View Applications
  document.getElementById('view-applications').addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('dashboard.html#applications') });
    window.close();
  });
  
  // Settings
  document.getElementById('settings').addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('dashboard.html#settings') });
    window.close();
  });
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updatePopup') {
    // Refresh popup data
    loadProfileStatus();
    loadApplicationStats();
    checkJobDetection();
  }
});