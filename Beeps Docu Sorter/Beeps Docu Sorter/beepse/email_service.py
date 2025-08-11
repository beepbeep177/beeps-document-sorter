#!/usr/bin/env python3
"""
Gmail Email Service for Document Processing System
Sends real emails via Gmail SMTP
"""

import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from pathlib import Path

class EmailService:
    def __init__(self):
        # Email configuration - UPDATE THESE WITH YOUR DETAILS
        self.smtp_server = "smtp.gmail.com"
        self.smtp_port = 587
        
        # ADMIN EMAIL (where you want to receive notifications)
        self.admin_email = "demohackaton10.com@gmail.com"  # UPDATE THIS
        
        # GMAIL CREDENTIALS (for sending emails)
        self.gmail_user = "demohackaton10.com@gmail.com"  # UPDATE THIS
        self.gmail_password = "xasz ibqw ccse vhdj"  # UPDATE THIS
        
        # Load from environment variables if available (more secure)
        self.admin_email = os.getenv('ADMIN_EMAIL', self.admin_email)
        self.gmail_user = os.getenv('GMAIL_USER', self.gmail_user)
        self.gmail_password = os.getenv('GMAIL_PASSWORD', self.gmail_password)
    
    def send_email(self, to_email, subject, message, is_html=False):
        """Send email via Gmail SMTP"""
        try:
            # Create message
            msg = MIMEMultipart()
            msg['From'] = self.gmail_user
            msg['To'] = to_email
            msg['Subject'] = subject
            
            # Add body
            msg.attach(MIMEText(message, 'html' if is_html else 'plain'))
            
            # Connect to Gmail SMTP
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()  # Enable encryption
            server.login(self.gmail_user, self.gmail_password)
            
            # Send email
            text = msg.as_string()
            server.sendmail(self.gmail_user, to_email, text)
            server.quit()
            
            print(f"✅ Email sent successfully to {to_email}")
            return True
            
        except Exception as e:
            print(f"❌ Failed to send email to {to_email}: {str(e)}")
            return False
    
    def send_password_protected_notification(self, client_email, client_name, filename):
        """Send notification about password-protected document"""
        
        # Email to CLIENT
        client_subject = "Document Resubmission Required - Password Protection Detected"
        client_message = f"""
Dear {client_name},

Your document "{filename}" could not be processed because it is password-protected.

🔒 ISSUE: Password-protected PDF detected
📄 DOCUMENT: {filename}
⏰ TIME: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

ACTION REQUIRED:
Please resubmit your document without password protection to continue processing.

If you need assistance, please contact our Document Quality Team.

Thank you,
Document Processing System 💖
        """
        
        # Email to ADMIN (you)
        admin_subject = f"🚨 Password-Protected Document Alert - {client_name}"
        admin_message = f"""
ADMIN ALERT: Password-Protected Document Detected

📄 DOCUMENT: {filename}
👤 CLIENT: {client_name} ({client_email})
⏰ TIME: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
🔒 ISSUE: Document is password-protected

ACTION TAKEN:
✅ Document moved to review queue
✅ Email notification sent to client
✅ Awaiting client resubmission

NEXT STEPS:
- Monitor for client resubmission
- Follow up if no response within 24 hours
- Contact client directly if needed

Document Quality Team System 💖
        """
        
        # Send both emails
        client_sent = self.send_email(client_email, client_subject, client_message)
        admin_sent = self.send_email(self.admin_email, admin_subject, admin_message)
        
        return client_sent and admin_sent
    
    def send_processing_error_notification(self, client_email, client_name, filename, error_details):
        """Send notification about processing errors"""
        
        # Email to CLIENT
        client_subject = "Document Processing Issue - Action Required"
        client_message = f"""
Dear {client_name},

We encountered an issue processing your document "{filename}".

❌ ISSUE: Processing error detected
📄 DOCUMENT: {filename}
⏰ TIME: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

ACTION REQUIRED:
Please resubmit your document or contact our support team for assistance.

Thank you,
Document Processing System 💖
        """
        
        # Email to ADMIN
        admin_subject = f"🔧 Processing Error Alert - {client_name}"
        admin_message = f"""
ADMIN ALERT: Document Processing Error

📄 DOCUMENT: {filename}
👤 CLIENT: {client_name} ({client_email})
⏰ TIME: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
❌ ERROR: {error_details}

ACTION TAKEN:
✅ Document moved to review queue
✅ Error notification sent to client
✅ Awaiting manual review

NEXT STEPS:
- Review document manually
- Contact client if needed
- Update processing rules if necessary

Document Quality Team System 💖
        """
        
        # Send both emails
        client_sent = self.send_email(client_email, client_subject, client_message)
        admin_sent = self.send_email(self.admin_email, admin_subject, admin_message)
        
        return client_sent and admin_sent
    
    def send_processing_complete_notification(self, client_email, client_name, filename, processed_filename, doc_type):
        """Send notification when document processing is complete"""
        
        client_subject = "Document Processing Complete ✅"
        client_message = f"""
Dear {client_name},

Great news! Your document has been processed successfully.

✅ STATUS: Processing complete
📄 ORIGINAL: {filename}
📋 PROCESSED AS: {processed_filename}
📂 DOCUMENT TYPE: {doc_type}
⏰ COMPLETED: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

Your document has been properly classified and filed in our system.

Thank you for using our document processing service!

Document Processing System 💖
        """
        
        return self.send_email(client_email, client_subject, client_message)
    
    def test_email_connection(self):
        """Test email connection and send test email"""
        test_subject = "📧 Email Service Test - Document Processing System"
        test_message = f"""
Email Service Test Successful! ✅

This is a test email to confirm your Gmail integration is working.

⏰ Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
📧 From: {self.gmail_user}
📧 To: {self.admin_email}

Your document processing system is ready to send real email notifications!

Document Processing System 💖
        """
        
        print("🧪 Testing email connection...")
        success = self.send_email(self.admin_email, test_subject, test_message)
        
        if success:
            print("✅ Email test successful! Check your inbox.")
        else:
            print("❌ Email test failed. Check your credentials.")
        
        return success

if __name__ == "__main__":
    # Test the email service
    email_service = EmailService()
    
    print("🚀 Testing Gmail Email Service...")
    print("📧 Make sure to update your credentials in the file!")
    print()
    
    # Run test
    email_service.test_email_connection()