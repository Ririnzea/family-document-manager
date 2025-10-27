@echo off
echo 🚀 Deploying Family Document Manager to GitHub Pages...
echo.

echo 📝 Adding all files...
git add .

echo 💬 Committing changes...
set /p commit_message="Enter commit message (or press Enter for default): "
if "%commit_message%"=="" set commit_message=Update Family Document Manager

git commit -m "%commit_message%"

echo 📤 Pushing to GitHub...
git push origin main

echo.
echo ✅ Deployment complete!
echo 🌐 Your app will be available at: https://your-username.github.io/family-document-manager
echo 📱 Wait 1-2 minutes for GitHub Pages to update
echo.
pause