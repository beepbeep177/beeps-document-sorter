#!/usr/bin/env python3
"""
Gmail Setup Helper for Document Processing System
Helps you configure Gmail integration step by step
"""

import os
from email_service import EmailService

def setup_gmail_credentials():
    """Interactive setup for Gmail credentials"""
    
    print("🚀 Gmail Integration Setup")
    print("=" * 50)
    print()
    
    print("📧 STEP 1: Gmail Account Setup")
    print("You'll need:")
    print("1. A Gmail account")
    print("2. 2-Factor Authentication enabled")
    print("3. An App Password (NOT your regular Gmail password)")
    print()
    
    print("🔐 STEP 2: Generate App Password")
    print("1. Go to: https://myaccount.google.com/security")
    print("2. Enable 2-Factor Authentication if not already enabled")
    print("3. Go to 'App passwords'")
    print("4. Select 'Mail' and generate password")
    print("5. Copy the 16-character password (like: abcd efgh ijkl mnop)")
    print()
    
    # Get user input
    print("📝 STEP 3: Enter Your Details")
    admin_email = input("Enter your admin email (where you want notifications): ").strip()
    gmail_user = input("Enter your Gmail address (for sending emails): ").strip()
    
    print()
    print("🔑 Enter your Gmail App Password (16 characters):")
    print("Format: abcd efgh ijkl mnop")
    gmail_password = input("App Password: ").strip().replace(" ", "")
    
    print()
    print("💾 STEP 4: Save Configuration")
    
    # Update email_service.py with credentials
    update_email_service_file(admin_email, gmail_user, gmail_password)
    
    print("✅ Configuration saved!")
    print()
    
    # Test the connection
    print("🧪 STEP 5: Test Email Connection")
    test_choice = input("Test email connection now? (y/n): ").strip().lower()
    
    if test_choice == 'y':
        print("Testing email connection...")
        email_service = EmailService()
        success = email_service.test_email_connection()
        
        if success:
            print()
            print("🎉 SUCCESS! Gmail integration is working!")
            print(f"✅ Check your inbox at {admin_email}")
            print("✅ Your document system can now send real emails!")
        else:
            print()
            print("❌ Test failed. Please check:")
            print("1. Gmail address is correct")
            print("2. App password is correct (16 characters)")
            print("3. 2-Factor Authentication is enabled")
            print("4. Internet connection is working")
    
    print()
    print("🚀 Setup Complete!")
    print("Your document processing system is now ready to send real Gmail notifications!")

def update_email_service_file(admin_email, gmail_user, gmail_password):
    """Update the email_service.py file with user credentials"""
    
    # Read the current file
    with open('email_service.py', 'r') as f:
        content = f.read()
    
    # Replace placeholder values
    content = content.replace(
        'self.admin_email = "your-admin-email@gmail.com"',
        f'self.admin_email = "{admin_email}"'
    )
    content = content.replace(
        'self.gmail_user = "your-gmail@gmail.com"',
        f'self.gmail_user = "{gmail_user}"'
    )
    content = content.replace(
        'self.gmail_password = "your-app-password"',
        f'self.gmail_password = "{gmail_password}"'
    )
    
    # Write back to file
    with open('email_service.py', 'w') as f:
        f.write(content)

def create_env_file(admin_email, gmail_user, gmail_password):
    """Create .env file for secure credential storage"""
    
    env_content = f"""# Gmail Configuration for Document Processing System
ADMIN_EMAIL={admin_email}
GMAIL_USER={gmail_user}
GMAIL_PASSWORD={gmail_password}
"""
    
    with open('.env', 'w') as f:
        f.write(env_content)
    
    print("📄 Created .env file for secure credential storage")

if __name__ == "__main__":
    try:
        setup_gmail_credentials()
    except KeyboardInterrupt:
        print("\n\n👋 Setup cancelled. Run again when ready!")
    except Exception as e:
        print(f"\n❌ Setup error: {e}")
        print("Please try again or check your inputs.")