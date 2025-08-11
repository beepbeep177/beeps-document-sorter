# 📧 Gmail Integration Setup Guide

## 🚀 Quick Setup (3 Steps)

### Step 1: Run Setup Script
```bash
python3 setup_gmail.py
```

### Step 2: Follow Interactive Setup
- Enter your admin email (where you want notifications)
- Enter your Gmail address (for sending emails)
- Enter your Gmail App Password

### Step 3: Test Integration
```bash
python3 test_email.py
```

---

## 🔐 How to Get Gmail App Password

### 1. Enable 2-Factor Authentication
- Go to: https://myaccount.google.com/security
- Turn on 2-Step Verification if not already enabled

### 2. Generate App Password
- Go to: https://myaccount.google.com/apppasswords
- Select "Mail" from dropdown
- Click "Generate"
- Copy the 16-character password (like: `abcd efgh ijkl mnop`)

### 3. Use App Password (NOT your regular Gmail password!)

---

## 📧 Email Notifications

### When Password-Protected PDF Detected:
**To Client:**
```
Subject: Document Resubmission Required - Password Protection Detected

Dear [Client Name],

Your document "[filename]" could not be processed because it is password-protected.

Please resubmit your document without password protection.

Thank you,
Document Processing System 💖
```

**To Admin (You):**
```
Subject: 🚨 Password-Protected Document Alert - [Client Name]

ADMIN ALERT: Password-Protected Document Detected

📄 DOCUMENT: [filename]
👤 CLIENT: [name] ([email])
⏰ TIME: [timestamp]

ACTION TAKEN:
✅ Document moved to review queue
✅ Email notification sent to client

Document Quality Team System 💖
```

### When Processing Complete:
**To Client:**
```
Subject: Document Processing Complete ✅

Dear [Client Name],

Great news! Your document has been processed successfully.

✅ STATUS: Processing complete
📄 ORIGINAL: [filename]
📋 PROCESSED AS: [new_filename]
📂 DOCUMENT TYPE: [RDL/RCS]

Document Processing System 💖
```

---

## 🧪 Testing

### Test Basic Connection:
```bash
python3 -c "from email_service import EmailService; EmailService().test_email_connection()"
```

### Test Full Integration:
```bash
python3 test_email.py
```

### Test with Real Document:
1. Upload password-protected PDF through client portal
2. Check your admin email for notification
3. Check client email for resubmission request

---

## 🔧 Troubleshooting

### "Authentication failed" Error:
- ✅ Check Gmail App Password (16 characters)
- ✅ Ensure 2-Factor Authentication is enabled
- ✅ Use App Password, NOT regular Gmail password

### "Connection refused" Error:
- ✅ Check internet connection
- ✅ Gmail SMTP might be blocked by firewall
- ✅ Try different network

### Emails not received:
- ✅ Check spam/junk folder
- ✅ Verify email addresses are correct
- ✅ Check Gmail sending limits (500 emails/day)

---

## 🔒 Security Notes

- **Never commit credentials to git**
- **Use environment variables in production**
- **App passwords are safer than regular passwords**
- **Rotate app passwords periodically**

---

## 🎯 Production Deployment

### Environment Variables:
```bash
export ADMIN_EMAIL="your-admin@gmail.com"
export GMAIL_USER="your-gmail@gmail.com"
export GMAIL_PASSWORD="your-app-password"
```

### Docker Environment:
```dockerfile
ENV ADMIN_EMAIL=your-admin@gmail.com
ENV GMAIL_USER=your-gmail@gmail.com
ENV GMAIL_PASSWORD=your-app-password
```

---

## 📊 Email Limits

- **Gmail Free**: 500 emails/day
- **Gmail Workspace**: 2000 emails/day
- **Rate Limit**: ~100 emails/hour

For high volume, consider:
- SendGrid
- AWS SES
- Mailgun

---

Made with 💖 for the Document Quality Team