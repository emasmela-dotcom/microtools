/**
 * Progressive Web App (PWA) Management
 * Handles installation, updates, offline functionality, and PWA features
 */

class PWAManager {
    constructor() {
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.isOnline = navigator.onLine;
        this.updateAvailable = false;
        
        this.init();
    }
    
    /**
     * Initialize PWA functionality
     */
    init() {
        this.registerServiceWorker();
        this.setupInstallPrompt();
        this.setupOnlineOfflineHandlers();
        this.setupUpdateHandlers();
        this.checkInstallationStatus();
        this.setupBackgroundSync();
        
        console.log('PWA Manager initialized');
    }
    
    /**
     * Register service worker
     */
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registered successfully:', registration);
                
                // Handle updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showUpdateNotification();
                        }
                    });
                });
                
                return registration;
            } catch (error) {
                console.error('Service Worker registration failed:', error);
            }
        } else {
            console.log('Service Worker not supported');
        }
    }
    
    /**
     * Setup install prompt
     */
    setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('PWA install prompt triggered');
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButton();
        });
        
        // Handle successful installation
        window.addEventListener('appinstalled', () => {
            console.log('PWA installed successfully');
            this.isInstalled = true;
            this.hideInstallButton();
            this.showInstallSuccessMessage();
        });
    }
    
    /**
     * Setup online/offline handlers
     */
    setupOnlineOfflineHandlers() {
        window.addEventListener('online', () => {
            console.log('App is online');
            this.isOnline = true;
            this.hideOfflineIndicator();
            this.syncPendingData();
        });
        
        window.addEventListener('offline', () => {
            console.log('App is offline');
            this.isOnline = false;
            this.showOfflineIndicator();
        });
        
        // Initial check
        if (!this.isOnline) {
            this.showOfflineIndicator();
        }
    }
    
    /**
     * Setup update handlers
     */
    setupUpdateHandlers() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                console.log('Service Worker controller changed');
                window.location.reload();
            });
        }
    }
    
    /**
     * Check if app is installed
     */
    checkInstallationStatus() {
        // Check if running as PWA
        if (window.matchMedia('(display-mode: standalone)').matches || 
            window.navigator.standalone === true) {
            this.isInstalled = true;
            console.log('App is running as PWA');
        }
        
        // Check if installed via other means
        if (window.navigator.userAgent.includes('Mobile') && 
            !window.navigator.userAgent.includes('Safari')) {
            // Likely installed on mobile
            this.isInstalled = true;
        }
    }
    
    /**
     * Show install button
     */
    showInstallButton() {
        // Remove existing install button
        const existingButton = document.getElementById('pwa-install-button');
        if (existingButton) {
            existingButton.remove();
        }
        
        // Create install button
        const installButton = document.createElement('button');
        installButton.id = 'pwa-install-button';
        installButton.className = 'pwa-install-button';
        installButton.innerHTML = `
            <i class="fas fa-download"></i>
            <span>Install App</span>
        `;
        
        installButton.addEventListener('click', () => {
            this.installApp();
        });
        
        // Add to page
        document.body.appendChild(installButton);
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
            if (installButton.parentElement) {
                installButton.style.opacity = '0';
                setTimeout(() => {
                    if (installButton.parentElement) {
                        installButton.remove();
                    }
                }, 300);
            }
        }, 10000);
    }
    
    /**
     * Hide install button
     */
    hideInstallButton() {
        const installButton = document.getElementById('pwa-install-button');
        if (installButton) {
            installButton.style.opacity = '0';
            setTimeout(() => {
                if (installButton.parentElement) {
                    installButton.remove();
                }
            }, 300);
        }
    }
    
    /**
     * Install the app
     */
    async installApp() {
        if (!this.deferredPrompt) {
            console.log('Install prompt not available');
            return;
        }
        
        try {
            // Show the install prompt
            this.deferredPrompt.prompt();
            
            // Wait for the user to respond
            const { outcome } = await this.deferredPrompt.userChoice;
            
            console.log(`User response to install prompt: ${outcome}`);
            
            // Clear the deferred prompt
            this.deferredPrompt = null;
            
            if (outcome === 'accepted') {
                this.showInstallSuccessMessage();
            }
        } catch (error) {
            console.error('Error during app installation:', error);
        }
    }
    
    /**
     * Show install success message
     */
    showInstallSuccessMessage() {
        this.showNotification(
            'App Installed!',
            'Digital Hermit has been installed on your device. You can now access it from your home screen.',
            'success'
        );
    }
    
    /**
     * Show update notification
     */
    showUpdateNotification() {
        this.updateAvailable = true;
        
        const updateNotification = document.createElement('div');
        updateNotification.id = 'pwa-update-notification';
        updateNotification.className = 'pwa-update-notification';
        updateNotification.innerHTML = `
            <div class="update-content">
                <i class="fas fa-sync-alt"></i>
                <div class="update-text">
                    <strong>Update Available</strong>
                    <span>New version of Digital Hermit is ready</span>
                </div>
                <div class="update-actions">
                    <button class="update-btn" onclick="pwaManager.updateApp()">Update</button>
                    <button class="dismiss-btn" onclick="pwaManager.dismissUpdate()">Later</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(updateNotification);
        
        // Auto-dismiss after 30 seconds
        setTimeout(() => {
            if (updateNotification.parentElement) {
                updateNotification.remove();
            }
        }, 30000);
    }
    
    /**
     * Update the app
     */
    updateApp() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistration().then(registration => {
                if (registration && registration.waiting) {
                    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                }
            });
        }
        
        const updateNotification = document.getElementById('pwa-update-notification');
        if (updateNotification) {
            updateNotification.remove();
        }
    }
    
    /**
     * Dismiss update notification
     */
    dismissUpdate() {
        const updateNotification = document.getElementById('pwa-update-notification');
        if (updateNotification) {
            updateNotification.remove();
        }
    }
    
    /**
     * Show offline indicator
     */
    showOfflineIndicator() {
        // Remove existing indicator
        const existingIndicator = document.getElementById('pwa-offline-indicator');
        if (existingIndicator) {
            return;
        }
        
        const offlineIndicator = document.createElement('div');
        offlineIndicator.id = 'pwa-offline-indicator';
        offlineIndicator.className = 'pwa-offline-indicator';
        offlineIndicator.innerHTML = `
            <i class="fas fa-wifi"></i>
            <span>You're offline</span>
        `;
        
        document.body.appendChild(offlineIndicator);
    }
    
    /**
     * Hide offline indicator
     */
    hideOfflineIndicator() {
        const offlineIndicator = document.getElementById('pwa-offline-indicator');
        if (offlineIndicator) {
            offlineIndicator.style.opacity = '0';
            setTimeout(() => {
                if (offlineIndicator.parentElement) {
                    offlineIndicator.remove();
                }
            }, 300);
        }
    }
    
    /**
     * Show notification
     */
    showNotification(title, message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `pwa-notification pwa-notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <div class="notification-text">
                    <strong>${title}</strong>
                    <span>${message}</span>
                </div>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.opacity = '0';
                setTimeout(() => {
                    if (notification.parentElement) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 5000);
    }
    
    /**
     * Get notification icon based on type
     */
    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        
        return icons[type] || 'info-circle';
    }
    
    /**
     * Setup background sync
     */
    setupBackgroundSync() {
        if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
            // Register for background sync
            navigator.serviceWorker.ready.then(registration => {
                // This would be called when form submission fails
                // registration.sync.register('form-submission');
            });
        }
    }
    
    /**
     * Sync pending data when back online
     */
    async syncPendingData() {
        try {
            // Get pending form submissions from localStorage
            const pendingSubmissions = JSON.parse(localStorage.getItem('pending_form_submissions') || '[]');
            
            if (pendingSubmissions.length > 0) {
                this.showNotification(
                    'Syncing Data',
                    `Syncing ${pendingSubmissions.length} pending submissions...`,
                    'info'
                );
                
                // Process pending submissions
                for (const submission of pendingSubmissions) {
                    try {
                        // Try to submit the form again
                        await this.submitForm(submission);
                        
                        // Remove from pending
                        const updatedPending = pendingSubmissions.filter(s => s.id !== submission.id);
                        localStorage.setItem('pending_form_submissions', JSON.stringify(updatedPending));
                        
                    } catch (error) {
                        console.error('Failed to sync submission:', error);
                    }
                }
                
                this.showNotification(
                    'Sync Complete',
                    'All pending data has been synced successfully',
                    'success'
                );
            }
        } catch (error) {
            console.error('Error syncing pending data:', error);
        }
    }
    
    /**
     * Submit form (with offline handling)
     */
    async submitForm(formData) {
        if (!this.isOnline) {
            // Store for later sync
            const pendingSubmissions = JSON.parse(localStorage.getItem('pending_form_submissions') || '[]');
            pendingSubmissions.push({
                ...formData,
                id: Date.now(),
                timestamp: new Date().toISOString()
            });
            localStorage.setItem('pending_form_submissions', JSON.stringify(pendingSubmissions));
            
            this.showNotification(
                'Saved Offline',
                'Your submission has been saved and will be sent when you\'re back online',
                'info'
            );
            
            return;
        }
        
        // Submit normally when online
        // This would integrate with your existing form submission logic
        return formData;
    }
    
    /**
     * Get PWA status
     */
    getStatus() {
        return {
            isInstalled: this.isInstalled,
            isOnline: this.isOnline,
            updateAvailable: this.updateAvailable,
            serviceWorkerSupported: 'serviceWorker' in navigator,
            installPromptAvailable: !!this.deferredPrompt
        };
    }
    
    /**
     * Request notification permission
     */
    async requestNotificationPermission() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }
        return false;
    }
    
    /**
     * Show notification (if permission granted)
     */
    async showPushNotification(title, options = {}) {
        if ('Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification(title, {
                icon: '/icons/icon-192x192.png',
                badge: '/icons/icon-72x72.png',
                ...options
            });
            
            notification.onclick = () => {
                window.focus();
                notification.close();
            };
            
            return notification;
        }
    }
}

// Initialize PWA Manager
const pwaManager = new PWAManager();

// Export for global access
window.PWAManager = PWAManager;
window.pwaManager = pwaManager;
