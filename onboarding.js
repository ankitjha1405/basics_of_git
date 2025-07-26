// TailorApply Onboarding Script
let currentStep = 1;
let extractedResumeData = null;
let userSkills = [];

document.addEventListener('DOMContentLoaded', () => {
    console.log('Onboarding script loaded');
    initializeOnboarding();
});

function initializeOnboarding() {
    // Set up file upload
    setupFileUpload();
    
    // Set up skills input
    setupSkillsInput();
    
    // Check if user already has some data
    checkExistingData();
}

function setupFileUpload() {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    
    // Click to upload
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });
    
    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileUpload(files[0]);
        }
    });
    
    // File input change
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileUpload(e.target.files[0]);
        }
    });
}

function setupSkillsInput() {
    const skillsInput = document.getElementById('skills-input');
    const skillInput = skillsInput.querySelector('.skill-input');
    
    skillInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && skillInput.value.trim()) {
            e.preventDefault();
            addSkill(skillInput.value.trim());
            skillInput.value = '';
        }
    });
    
    skillsInput.addEventListener('click', () => {
        skillInput.focus();
    });
}

function addSkill(skill) {
    if (userSkills.includes(skill)) return;
    
    userSkills.push(skill);
    
    const skillsInput = document.getElementById('skills-input');
    const skillInput = skillsInput.querySelector('.skill-input');
    
    const skillTag = document.createElement('div');
    skillTag.className = 'skill-tag';
    skillTag.innerHTML = `
        ${skill}
        <span class="skill-remove" onclick="removeSkill('${skill}', this.parentElement)">×</span>
    `;
    
    skillsInput.insertBefore(skillTag, skillInput);
}

function removeSkill(skill, element) {
    userSkills = userSkills.filter(s => s !== skill);
    element.remove();
}

async function handleFileUpload(file) {
    console.log('File uploaded:', file.name);
    
    // Validate file
    if (!validateFile(file)) {
        return;
    }
    
    // Show progress
    showProgress();
    
    try {
        // Simulate file processing
        await processResumeFile(file);
        
        // Enable continue button
        document.getElementById('continue-btn-1').disabled = false;
        
        // Hide progress and show success
        hideProgress();
        showSuccess();
        
    } catch (error) {
        console.error('Error processing file:', error);
        showError('Error processing your resume. Please try again.');
        hideProgress();
    }
}

function validateFile(file) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (file.size > maxSize) {
        showError('File size must be less than 10MB.');
        return false;
    }
    
    if (!allowedTypes.includes(file.type)) {
        showError('Please upload a PDF, DOC, or DOCX file.');
        return false;
    }
    
    return true;
}

function showProgress() {
    document.getElementById('progress-bar').style.display = 'block';
    document.getElementById('processing-status').style.display = 'block';
    
    // Animate progress bar
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
        }
        document.getElementById('progress-fill').style.width = progress + '%';
    }, 200);
}

function hideProgress() {
    document.getElementById('progress-bar').style.display = 'none';
    document.getElementById('processing-status').style.display = 'none';
}

function showSuccess() {
    const uploadArea = document.getElementById('upload-area');
    uploadArea.innerHTML = `
        <div class="upload-icon">✅</div>
        <div class="upload-text">Resume uploaded successfully!</div>
        <div class="upload-subtext">Click continue to review the extracted information</div>
    `;
    uploadArea.style.borderColor = '#48bb78';
    uploadArea.style.backgroundColor = '#f0fff4';
}

function showError(message) {
    alert(message); // In a real app, you'd show a nice error message
}

async function processResumeFile(file) {
    // Simulate AI processing with mock data
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock extracted data
    extractedResumeData = {
        personalInfo: {
            name: 'John Doe',
            email: 'john.doe@email.com',
            phone: '+1 (555) 123-4567',
            location: 'San Francisco, CA',
            linkedin: 'https://linkedin.com/in/johndoe'
        },
        experience: [
            {
                title: 'Senior Software Engineer',
                company: 'Tech Corp',
                duration: '2020 - Present',
                bullets: [
                    'Led development of scalable web applications using React and Node.js',
                    'Improved system performance by 40% through optimization',
                    'Mentored junior developers and conducted code reviews'
                ]
            },
            {
                title: 'Software Engineer',
                company: 'StartupXYZ',
                duration: '2018 - 2020',
                bullets: [
                    'Built RESTful APIs and microservices architecture',
                    'Collaborated with cross-functional teams on product development',
                    'Implemented automated testing and CI/CD pipelines'
                ]
            }
        ],
        education: [
            {
                degree: 'Bachelor of Science in Computer Science',
                school: 'University of California, Berkeley',
                year: '2018'
            }
        ],
        skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'AWS', 'Docker', 'Git'],
        projects: [
            {
                name: 'E-commerce Platform',
                description: 'Built a full-stack e-commerce application with payment integration'
            }
        ]
    };
    
    // Store in local storage
    await chrome.storage.local.set({ 
        masterResume: file.name,
        extractedResumeData: extractedResumeData 
    });
}

async function checkExistingData() {
    try {
        const result = await chrome.storage.local.get(['userProfile', 'extractedResumeData']);
        
        if (result.userProfile) {
            // Pre-fill form with existing data
            fillFormWithExistingData(result.userProfile);
        }
        
        if (result.extractedResumeData) {
            extractedResumeData = result.extractedResumeData;
        }
    } catch (error) {
        console.error('Error checking existing data:', error);
    }
}

