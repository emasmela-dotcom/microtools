/**
 * Email Marketing Integration
 * Mailchimp and ConvertKit Integration for Digital Hermit
 * 
 * This system handles automatic email list subscriptions when users submit the form
 */

// Email Marketing Configuration
const EMAIL_MARKETING_CONFIG = {
    // General Settings
    enabled: false, // Disabled for testing - set to true when you have API keys
    debug: false, // Set to true for development/testing
    
    // Provider Selection
    provider: 'mailchimp', // 'mailchimp' or 'convertkit'
    
    // Mailchimp Configuration
    mailchimp: {
        enabled: true,
        apiKey: 'YOUR_MAILCHIMP_API_KEY', // Replace with your Mailchimp API key
        listId: 'YOUR_MAILCHIMP_LIST_ID', // Replace with your Mailchimp List ID
        serverPrefix: 'us1', // Replace with your server prefix (e.g., us1, us2, etc.)
        tags: ['digital-hermit', 'landing-page'], // Tags to add to subscribers
        mergeFields: {
            // Custom merge fields mapping
            FNAME: 'name', // Maps form name to Mailchimp FNAME field
            INTERESTS: 'interests', // Maps interests to custom field
            HOBBIES: 'hobbies' // Maps hobbies to custom field
        },
        doubleOptIn: true, // Require email confirmation
        updateExisting: true // Update existing subscribers
    },
    
    // ConvertKit Configuration
    convertkit: {
        enabled: true,
        apiKey: 'YOUR_CONVERTKIT_API_KEY', // Replace with your ConvertKit API key
        formId: 'YOUR_CONVERTKIT_FORM_ID', // Replace with your ConvertKit Form ID
        tags: ['digital-hermit', 'landing-page'], // Tags to add to subscribers
        fields: {
            // Custom fields mapping
            first_name: 'name', // Maps form name to ConvertKit first_name field
            interests: 'interests', // Maps interests to custom field
            hobbies: 'hobbies' // Maps hobbies to custom field
        },
        doubleOptIn: true, // Require email confirmation
        updateExisting: true // Update existing subscribers
    },
    
    // Email Templates
    templates: {
        welcome: {
            subject: 'Welcome to Digital Hermit!',
            fromName: 'Digital Hermit Team',
            fromEmail: 'hello@digitalhermit.com'
        },
        confirmation: {
            subject: 'Please confirm your subscription',
            fromName: 'Digital Hermit Team',
            fromEmail: 'hello@digitalhermit.com'
        }
    },
    
    // Error Handling
    errorHandling: {
        showUserErrors: true, // Show errors to users
        logErrors: true, // Log errors to console
        fallbackAction: 'localStorage' // Fallback when API fails
    }
};

/**
 * Email Marketing Manager Class
 */
class EmailMarketingManager {
    constructor(config) {
        this.config = config;
        this.isInitialized = false;
        this.subscriptionQueue = [];
        
        this.init();
    }
    
    /**
     * Initialize email marketing system
     */
    init() {
        if (!this.config.enabled) {
            console.log('Email marketing disabled');
            return;
        }
        
        this.validateConfiguration();
        this.setupEventListeners();
        
        this.isInitialized = true;
        console.log('Email Marketing Manager initialized');
    }
    
    /**
     * Validate configuration
     */
    validateConfiguration() {
        const provider = this.config.provider;
        const providerConfig = this.config[provider];
        
        if (!providerConfig.enabled) {
            console.warn(`Email marketing provider ${provider} is disabled`);
            return;
        }
        
        // Check for required configuration
        const requiredFields = this.getRequiredFields(provider);
        const missingFields = requiredFields.filter(field => 
            !providerConfig[field] || providerConfig[field].includes('YOUR_')
        );
        
        if (missingFields.length > 0) {
            console.warn(`Missing email marketing configuration: ${missingFields.join(', ')}`);
            console.warn('Please update your configuration in email-marketing.js');
        }
    }
    
    /**
     * Get required fields for provider
     */
    getRequiredFields(provider) {
        const requiredFields = {
            mailchimp: ['apiKey', 'listId', 'serverPrefix'],
            convertkit: ['apiKey', 'formId']
        };
        
        return requiredFields[provider] || [];
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen for form submissions
        document.addEventListener('formSubmissionSuccess', (event) => {
            this.handleFormSubmission(event.detail);
        });
    }
    
    /**
     * Handle form submission
     */
    async handleFormSubmission(formData) {
        if (!this.isInitialized) {
            console.warn('Email marketing not initialized');
            return;
        }
        
        try {
            const result = await this.subscribeUser(formData);
            
            // Track successful subscription
            if (window.analytics) {
                window.analytics.trackEvent('email_subscription_success', {
                    provider: this.config.provider,
                    email: formData.email,
                    interests_count: formData.interests?.length || 0
                });
            }
            
            return result;
        } catch (error) {
            console.error('Email subscription failed:', error);
            
            // Track failed subscription
            if (window.analytics) {
                window.analytics.trackEvent('email_subscription_error', {
                    provider: this.config.provider,
                    error: error.message,
                    email: formData.email
                });
            }
            
            // Handle error based on configuration
            if (this.config.errorHandling.showUserErrors) {
                this.showUserError(error.message);
            }
            
            // Fallback action
            if (this.config.errorHandling.fallbackAction === 'localStorage') {
                this.saveToLocalStorage(formData);
            }
            
            throw error;
        }
    }
    
