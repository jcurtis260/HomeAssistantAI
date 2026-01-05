# Pre-Publish Checklist

Use this checklist before publishing to GitHub to ensure everything is ready.

## ✅ Code Quality

- [ ] All new files are added and committed
- [ ] No console.log statements in production code (frontend)
- [ ] All imports are correct
- [ ] No syntax errors
- [ ] Code follows Home Assistant guidelines

## ✅ Documentation

- [ ] README.md is up to date
- [ ] CHANGELOG.md includes new changes
- [ ] All documentation files are present
- [ ] Installation instructions are clear

## ✅ Configuration

- [ ] `manifest.json` version is updated
- [ ] `manifest.json` has correct repository URLs
- [ ] `hacs.json` is properly configured
- [ ] `requirements.txt` includes all dependencies

## ✅ Files to Include

- [ ] `custom_components/ai_agent_ha/` - Main code
- [ ] `README.md`
- [ ] `LICENSE`
- [ ] `hacs.json`
- [ ] `requirements.txt`
- [ ] `docs/` folder
- [ ] `.gitignore`
- [ ] `CHANGELOG.md`

## ✅ Files to Exclude

- [ ] `.git/` folder (automatically excluded)
- [ ] `__pycache__/` folders (should be in .gitignore)
- [ ] `*.pyc` files (should be in .gitignore)
- [ ] `.DS_Store` (should be in .gitignore)
- [ ] Any API keys or secrets

## ✅ Testing

- [ ] Integration loads without errors
- [ ] Config flow works
- [ ] All AI providers can be configured
- [ ] Dashboard creation works
- [ ] Entity control works
- [ ] Data queries work

## ✅ Git Setup

- [ ] Git repository is initialized
- [ ] All files are added
- [ ] Initial commit is made
- [ ] GitHub repository is created
- [ ] Remote is configured correctly

## ✅ Post-Publish

- [ ] Repository URLs are updated in manifest.json
- [ ] README installation link is updated
- [ ] Test installation via HACS (if public)
- [ ] Create first release tag

---

**Ready to Publish?** Once all items are checked, follow the steps in `GITHUB_PUBLISH_GUIDE.md`