function fillFormWithExistingData(profile) {
    if (profile.personalInfo) {
        const info = profile.personalInfo;
        document.getElementById('full-name').value = info.name || '';
        document.getElementById('email').value = info.email || '';
        document.getElementById('phone').value = info.phone || '';
        document.getElementById('location').value = info.location || '';
        document.getElementById('linkedin').value = info.linkedin || '';
        document.getElementById('summary').value = info.summary || '';
    }
    
    if (profile.skills) {
        userSkills = [...profile.skills];
        profile.skills.forEach(skill => {
            addSkill(skill);
        });
    }
}

function nextStep() {
    if (currentStep === 1) {
        // Moving to step 2 - show extracted data
        displayExtractedData();
    }
    
    // Hide current step
    document.getElementById(`step-${currentStep}`).classList.remove('active');
    
    // Show next step
    currentStep++;
    document.getElementById(`step-${currentStep}`).classList.add('active');
}

function prevStep() {
    // Hide current step
    document.getElementById(`step-${currentStep}`).classList.remove('active');
    
    // Show previous step
    currentStep--;
    document.getElementById(`step-${currentStep}`).classList.add('active');
}

function skipStep() {
    // Skip resume upload, go directly to manual entry
    currentStep = 3;
    document.getElementById('step-1').classList.remove('active');
    document.getElementById('step-3').classList.add('active');
}

function displayExtractedData() {
    if (!extractedResumeData) {
        nextStep(); // Skip if no data
        return;
    }
    
    const extractedDataContainer = document.getElementById('extracted-data');
    
    let html = '';
    
    // Personal Information
    if (extractedResumeData.personalInfo) {
        html += `
            <div class="data-section">
                <h3 class="data-title">Personal Information</h3>
                <div class="data-list">
                    <div class="data-item">Name: ${extractedResumeData.personalInfo.name}</div>
                    <div class="data-item">Email: ${extractedResumeData.personalInfo.email}</div>
                    <div class="data-item">Phone: ${extractedResumeData.personalInfo.phone}</div>
                    <div class="data-item">Location: ${extractedResumeData.personalInfo.location}</div>
                </div>
            </div>
        `;
    }
    
    // Skills
    if (extractedResumeData.skills && extractedResumeData.skills.length > 0) {
        html += `
            <div class="data-section">
                <h3 class="data-title">Skills</h3>
                <div class="data-list">
                    ${extractedResumeData.skills.map(skill => `<div class="data-item">${skill}</div>`).join('')}
                </div>
            </div>
        `;
    }
    
    // Experience
    if (extractedResumeData.experience && extractedResumeData.experience.length > 0) {
        html += `
            <div class="data-section">
                <h3 class="data-title">Work Experience</h3>
                <div class="data-list">
                    ${extractedResumeData.experience.map(exp => 
                        `<div class="data-item">${exp.title} at ${exp.company} (${exp.duration})</div>`
                    ).join('')}
                </div>
            </div>
        `;
    }
    
    // Education
    if (extractedResumeData.education && extractedResumeData.education.length > 0) {
        html += `
            <div class="data-section">
                <h3 class="data-title">Education</h3>
                <div class="data-list">
                    ${extractedResumeData.education.map(edu => 
                        `<div class="data-item">${edu.degree} from ${edu.school} (${edu.year})</div>`
                    ).join('')}
                </div>
            </div>
        `;
    }
    
    extractedDataContainer.innerHTML = html;
    
    // Pre-fill the form with extracted data
    if (extractedResumeData.personalInfo) {
        fillFormWithExistingData({ personalInfo: extractedResumeData.personalInfo });
    }
    
    if (extractedResumeData.skills) {
        userSkills = [...extractedResumeData.skills];
        // Clear existing skills first
        const skillsInput = document.getElementById('skills-input');
        const skillTags = skillsInput.querySelectorAll('.skill-tag');
        skillTags.forEach(tag => tag.remove());
        
        // Add extracted skills
        extractedResumeData.skills.forEach(skill => {
            addSkill(skill);
        });
    }
}

async function completeOnboarding() {
    // Collect form data
    const profileData = {
        personalInfo: {
            name: document.getElementById('full-name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            location: document.getElementById('location').value,
            linkedin: document.getElementById('linkedin').value,
            summary: document.getElementById('summary').value
        },
        skills: userSkills,
        experience: extractedResumeData?.experience || [],
        education: extractedResumeData?.education || [],
        projects: extractedResumeData?.projects || []
    };
    
    // Validate required fields
    if (!profileData.personalInfo.name || !profileData.personalInfo.email) {
        alert('Please fill in your name and email address.');
        return;
    }
    
    try {
        // Save to chrome storage
        await chrome.storage.local.set({ 
            userProfile: profileData,
            onboardingCompleted: true,
            setupDate: new Date().toISOString()
        });
        
        // Move to completion step
        nextStep();
        
        // Send message to background script
        chrome.runtime.sendMessage({ 
            action: 'onboardingCompleted',
            profile: profileData 
        });
        
    } catch (error) {
        console.error('Error saving profile:', error);
        alert('Error saving your profile. Please try again.');
    }
}

function openDashboard() {
    chrome.tabs.create({ url: chrome.runtime.getURL('dashboard.html') });
    window.close();
}

function startApplying() {
    // Close onboarding and let user start applying
    window.close();
}