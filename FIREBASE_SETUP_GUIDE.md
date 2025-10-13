# Firebase Setup Guide for Digital Hermit Community Platform

This guide will help you set up Firebase for your Digital Hermit community platform.

## Prerequisites

- A Google account
- Basic understanding of web development
- Access to the Digital Hermit project files

## Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `digital-hermit-community` (or your preferred name)
4. Enable Google Analytics (recommended)
5. Choose or create a Google Analytics account
6. Click "Create project"

## Step 2: Enable Firebase Services

### Enable Firestore Database

1. In your Firebase project, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location close to your users
5. Click "Done"

### Enable Authentication (Optional for Phase 2)

1. Go to "Authentication" in the Firebase console
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password" provider
5. Optionally enable other providers (Google, GitHub, etc.)

### Enable Hosting (For Deployment)

1. Go to "Hosting" in the Firebase console
2. Click "Get started"
3. Follow the setup instructions

## Step 3: Get Firebase Configuration

1. In your Firebase project, click the gear icon (⚙️) next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon (`</>`) to add a web app
5. Enter app nickname: `Digital Hermit Web`
6. Check "Also set up Firebase Hosting" if you plan to deploy
7. Click "Register app"
8. Copy the Firebase configuration object

## Step 4: Update Firebase Configuration

1. Open `firebase-config.js` in your project
2. Replace the placeholder values with your actual Firebase config:

```javascript
const firebaseConfig = {
    apiKey: "your-actual-api-key",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-actual-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "your-actual-sender-id",
    appId: "your-actual-app-id"
};
```

## Step 5: Set Up Firestore Security Rules

1. Go to "Firestore Database" → "Rules" tab
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to signups collection
    match /signups/{document} {
      allow read, write: if true; // For development - restrict in production
    }
    
    // Allow read/write access to users collection (for future use)
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

**⚠️ Important**: These rules allow public read/write access for development. In production, implement proper authentication and authorization rules.

## Step 6: Test the Setup

1. Open `index.html` in your browser
2. Try submitting the signup form
3. Check the Firebase Console → Firestore Database to see if data is being saved
4. Open `admin-dashboard.html` to view the submitted signups

## Step 7: Set Up Email Notifications (Optional)

For email notifications, you have several options:

### Option A: Firebase Extensions
1. Go to Firebase Console → Extensions
2. Install "Trigger Email" extension
3. Configure email templates

### Option B: Cloud Functions
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Initialize functions: `firebase init functions`
3. Create a function to send emails using SendGrid, Mailgun, or similar

### Option C: External Service
- Use services like EmailJS, Formspree, or Netlify Forms
- Update the `sendSignupNotification` function in `firebase-config.js`

## Step 8: Deploy to Firebase Hosting

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize hosting: `firebase init hosting`
4. Select your project and set `public` as the public directory
5. Deploy: `firebase deploy`

## Production Considerations

### Security Rules
Update Firestore rules for production:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Signups - allow public write, admin read
    match /signups/{document} {
      allow write: if true;
      allow read: if request.auth != null; // Only authenticated users
    }
  }
}
```

### Environment Variables
Consider using environment variables for sensitive configuration:

```javascript
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    // ... other config
};
```

### Analytics
Firebase Analytics is automatically enabled. You can view analytics in the Firebase Console.

## Troubleshooting

### Common Issues

1. **"Firebase not initialized" error**
   - Check that Firebase SDK scripts are loaded before your custom scripts
   - Verify the Firebase configuration is correct

2. **"Permission denied" error**
   - Check Firestore security rules
   - Ensure the collection name matches your code

3. **Data not appearing in console**
   - Check browser console for errors
   - Verify the data structure matches your expectations
   - Check if you're looking in the correct project

### Debug Mode
Enable debug mode by adding this to your HTML:

```html
<script>
    // Enable Firebase debug mode
    firebase.firestore().settings({
        cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
    });
</script>
```

## Next Steps

1. **User Authentication**: Implement Firebase Auth for user login
2. **Profile Management**: Create user profile pages
3. **Community Features**: Build user matching and messaging
4. **Email Marketing**: Set up automated email campaigns
5. **Analytics**: Implement detailed user behavior tracking

## Support

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Community](https://firebase.google.com/community)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/firebase)

---

*Last updated: Current session*
*For questions or issues, check the troubleshooting section or refer to Firebase documentation.*
