#!/bin/bash

# GitHub Secrets Setup Helper
# This script helps convert certificates to base64 for GitHub secrets

echo "🔐 GitHub Secrets Setup Helper"
echo "=============================="
echo ""

function help_text() {
    echo "This script helps you prepare certificates for GitHub repository secrets."
    echo ""
    echo "Usage:"
    echo "  ./setup-secrets.sh [certificate.p12]"
    echo ""
    echo "What this script does:"
    echo "  1. Converts .p12 certificate to base64"
    echo "  2. Copies base64 string to clipboard (macOS)"
    echo "  3. Shows you exactly what to paste into GitHub secrets"
    echo ""
    echo "Required GitHub Secrets:"
    echo "  🔄 GITHUB_TOKEN (automatic - no setup needed)"
    echo "  🍎 APPLE_ID (your Apple Developer email)"
    echo "  🍎 APPLE_ID_PASS (app-specific password)"
    echo "  🍎 CSC_LINK (base64 of macOS .p12 cert)"
    echo "  🍎 CSC_KEY_PASSWORD (password for macOS cert)"
    echo "  🪟 WIN_CSC_LINK (base64 of Windows .p12 cert)"
    echo "  🪟 WIN_CSC_KEY_PASSWORD (password for Windows cert)"
    echo ""
}

if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    help_text
    exit 0
fi

if [ -z "$1" ]; then
    echo "❌ Please provide a certificate file"
    echo ""
    help_text
    exit 1
fi

CERT_FILE="$1"

if [ ! -f "$CERT_FILE" ]; then
    echo "❌ Certificate file not found: $CERT_FILE"
    exit 1
fi

echo "📋 Processing certificate: $CERT_FILE"
echo ""

# Convert to base64
echo "🔄 Converting to base64..."
BASE64_CONTENT=$(base64 -i "$CERT_FILE")

if [ $? -eq 0 ]; then
    echo "✅ Conversion successful!"
    echo ""
    
    # Copy to clipboard on macOS
    if command -v pbcopy >/dev/null 2>&1; then
        echo "$BASE64_CONTENT" | pbcopy
        echo "📋 Base64 content copied to clipboard!"
        echo ""
    fi
    
    echo "🔐 GitHub Secret Setup Instructions:"
    echo "====================================="
    echo ""
    echo "1. Go to your GitHub repository"
    echo "2. Navigate to: Settings → Secrets and variables → Actions"
    echo "3. Click 'New repository secret'"
    echo "4. Add these secrets:"
    echo ""
    
    if [[ "$CERT_FILE" == *"mac"* ]] || [[ "$CERT_FILE" == *"apple"* ]] || [[ "$CERT_FILE" == *"darwin"* ]]; then
        echo "   📝 Secret name: CSC_LINK"
        echo "   📝 Secret name: CSC_KEY_PASSWORD"
        echo "   📝 Also add: APPLE_ID (your Apple Developer email)"
        echo "   📝 Also add: APPLE_ID_PASS (app-specific password)"
    elif [[ "$CERT_FILE" == *"win"* ]] || [[ "$CERT_FILE" == *"windows"* ]]; then
        echo "   📝 Secret name: WIN_CSC_LINK"
        echo "   📝 Secret name: WIN_CSC_KEY_PASSWORD"
    else
        echo "   📝 For macOS: CSC_LINK"
        echo "   📝 For Windows: WIN_CSC_LINK"
        echo "   📝 Password secrets: CSC_KEY_PASSWORD or WIN_CSC_KEY_PASSWORD"
    fi
    
    echo ""
    echo "5. Paste the base64 content (already in clipboard) as the secret value"
    echo "6. Add the certificate password as a separate secret"
    echo ""
    echo "✅ Your certificate is ready for GitHub Actions!"
    
else
    echo "❌ Failed to convert certificate to base64"
    exit 1
fi
