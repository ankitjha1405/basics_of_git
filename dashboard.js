// TailorApply Dashboard Script
let userProfile = null;
let userSkills = [];

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Dashboard loaded');
    
    // Initialize dashboard
    await initializeDashboard();
    
    // Set up event listeners
    setupEventListeners();
});

async function initializeDashboard() {
    try {
        // Load user data
        await loadUserProfile();
        
        // Load stats
        await loadStats();
        
        // Load applications
        await loadApplications();
        
        // Load settings
        await loadSettings();
        
        // Check URL hash for specific tab
        checkURLHash();
        
    } catch (error) {
        console.error('Error initializing dashboard:', error);
    }
}

function setupEventListeners() {
    // Tab navigation
    const navTabs = document.querySelectorAll('.nav-tab');
    navTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            const tabName = e.target.dataset.tab;
            switchTab(tabName);
        });
    });
    
    // Skills input
    const newSkillInput = document.getElementById('new-skill');
    newSkillInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addSkill();
        }
    });
    
    // Settings toggles
    const settingsToggle = document.querySelectorAll('.toggle input[type="checkbox"]');
    settingsToggle.forEach(toggle => {
        toggle.addEventListener('change', saveSettings);
    });
}

function switchTab(tabName) {
    // Update active tab
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Update active panel
    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Update URL hash
    window.location.hash = tabName;
}

function checkURLHash() {
    const hash = window.location.hash.slice(1);
    if (hash && ['profile', 'applications', 'settings'].includes(hash)) {
        switchTab(hash);
    }
}

async function loadUserProfile() {
    try {
        const result = await chrome.storage.local.get(['userProfile', 'masterResume']);
        
        if (result.userProfile) {
            userProfile = result.userProfile;
            populateProfileForm(userProfile);
        }
        
        if (result.masterResume) {
            updateResumeStatus(result.masterResume);
        }
        
    } catch (error) {
        console.error('Error loading user profile:', error);
    }
}

function populateProfileForm(profile) {
    if (profile.personalInfo) {
        const info = profile.personalInfo;
        document.getElementById('full-name').value = info.name || '';
        document.getElementById('email').value = info.email || '';
        document.getElementById('phone').value = info.phone || '';
        document.getElementById('location').value = info.location || '';
        document.getElementById('linkedin').value = info.linkedin || '';
        document.getElementById('website').value = info.website || '';
        document.getElementById('summary').value = info.summary || '';
    }
    
    if (profile.skills) {
        userSkills = [...profile.skills];
        renderSkills();
    }
}

function renderSkills() {
    const skillsContainer = document.getElementById('skills-container');
    skillsContainer.innerHTML = '';
    
    userSkills.forEach(skill => {
        const skillTag = document.createElement('div');
        skillTag.className = 'skill-tag';
        skillTag.innerHTML = `
            ${skill}
            <span class="skill-remove" onclick="removeSkill('${skill}')">×</span>
        `;
        skillsContainer.appendChild(skillTag);
    });
}

function addSkill() {
    const newSkillInput = document.getElementById('new-skill');
    const skill = newSkillInput.value.trim();
    
    if (skill && !userSkills.includes(skill)) {
        userSkills.push(skill);
        renderSkills();
        newSkillInput.value = '';
    }
}

function removeSkill(skill) {
    userSkills = userSkills.filter(s => s !== skill);
    renderSkills();
}

