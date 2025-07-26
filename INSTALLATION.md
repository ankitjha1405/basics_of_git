# TailorApply Installation Guide

## Quick Installation (Developer Mode)

### Prerequisites
- Google Chrome browser (version 88 or higher)
- Basic understanding of Chrome extensions

### Step 1: Download/Clone the Extension

If you have the source code:
```bash
# Navigate to your desired directory
cd ~/Projects

# If cloning from git
git clone https://github.com/tailorapply/chrome-extension.git
cd chrome-extension

# Or if you downloaded as ZIP, extract it
unzip tailorapply-extension.zip
cd tailorapply
```

### Step 2: Load Extension in Chrome

1. **Open Chrome Extensions Page**
   - Type `chrome://extensions/` in your address bar
   - OR go to Menu → More Tools → Extensions

2. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top right corner

3. **Load the Extension**
   - Click "Load unpacked" button
   - Navigate to the TailorApply folder
   - Select the folder and click "Select Folder"

4. **Verify Installation**
   - You should see "TailorApply" in your extensions list
   - The extension icon should appear in your Chrome toolbar

### Step 3: First-Time Setup

1. **Click the TailorApply Icon**
   - Look for the TailorApply icon in your Chrome toolbar
   - Click it to open the popup

2. **Complete Onboarding**
   - Click "📊 Open Dashboard" or "📄 Upload Master Resume"
   - Follow the onboarding steps:
     - Upload your resume (PDF, DOC, or DOCX)
     - Review extracted information
     - Complete your profile

3. **Configure AI Service (Optional)**
   - Go to Dashboard → Settings
   - Add your OpenAI API key for enhanced features
   - Without API key, basic features will still work

## Testing the Extension

### Test on Supported Job Sites

1. **LinkedIn Jobs**
   - Go to `https://www.linkedin.com/jobs/`
   - Find any job posting
   - Look for the TailorApply floating button on the right side

2. **Other Supported Sites**
   - Naukri.com job listings
   - Wellfound.com job pages
   - Y Combinator job board
   - Glassdoor job listings

### Test Core Features

1. **Job Detection**
   - Visit a job posting page
   - Verify the TailorApply button appears
   - Click the button to open the side panel

2. **Resume Generation**
   - In the side panel, go to "Resume" tab
   - Click "Generate Optimized Resume"
   - Verify resume appears with ATS score

3. **Cover Letter Creation**
   - Go to "Cover Letter" tab
   - Click "Generate Cover Letter"
   - Verify personalized cover letter is created

4. **ATS Scoring**
   - Check the "ATS Score" tab
   - Verify score calculation and suggestions appear

## Troubleshooting

### Common Issues

**Extension doesn't load:**
- Check that all files are in the correct location
- Ensure manifest.json is in the root directory
- Check Chrome console for error messages

**No floating button on job pages:**
- Refresh the page
- Check if the site is supported
- Verify the extension is enabled
- Try clicking the extension icon manually

**AI features not working:**
- Check if OpenAI API key is configured
- Verify internet connection
- Check browser console for API errors

**Resume upload fails:**
- Ensure file is under 10MB
- Use supported formats: PDF, DOC, DOCX
- Check browser permissions for file access

### Debug Mode

1. **Open Developer Tools**
   - Right-click on any page → Inspect
   - Go to Console tab

2. **Check Extension Logs**
   - Look for TailorApply messages
   - Check for any error messages

3. **Inspect Extension**
   - Go to `chrome://extensions/`
   - Click "Inspect views: background page" under TailorApply
   - Check background script console

## File Structure Verification

Ensure your installation has these key files:

```
tailorapply/
├── manifest.json              ✓ Required
├── background.js              ✓ Required
├── content.js                 ✓ Required
├── content.css               ✓ Required
├── popup.html                ✓ Required
├── popup.js                  ✓ Required
├── onboarding.html           ✓ Required
├── onboarding.js             ✓ Required
├── dashboard.html            ✓ Required
├── dashboard.js              ✓ Required
├── src/services/ai-service.js ✓ Required
├── icons/ (with icon files)   ✓ Required
└── README.md                 ✓ Documentation
```

## Next Steps

1. **Set up your profile** through the onboarding process
2. **Test on different job sites** to ensure compatibility
3. **Configure AI service** for enhanced features
4. **Start applying** to jobs with optimized resumes!

## Getting Help

- **GitHub Issues**: Report bugs and requests
- **Console Logs**: Check browser console for errors
- **Extension Popup**: Shows current status and quick actions
- **Dashboard**: Access full feature set and settings

---

**Happy job hunting! 🚀**