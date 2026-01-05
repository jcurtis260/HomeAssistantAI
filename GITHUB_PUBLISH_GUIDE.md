# Publishing AI Agent HA to GitHub

This guide will help you publish the AI Agent HA integration to GitHub so you can use it in Home Assistant.

## 📋 Prerequisites

1. **GitHub Account** - Create one at https://github.com if you don't have one
2. **Git Installed** - Make sure Git is installed on your computer
3. **Home Assistant** - Your Home Assistant instance (for testing)

## 🚀 Step-by-Step Publishing Guide

### Step 1: Initialize Git Repository (if not already done)

Open a terminal/command prompt in the project directory and run:

```bash
# Check if git is already initialized
git status

# If not initialized, run:
git init
```

### Step 2: Create GitHub Repository

1. Go to https://github.com/new
2. **Repository name**: `ai_agent_ha` (or your preferred name)
3. **Description**: "AI Agent for Home Assistant - Natural language control with multiple AI providers"
4. **Visibility**: 
   - Choose **Public** (if you want others to use it via HACS)
   - Choose **Private** (if it's just for your personal use)
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click **Create repository**

### Step 3: Add All Files to Git

```bash
# Add all files
git add .

# Check what will be committed
git status

# Commit the files
git commit -m "Initial commit: AI Agent HA with improvements

- Added custom exception classes for better error handling
- Added input validation utilities
- Improved frontend code
- Added comprehensive documentation
- Enhanced security with service call validation"
```

### Step 4: Connect to GitHub and Push

```bash
# Add your GitHub repository as remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/ai_agent_ha.git

# Or if using SSH:
# git remote add origin git@github.com:YOUR_USERNAME/ai_agent_ha.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 5: Update Repository Information

After publishing, update these files with your GitHub username:

1. **`custom_components/ai_agent_ha/manifest.json`**:
   ```json
   {
     "documentation": "https://github.com/YOUR_USERNAME/ai_agent_ha",
     "issue_tracker": "https://github.com/YOUR_USERNAME/ai_agent_ha/issues"
   }
   ```

2. **`README.md`** - Update the HACS installation link:
   ```markdown
   [![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=YOUR_USERNAME&repository=ai_agent_ha&category=integration)
   ```

3. **`hacs.json`** - Already configured, no changes needed

Then commit and push the updates:
```bash
git add .
git commit -m "Update repository URLs"
git push
```

## 📦 Installing in Home Assistant

### Option 1: Install via HACS (Recommended)

1. **Add to HACS**:
   - Go to HACS → Integrations
   - Click the three dots (⋮) → Custom repositories
   - Add repository: `https://github.com/YOUR_USERNAME/ai_agent_ha`
   - Category: Integration
   - Click Add

2. **Install**:
   - Find "AI Agent HA" in the integration list
   - Click Download
   - Restart Home Assistant

3. **Configure**:
   - Go to Settings → Devices & Services → Add Integration
   - Search for "AI Agent HA"
   - Follow the setup wizard

### Option 2: Manual Installation

1. **Download**:
   - Go to your GitHub repository
   - Click Code → Download ZIP
   - Extract the ZIP file

2. **Copy Files**:
   - Copy the `custom_components/ai_agent_ha` folder to your Home Assistant `custom_components` directory
   - Path: `/config/custom_components/ai_agent_ha/`

3. **Restart Home Assistant**

4. **Configure**:
   - Go to Settings → Devices & Services → Add Integration
   - Search for "AI Agent HA"
   - Follow the setup wizard

## 🔄 Updating the Integration

When you make changes:

```bash
# Make your changes to files

# Stage changes
git add .

# Commit changes
git commit -m "Description of your changes"

# Push to GitHub
git push
```

Then in Home Assistant:
- **HACS**: Go to HACS → Integrations → AI Agent HA → Update
- **Manual**: Download the latest version and replace the files

## 🏷️ Creating Releases

For version tracking, create releases on GitHub:

1. Go to your repository on GitHub
2. Click **Releases** → **Create a new release**
3. **Tag version**: `v1.08` (or next version number)
4. **Release title**: `v1.08 - Improvements and Bug Fixes`
5. **Description**: List the changes
6. Click **Publish release**

## 📝 Important Files to Keep

Make sure these files are in your repository:
- ✅ `custom_components/ai_agent_ha/` - Main integration code
- ✅ `README.md` - Project documentation
- ✅ `LICENSE` - License file
- ✅ `hacs.json` - HACS configuration
- ✅ `.gitignore` - Git ignore rules
- ✅ `requirements.txt` - Python dependencies
- ✅ `docs/` - Documentation folder
- ✅ `tests/` - Test files

## 🔒 Security Notes

- **Never commit** API keys or tokens
- The `.gitignore` should exclude sensitive files
- Review files before committing to ensure no secrets are included

## 🎯 Next Steps After Publishing

1. **Test Installation**: Install the integration in Home Assistant and test all features
2. **Update Documentation**: Keep README.md updated with new features
3. **Create Issues**: Use GitHub Issues to track bugs and feature requests
4. **Version Bumping**: Update version in `manifest.json` when releasing new versions

## 📚 Additional Resources

- [GitHub Documentation](https://docs.github.com/)
- [HACS Documentation](https://hacs.xyz/docs/)
- [Home Assistant Integration Development](https://developers.home-assistant.io/docs/creating_integration_manifest/)

---

**Need Help?** If you encounter issues, check:
- GitHub's documentation for Git commands
- Home Assistant Community Forums
- HACS Discord/Support channels
