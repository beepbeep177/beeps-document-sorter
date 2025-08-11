#!/usr/bin/env python3
"""
Export Project - Creates a complete package of the document processing system
"""

import os
import shutil
import zipfile
from pathlib import Path

def create_project_export():
    """Create a complete export package"""
    
    print("📦 Creating Document Processing System Export...")
    
    # Create export directory
    export_dir = Path("document_processing_system_export")
    if export_dir.exists():
        shutil.rmtree(export_dir)
    export_dir.mkdir()
    
    # Files to include in export
    files_to_export = [
        # Frontend files
        "index.html",
        "login.css", 
        "login.js",
        "client-portal.html",
        "client-portal.css", 
        "client-portal.js",
        "admin-dashboard.html",
        "admin-dashboard.css",
        "admin-dashboard.js",
        "style.css",
        "script.js",
        
        # Backend files
        "document_processor.py",
        "email_service.py",
        "quick_email_setup.py",
        "test_email.py",
        "api_server.py",
        
        # Configuration files
        "requirements.txt",
        "GMAIL_SETUP.md",
        "README.md",
        
        # Alternative files
        "email-setup.html",
        "original-document-sorter.html"
    ]
    
    # Copy files
    copied_files = []
    for filename in files_to_export:
        if Path(filename).exists():
            shutil.copy2(filename, export_dir / filename)
            copied_files.append(filename)
            print(f"✅ Copied: {filename}")
        else:
            print(f"⚠️  Missing: {filename}")
    
    # Create setup instructions
    setup_instructions = """# 🚀 Document Processing System - Setup Instructions

## 📁 What You Have:
- Complete dual-portal document processing system
- Client portal for document uploads
- Admin dashboard for processing management
- Real Gmail email integration
- Beautiful pink-themed UI

## 🎯 Quick Start:

### Frontend Only (Demo Mode):
1. Open `index.html` in Live Server or browser
2. Use demo accounts to test the system
3. Upload documents and see processing simulation

### Full System with Real Emails:
1. Install Python dependencies: `pip install -r requirements.txt`
2. Configure Gmail: Edit `quick_email_setup.py` with your credentials
3. Run: `python3 quick_email_setup.py`
4. Test: `python3 test_email.py`
5. Start frontend: Open `index.html` in Live Server

## 📧 Gmail Setup:
1. Enable 2-Factor Authentication on Gmail
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Update credentials in `quick_email_setup.py`
4. Run setup script

## 🎨 Demo Accounts:
- Client: client@demo.com / demo123
- Admin: admin@demo.com / admin123

## 📊 Features:
- ✅ Role-based authentication (Client/Admin)
- ✅ Document upload with drag & drop
- ✅ Automatic document classification (RDL, RCS)
- ✅ Client name extraction and auto-renaming
- ✅ Password-protected document detection
- ✅ Real Gmail email notifications
- ✅ Processing queue management
- ✅ Client account management
- ✅ Document library browser

Made with 💖 for the Document Quality Team
"""
    
    with open(export_dir / "SETUP_INSTRUCTIONS.md", "w") as f:
        f.write(setup_instructions)
    
    # Create ZIP file
    zip_filename = "document_processing_system.zip"
    with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for file_path in export_dir.rglob('*'):
            if file_path.is_file():
                arcname = file_path.relative_to(export_dir)
                zipf.write(file_path, arcname)
    
    print(f"\n🎉 Export Complete!")
    print(f"📦 Created: {zip_filename}")
    print(f"📁 Folder: {export_dir}")
    print(f"📄 Files exported: {len(copied_files)}")
    print(f"\n💾 Download the ZIP file to get everything!")
    
    return zip_filename, export_dir

if __name__ == "__main__":
    create_project_export()