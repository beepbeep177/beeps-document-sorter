#!/usr/bin/env python3
"""
Document Quality Team - AI Document Processor
Identifies document types (RDL, RCS) and organizes them automatically
"""

import os
import re
import shutil
from datetime import datetime
from pathlib import Path
import PyPDF2
from PIL import Image
import pytesseract
from email_service import EmailService

class DocumentProcessor:
    def __init__(self, input_dir="uploads", output_dir="processed"):
        self.input_dir = Path(input_dir)
        self.output_dir = Path(output_dir)
        self.email_service = EmailService()
        self.setup_directories()
    
    def setup_directories(self):
        """Create necessary directories"""
        self.input_dir.mkdir(exist_ok=True)
        self.output_dir.mkdir(exist_ok=True)
        (self.output_dir / "RDL").mkdir(exist_ok=True)
        (self.output_dir / "RCS").mkdir(exist_ok=True)
        (self.output_dir / "UNKNOWN").mkdir(exist_ok=True)
        (self.output_dir / "REVIEW_NEEDED").mkdir(exist_ok=True)
    
    def extract_text_from_pdf(self, file_path):
        """Extract text from PDF using PyPDF2"""
        try:
            with open(file_path, 'rb') as file:
                reader = PyPDF2.PdfReader(file)
                text = ""
                for page in reader.pages:
                    text += page.extract_text()
                return text
        except Exception as e:
            print(f"PDF extraction failed: {e}")
            return ""
    
    def extract_text_from_image(self, file_path):
        """Extract text from image using OCR"""
        try:
            image = Image.open(file_path)
            text = pytesseract.image_to_string(image)
            return text
        except Exception as e:
            print(f"OCR extraction failed: {e}")
            return ""
    
    def classify_document(self, text):
        """Classify document type based on content patterns"""
        text_upper = text.upper()
        
        # RDL Detection
        if ("DEPARTMENT OF VETERANS AFFAIRS" in text_upper and 
            "RATING DECISION" in text_upper):
            return "RDL"
        
        # RCS Detection  
        if ("TM CLIENT AUTHORIZATION" in text_upper or
            "TM-RCS-" in text_upper):
            return "RCS"
        
        return "UNKNOWN"
    
    def extract_client_info(self, text, doc_type):
        """Extract client name and ID based on document type"""
        if doc_type == "RDL":
            # Look for name before VA File Number
            lines = text.split('\n')
            for i, line in enumerate(lines):
                if 'VA File Number' in line:
                    # Check previous lines for the name
                    for j in range(max(0, i-5), i):
                        name_line = lines[j].strip()
                        if (len(name_line) > 3 and 
                            name_line.isupper() and 
                            not any(char.isdigit() for char in name_line) and
                            name_line not in ['DEPARTMENT OF VETERANS AFFAIRS', 'VETERANS BENEFITS ADMINISTRATION', 'REGIONAL OFFICE']):
                            return name_line, None
        
        elif doc_type == "RCS":
            # Extract TM client info
            name_match = re.search(r'Client:\s*([A-Za-z\s\.]+)\s*\(', text)
            if name_match:
                name = name_match.group(1).strip()
                return name, None
        
        return None, None
    
    def is_password_protected(self, file_path):
        """Check if PDF is password protected"""
        try:
            with open(file_path, 'rb') as file:
                reader = PyPDF2.PdfReader(file)
                return reader.is_encrypted
        except:
            return False
    
    def is_unwanted_document(self, text):
        """Check for unwanted documents (driver's license, passport)"""
        text_upper = text.upper()
        unwanted_patterns = [
            "DRIVER'S LICENSE", "DRIVERS LICENSE", "DL",
            "PASSPORT", "BIRTH CERTIFICATE", 
            "SOCIAL SECURITY CARD"
        ]
        return any(pattern in text_upper for pattern in unwanted_patterns)
    
    def generate_filename(self, doc_type, client_name, client_id, original_name):
        """Generate standardized filename: CLIENT_NAME_TYPE_OF_FILE.pdf"""
        clean_name = re.sub(r'[^\w\s-]', '', client_name).replace(' ', '_')
        
        return f"{clean_name}_{doc_type}.pdf"
    
    def process_file(self, file_path, client_email=None, client_name=None):
        """Process a single document file"""
        print(f"Processing: {file_path.name}")
        
        # Check if password protected
        if file_path.suffix.lower() == '.pdf' and self.is_password_protected(file_path):
            dest = self.output_dir / "REVIEW_NEEDED" / f"PASSWORD_PROTECTED_{file_path.name}"
            shutil.copy2(file_path, dest)
            
            # Send real email notification if client info provided
            if client_email and client_name:
                print(f"📧 Sending password protection notification to {client_email}")
                self.email_service.send_password_protected_notification(
                    client_email, client_name, file_path.name
                )
            
            return "PASSWORD_PROTECTED"
        
        # Extract text
        if file_path.suffix.lower() == '.pdf':
            text = self.extract_text_from_pdf(file_path)
        elif file_path.suffix.lower() in ['.jpg', '.jpeg', '.png', '.tiff']:
            text = self.extract_text_from_image(file_path)
        else:
            return "UNSUPPORTED_FORMAT"
        
        # Check for unwanted documents
        if self.is_unwanted_document(text):
            dest = self.output_dir / "REVIEW_NEEDED" / f"UNWANTED_{file_path.name}"
            shutil.copy2(file_path, dest)
            return "UNWANTED"
        
        # Classify document
        doc_type = self.classify_document(text)
        
        # Extract client info
        client_name, client_id = self.extract_client_info(text, doc_type)
        
        if not client_name:
            # Move to review queue if can't extract client info
            dest = self.output_dir / "REVIEW_NEEDED" / f"NO_CLIENT_INFO_{file_path.name}"
            shutil.copy2(file_path, dest)
            return "NEEDS_REVIEW"
        
        # Generate new filename and move
        new_filename = self.generate_filename(doc_type, client_name, client_id, file_path.name)
        dest_dir = self.output_dir / doc_type
        dest_path = dest_dir / new_filename
        
        shutil.copy2(file_path, dest_path)
        
        # Send completion notification if client info provided
        if client_email and client_name:
            print(f"📧 Sending completion notification to {client_email}")
            self.email_service.send_processing_complete_notification(
                client_email, client_name, file_path.name, new_filename, doc_type
            )
        
        return f"PROCESSED_{doc_type}"
    
    def process_all(self):
        """Process all files in input directory"""
        results = {}
        
        for file_path in self.input_dir.iterdir():
            if file_path.is_file():
                result = self.process_file(file_path)
                results[file_path.name] = result
                print(f"  → {result}")
        
        return results

if __name__ == "__main__":
    processor = DocumentProcessor()
    print("🚀 Starting Document Processing...")
    results = processor.process_all()
    
    print("\n📊 Processing Summary:")
    for filename, status in results.items():
        print(f"  {filename}: {status}")