async function saveProfile() {
    try {
        // Collect form data
        const profileData = {
            personalInfo: {
                name: document.getElementById('full-name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                location: document.getElementById('location').value,
                linkedin: document.getElementById('linkedin').value,
                website: document.getElementById('website').value,
                summary: document.getElementById('summary').value
            },
            skills: userSkills,
            experience: userProfile?.experience || [],
            education: userProfile?.education || [],
            projects: userProfile?.projects || []
        };
        
        // Validate required fields
        if (!profileData.personalInfo.name || !profileData.personalInfo.email) {
            alert('Please fill in your name and email address.');
            return;
        }
        
        // Save to storage
        await chrome.storage.local.set({ userProfile: profileData });
        userProfile = profileData;
        
        // Show success message
        showNotification('Profile saved successfully!', 'success');
        
    } catch (error) {
        console.error('Error saving profile:', error);
        showNotification('Error saving profile. Please try again.', 'error');
    }
}

async function loadStats() {
    try {
        const result = await chrome.storage.local.get([
            'applicationHistory',
            'atsScores',
            'resumesGenerated',
            'coverLettersGenerated'
        ]);
        
        // Total applications
        const applications = result.applicationHistory || [];
        document.getElementById('total-applications').textContent = applications.length;
        
        // Average ATS score
        const atsScores = result.atsScores || [];
        if (atsScores.length > 0) {
            const average = atsScores.reduce((sum, score) => sum + score, 0) / atsScores.length;
            document.getElementById('avg-ats-score').textContent = Math.round(average) + '%';
        } else {
            document.getElementById('avg-ats-score').textContent = '-';
        }
        
        // Resumes generated
        document.getElementById('resumes-generated').textContent = result.resumesGenerated || 0;
        
        // Cover letters generated
        document.getElementById('cover-letters-generated').textContent = result.coverLettersGenerated || 0;
        
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

async function loadApplications() {
    try {
        const result = await chrome.storage.local.get(['applicationHistory']);
        const applications = result.applicationHistory || [];
        
        const applicationsList = document.getElementById('applications-list');
        
        if (applications.length === 0) {
            applicationsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📋</div>
                    <div class="empty-title">No Applications Yet</div>
                    <div class="empty-description">
                        Start applying to jobs to see your application history here.
                        Visit any job posting and use TailorApply to generate optimized resumes and cover letters.
                    </div>
                    <button class="btn btn-primary" onclick="window.close()">Start Applying</button>
                </div>
            `;
            return;
        }
        
        // Render applications
        applicationsList.innerHTML = applications.map(app => `
            <div class="application-item">
                <div class="application-header">
                    <div>
                        <div class="application-title">${app.jobTitle}</div>
                        <div class="application-company">${app.company}</div>
                    </div>
                    <div class="application-date">${formatDate(app.date)}</div>
                </div>
                
                <div class="application-stats">
                    <div class="application-stat">
                        <span>📊</span>
                        <span class="ats-score ${getScoreClass(app.atsScore)}">${app.atsScore}% ATS</span>
                    </div>
                    <div class="application-stat">
                        <span>📄</span>
                        <span>Resume Generated</span>
                    </div>
                    ${app.coverLetter ? '<div class="application-stat"><span>✉️</span><span>Cover Letter</span></div>' : ''}
                    <div class="application-stat">
                        <span>🌐</span>
                        <a href="${app.jobUrl}" target="_blank" style="color: #667eea;">View Job</a>
                    </div>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading applications:', error);
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function getScoreClass(score) {
    if (score >= 90) return 'good';
    if (score >= 70) return 'average';
    return 'poor';
}

async function loadSettings() {
    try {
        const result = await chrome.storage.local.get([
            'autoDetect',
            'companyResearch',
            'analytics',
            'apiKey'
        ]);
        
        // Load toggle states
        document.getElementById('auto-detect').checked = result.autoDetect !== false;
        document.getElementById('company-research').checked = result.companyResearch !== false;
        document.getElementById('analytics').checked = result.analytics !== false;
        
        // Load API key (don't show the actual key for security)
        if (result.apiKey) {
            document.getElementById('api-key').placeholder = 'API key saved (hidden for security)';
        }
        
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

async function saveSettings() {
    try {
        const settings = {
            autoDetect: document.getElementById('auto-detect').checked,
            companyResearch: document.getElementById('company-research').checked,
            analytics: document.getElementById('analytics').checked
        };
        
        await chrome.storage.local.set(settings);
        showNotification('Settings saved successfully!', 'success');
        
    } catch (error) {
        console.error('Error saving settings:', error);
        showNotification('Error saving settings. Please try again.', 'error');
    }
}

async function saveApiKey() {
    try {
        const apiKey = document.getElementById('api-key').value.trim();
        
        if (!apiKey) {
            alert('Please enter an API key.');
            return;
        }
        
        if (!apiKey.startsWith('sk-')) {
            alert('Please enter a valid OpenAI API key (starts with sk-).');
            return;
        }
        
        await chrome.storage.local.set({ apiKey: apiKey });
        
        // Clear the input and update placeholder
        document.getElementById('api-key').value = '';
        document.getElementById('api-key').placeholder = 'API key saved (hidden for security)';
        
        showNotification('API key saved successfully!', 'success');
        
    } catch (error) {
        console.error('Error saving API key:', error);
        showNotification('Error saving API key. Please try again.', 'error');
    }
}

function uploadNewResume() {
    // Open onboarding page
    chrome.tabs.create({ url: chrome.runtime.getURL('onboarding.html') });
}

function updateResumeStatus(fileName) {
    const resumeStatus = document.getElementById('resume-status');
    resumeStatus.innerHTML = `
        <div style="display: flex; align-items: center; gap: 15px; padding: 20px; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px;">
            <div style="font-size: 32px;">📄</div>
            <div>
                <div style="font-weight: 600; color: #1e293b; margin-bottom: 5px;">Master Resume Uploaded</div>
                <div style="color: #64748b; font-size: 14px;">${fileName}</div>
                <div style="color: #64748b; font-size: 12px; margin-top: 5px;">Last updated: ${new Date().toLocaleDateString()}</div>
            </div>
        </div>
    `;
}

async function clearHistory() {
    if (confirm('Are you sure you want to clear all application history? This action cannot be undone.')) {
        try {
            await chrome.storage.local.remove([
                'applicationHistory',
                'atsScores',
                'resumesGenerated',
                'coverLettersGenerated'
            ]);
            
            await loadStats();
            await loadApplications();
            
            showNotification('Application history cleared successfully!', 'success');
            
        } catch (error) {
            console.error('Error clearing history:', error);
            showNotification('Error clearing history. Please try again.', 'error');
        }
    }
}

async function exportData() {
    try {
        const result = await chrome.storage.local.get(null);
        
        const exportData = {
            profile: result.userProfile,
            applications: result.applicationHistory || [],
            settings: {
                autoDetect: result.autoDetect,
                companyResearch: result.companyResearch,
                analytics: result.analytics
            },
            stats: {
                totalApplications: result.applicationHistory?.length || 0,
                resumesGenerated: result.resumesGenerated || 0,
                coverLettersGenerated: result.coverLettersGenerated || 0,
                atsScores: result.atsScores || []
            },
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `tailorapply-data-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        
        showNotification('Data exported successfully!', 'success');
        
    } catch (error) {
        console.error('Error exporting data:', error);
        showNotification('Error exporting data. Please try again.', 'error');
    }
}

async function exportAllData() {
    await exportData();
}

async function clearAllData() {
    if (confirm('Are you sure you want to delete ALL data? This will permanently remove your profile, application history, and settings. This action cannot be undone.')) {
        if (confirm('This is your final warning. ALL data will be permanently deleted. Continue?')) {
            try {
                await chrome.storage.local.clear();
                
                // Reload the page to show empty state
                window.location.reload();
                
            } catch (error) {
                console.error('Error clearing all data:', error);
                showNotification('Error clearing data. Please try again.', 'error');
            }
        }
    }
}

async function refreshData() {
    try {
        showNotification('Refreshing data...', 'info');
        
        await loadUserProfile();
        await loadStats();
        await loadApplications();
        await loadSettings();
        
        showNotification('Data refreshed successfully!', 'success');
        
    } catch (error) {
        console.error('Error refreshing data:', error);
        showNotification('Error refreshing data. Please try again.', 'error');
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `;
    
    // Set background color based on type
    switch (type) {
        case 'success':
            notification.style.backgroundColor = '#10b981';
            break;
        case 'error':
            notification.style.backgroundColor = '#ef4444';
            break;
        case 'warning':
            notification.style.backgroundColor = '#f59e0b';
            break;
        default:
            notification.style.backgroundColor = '#6b7280';
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);