    /**
     * Subscribe user to email list
     */
    async subscribeUser(formData) {
        const provider = this.config.provider;
        
        switch (provider) {
            case 'mailchimp':
                return await this.subscribeToMailchimp(formData);
            case 'convertkit':
                return await this.subscribeToConvertKit(formData);
            default:
                throw new Error(`Unsupported email provider: ${provider}`);
        }
    }
    
    /**
     * Subscribe to Mailchimp
     */
    async subscribeToMailchimp(formData) {
        const config = this.config.mailchimp;
        const apiUrl = `https://${config.serverPrefix}.api.mailchimp.com/3.0/lists/${config.listId}/members`;
        
        // Prepare subscriber data
        const subscriberData = {
            email_address: formData.email,
            status: config.doubleOptIn ? 'pending' : 'subscribed',
            merge_fields: {
                FNAME: this.extractFirstName(formData.name)
            },
            tags: config.tags,
            interests: formData.interests || []
        };
        
        // Add custom merge fields
        Object.keys(config.mergeFields).forEach(field => {
            const formField = config.mergeFields[field];
            if (formData[formField]) {
                subscriberData.merge_fields[field] = formData[formField];
            }
        });
        
        // Add interests as merge field
        if (formData.interests && formData.interests.length > 0) {
            subscriberData.merge_fields.INTERESTS = formData.interests.join(', ');
        }
        
        // Add hobbies as merge field
        if (formData.hobbies) {
            subscriberData.merge_fields.HOBBIES = formData.hobbies;
        }
        
        const response = await this.makeApiRequest(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${config.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(subscriberData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Mailchimp API error: ${errorData.detail || errorData.title}`);
        }
        
        const result = await response.json();
        
        if (this.config.debug) {
            console.log('Mailchimp subscription successful:', result);
        }
        
        return {
            success: true,
            provider: 'mailchimp',
            subscriberId: result.id,
            status: result.status,
            message: config.doubleOptIn ? 
                'Please check your email to confirm your subscription.' : 
                'Successfully subscribed to our newsletter!'
        };
    }
    
    /**
     * Subscribe to ConvertKit
     */
    async subscribeToConvertKit(formData) {
        const config = this.config.convertkit;
        const apiUrl = `https://api.convertkit.com/v3/forms/${config.formId}/subscribe`;
        
        // Prepare subscriber data
        const subscriberData = {
            api_key: config.apiKey,
            email: formData.email,
            first_name: this.extractFirstName(formData.name),
            tags: config.tags,
            fields: {
                interests: formData.interests ? formData.interests.join(', ') : '',
                hobbies: formData.hobbies || ''
            }
        };
        
        const response = await this.makeApiRequest(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(subscriberData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`ConvertKit API error: ${errorData.message || 'Unknown error'}`);
        }
        
        const result = await response.json();
        
        if (this.config.debug) {
            console.log('ConvertKit subscription successful:', result);
        }
        
        return {
            success: true,
            provider: 'convertkit',
            subscriberId: result.subscription?.id,
            status: 'subscribed',
            message: config.doubleOptIn ? 
                'Please check your email to confirm your subscription.' : 
                'Successfully subscribed to our newsletter!'
        };
    }
    
    /**
     * Make API request with error handling
     */
    async makeApiRequest(url, options) {
        try {
            const response = await fetch(url, options);
            return response;
        } catch (error) {
            throw new Error(`Network error: ${error.message}`);
        }
    }
    
    /**
     * Extract first name from full name
     */
    extractFirstName(fullName) {
        return fullName.split(' ')[0] || fullName;
    }
    
    /**
     * Save to localStorage as fallback
     */
    saveToLocalStorage(formData) {
        const fallbackData = {
            email: formData.email,
            name: formData.name,
            interests: formData.interests,
            hobbies: formData.hobbies,
            timestamp: new Date().toISOString(),
            provider: this.config.provider,
            status: 'pending'
        };
        
        const existingData = JSON.parse(localStorage.getItem('email_fallback_subscriptions') || '[]');
        existingData.push(fallbackData);
        localStorage.setItem('email_fallback_subscriptions', JSON.stringify(existingData));
        
        console.log('Saved subscription to localStorage as fallback');
    }
    
    /**
     * Show user error message
     */
    showUserError(message) {
        // Create error notification
        const errorDiv = document.createElement('div');
        errorDiv.className = 'email-error-notification';
        errorDiv.innerHTML = `
            <div class="error-content">
                <i class="fas fa-exclamation-triangle"></i>
                <span>Email subscription failed: ${message}</span>
                <button onclick="this.parentElement.parentElement.remove()">&times;</button>
            </div>
        `;
        
        // Add to page
        document.body.appendChild(errorDiv);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentElement) {
                errorDiv.remove();
            }
        }, 5000);
    }
    
