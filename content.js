// TailorApply Content Script
console.log('TailorApply content script loaded');

class TailorApplyContentScript {
  constructor() {
    this.isInitialized = false;
    this.panel = null;
    this.jobData = null;
    this.init();
  }

  init() {
    if (this.isInitialized) return;
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initializeExtension());
    } else {
      this.initializeExtension();
    }
  }

  initializeExtension() {
    console.log('Initializing TailorApply on:', window.location.href);
    
    // Check if we're on a supported job page
    if (this.isJobPage()) {
      this.extractJobData();
      this.createFloatingButton();
      this.isInitialized = true;
    }
  }

  isJobPage() {
    const url = window.location.href;
    const jobPagePatterns = [
      /linkedin\.com\/jobs\/view/,
      /naukri\.com\/job-listings/,
      /wellfound\.com\/jobs/,
      /ycombinator\.com\/jobs/,
      /glassdoor\.com\/job-listing/
    ];
    
    return jobPagePatterns.some(pattern => pattern.test(url));
  }

  extractJobData() {
    const site = this.detectSite();
    this.jobData = this.extractJobDataBySite(site);
    console.log('Extracted job data:', this.jobData);
  }

  detectSite() {
    const hostname = window.location.hostname;
    if (hostname.includes('linkedin.com')) return 'linkedin';
    if (hostname.includes('naukri.com')) return 'naukri';
    if (hostname.includes('wellfound.com')) return 'wellfound';
    if (hostname.includes('ycombinator.com')) return 'yc';
    if (hostname.includes('glassdoor.com')) return 'glassdoor';
    return 'generic';
  }

  extractJobDataBySite(site) {
    switch (site) {
      case 'linkedin':
        return this.extractLinkedInJobData();
      case 'naukri':
        return this.extractNaukriJobData();
      case 'wellfound':
        return this.extractWellfoundJobData();
      case 'yc':
        return this.extractYCJobData();
      case 'glassdoor':
        return this.extractGlassdoorJobData();
      default:
        return this.extractGenericJobData();
    }
  }

  extractLinkedInJobData() {
    const titleElement = document.querySelector('h1.t-24, .job-details-jobs-unified-top-card__job-title');
    const companyElement = document.querySelector('.job-details-jobs-unified-top-card__company-name a, .job-details-jobs-unified-top-card__company-name');
    const descriptionElement = document.querySelector('.job-details-jobs-unified-top-card__job-description, .jobs-description__content');
    
    return {
      title: titleElement?.textContent?.trim() || '',
      company: companyElement?.textContent?.trim() || '',
      description: descriptionElement?.textContent?.trim() || '',
      location: document.querySelector('.job-details-jobs-unified-top-card__bullet')?.textContent?.trim() || '',
      url: window.location.href
    };
  }

  extractNaukriJobData() {
    const titleElement = document.querySelector('.jd-header-title, h1');
    const companyElement = document.querySelector('.jd-header-comp-name, .comp-name');
    const descriptionElement = document.querySelector('.job-desc, .jd-desc');
    
    return {
      title: titleElement?.textContent?.trim() || '',
      company: companyElement?.textContent?.trim() || '',
      description: descriptionElement?.textContent?.trim() || '',
      location: document.querySelector('.jd-loc')?.textContent?.trim() || '',
      url: window.location.href
    };
  }

  extractWellfoundJobData() {
    const titleElement = document.querySelector('h1, .job-title');
    const companyElement = document.querySelector('.company-name, .startup-name');
    const descriptionElement = document.querySelector('.job-description, .description');
    
    return {
      title: titleElement?.textContent?.trim() || '',
      company: companyElement?.textContent?.trim() || '',
      description: descriptionElement?.textContent?.trim() || '',
      location: document.querySelector('.location')?.textContent?.trim() || '',
      url: window.location.href
    };
  }

  extractYCJobData() {
    const titleElement = document.querySelector('h1, .job-title');
    const companyElement = document.querySelector('.company-name');
    const descriptionElement = document.querySelector('.job-description');
    
    return {
      title: titleElement?.textContent?.trim() || '',
      company: companyElement?.textContent?.trim() || '',
      description: descriptionElement?.textContent?.trim() || '',
      location: document.querySelector('.location')?.textContent?.trim() || '',
      url: window.location.href
    };
  }

  extractGlassdoorJobData() {
    const titleElement = document.querySelector('[data-test="job-title"], h1');
    const companyElement = document.querySelector('[data-test="employer-name"], .employer-name');
    const descriptionElement = document.querySelector('[data-test="job-description"], .job-description');
    
    return {
      title: titleElement?.textContent?.trim() || '',
      company: companyElement?.textContent?.trim() || '',
      description: descriptionElement?.textContent?.trim() || '',
      location: document.querySelector('[data-test="job-location"]')?.textContent?.trim() || '',
      url: window.location.href
    };
  }

  extractGenericJobData() {
    // Fallback for other job sites
    const titleElement = document.querySelector('h1, .job-title, .title');
    const companyElement = document.querySelector('.company, .company-name, .employer');
    const descriptionElement = document.querySelector('.description, .job-description, .content');
    
    return {
      title: titleElement?.textContent?.trim() || '',
      company: companyElement?.textContent?.trim() || '',
      description: descriptionElement?.textContent?.trim() || '',
      location: '',
      url: window.location.href
    };
  }

  createFloatingButton() {
    // Remove existing button if any
    const existingButton = document.getElementById('tailorapply-floating-btn');
    if (existingButton) {
      existingButton.remove();
    }

    const button = document.createElement('div');
    button.id = 'tailorapply-floating-btn';
    button.innerHTML = `
      <div class="tailorapply-btn-content">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <polyline points="10,9 9,9 8,9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>TailorApply</span>
      </div>
    `;
    
    button.addEventListener('click', () => this.togglePanel());
    document.body.appendChild(button);
  }

  async togglePanel() {
    if (this.panel && this.panel.style.display !== 'none') {
      this.hidePanel();
    } else {
      await this.showPanel();
    }
  }

  async showPanel() {
    if (!this.panel) {
      await this.createPanel();
    }
    
    this.panel.style.display = 'block';
    setTimeout(() => {
      this.panel.classList.add('tailorapply-panel-visible');
    }, 10);
  }

  hidePanel() {
    if (this.panel) {
      this.panel.classList.remove('tailorapply-panel-visible');
      setTimeout(() => {
        this.panel.style.display = 'none';
      }, 300);
    }
  }

  async createPanel() {
    const panel = document.createElement('div');
    panel.id = 'tailorapply-panel';
    panel.className = 'tailorapply-panel';
    
    // Load panel HTML
    const panelHTML = await this.loadPanelHTML();
    panel.innerHTML = panelHTML;
    
    document.body.appendChild(panel);
    this.panel = panel;
    
    // Initialize panel functionality
    this.initializePanelEvents();
    
    // Process job data immediately
    await this.processJobData();
  }

  async loadPanelHTML() {
    return `
      <div class="tailorapply-panel-header">
        <h3>TailorApply</h3>
        <button class="tailorapply-close-btn" id="tailorapply-close">&times;</button>
      </div>
      
      <div class="tailorapply-panel-content">
        <div class="tailorapply-tabs">
          <button class="tailorapply-tab active" data-tab="job-summary">Job Summary</button>
          <button class="tailorapply-tab" data-tab="resume">Resume</button>
          <button class="tailorapply-tab" data-tab="cover-letter">Cover Letter</button>
          <button class="tailorapply-tab" data-tab="ats-score">ATS Score</button>
        </div>
        
        <div class="tailorapply-tab-content">
          <div id="job-summary-tab" class="tailorapply-tab-panel active">
            <div class="tailorapply-loading" id="job-loading">Analyzing job posting...</div>
            <div id="job-summary-content" style="display: none;">
              <h4>Job Details</h4>
              <div class="tailorapply-job-info">
                <p><strong>Title:</strong> <span id="job-title">-</span></p>
                <p><strong>Company:</strong> <span id="job-company">-</span></p>
                <p><strong>Location:</strong> <span id="job-location">-</span></p>
              </div>
              
              <h4>Key Requirements</h4>
              <div id="job-keywords" class="tailorapply-keywords"></div>
              
              <h4>Skills Needed</h4>
              <div id="job-skills" class="tailorapply-skills"></div>
            </div>
          </div>
          
          <div id="resume-tab" class="tailorapply-tab-panel">
            <div class="tailorapply-action-buttons">
              <button class="tailorapply-btn-primary" id="generate-resume">Generate Optimized Resume</button>
              <button class="tailorapply-btn-secondary" id="download-resume" style="display: none;">Download Resume</button>
            </div>
            <div id="resume-content" class="tailorapply-resume-preview"></div>
          </div>
          
          <div id="cover-letter-tab" class="tailorapply-tab-panel">
            <div class="tailorapply-action-buttons">
              <button class="tailorapply-btn-primary" id="generate-cover-letter">Generate Cover Letter</button>
              <button class="tailorapply-btn-secondary" id="download-cover-letter" style="display: none;">Download Cover Letter</button>
            </div>
            <div id="cover-letter-content">
              <textarea id="cover-letter-text" placeholder="Cover letter will appear here..." rows="15"></textarea>
            </div>
          </div>
          
          <div id="ats-score-tab" class="tailorapply-tab-panel">
            <div class="tailorapply-ats-score">
              <div class="tailorapply-score-circle" id="ats-score-circle">
                <span id="ats-score-number">-</span>
                <span class="tailorapply-score-label">ATS Score</span>
              </div>
              
              <div class="tailorapply-score-breakdown">
                <div class="tailorapply-score-item">
                  <span>Keyword Match:</span>
                  <span id="keyword-score">-</span>
                </div>
                <div class="tailorapply-score-item">
                  <span>Format Score:</span>
                  <span id="format-score">-</span>
                </div>
                <div class="tailorapply-score-item">
                  <span>Completeness:</span>
                  <span id="completeness-score">-</span>
                </div>
              </div>
              
              <div class="tailorapply-suggestions">
                <h4>Improvement Suggestions</h4>
                <ul id="ats-suggestions"></ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  initializePanelEvents() {
    // Close panel
    const closeBtn = document.getElementById('tailorapply-close');
    closeBtn.addEventListener('click', () => this.hidePanel());
    
    // Tab switching
    const tabs = document.querySelectorAll('.tailorapply-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        const tabName = e.target.dataset.tab;
        this.switchTab(tabName);
      });
    });
    
    // Action buttons
    document.getElementById('generate-resume').addEventListener('click', () => this.generateResume());
    document.getElementById('generate-cover-letter').addEventListener('click', () => this.generateCoverLetter());
    document.getElementById('download-resume').addEventListener('click', () => this.downloadResume());
    document.getElementById('download-cover-letter').addEventListener('click', () => this.downloadCoverLetter());
  }

  switchTab(tabName) {
    // Update active tab
    document.querySelectorAll('.tailorapply-tab').forEach(tab => {
      tab.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Update active panel
    document.querySelectorAll('.tailorapply-tab-panel').forEach(panel => {
      panel.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');
  }

  async processJobData() {
    try {
      // Send job data to background script for processing
      const response = await chrome.runtime.sendMessage({
        action: 'extractJobData',
        data: this.jobData
      });
      
      if (response.success) {
        this.displayJobSummary(response.data);
        this.calculateATSScore();
      }
    } catch (error) {
      console.error('Error processing job data:', error);
    }
  }

  displayJobSummary(jobData) {
    document.getElementById('job-loading').style.display = 'none';
    document.getElementById('job-summary-content').style.display = 'block';
    
    document.getElementById('job-title').textContent = jobData.title;
    document.getElementById('job-company').textContent = jobData.company;
    document.getElementById('job-location').textContent = this.jobData.location || 'Remote';
    
    // Display keywords
    const keywordsContainer = document.getElementById('job-keywords');
    keywordsContainer.innerHTML = jobData.keywords.map(keyword => 
      `<span class="tailorapply-keyword">${keyword}</span>`
    ).join('');
    
    // Display skills
    const skillsContainer = document.getElementById('job-skills');
    skillsContainer.innerHTML = jobData.skills.map(skill => 
      `<span class="tailorapply-skill">${skill}</span>`
    ).join('');
  }

  async generateResume() {
    try {
      // Get user profile from storage
      const userProfile = await this.getUserProfile();
      
      if (!userProfile) {
        alert('Please complete your profile in the TailorApply dashboard first.');
        return;
      }
      
      document.getElementById('generate-resume').disabled = true;
      document.getElementById('generate-resume').textContent = 'Generating...';
      
      const response = await chrome.runtime.sendMessage({
        action: 'generateResume',
        data: {
          jobData: this.jobData,
          userProfile: userProfile,
          jobKeywords: this.extractedJobData?.keywords || []
        }
      });
      
      if (response.success) {
        this.displayGeneratedResume(response.resume);
        document.getElementById('download-resume').style.display = 'inline-block';
      }
    } catch (error) {
      console.error('Error generating resume:', error);
      alert('Error generating resume. Please try again.');
    } finally {
      document.getElementById('generate-resume').disabled = false;
      document.getElementById('generate-resume').textContent = 'Generate Optimized Resume';
    }
  }

  async generateCoverLetter() {
    try {
      const userProfile = await this.getUserProfile();
      
      if (!userProfile) {
        alert('Please complete your profile in the TailorApply dashboard first.');
        return;
      }
      
      document.getElementById('generate-cover-letter').disabled = true;
      document.getElementById('generate-cover-letter').textContent = 'Generating...';
      
      const response = await chrome.runtime.sendMessage({
        action: 'generateCoverLetter',
        data: {
          jobTitle: this.jobData.title,
          company: this.jobData.company,
          userName: userProfile.personalInfo?.name || 'User',
          achievements: ['Led development of scalable applications', 'Improved system performance by 40%'],
          relevantSkills: ['JavaScript', 'React', 'Node.js']
        }
      });
      
      if (response.success) {
        document.getElementById('cover-letter-text').value = response.coverLetter.content;
        document.getElementById('download-cover-letter').style.display = 'inline-block';
      }
    } catch (error) {
      console.error('Error generating cover letter:', error);
      alert('Error generating cover letter. Please try again.');
    } finally {
      document.getElementById('generate-cover-letter').disabled = false;
      document.getElementById('generate-cover-letter').textContent = 'Generate Cover Letter';
    }
  }

  async calculateATSScore() {
    try {
      const userProfile = await this.getUserProfile();
      
      if (!userProfile) return;
      
      const response = await chrome.runtime.sendMessage({
        action: 'checkATSScore',
        data: {
          personalInfo: userProfile.personalInfo,
          experience: userProfile.experience,
          skills: userProfile.skills,
          education: userProfile.education,
          keywords: userProfile.skills || [],
          jobKeywords: this.extractedJobData?.keywords || []
        }
      });
      
      if (response.success) {
        this.displayATSScore(response.score);
      }
    } catch (error) {
      console.error('Error calculating ATS score:', error);
    }
  }

  displayATSScore(scoreData) {
    document.getElementById('ats-score-number').textContent = scoreData.totalScore;
    document.getElementById('keyword-score').textContent = `${scoreData.keywordMatch}%`;
    document.getElementById('format-score').textContent = `${scoreData.formatScore}%`;
    document.getElementById('completeness-score').textContent = `${scoreData.completenessScore}%`;
    
    // Update score circle color
    const scoreCircle = document.getElementById('ats-score-circle');
    if (scoreData.totalScore >= 90) {
      scoreCircle.className = 'tailorapply-score-circle excellent';
    } else if (scoreData.totalScore >= 70) {
      scoreCircle.className = 'tailorapply-score-circle good';
    } else {
      scoreCircle.className = 'tailorapply-score-circle needs-improvement';
    }
    
    // Display suggestions
    const suggestionsContainer = document.getElementById('ats-suggestions');
    suggestionsContainer.innerHTML = scoreData.suggestions.map(suggestion => 
      `<li>${suggestion}</li>`
    ).join('');
  }

  async getUserProfile() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['userProfile'], (result) => {
        resolve(result.userProfile);
      });
    });
  }

  displayGeneratedResume(resume) {
    const resumeContainer = document.getElementById('resume-content');
    resumeContainer.innerHTML = `
      <div class="tailorapply-resume">
        <h3>Optimized Resume Preview</h3>
        <p><strong>ATS Score:</strong> <span class="tailorapply-score">${resume.atsScore}%</span></p>
        <div class="tailorapply-resume-section">
          <h4>Professional Summary</h4>
          <p>${resume.summary}</p>
        </div>
        <!-- Add more resume sections here -->
      </div>
    `;
  }

  downloadResume() {
    // This would generate and download the resume PDF
    alert('Resume download functionality will be implemented with PDF generation service.');
  }

  downloadCoverLetter() {
    // This would download the cover letter
    const content = document.getElementById('cover-letter-text').value;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cover-letter.txt';
    a.click();
    URL.revokeObjectURL(url);
  }
}

// Initialize the content script
new TailorApplyContentScript();