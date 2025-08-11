# 💖 Document Quality Team - AI Processor

A modern, pink-themed web interface for automatically processing and organizing documents (RDL, RCS, etc.) with AI-powered classification.

## ✨ Features

- **Drag & Drop Interface** - Beautiful, modern UI with pink glassmorphism design
- **Document Classification** - Automatically identifies RDL, RCS, and other document types
- **Client Info Extraction** - Pulls client names and IDs from documents
- **Auto-Renaming** - Standardized naming: `RDL_CLIENT_NAME_ID_DATE.pdf`
- **Smart Organization** - Sorts documents into proper folders
- **Exception Handling** - Flags password-protected and unwanted documents
- **Real-time Processing** - Live updates with sparkle effects ✨

## 🚀 Quick Start

### Option 1: Live Server (Recommended)
1. Open VS Code
2. Install "Live Server" extension
3. Right-click `index.html` → "Open with Live Server"
4. Drag and drop your documents! 💖

### Option 2: Python Backend (Full Processing)
```bash
# Install dependencies
pip install PyPDF2 Pillow pytesseract

# Run the processor
python3 document_processor.py
```

## 📁 Project Structure

```
workshop/
├── index.html          # Main web interface
├── style.css           # Pink-themed styling
├── script.js           # Frontend logic
├── document_processor.py  # Python backend
├── test_processor.py   # Test script
└── requirements.txt    # Python dependencies
```

## 🎯 Document Types Supported

- **RDL** (Rating Decision Letter) - VA disability decisions
- **RCS** (Records/Client Services) - Authorization forms
- **Unknown** - Flagged for human review
- **Unwanted** - Driver's licenses, passports, etc.

## 💡 How It Works

1. **Upload** - Drag files to the pink drop zone
2. **Process** - AI analyzes document content and structure
3. **Classify** - Identifies document type (RDL, RCS, etc.)
4. **Extract** - Pulls client name and ID information
5. **Rename** - Creates standardized filename
6. **Organize** - Moves to appropriate folder

## 🔧 Customization

- **Colors**: Edit `style.css` for different themes
- **Document Types**: Add patterns in `script.js` classification
- **Processing Logic**: Modify `document_processor.py` for backend

## 📊 Stats Dashboard

Real-time tracking of:
- Total documents processed
- RDL documents identified
- RCS documents identified  
- Documents needing review

---

Made with 💖 for the Document Quality Team