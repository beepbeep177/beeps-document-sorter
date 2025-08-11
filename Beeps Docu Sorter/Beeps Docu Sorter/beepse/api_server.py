#!/usr/bin/env python3
"""
Simple Flask API to connect frontend to document processor
Run this to enable real document processing from web interface
"""

from flask import Flask, request, jsonify
import os
import tempfile
from document_processor import DocumentProcessor
from email_service import EmailService

app = Flask(__name__)

# Simple CORS headers
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

# Initialize services
processor = DocumentProcessor()
email_service = EmailService()

# Debug: Print email credentials being used
print(f"📧 API Server Email Config:")
print(f"   Gmail User: {email_service.gmail_user}")
print(f"   Admin Email: {email_service.admin_email}")
print(f"   Password Length: {len(email_service.gmail_password)}")
print()

@app.route('/api/process-document', methods=['POST'])
def process_document():
    """Process uploaded document with real email notifications"""
    
    try:
        # Get file and client info from request
        file = request.files['document']
        client_email = request.form.get('clientEmail')
        client_name = request.form.get('clientName')
        
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
            file.save(temp_file.name)
            
            # Process with real email notifications
            result = processor.process_file(
                temp_file.name, 
                client_email=client_email, 
                client_name=client_name
            )
            
            # Clean up temp file
            os.unlink(temp_file.name)
            
            return jsonify({
                'success': True,
                'result': result,
                'message': 'Document processed successfully'
            })
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Document processing failed'
        }), 500

@app.route('/api/test-email', methods=['POST'])
def test_email():
    """Test email functionality"""
    
    try:
        success = email_service.test_email_connection()
        return jsonify({
            'success': success,
            'message': 'Email test completed'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/send-email', methods=['POST'])
def send_email():
    """Send custom email from admin dashboard"""
    
    try:
        data = request.get_json()
        recipient = data.get('recipient')
        subject = data.get('subject')
        message = data.get('message')
        
        if not all([recipient, subject, message]):
            return jsonify({
                'success': False,
                'error': 'Missing required fields'
            }), 400
        
        # Create fresh EmailService instance to avoid caching issues
        fresh_email_service = EmailService()
        print(f"🔍 Using credentials: {fresh_email_service.gmail_user} / {len(fresh_email_service.gmail_password)} chars")
        
        success = fresh_email_service.send_email(recipient, subject, message)
        
        return jsonify({
            'success': success,
            'message': 'Email sent successfully' if success else 'Failed to send email'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    print("🚀 Starting Document Processing API...")
    print("📧 Make sure Gmail is configured (run setup_gmail.py)")
    print("🌐 API will run on: http://localhost:5000")
    print("🎨 Frontend should run on Live Server")
    print()
    
    app.run(debug=True, port=5000)