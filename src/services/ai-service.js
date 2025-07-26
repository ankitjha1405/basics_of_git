// TailorApply AI Service
class AIService {
    constructor() {
        this.baseURL = 'https://api.openai.com/v1';
        this.model = 'gpt-4';
        this.apiKey = null;
        this.loadApiKey();
    }

    async loadApiKey() {
        try {
            const result = await chrome.storage.local.get(['apiKey']);
            this.apiKey = result.apiKey;
        } catch (error) {
            console.error('Error loading API key:', error);
        }
    }

    async makeRequest(endpoint, data) {
        if (!this.apiKey) {
            throw new Error('OpenAI API key not configured. Please add your API key in settings.');
        }

        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`AI Service error: ${response.status} ${response.statusText}`);
        }

        return response.json();
    }

    async extractJobDescription(jobText) {
        const prompt = `
        Extract key information from this job posting and return a JSON object with the following structure:
        {
            "title": "job title",
            "company": "company name",
            "keywords": ["keyword1", "keyword2", ...],
            "requirements": ["requirement1", "requirement2", ...],
            "responsibilities": ["responsibility1", "responsibility2", ...],
            "skills": ["skill1", "skill2", ...],
            "experience_level": "entry/mid/senior",
            "employment_type": "full-time/part-time/contract",
            "location": "location if mentioned"
        }

        Job posting:
        ${jobText}

        Extract the most important keywords, technical skills, and requirements. Focus on terms that would be crucial for ATS optimization.
        `;

        try {
            const response = await this.makeRequest('/chat/completions', {
                model: this.model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert ATS (Applicant Tracking System) analyzer. Extract key information from job postings for resume optimization.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.3,
                max_tokens: 1000
            });

            const content = response.choices[0].message.content;
            return JSON.parse(content);
        } catch (error) {
            console.error('Error extracting job description:', error);
            // Return fallback data if AI fails
            return this.extractJobDescriptionFallback(jobText);
        }
    }

    extractJobDescriptionFallback(jobText) {
        // Simple keyword extraction as fallback
        const commonSkills = [
            'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'HTML', 'CSS',
            'AWS', 'Docker', 'Kubernetes', 'Git', 'Agile', 'Scrum', 'REST API',
            'Machine Learning', 'Data Analysis', 'Project Management', 'Leadership'
        ];

        const foundSkills = commonSkills.filter(skill => 
            jobText.toLowerCase().includes(skill.toLowerCase())
        );

        return {
            title: 'Software Engineer', // Default
            company: 'Company',
            keywords: foundSkills.slice(0, 10),
            requirements: [],
            responsibilities: [],
            skills: foundSkills,
            experience_level: 'mid',
            employment_type: 'full-time',
            location: 'Remote'
        };
    }

    async optimizeResume(userProfile, jobData) {
        const prompt = `
        Optimize this resume for the given job posting. Return a JSON object with the optimized resume structure.

        User Profile:
        ${JSON.stringify(userProfile, null, 2)}

        Job Requirements:
        ${JSON.stringify(jobData, null, 2)}

        Optimize the resume by:
        1. Reordering skills to prioritize job-relevant ones
        2. Rewriting bullet points to include job keywords naturally
        3. Emphasizing relevant experience
        4. Creating an ATS-optimized professional summary
        5. Ensuring keyword density without keyword stuffing

        Return the optimized resume in the same structure as the input profile.
        `;

        try {
            const response = await this.makeRequest('/chat/completions', {
                model: this.model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert resume writer and ATS optimization specialist. Create ATS-friendly resumes that score 90%+ on ATS systems while remaining natural and compelling.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.4,
                max_tokens: 2000
            });

            const content = response.choices[0].message.content;
            const optimizedResume = JSON.parse(content);
            
            // Add ATS score calculation
            optimizedResume.atsScore = this.calculateATSScore(optimizedResume, jobData);
            
            return optimizedResume;
        } catch (error) {
            console.error('Error optimizing resume:', error);
            // Return original profile with basic optimization as fallback
            return this.optimizeResumeFallback(userProfile, jobData);
        }
    }

    optimizeResumeFallback(userProfile, jobData) {
        // Basic optimization without AI
        const optimized = JSON.parse(JSON.stringify(userProfile));
        
        // Prioritize skills that match job requirements
        if (optimized.skills && jobData.skills) {
            optimized.skills.sort((a, b) => {
                const aRelevant = jobData.skills.some(skill => 
                    skill.toLowerCase().includes(a.toLowerCase()));
                const bRelevant = jobData.skills.some(skill => 
                    skill.toLowerCase().includes(b.toLowerCase()));
                
                if (aRelevant && !bRelevant) return -1;
                if (!aRelevant && bRelevant) return 1;
                return 0;
            });
        }

        optimized.atsScore = this.calculateATSScore(optimized, jobData);
        return optimized;
    }

    async generateCoverLetter(userProfile, jobData, companyInfo = null) {
        const prompt = `
        Write a personalized cover letter for this job application.

        User Profile:
        ${JSON.stringify(userProfile.personalInfo, null, 2)}

        Job Information:
        ${JSON.stringify(jobData, null, 2)}

        ${companyInfo ? `Company Information: ${JSON.stringify(companyInfo, null, 2)}` : ''}

        Write a professional, engaging cover letter that:
        1. Opens with enthusiasm for the specific role and company
        2. Highlights 2-3 key achievements that align with job requirements
        3. Shows knowledge of the company (if company info provided)
        4. Expresses cultural fit and enthusiasm
        5. Has a strong closing with next steps
        6. Is exactly 3 paragraphs
        7. Uses professional but conversational tone

        Return only the cover letter text, no additional formatting or explanations.
        `;

        try {
            const response = await this.makeRequest('/chat/completions', {
                model: this.model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert cover letter writer. Create compelling, personalized cover letters that get interviews.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.6,
                max_tokens: 800
            });

            return response.choices[0].message.content.trim();
        } catch (error) {
            console.error('Error generating cover letter:', error);
            return this.generateCoverLetterFallback(userProfile, jobData);
        }
    }

    generateCoverLetterFallback(userProfile, jobData) {
        const name = userProfile.personalInfo?.name || 'Applicant';
        const title = jobData.title || 'Position';
        const company = jobData.company || 'Company';

        return `Dear Hiring Manager,

I am excited to apply for the ${title} position at ${company}. Your commitment to innovation and technical excellence aligns perfectly with my passion for building scalable software solutions and delivering exceptional results.

In my previous roles, I have successfully developed and implemented solutions that directly address the key requirements outlined in your job posting. My experience with the technologies and methodologies you're seeking positions me well to contribute to your team's continued success from day one.

I would welcome the opportunity to discuss how my background and enthusiasm can contribute to ${company}'s mission. Thank you for your consideration, and I look forward to hearing from you.

Best regards,
${name}`;
    }

    calculateATSScore(resume, jobData) {
        let score = 0;
        let maxScore = 0;

        // Check for basic sections (40 points)
        maxScore += 40;
        if (resume.personalInfo) score += 10;
        if (resume.experience && resume.experience.length > 0) score += 15;
        if (resume.skills && resume.skills.length > 0) score += 10;
        if (resume.education && resume.education.length > 0) score += 5;

        // Keyword matching (40 points)
        maxScore += 40;
        if (jobData.keywords && resume.skills) {
            const matchedKeywords = jobData.keywords.filter(keyword =>
                resume.skills.some(skill => 
                    skill.toLowerCase().includes(keyword.toLowerCase())
                )
            );
            score += Math.min(40, (matchedKeywords.length / jobData.keywords.length) * 40);
        }

        // Content quality (20 points)
        maxScore += 20;
        if (resume.personalInfo?.summary) score += 5;
        if (resume.experience?.some(exp => exp.bullets && exp.bullets.length > 0)) score += 10;
        if (resume.skills && resume.skills.length >= 5) score += 5;

        return Math.round((score / maxScore) * 100);
    }

    async parseResume(resumeText) {
        const prompt = `
        Parse this resume text and extract information into a structured JSON format:

        {
            "personalInfo": {
                "name": "",
                "email": "",
                "phone": "",
                "location": "",
                "linkedin": "",
                "website": ""
            },
            "summary": "",
            "experience": [
                {
                    "title": "",
                    "company": "",
                    "duration": "",
                    "location": "",
                    "bullets": ["", ""]
                }
            ],
            "education": [
                {
                    "degree": "",
                    "school": "",
                    "year": "",
                    "gpa": ""
                }
            ],
            "skills": ["skill1", "skill2"],
            "projects": [
                {
                    "name": "",
                    "description": "",
                    "technologies": [""]
                }
            ],
            "certifications": [""],
            "languages": [""]
        }

        Resume text:
        ${resumeText}

        Extract all information accurately. If a section is not present, leave it empty.
        `;

        try {
            const response = await this.makeRequest('/chat/completions', {
                model: this.model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert resume parser. Extract structured data from resume text accurately.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.1,
                max_tokens: 2000
            });

            const content = response.choices[0].message.content;
            return JSON.parse(content);
        } catch (error) {
            console.error('Error parsing resume:', error);
            return this.parseResumeFallback(resumeText);
        }
    }

    parseResumeFallback(resumeText) {
        // Basic parsing as fallback
        const lines = resumeText.split('\n').filter(line => line.trim());
        
        // Extract email and phone with regex
        const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
        const phoneRegex = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/;
        
        const email = resumeText.match(emailRegex)?.[0] || '';
        const phone = resumeText.match(phoneRegex)?.[0] || '';
        
        return {
            personalInfo: {
                name: lines[0] || '',
                email: email,
                phone: phone,
                location: '',
                linkedin: '',
                website: ''
            },
            summary: '',
            experience: [],
            education: [],
            skills: [],
            projects: [],
            certifications: [],
            languages: []
        };
    }
}

// Export for use in other modules
window.AIService = AIService;