#!/bin/bash
# Setup script for Document Processor

echo "🚀 Setting up Document Quality Team AI Processor..."

# Install system dependencies (Ubuntu/Debian)
echo "📦 Installing system dependencies..."
sudo apt-get update
sudo apt-get install -y tesseract-ocr python3-pip

# Install Python dependencies
echo "🐍 Installing Python packages..."
pip3 install -r requirements.txt

# Make scripts executable
chmod +x document_processor.py
chmod +x test_processor.py

echo "✅ Setup complete!"
echo ""
echo "🧪 To test the system:"
echo "  python3 test_processor.py"
echo ""
echo "🚀 To process real documents:"
echo "  1. Put documents in 'uploads/' folder"
echo "  2. Run: python3 document_processor.py"
echo "  3. Check 'processed/' folder for results"