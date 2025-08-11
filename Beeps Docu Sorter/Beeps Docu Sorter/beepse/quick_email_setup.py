#!/usr/bin/env python3
"""
Quick Email Setup - No Interactive Input Required
Just update the credentials below and run this file
"""

def setup_email_credentials():
    """Update email_service.py with your Gmail credentials"""
    
    # 🔧 UPDATE THESE WITH YOUR DETAILS:
    ADMIN_EMAIL = "your-admin-email@gmail.com"      # Where you want notifications
    GMAIL_USER = "your-sending-gmail@gmail.com"     # Your Gmail address
    GMAIL_PASSWORD = "your-16-char-app-password"    # Your Gmail App Password
    
    print("🚀 Quick Gmail Setup")
    print("=" * 40)
    
    # Check if credentials are still default
    if (ADMIN_EMAIL == "your-admin-email@gmail.com" or 
        GMAIL_USER == "your-sending-gmail@gmail.com" or 
        GMAIL_PASSWORD == "your-16-char-app-password"):
        
        print("❌ Please update the credentials in this file first!")
        print()
        print("📝 Edit quick_email_setup.py and update:")
        print(f"   ADMIN_EMAIL = '{ADMIN_EMAIL}'")
        print(f"   GMAIL_USER = '{GMAIL_USER}'") 
        print(f"   GMAIL_PASSWORD = '{GMAIL_PASSWORD}'")
        print()
        print("🔑 Get Gmail App Password from:")
        print("   https://myaccount.google.com/apppasswords")
        return False
    
    # Read current email_service.py
    try:
        with open('email_service.py', 'r') as f:
            content = f.read()
        
        # Update credentials
        content = content.replace(
            'self.admin_email = "admin@example.com"',
            f'self.admin_email = "{ADMIN_EMAIL}"'
        )
        content = content.replace(
            'self.gmail_user = "sender@gmail.com"',
            f'self.gmail_user = "{GMAIL_USER}"'
        )
        content = content.replace(
            'self.gmail_password = "app-password-here"',
            f'self.gmail_password = "{GMAIL_PASSWORD}"'
        )
        
        # Write back
        with open('email_service.py', 'w') as f:
            f.write(content)
        
        print("✅ Email credentials updated successfully!")
        print()
        print(f"📧 Admin Email: {ADMIN_EMAIL}")
        print(f"📧 Gmail User: {GMAIL_USER}")
        print(f"🔑 Password: {'*' * len(GMAIL_PASSWORD)}")
        print()
        
        # Test the connection
        print("🧪 Testing email connection...")
        from email_service import EmailService
        
        email_service = EmailService()
        success = email_service.test_email_connection()
        
        if success:
            print("🎉 SUCCESS! Gmail integration is working!")
            print(f"✅ Check your inbox at {ADMIN_EMAIL}")
        else:
            print("❌ Test failed. Please check:")
            print("1. Gmail App Password is correct")
            print("2. 2-Factor Authentication is enabled")
            print("3. Internet connection is working")
        
        return success
        
    except Exception as e:
        print(f"❌ Setup failed: {e}")
        return False

if __name__ == "__main__":
    setup_email_credentials()