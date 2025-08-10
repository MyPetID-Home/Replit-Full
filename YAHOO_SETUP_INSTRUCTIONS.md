# 📧 Yahoo Email Setup for MyPetID

## Simple 3-Step Setup

### Step 1: Yahoo Account Security
1. Log in to **MyPetID@yahoo.com**
2. Go to Account Info → Account Security
3. Enable **Two-step verification** (if not already enabled)

### Step 2: Generate App Password
1. Still in Account Security
2. Click **"Generate app password"**
3. Select **"Other"** and enter: `MyPetID GitHub Actions`
4. **Copy the 16-character password** (looks like: `abcd efgh ijkl mnop`)

### Step 3: Add to GitHub
1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Click **"New repository secret"**
4. Name: `YAHOO_APP_PASSWORD`
5. Value: **Paste the 16-character password**
6. Click **"Add secret"**

## ✅ That's It!

Your MyPetID system will now send beautiful verification emails from **MyPetID@yahoo.com** automatically!

## 📧 What Users Will Receive

Professional emails with:
- 🐾 MyPetID branding
- Large, easy-to-read verification code
- 30-minute expiration time
- Mobile-friendly design
- Patreon support link

## 🔧 Testing

1. Register a new user on your site
2. Check the user's email inbox
3. They should receive a verification email from MyPetID@yahoo.com
4. The 6-digit code should work on your verification page

## 🚨 Important Notes

- **Never share** the app password publicly
- **Keep it secure** in GitHub Secrets only
- **Only one secret needed**: `YAHOO_APP_PASSWORD`
- **Works immediately** after setup

Your email verification system is now ready for production!