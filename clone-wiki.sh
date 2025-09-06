#!/bin/bash

# Azure does not support ssh-ed25519 keys because they are idiots, so we might have to use an RSA key
# to clone the wiki

# Script to clone Azure DevOps Wiki using local RSA key
# Usage: ./clone-wiki.sh <repository_url>
# Example: ./clone-wiki.sh git@ssh.dev.azure.com:v3/FooInc/MyDevOpsWiki/MyDevOpsWiki.wiki

# Check if repository URL is provided
if [ $# -eq 0 ]; then
    echo "Error: Repository URL is required"
    echo "Usage: $0 <repository_url>"
    echo "Example: $0 git@ssh.dev.azure.com:v3/FooInc/MyDevOpsWiki/MyDevOpsWiki.wiki"
    exit 1
fi

SSH_KEY_PATH="./azuredevops_rsa"

# Repository URL from parameter
REPO_URL="$1"

# Extract target directory name from the repository URL
# This will get the last part of the URL (e.g., "MyDevOpsWiki.wiki" from the full URL)
TARGET_DIR=$(basename "$REPO_URL")

# Check if the SSH key exists
if [ ! -f "$SSH_KEY_PATH" ]; then
    echo "Error: SSH key not found at $SSH_KEY_PATH"
    exit 1
fi

# Set proper permissions for the SSH key
chmod 600 "$SSH_KEY_PATH"

echo "Cloning Azure DevOps Wiki repository..."
echo "Using SSH key: $SSH_KEY_PATH"
echo "Repository: $REPO_URL"
echo "Target directory: $TARGET_DIR"
echo ""

# Clone the repository using the specific SSH key
GIT_SSH_COMMAND="ssh -i $SSH_KEY_PATH -o StrictHostKeyChecking=no" git clone "$REPO_URL" "$TARGET_DIR"

if [ $? -eq 0 ]; then
    echo ""
    echo "Successfully cloned the wiki repository to $TARGET_DIR"
    
    # Configure the repository to always use this SSH key
    cd "$TARGET_DIR"
    git config core.sshCommand "ssh -i ../$SSH_KEY_PATH -o StrictHostKeyChecking=no"
    echo "Configured the repository to use the local SSH key for future operations"
else
    echo ""
    echo "Failed to clone the repository. Please check:"
    echo "1. The SSH key is correctly added to your Azure DevOps account"
    echo "2. You have access to the repository"
    echo "3. The repository URL is correct"
fi
