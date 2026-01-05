@echo off
echo ========================================
echo Publishing AI Agent HA to GitHub
echo Repository: https://github.com/jcurtis260/HomeAssistantAI
echo ========================================
echo.

REM Check if git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Git is not installed!
    echo Please install Git from: https://git-scm.com/download/win
    pause
    exit /b 1
)

echo [1/5] Initializing git repository...
git init
if errorlevel 1 (
    echo WARNING: Git may already be initialized, continuing...
)

echo.
echo [2/5] Adding all files...
git add .
if errorlevel 1 (
    echo ERROR: Failed to add files
    pause
    exit /b 1
)

echo.
echo [3/5] Committing changes...
git commit -m "Initial commit: AI Agent HA v1.08 with improvements

- Added custom exception classes for better error handling
- Added input validation utilities
- Enhanced security with service call validation
- Improved documentation and frontend code"
if errorlevel 1 (
    echo ERROR: Failed to commit
    pause
    exit /b 1
)

echo.
echo [4/5] Setting up remote repository...
git remote remove origin 2>nul
git remote add origin https://github.com/jcurtis260/HomeAssistantAI.git
if errorlevel 1 (
    echo ERROR: Failed to add remote repository
    pause
    exit /b 1
)

echo.
echo [5/5] Pushing to GitHub...
echo NOTE: You may be prompted for GitHub credentials
echo       Use your GitHub username and a Personal Access Token (not password)
echo.
git branch -M main
git push -u origin main
if errorlevel 1 (
    echo.
    echo ERROR: Failed to push to GitHub
    echo.
    echo Possible solutions:
    echo 1. Make sure the repository exists at: https://github.com/jcurtis260/HomeAssistantAI
    echo 2. Use a Personal Access Token instead of password
    echo    Get one at: https://github.com/settings/tokens
    echo 3. Or use GitHub Desktop for easier authentication
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo SUCCESS! Code published to GitHub!
echo ========================================
echo.
echo Repository: https://github.com/jcurtis260/HomeAssistantAI
echo.
echo Next steps:
echo 1. Update repository URLs in manifest.json (replace sbenodiz with jcurtis260)
echo 2. Install in Home Assistant via HACS or manually
echo.
pause
