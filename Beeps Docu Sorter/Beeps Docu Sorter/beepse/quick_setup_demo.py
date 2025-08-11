#!/usr/bin/env python3
"""
Quick Demo Setup - Configure email credentials for demo
"""

def setup_demo_email():
    """Quick setup for demo email functionality"""
    
    print("🚀 Quick Demo Email Setup")
    print("=" * 40)
    print()
    
    print("Enter your Gmail credentials for the demo:")
    print("(You can use a test Gmail account)")
    print()
    
    admin_email = input("Admin email (where you'll receive notifications): ").strip()
    gmail_user = input("Gmail address (for sending emails): ").strip()
    gmail_password = input("Gmail App Password (16 characters): ").strip().replace(" ", "")
    
    # Update email_service.py
    with open('email_service.py', 'r') as f:
        content = f.read()
    
    # Replace the placeholder values
    content = content.replace(
        'self.admin_email = "your-demo-email@gmail.com"',
        f'self.admin_email = "{admin_email}"'
    )
    content = content.replace(
        'self.gmail_user = "your-demo-email@gmail.com"',
        f'self.gmail_user = "{gmail_user}"'
    )
    content = content.replace(
        'self.gmail_password = "your-app-password"',
        f'self.gmail_password = "{gmail_password}"'
    )
    
    with open('email_service.py', 'w') as f:
        f.write(content)
    
    print()
    print("✅ Email credentials configured!")
    print()
    print("🚀 To test the admin email functionality:")
    print("1. Run: python api_server.py")
    print("2. Open admin-dashboard.html in Live Server")
    print("3. Login as admin (admin@demo.com / admin123)")
    print("4. Click 'Send Email' button")
    print("5. Double-click 'Send Email' to test connection")
    print()
    print("📧 The admin can now send real emails!")

if __name__ == "__main__":
    setup_demo_email()