#!/bin/bash
git config --global http.sslverify "false"

# Add all changes to git
git add .

# Commit the changes
git commit -m "another commit"

# Set the branch name to 'main'
git branch -M main

# Add remote repository URL
git remote add origin https://github.com/f-musa/ML-IOT-GR6.git

# Push changes to remote repository
git push -u origin main
