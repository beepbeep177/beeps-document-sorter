#!/usr/bin/env python3
"""
Test Gmail Email Integration
Quick test script to verify email functionality
"""

from email_service import EmailService
import sys

def test_password_notification():
    """Test password-protected document notification"""
    
    email_service = EmailService()
    
    print("🧪 Testing Password-Protected Document Notification...")
    
    # Test data
    client_email = "test-client@example.com"  # Change this to your email for testing
    client_name = "Test Client"
    filename = "protected_document.pdf"
    
    success = email_service.send_password_protected_notification(
        client_email, client_name, filename
    )
    
    if success:
        print("✅ Password notification test successful!")
        print(f"📧 Emails sent to: {client_email} and admin")
    else:
        print("❌ Password notification test failed!")
    
    return success

def test_completion_notification():
    """Test document completion notification"""
    
    email_service = EmailService()
    
    print("🧪 Testing Document Completion Notification...")
    
    # Test data
    client_email = "test-client@example.com"  # Change this to your email for testing
    client_name = "Test Client"
    filename = "sample_document.pdf"
    processed_filename = "JOHN_SMITH_RDL.pdf"
    doc_type = "RDL"
    
    success = email_service.send_processing_complete_notification(
        client_email, client_name, filename, processed_filename, doc_type
    )
    
    if success:
        print("✅ Completion notification test successful!")
        print(f"📧 Email sent to: {client_email}")
    else:
        print("❌ Completion notification test failed!")
    
    return success

def main():
    """Run all email tests"""
    
    print("🚀 Gmail Email Service Test Suite")
    print("=" * 50)
    print()
    
    # Check if credentials are configured
    email_service = EmailService()
    
    if (email_service.gmail_user == "your-gmail@gmail.com" or 
        email_service.gmail_password == "your-app-password"):
        print("❌ Gmail credentials not configured!")
        print("Please run: python3 setup_gmail.py")
        sys.exit(1)
    
    print(f"📧 Gmail User: {email_service.gmail_user}")
    print(f"📧 Admin Email: {email_service.admin_email}")
    print()
    
    # Test 1: Basic connection
    print("TEST 1: Basic Email Connection")
    basic_test = email_service.test_email_connection()
    print()
    
    if not basic_test:
        print("❌ Basic email test failed. Check your credentials.")
        return
    
    # Test 2: Password notification
    print("TEST 2: Password-Protected Document Notification")
    password_test = test_password_notification()
    print()
    
    # Test 3: Completion notification
    print("TEST 3: Document Completion Notification")
    completion_test = test_completion_notification()
    print()
    
    # Summary
    print("📊 TEST SUMMARY")
    print("=" * 30)
    print(f"Basic Connection: {'✅ PASS' if basic_test else '❌ FAIL'}")
    print(f"Password Notification: {'✅ PASS' if password_test else '❌ FAIL'}")
    print(f"Completion Notification: {'✅ PASS' if completion_test else '❌ FAIL'}")
    print()
    
    if all([basic_test, password_test, completion_test]):
        print("🎉 ALL TESTS PASSED!")
        print("Your Gmail integration is working perfectly!")
        print("The document system is ready to send real email notifications!")
    else:
        print("⚠️ Some tests failed. Check your Gmail configuration.")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n👋 Tests cancelled.")
    except Exception as e:
        print(f"\n❌ Test error: {e}")
        print("Please check your Gmail configuration.")