# Publish to Your GitHub Repository

## Your Repository
**URL**: https://github.com/jcurtis260/HomeAssistantAI

## 🚀 Quick Publish (Choose One Method)

### Method 1: Run the Batch File (Easiest!)

1. **Double-click** `publish_to_github.bat` in your project folder
2. Follow the prompts
3. If asked for credentials:
   - Username: `jcurtis260`
   - Password: Use a **Personal Access Token** (not your GitHub password)
     - Get token: https://github.com/settings/tokens
     - Click "Generate new token (classic)"
     - Name: "Home Assistant Integration"
     - Select scope: `repo`
     - Generate and copy the token

### Method 2: Copy-Paste Commands

Open PowerShell or Command Prompt in your project folder and run:

```powershell
# Navigate to project folder
cd "C:\Users\Work\Downloads\ai_agent_ha-main\ai_agent_ha-main"

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: AI Agent HA v1.08 with improvements"

# Add your repository
git remote add origin https://github.com/jcurtis260/HomeAssistantAI.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Method 3: GitHub Desktop

1. Download: https://desktop.github.com/
2. Sign in with your GitHub account
3. File → Add Local Repository
4. Browse to your project folder
5. Click "Publish repository"
6. Name: `HomeAssistantAI`
7. Click "Publish"

## ⚠️ Important: Update Repository URLs

After publishing, you need to update the repository URLs in the code:

1. **Edit**: `custom_components/ai_agent_ha/manifest.json`
2. **Replace** `sbenodiz` with `jcurtis260` in:
   - `documentation` field
   - `issue_tracker` field
3. **Commit and push**:
   ```bash
   git add custom_components/ai_agent_ha/manifest.json
   git commit -m "Update repository URLs"
   git push
   ```

## 📦 Install in Home Assistant

### Via HACS (if repository is Public):
1. HACS → Integrations → Custom repositories
2. Add: `https://github.com/jcurtis260/HomeAssistantAI`
3. Category: Integration
4. Download and restart

### Manual Installation:
1. Go to: https://github.com/jcurtis260/HomeAssistantAI
2. Click "Code" → "Download ZIP"
3. Extract `custom_components/ai_agent_ha` folder
4. Copy to `/config/custom_components/` in Home Assistant
5. Restart Home Assistant

## ✅ Verify It Worked

After publishing, check:
- https://github.com/jcurtis260/HomeAssistantAI
- You should see all your files there
- README.md should be visible

---

**Need Help?** If you get errors, check:
- Repository exists at the URL
- You have write access to the repository
- Git credentials are correct