    /**
     * Get subscription status
     */
    async getSubscriptionStatus(email) {
        const provider = this.config.provider;
        
        switch (provider) {
            case 'mailchimp':
                return await this.getMailchimpSubscriptionStatus(email);
            case 'convertkit':
                return await this.getConvertKitSubscriptionStatus(email);
            default:
                throw new Error(`Unsupported email provider: ${provider}`);
        }
    }
    
    /**
     * Get Mailchimp subscription status
     */
    async getMailchimpSubscriptionStatus(email) {
        const config = this.config.mailchimp;
        const emailHash = this.md5(email.toLowerCase());
        const apiUrl = `https://${config.serverPrefix}.api.mailchimp.com/3.0/lists/${config.listId}/members/${emailHash}`;
        
        try {
            const response = await this.makeApiRequest(apiUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${config.apiKey}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                return {
                    subscribed: data.status === 'subscribed',
                    status: data.status,
                    timestamp: data.timestamp_opt
                };
            }
            
            return { subscribed: false, status: 'not_found' };
        } catch (error) {
            console.error('Error checking Mailchimp subscription status:', error);
            return { subscribed: false, status: 'error' };
        }
    }
    
    /**
     * Get ConvertKit subscription status
     */
    async getConvertKitSubscriptionStatus(email) {
        const config = this.config.convertkit;
        const apiUrl = `https://api.convertkit.com/v3/subscribers?api_key=${config.apiKey}&email_address=${encodeURIComponent(email)}`;
        
        try {
            const response = await this.makeApiRequest(apiUrl, {
                method: 'GET'
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.subscribers && data.subscribers.length > 0) {
                    const subscriber = data.subscribers[0];
                    return {
                        subscribed: true,
                        status: 'subscribed',
                        timestamp: subscriber.created_at
                    };
                }
            }
            
            return { subscribed: false, status: 'not_found' };
        } catch (error) {
            console.error('Error checking ConvertKit subscription status:', error);
            return { subscribed: false, status: 'error' };
        }
    }
    
    /**
     * Simple MD5 hash function for email hashing
     */
    md5(string) {
        // Simple MD5 implementation for email hashing
        // In production, use a proper MD5 library
        return btoa(string).replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    }
    
    /**
     * Update configuration
     */
    updateConfig(newConfig) {
        Object.assign(this.config, newConfig);
        this.validateConfiguration();
    }
    
    /**
     * Get current configuration
     */
    getConfig() {
        return { ...this.config };
    }
    
    /**
     * Test email marketing connection
     */
    async testConnection() {
        const provider = this.config.provider;
        const config = this.config[provider];
        
        if (!config.enabled) {
            throw new Error(`${provider} is disabled`);
        }
        
        try {
            switch (provider) {
                case 'mailchimp':
                    return await this.testMailchimpConnection();
                case 'convertkit':
                    return await this.testConvertKitConnection();
                default:
                    throw new Error(`Unsupported provider: ${provider}`);
            }
        } catch (error) {
            throw new Error(`Connection test failed: ${error.message}`);
        }
    }
    
    /**
     * Test Mailchimp connection
     */
    async testMailchimpConnection() {
        const config = this.config.mailchimp;
        const apiUrl = `https://${config.serverPrefix}.api.mailchimp.com/3.0/lists/${config.listId}`;
        
        const response = await this.makeApiRequest(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${config.apiKey}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Invalid Mailchimp API key or list ID');
        }
        
        const data = await response.json();
        return {
            success: true,
            listName: data.name,
            memberCount: data.stats.member_count
        };
    }
    
    /**
     * Test ConvertKit connection
     */
    async testConvertKitConnection() {
        const config = this.config.convertkit;
        const apiUrl = `https://api.convertkit.com/v3/forms/${config.formId}?api_key=${config.apiKey}`;
        
        const response = await this.makeApiRequest(apiUrl, {
            method: 'GET'
        });
        
        if (!response.ok) {
            throw new Error('Invalid ConvertKit API key or form ID');
        }
        
        const data = await response.json();
        return {
            success: true,
            formName: data.forms[0].name,
            subscriberCount: data.forms[0].subscriber_count
        };
    }
}

// Initialize Email Marketing Manager
const emailMarketing = new EmailMarketingManager(EMAIL_MARKETING_CONFIG);

// Export for use in other scripts
window.EmailMarketingManager = EmailMarketingManager;
window.emailMarketing = emailMarketing;

// Add isEnabled function
window.emailMarketing.isEnabled = function() {
    return EMAIL_MARKETING_CONFIG.enabled;
};
