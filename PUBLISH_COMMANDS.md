# Copy-Paste Commands to Publish to GitHub

## Step 1: Create GitHub Repository First

1. Go to: https://github.com/new
2. Repository name: `ai_agent_ha`
3. Description: "AI Agent for Home Assistant - Natural language control with multiple AI providers"
4. Choose **Public** (for HACS) or **Private**
5. **DO NOT** check "Initialize with README"
6. Click **Create repository**

## Step 2: Copy These Commands

After creating the repository, GitHub will show you commands. **BUT**, use these instead (they're already set up):

### Windows (PowerShell or Command Prompt):

```powershell
# Navigate to your project folder (adjust path as needed)
cd "C:\Users\Work\Downloads\ai_agent_ha-main\ai_agent_ha-main"

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: AI Agent HA v1.08 with improvements

- Added custom exception classes for better error handling
- Added input validation utilities
- Enhanced security with service call validation
- Improved documentation and frontend code"

# Add your GitHub repository (REPLACE YOUR_USERNAME with your actual GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/ai_agent_ha.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### If Git Asks for Credentials:

**Option 1: Use GitHub Personal Access Token**
- Go to: https://github.com/settings/tokens
- Click "Generate new token (classic)"
- Name: "Home Assistant Integration"
- Select scopes: `repo` (full control)
- Click "Generate token"
- Copy the token
- When git asks for password, paste the token (not your GitHub password)

**Option 2: Use GitHub CLI (Easier)**
```powershell
# Install GitHub CLI first: https://cli.github.com/
# Then authenticate:
gh auth login

# Then use the commands above
```

## Step 3: Update Repository URLs

After pushing, you need to update the repository URLs in the code:

```powershell
# Edit manifest.json and replace sbenodiz with YOUR_USERNAME
# Then:
git add custom_components/ai_agent_ha/manifest.json
git commit -m "Update repository URLs"
git push
```

## Troubleshooting

### "Git is not recognized"
- Install Git: https://git-scm.com/download/win
- Restart terminal after installation

### "Repository already exists"
- You already initialized git, skip `git init`
- Or remove `.git` folder and start fresh

### "Authentication failed"
- Use Personal Access Token instead of password
- Or set up SSH keys (more complex)

### "Remote origin already exists"
```powershell
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/ai_agent_ha.git
```

---

**Need Help?** The commands above should work. Just replace `YOUR_USERNAME` with your actual GitHub username!
