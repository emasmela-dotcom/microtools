/**
 * Firebase Configuration for Digital Hermit Community Platform
 * This file contains the Firebase setup and initialization
 */

// Firebase configuration object
const firebaseConfig = {
    // Note: In production, these would be your actual Firebase project credentials
    // For now, we'll use placeholder values that you'll need to replace
    apiKey: "your-api-key-here",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id"
};

// Initialize Firebase
let app;
let db;
let auth;
let analytics;

try {
    // Check if Firebase is already initialized
    if (!firebase.apps.length) {
        app = firebase.initializeApp(firebaseConfig);
    } else {
        app = firebase.app();
    }
    
    // Initialize Firebase services
    db = firebase.firestore();
    auth = firebase.auth();
    analytics = firebase.analytics();
    
    console.log('Firebase initialized successfully');
} catch (error) {
    console.error('Firebase initialization error:', error);
    // Fallback to localStorage if Firebase fails
    console.log('Falling back to localStorage for data storage');
}

/**
 * Firebase Database Service
 * Handles all database operations for the Digital Hermit platform
 */
class FirebaseService {
    constructor() {
        this.db = db;
        this.isOnline = navigator.onLine;
        this.setupOfflineSupport();
    }

    /**
     * Setup offline support for the app
     */
    setupOfflineSupport() {
        // Enable offline persistence
        if (this.db) {
            this.db.enablePersistence()
                .then(() => {
                    console.log('Firebase offline persistence enabled');
                })
                .catch((err) => {
                    if (err.code === 'failed-precondition') {
                        console.log('Multiple tabs open, persistence can only be enabled in one tab at a time');
                    } else if (err.code === 'unimplemented') {
                        console.log('The current browser does not support offline persistence');
                    }
                });
        }

        // Listen for online/offline status
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('App is online');
            this.syncOfflineData();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('App is offline');
        });
    }

    /**
     * Save user signup to Firebase
     */
    async saveUserSignup(userData) {
        try {
            if (!this.db) {
                throw new Error('Firebase not initialized');
            }

            // Add timestamp and metadata
            const signupData = {
                ...userData,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                createdAt: new Date().toISOString(),
                ip: await this.getUserIP(),
                userAgent: navigator.userAgent,
                source: 'landing_page',
                status: 'pending'
            };

            // Save to Firestore
            const docRef = await this.db.collection('signups').add(signupData);
            
            console.log('User signup saved with ID:', docRef.id);
            
            // Track analytics event
            if (analytics) {
                analytics.logEvent('user_signup', {
                    user_id: docRef.id,
                    interests_count: userData.interests ? userData.interests.length : 0,
                    has_hobbies: !!userData.hobbies
                });
            }

            return {
                success: true,
                id: docRef.id,
                data: signupData
            };

        } catch (error) {
            console.error('Error saving user signup:', error);
            
            // Fallback to localStorage
            return this.saveToLocalStorage(userData);
        }
    }

    /**
     * Get user IP address (simplified version)
     */
    async getUserIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            console.warn('Could not get IP address:', error);
            return 'unknown';
        }
    }

    /**
     * Fallback to localStorage when Firebase is unavailable
     */
    saveToLocalStorage(userData) {
        try {
            const signupData = {
                ...userData,
                timestamp: new Date().toISOString(),
                id: 'local_' + Date.now(),
                source: 'landing_page_local',
                status: 'pending'
            };

            // Get existing submissions
            const existingSubmissions = JSON.parse(localStorage.getItem('digital_hermit_submissions') || '[]');
            existingSubmissions.unshift(signupData);

            // Save back to localStorage
            localStorage.setItem('digital_hermit_submissions', JSON.stringify(existingSubmissions));

            console.log('User signup saved to localStorage:', signupData.id);

            return {
                success: true,
                id: signupData.id,
                data: signupData,
                fallback: true
            };

        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get all signups (for admin dashboard)
     */
    async getAllSignups() {
        try {
            if (!this.db) {
                // Fallback to localStorage
                const localData = JSON.parse(localStorage.getItem('digital_hermit_submissions') || '[]');
                return {
                    success: true,
                    data: localData,
                    fallback: true
                };
            }

            const snapshot = await this.db.collection('signups')
                .orderBy('timestamp', 'desc')
                .get();

            const signups = [];
            snapshot.forEach(doc => {
                signups.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return {
                success: true,
                data: signups
            };

        } catch (error) {
            console.error('Error getting signups:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Update signup status
     */
    async updateSignupStatus(signupId, status) {
        try {
            if (!this.db) {
                // Update localStorage
                const submissions = JSON.parse(localStorage.getItem('digital_hermit_submissions') || '[]');
                const index = submissions.findIndex(s => s.id === signupId);
                if (index !== -1) {
                    submissions[index].status = status;
                    submissions[index].updatedAt = new Date().toISOString();
                    localStorage.setItem('digital_hermit_submissions', JSON.stringify(submissions));
                }
                return { success: true, fallback: true };
            }

            await this.db.collection('signups').doc(signupId).update({
                status: status,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            return { success: true };

        } catch (error) {
            console.error('Error updating signup status:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Sync offline data when coming back online
     */
    async syncOfflineData() {
        try {
            const localData = JSON.parse(localStorage.getItem('digital_hermit_submissions') || '[]');
            const pendingData = localData.filter(item => item.source === 'landing_page_local');

            for (const item of pendingData) {
                try {
                    await this.db.collection('signups').add({
                        ...item,
                        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                        synced: true
                    });
                    
                    // Remove from localStorage after successful sync
                    const updatedData = localData.filter(localItem => localItem.id !== item.id);
                    localStorage.setItem('digital_hermit_submissions', JSON.stringify(updatedData));
                    
                } catch (error) {
                    console.error('Error syncing item:', item.id, error);
                }
            }

            console.log('Offline data sync completed');

        } catch (error) {
            console.error('Error syncing offline data:', error);
        }
    }

    /**
     * Send email notification for new signup
     */
    async sendSignupNotification(signupData) {
        try {
            // This would typically call a Cloud Function or external service
            // For now, we'll simulate the notification
            console.log('Sending signup notification for:', signupData.email);
            
            // In a real implementation, you would:
            // 1. Call a Cloud Function
            // 2. Send to an email service like SendGrid
            // 3. Or use Firebase Extensions for email
            
            return {
                success: true,
                message: 'Notification sent successfully'
            };

        } catch (error) {
            console.error('Error sending notification:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// Initialize Firebase service
const firebaseService = new FirebaseService();

// Export for use in other files
window.firebaseService = firebaseService;
window.firebaseConfig = firebaseConfig;

console.log('Firebase service initialized');
