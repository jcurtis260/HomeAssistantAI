# Quick Start - Publishing to GitHub

## 🚀 Fast Track (5 Minutes)

### 1. Create GitHub Repository
1. Go to https://github.com/new
2. Name: `ai_agent_ha`
3. Description: "AI Agent for Home Assistant"
4. Choose Public or Private
5. **Don't** initialize with README
6. Click **Create repository**

### 2. Initialize Git and Push

Open terminal in your project folder and run:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: AI Agent HA v1.08 with improvements"

# Add your GitHub repository (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/ai_agent_ha.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 3. Update Repository URLs

Edit `custom_components/ai_agent_ha/manifest.json`:
- Replace `sbenodiz` with your GitHub username in:
  - `documentation` field
  - `issue_tracker` field

Then commit and push:
```bash
git add .
git commit -m "Update repository URLs"
git push
```

### 4. Install in Home Assistant

#### Via HACS (if repository is Public):
1. HACS → Integrations → Custom repositories
2. Add: `https://github.com/YOUR_USERNAME/ai_agent_ha`
3. Category: Integration
4. Download and restart

#### Manual Installation:
1. Download ZIP from GitHub
2. Extract `custom_components/ai_agent_ha` folder
3. Copy to `/config/custom_components/` in Home Assistant
4. Restart Home Assistant

### 5. Configure

1. Settings → Devices & Services → Add Integration
2. Search: "AI Agent HA"
3. Select AI provider
4. Enter API key
5. Done!

---

## 📝 What Changed in v1.08

- ✅ Added custom exception classes for better error handling
- ✅ Added input validation utilities
- ✅ Enhanced security with service call validation
- ✅ Improved documentation
- ✅ Cleaned up frontend code

## 🔗 Full Documentation

- **Publishing Guide**: See `GITHUB_PUBLISH_GUIDE.md` for detailed steps
- **Capabilities**: See `CAPABILITIES.md` for what the AI can do
- **Improvements**: See `IMPROVEMENTS_SUMMARY.md` for what was improved

---

**Need Help?** Check the full guide in `GITHUB_PUBLISH_GUIDE.md`
