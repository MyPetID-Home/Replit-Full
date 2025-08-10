# Yahoo Email Setup for MyPetID Email Verification

## 🎯 MyPetID@yahoo.com Configuration

Your MyPetID system is configured to send emails from **MyPetID@yahoo.com**. Here's how to set it up:

## 📧 Yahoo Email Setup Steps

### 1. Yahoo Account Configuration
1. **Log in to Yahoo Mail** with the MyPetID@yahoo.com account
2. **Enable 2-Step Verification**:
   - Go to Account Security settings
   - Enable 2-Step Verification
   - Choose SMS or authenticator app
3. **Generate App Password**:
   - Still in Account Security
   - Click "Generate app password"
   - Choose "Other" and enter "MyPetID GitHub Actions"
   - Copy the 16-character password (save it securely!)

### 2. SMTP Settings
The system is pre-configured with these Yahoo SMTP settings:
```
Host: smtp.mail.yahoo.com
Port: 587
Security: TLS/STARTTLS
User: MyPetID@yahoo.com
Password: [App Password from step 1]
```

### 3. GitHub Secrets Configuration
You only need to add **one secret** to your GitHub repository:

1. Go to your GitHub repository
2. Settings > Secrets and variables > Actions
3. Click "New repository secret"
4. Add:
   - **Name**: `YAHOO_APP_PASSWORD`
   - **Value**: The 16-character app password from Yahoo

### 4. Test Email Configuration
The system will automatically send professional verification emails with:
- ✅ MyPetID branding and styling
- ✅ Gradient header with pet emoji
- ✅ Large, easy-to-read verification code
- ✅ Expiration time (30 minutes)
- ✅ Professional footer with Patreon link
- ✅ Mobile-responsive design

## 📋 Email Limits
- **Yahoo Free**: 500 emails/day
- **Perfect for MyPetID**: Handles thousands of users

## ✅ Required GitHub Secret

You only need **one secret** for email verification:

```
YAHOO_APP_PASSWORD=your-16-character-app-password
```

**That's it!** The system is pre-configured for Yahoo email.

## 🧪 Testing Email Setup

Create a test file to verify your SMTP works:

```javascript
// test-email.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-password'
  }
});

const mailOptions = {
  from: 'your-email@gmail.com',
  to: 'test@example.com',
  subject: 'MyPetID Test Email',
  text: 'This is a test email from MyPetID!'
};

transporter.sendMail(mailOptions)
  .then(() => console.log('Email sent successfully!'))
  .catch(error => console.error('Error:', error));
```

## 📧 Email Templates

The system uses HTML email templates for:
- **Welcome emails** with verification codes
- **Password reset** notifications
- **Pet found alerts**
- **Location updates**

All templates are responsive and work on mobile devices.

## 🔒 Security Notes

- Never commit SMTP credentials to your repository
- Use app passwords instead of regular passwords
- Enable 2FA on your email account
- Monitor email usage to avoid hitting limits

## 🚀 Quick Start Summary

1. **Enable 2-Step Verification** on MyPetID@yahoo.com
2. **Generate App Password** in Yahoo Account Security
3. **Add to GitHub Secrets**:
   ```
   YAHOO_APP_PASSWORD=your-16-character-app-password
   ```
4. **Test** by registering a new user - you should receive a beautiful verification email!

Your MyPetID system will now send professional verification emails automatically from MyPetID@yahoo.com!