# MyPetID - Smart Pet Identification System

A comprehensive smart pet identification system that combines NFC-enabled tags with digital profiles to help keep pets safe. The system uses GitHub Pages for hosting and GitHub Workflows for backend operations, with MongoDB as the primary database.

## 🏗️ Architecture

### Frontend (GitHub Pages)
- **Static HTML/CSS/JS** - Hosted on GitHub Pages
- **Client-side JavaScript** - Handles UI interactions and API calls
- **JSON Files** - Local data cache synchronized with MongoDB
- **No server required** - Completely static hosting

### Backend (GitHub Workflows)
- **Issue-based API** - GitHub Issues trigger workflows
- **MongoDB Database** - Primary data storage
- **Automated Sync** - Bi-directional sync between JSON files and MongoDB
- **Email Integration** - SMTP-based email verification
- **NFC Integration** - Location tracking via Tasker

## 🚀 Deployment Instructions

### 1. GitHub Repository Setup

1. Create a new GitHub repository
2. Copy these files to your repository:
   ```
   index.html
   app.js
   styles.css
   data/
   .github/workflows/
   push-to-mongo.js
   pull-from-mongo.js
   README.md
   ```

### 2. GitHub Pages Configuration

1. Go to repository Settings > Pages
2. Select "Deploy from a branch"
3. Choose "main" branch
4. Select "/ (root)" folder
5. Click "Save"

### 3. MongoDB Setup

1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Replace `<password>` in the connection string

### 4. GitHub Secrets Configuration

Go to repository Settings > Secrets and variables > Actions, and add:

```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/mypetid
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 5. Initial Data Setup

The system will automatically create the following MongoDB collections:
- `users` - User accounts and profiles
- `dogs` - Pet information and profiles  
- `locations` - GPS tracking data
- `devices` - Device information for tracking
- `email_verification` - Email verification codes
- `patreon_verification_queue` - Patreon verification queue
- `user_stats` - User statistics
- `pet_stats` - Pet statistics

## 🔄 Data Flow

### User Registration
1. User fills registration form on website
2. JavaScript creates GitHub Issue with user data
3. `user-registration.yml` workflow processes the issue
4. Data is saved to MongoDB and JSON files
5. Email verification is triggered

### Pet Management
1. User adds/edits pet information
2. JavaScript creates GitHub Issue with pet data
3. `pet-management.yml` workflow processes the issue
4. Data is saved to MongoDB and JSON files

### Location Tracking
1. NFC tag scan triggers location update
2. Tasker app creates GitHub Issue with location data
3. `location-tracking.yml` workflow processes the issue
4. Location data is saved to MongoDB and JSON files

### Data Synchronization
1. `mongodb-sync.yml` workflow runs every 6 hours
2. Pulls latest data from MongoDB to JSON files
3. Pushes any local changes to MongoDB
4. Commits updated JSON files to repository

## 🔧 API Endpoints (via GitHub Issues)

### User Registration
```
Title: Register User
Body: {"username": "john", "email": "john@example.com", "password": "hashed", ...}
```

### Pet Management
```
Title: Save Pet Data
Body: {"name": "Buddy", "nfcTagId": "abc123", "ownerId": "user123", ...}
```

### Location Updates
```
Title: Update Location
Body: {"nfcTagId": "abc123", "latitude": 40.7128, "longitude": -74.0060, ...}
```

### Email Verification
```
Title: Send Verification Email
Body: {"email": "user@example.com", "username": "john"}

Title: Verify Email Code
Body: {"username": "john", "code": "123456"}
```

## 📁 File Structure

```
/
├── index.html              # Main HTML file
├── app.js                  # Client-side JavaScript
├── styles.css              # Styling
├── data/                   # JSON data files (synced with MongoDB)
│   ├── users.json
│   ├── dogs.json
│   ├── locations.json
│   ├── devices.json
│   └── ...
├── .github/workflows/      # GitHub Actions workflows
│   ├── mongodb-sync.yml
│   ├── user-registration.yml
│   ├── pet-management.yml
│   ├── location-tracking.yml
│   └── email-verification.yml
├── push-to-mongo.js        # Push data to MongoDB
├── pull-from-mongo.js      # Pull data from MongoDB
└── README.md              # This file
```

## 🔑 Key Features

### ✅ NFC Pet Identification
- Each pet gets a unique NFC tag
- Scan tag to view pet profile instantly
- No app required - works with any smartphone

### ✅ User Management
- Secure user registration and login
- Email verification system
- Patreon integration for premium features
- Admin system for CAK3D user

### ✅ Pet Profiles
- Comprehensive pet information
- Photo galleries with multiple images
- Medical records and documents
- Personality traits and behavior notes
- Emergency contact information

### ✅ Location Tracking
- Real-time GPS tracking via NFC scans
- Historical location data
- Integration with Tasker for automation
- Google Maps integration

### ✅ Data Persistence
- MongoDB primary database
- JSON files for offline/local access
- Automatic bidirectional synchronization
- Backup and recovery capabilities

## 🌟 Premium Features (Patreon)

- **Supporter ($5/month)**: Multiple pet profiles, basic analytics
- **Guardian ($10/month)**: Advanced location tracking, priority support
- **Protector ($20/month)**: Custom branding, API access, unlimited pets

## 🔒 Security Features

- Password hashing with secure algorithms
- Session-based authentication
- Email verification required
- Secure MongoDB connections
- GitHub secrets for sensitive data

## 🛠️ Development

### Local Development
1. Open `index.html` in your browser
2. Edit `app.js` for functionality changes
3. Edit `styles.css` for styling changes
4. Test workflows using `test-workflows.js`

### Testing MongoDB Integration
```bash
node test-workflows.js
```

### Manual Data Sync
```bash
# Push local data to MongoDB
node push-to-mongo.js

# Pull data from MongoDB
node pull-from-mongo.js
```

## 🆘 Troubleshooting

### Common Issues

**MongoDB Connection Failed**
- Check MONGO_URI secret is set correctly
- Ensure MongoDB Atlas cluster is running
- Verify IP whitelist includes GitHub Actions IPs

**Email Verification Not Working**
- Check SMTP_* secrets are configured
- Verify Gmail app password is used (not regular password)
- Check spam folder for verification emails

**Workflow Not Triggering**
- Ensure issue title matches workflow trigger
- Check workflow file syntax
- Verify repository has Actions enabled

### Support

For technical support, create an issue in the repository or contact the MyPetID team through our Patreon page.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Patreon supporters for funding development
- NFC technology for pet identification
- GitHub Actions for serverless backend
- MongoDB Atlas for reliable data storage

---

**Ready to deploy?** Just copy these files to your GitHub repository, configure the secrets, and your MyPetID system will be live on GitHub Pages with full MongoDB integration!