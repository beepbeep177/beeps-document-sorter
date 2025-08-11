#!/usr/bin/env python3
"""
Test script for document processor with sample data
"""

from document_processor import DocumentProcessor
from pathlib import Path

def create_test_documents():
    """Create sample text files to test the processor"""
    
    # Create test directory
    test_dir = Path("uploads")
    test_dir.mkdir(exist_ok=True)
    
    # Sample RDL content
    rdl_content = """DEPARTMENT OF VETERANS AFFAIRS
Veterans Benefits Administration
Regional Office
ARIANA ATKINS
VA File Number
209 684 1394
Rating Decision
08/05/2025
INTRODUCTION
The records reflect that you are a Veteran of the Peacetime."""
    
    # Sample RCS content  
    rcs_content = """TM CLIENT AUTHORIZATION FORM
Document ID: TM-RCS-2023-8765
Client: John A. Smith (ID: TM-1142-2023)
Date Issued: 15-Aug-2023

Authorization Request
I, John A. Smith (TM Client ID: TM-1142-2023), hereby authorize:"""
    
    # Sample unwanted document
    unwanted_content = """STATE OF CALIFORNIA
DRIVER'S LICENSE
Name: Jane Doe
License Number: D1234567"""
    
    # Write test files
    with open(test_dir / "sample_rdl.txt", "w") as f:
        f.write(rdl_content)
    
    with open(test_dir / "sample_rcs.txt", "w") as f:
        f.write(rcs_content)
        
    with open(test_dir / "sample_unwanted.txt", "w") as f:
        f.write(unwanted_content)
    
    print("✅ Test documents created in uploads/ directory")

def run_test():
    """Run the document processor test"""
    print("🧪 Creating test documents...")
    create_test_documents()
    
    print("\n🚀 Running document processor...")
    processor = DocumentProcessor()
    results = processor.process_all()
    
    print("\n📊 Test Results:")
    for filename, status in results.items():
        print(f"  {filename}: {status}")
    
    print("\n📁 Check the 'processed' directory for organized files!")

if __name__ == "__main__":
    run_test()