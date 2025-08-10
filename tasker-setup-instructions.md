# Tasker NFC Location Tracking Setup

This document explains how to set up Tasker to automatically post your pet's location when their NFC tag is scanned.

## Prerequisites

1. **Android Device** with NFC capability
2. **Tasker App** (paid app from Google Play Store)
3. **GitHub Repository** with MyPetID system deployed
4. **GitHub Personal Access Token** with repository write permissions

## Setup Instructions

### Step 1: Create GitHub Personal Access Token

1. Go to GitHub Settings > Developer settings > Personal access tokens
2. Generate new token (classic)
3. Select scopes: `repo` (Full control of private repositories)
4. Copy the token and save it securely

### Step 2: Create Tasker Profile

1. Open Tasker app
2. Create new **Profile**:
   - Name: "Pet NFC Location Tracker"
   - Event: **NFC Tag**
   - Tag ID: Enter your pet's NFC tag ID (e.g., `NFC-1751920776223`)

### Step 3: Create Tasker Task

1. Create new **Task** for the profile:
   - Name: "Post Pet Location"

2. Add the following **Actions**:

#### Action 1: Get Location
- **Action**: Location > Get Location
- **Source**: GPS
- **Timeout**: 30 seconds
- Store in variable: `%PET_LAT` (latitude), `%PET_LON` (longitude)

#### Action 2: Get Device Info
- **Action**: Variables > Variable Set
- **Name**: `%DEVICE_NAME`
- **To**: `%DEVID` (or custom device name like "Owner Phone")

#### Action 3: Create GitHub Issue
- **Action**: Net > HTTP Request
- **Method**: POST
- **URL**: `https://api.github.com/repos/YOUR_USERNAME/YOUR_REPO_NAME/issues`
- **Headers**: 
  ```
  Authorization: token YOUR_GITHUB_TOKEN
  Content-Type: application/json
  ```
- **Body**:
  ```json
  {
    "title": "Location Update",
    "body": "NFC Tag: YOUR_PET_NFC_TAG_ID\nLatitude: %PET_LAT\nLongitude: %PET_LON\nDevice: %DEVICE_NAME\nTimestamp: %TIMES"
  }
  ```

#### Action 4: Show Confirmation
- **Action**: Alert > Flash
- **Text**: "Pet location updated!"

### Step 4: Configure Variables

Replace these placeholders in your Tasker setup:

- `YOUR_USERNAME`: Your GitHub username
- `YOUR_REPO_NAME`: Your MyPetID repository name  
- `YOUR_GITHUB_TOKEN`: Your personal access token from Step 1
- `YOUR_PET_NFC_TAG_ID`: Your pet's NFC tag ID (e.g., `NFC-1751920776223`)

### Example Task Configuration

Here's a complete example for a pet with NFC tag `NFC-1751920776223`:

```
Profile: Pet NFC Location Tracker
Event: NFC Tag [NFC-1751920776223]

Task: Post Pet Location
A1: Get Location [Source: GPS, Timeout: 30s]
A2: Variable Set [Name: %DEVICE_NAME, To: Owner Phone]
A3: HTTP Request [
  Method: POST
  URL: https://api.github.com/repos/johndoe/mypetid/issues
  Headers: 
    Authorization: token ghp_xxxxxxxxxxxxxxxxxxxx
    Content-Type: application/json
  Body: {
    "title": "Location Update",
    "body": "NFC Tag: NFC-1751920776223\nLatitude: %PET_LAT\nLongitude: %PET_LON\nDevice: %DEVICE_NAME\nTimestamp: %TIMES"
  }
]
A4: Flash [Text: Pet location updated!]
```

## How It Works

1. **NFC Scan**: When someone scans your pet's NFC tag with your phone
2. **Location Capture**: Tasker gets current GPS coordinates
3. **GitHub Issue**: Creates issue with location data
4. **Workflow Trigger**: GitHub workflow processes the location
5. **Data Storage**: Location saved to JSON files and synced to MongoDB
6. **Map Display**: Location appears on pet's profile page

## Testing

1. Place NFC tag near your phone
2. Tasker should detect the tag and run the task
3. Check GitHub repository for new issue
4. Verify location appears in `data/locations.json`
5. View pet profile to see location on map

## Troubleshooting

- **No GPS Signal**: Ensure location services are enabled
- **GitHub API Error**: Check token permissions and repository access
- **Tasker Not Triggering**: Verify NFC tag ID matches exactly
- **Location Not Showing**: Check that coordinates are valid numbers

## Privacy & Security

- Location data is only shared when NFC tag is scanned
- GitHub token should be kept secure and private
- Consider using a dedicated device/phone for pet tracking
- Location data is automatically filtered to last 2 hours on public profiles

## Multiple Pets

To track multiple pets:
1. Create separate Tasker profiles for each NFC tag
2. Use different NFC tag IDs in each profile
3. Each pet's location will be tracked independently