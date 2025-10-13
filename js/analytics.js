/**
 * Analytics Tracking Configuration
 * Google Analytics 4 and Facebook Pixel Integration
 * 
 * Instructions:
 * 1. Replace 'GA_MEASUREMENT_ID' with your actual Google Analytics 4 Measurement ID
 * 2. Replace 'FACEBOOK_PIXEL_ID' with your actual Facebook Pixel ID
 * 3. Update the configuration object below with your tracking IDs
 */

// Analytics Configuration
const ANALYTICS_CONFIG = {
    // Google Analytics 4 Configuration
    googleAnalytics: {
        enabled: true,
        measurementId: 'GA_MEASUREMENT_ID', // Replace with your GA4 Measurement ID (e.g., 'G-XXXXXXXXXX')
        // Example: measurementId: 'G-ABC123DEF4',
        debug: false, // Set to true for development/testing
        customEvents: {
            formSubmission: 'form_submission',
            formValidationError: 'form_validation_error',
            interestSelection: 'interest_selection',
            pageView: 'page_view',
            scrollDepth: 'scroll_depth',
            timeOnPage: 'time_on_page'
        }
    },
    
    // Facebook Pixel Configuration
    facebookPixel: {
        enabled: true,
        pixelId: 'FACEBOOK_PIXEL_ID', // Replace with your Facebook Pixel ID (e.g., '123456789012345')
        // Example: pixelId: '123456789012345',
        events: {
            pageView: 'PageView',
            lead: 'Lead',
            completeRegistration: 'CompleteRegistration',
            viewContent: 'ViewContent'
        }
    },
    
    // General Analytics Settings
    settings: {
        trackFormInteractions: true,
        trackScrollDepth: true,
        trackTimeOnPage: true,
        trackInterestSelections: true,
        respectDoNotTrack: true, // Respect user's Do Not Track preference
        anonymizeIP: true // Anonymize IP addresses for privacy
    }
};

/**
 * Analytics Manager Class
 * Handles all analytics tracking functionality
 */
class AnalyticsManager {
    constructor(config) {
        this.config = config;
        this.startTime = Date.now();
        this.scrollDepth = 0;
        this.maxScrollDepth = 0;
        this.isInitialized = false;
        
        // Initialize analytics
        this.init();
    }
    
    /**
     * Initialize all analytics tracking
     */
    init() {
        if (this.shouldSkipTracking()) {
            console.log('Analytics tracking skipped (Do Not Track enabled)');
            return;
        }
        
        this.initGoogleAnalytics();
        this.initFacebookPixel();
        this.initEventTracking();
        
        this.isInitialized = true;
        console.log('Analytics tracking initialized');
    }
    
    /**
     * Check if tracking should be skipped
     */
    shouldSkipTracking() {
        if (this.config.settings.respectDoNotTrack) {
            return navigator.doNotTrack === '1' || 
                   navigator.doNotTrack === 'yes' || 
                   navigator.msDoNotTrack === '1';
        }
        return false;
    }
    
    /**
     * Initialize Google Analytics 4
     */
    initGoogleAnalytics() {
        if (!this.config.googleAnalytics.enabled) return;
        
        const { measurementId, debug } = this.config.googleAnalytics;
        
        // Skip if measurement ID is not configured
        if (measurementId === 'GA_MEASUREMENT_ID') {
            console.warn('Google Analytics: Please configure your Measurement ID');
            return;
        }
        
        // Load Google Analytics script
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
        document.head.appendChild(script);
        
        // Initialize gtag
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        window.gtag = gtag;
        
        gtag('js', new Date());
        gtag('config', measurementId, {
            anonymize_ip: this.config.settings.anonymizeIP,
            debug_mode: debug,
            send_page_view: true
        });
        
        // Track initial page view
        this.trackEvent('page_view', {
            page_title: document.title,
            page_location: window.location.href,
            page_path: window.location.pathname
        });
        
        console.log('Google Analytics 4 initialized');
    }
    
    /**
     * Initialize Facebook Pixel
     */
    initFacebookPixel() {
        if (!this.config.facebookPixel.enabled) return;
        
        const { pixelId } = this.config.facebookPixel;
        
        // Skip if pixel ID is not configured
        if (pixelId === 'FACEBOOK_PIXEL_ID') {
            console.warn('Facebook Pixel: Please configure your Pixel ID');
            return;
        }
        
        // Facebook Pixel code
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        
        fbq('init', pixelId);
        fbq('track', 'PageView');
        
        console.log('Facebook Pixel initialized');
    }
    
    /**
     * Initialize event tracking
     */
    initEventTracking() {
        if (this.config.settings.trackScrollDepth) {
            this.initScrollTracking();
        }
        
        if (this.config.settings.trackTimeOnPage) {
            this.initTimeTracking();
        }
        
        if (this.config.settings.trackFormInteractions) {
            this.initFormTracking();
        }
    }
    
    /**
     * Initialize scroll depth tracking
     */
    initScrollTracking() {
        let scrollTimeout;
        
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                const docHeight = document.documentElement.scrollHeight - window.innerHeight;
                const scrollPercent = Math.round((scrollTop / docHeight) * 100);
                
                if (scrollPercent > this.maxScrollDepth) {
                    this.maxScrollDepth = scrollPercent;
                    
                    // Track milestone scroll depths
                    if (scrollPercent >= 25 && this.scrollDepth < 25) {
                        this.trackEvent('scroll_depth', { depth: 25 });
                    } else if (scrollPercent >= 50 && this.scrollDepth < 50) {
                        this.trackEvent('scroll_depth', { depth: 50 });
                    } else if (scrollPercent >= 75 && this.scrollDepth < 75) {
                        this.trackEvent('scroll_depth', { depth: 75 });
                    } else if (scrollPercent >= 90 && this.scrollDepth < 90) {
                        this.trackEvent('scroll_depth', { depth: 90 });
                    }
                    
                    this.scrollDepth = scrollPercent;
                }
            }, 100);
        });
    }
    
    /**
     * Initialize time on page tracking
     */
    initTimeTracking() {
        // Track time on page when user leaves
        window.addEventListener('beforeunload', () => {
            const timeOnPage = Math.round((Date.now() - this.startTime) / 1000);
            this.trackEvent('time_on_page', { 
                time_seconds: timeOnPage,
                time_minutes: Math.round(timeOnPage / 60 * 100) / 100
            });
        });
        
        // Track time milestones
        setTimeout(() => {
            this.trackEvent('time_on_page', { milestone: '30_seconds' });
        }, 30000);
        
        setTimeout(() => {
            this.trackEvent('time_on_page', { milestone: '1_minute' });
        }, 60000);
        
        setTimeout(() => {
            this.trackEvent('time_on_page', { milestone: '2_minutes' });
        }, 120000);
    }
    
    /**
     * Initialize form interaction tracking
     */
    initFormTracking() {
        // Track form field interactions
        const form = document.getElementById('signupForm');
        if (!form) return;
        
        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                this.trackEvent('form_field_focus', {
                    field_name: input.name || input.id,
                    field_type: input.type
                });
            });
            
            input.addEventListener('blur', () => {
                this.trackEvent('form_field_blur', {
                    field_name: input.name || input.id,
                    field_type: input.type,
                    has_value: input.value.length > 0
                });
            });
        });
        
        // Track interest selections
        const interestCheckboxes = form.querySelectorAll('input[name="interests"]');
        interestCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                const selectedCount = form.querySelectorAll('input[name="interests"]:checked').length;
                this.trackEvent('interest_selection', {
                    interest: checkbox.value,
                    selected: checkbox.checked,
                    total_selected: selectedCount
                });
            });
        });
    }
    
    /**
     * Track custom events
     */
    trackEvent(eventName, parameters = {}) {
        if (!this.isInitialized) return;
        
        // Google Analytics 4
        if (this.config.googleAnalytics.enabled && window.gtag) {
            window.gtag('event', eventName, {
                ...parameters,
                event_category: 'engagement',
                event_label: parameters.interest || parameters.field_name || 'general'
            });
        }
        
        // Facebook Pixel
        if (this.config.facebookPixel.enabled && window.fbq) {
            // Map custom events to Facebook Pixel events
            const fbEvent = this.mapToFacebookEvent(eventName, parameters);
            if (fbEvent) {
                window.fbq('track', fbEvent.event, fbEvent.parameters);
            }
        }
        
        // Console log for debugging
        if (this.config.googleAnalytics.debug) {
            console.log('Analytics Event:', eventName, parameters);
        }
    }
    
    /**
     * Map custom events to Facebook Pixel events
     */
    mapToFacebookEvent(eventName, parameters) {
        const { events } = this.config.facebookPixel;
        
        switch (eventName) {
            case 'form_submission':
                return {
                    event: events.completeRegistration,
                    parameters: {
                        content_name: 'Digital Hermit Signup',
                        content_category: 'Lead Generation',
                        value: 1,
                        currency: 'USD'
                    }
                };
            case 'form_validation_error':
                return {
                    event: events.viewContent,
                    parameters: {
                        content_name: 'Form Validation Error',
                        content_category: 'Form Interaction'
                    }
                };
            case 'interest_selection':
                return {
                    event: events.viewContent,
                    parameters: {
                        content_name: `Interest: ${parameters.interest}`,
                        content_category: 'Interest Selection'
                    }
                };
            default:
                return null;
        }
    }
    
    /**
     * Track form submission
     */
    trackFormSubmission(formData) {
        this.trackEvent('form_submission', {
            form_name: 'signup_form',
            user_name: formData.name,
            user_email: formData.email,
            interests_count: formData.interests?.length || 0,
            has_additional_hobbies: formData.hobbies?.length > 0,
            submission_timestamp: new Date().toISOString()
        });
    }
    
    /**
     * Track form validation error
     */
    trackFormValidationError(fieldName, errorType) {
        this.trackEvent('form_validation_error', {
            field_name: fieldName,
            error_type: errorType,
            error_timestamp: new Date().toISOString()
        });
    }
    
    /**
     * Track button clicks
     */
    trackButtonClick(buttonName, location = 'unknown') {
        this.trackEvent('button_click', {
            button_name: buttonName,
            button_location: location,
            click_timestamp: new Date().toISOString()
        });
    }
    
    /**
     * Track external link clicks
     */
    trackExternalLink(url, linkText) {
        this.trackEvent('external_link_click', {
            link_url: url,
            link_text: linkText,
            click_timestamp: new Date().toISOString()
        });
    }
}

// Initialize Analytics Manager
const analytics = new AnalyticsManager(ANALYTICS_CONFIG);

// Export for use in other scripts
window.AnalyticsManager = AnalyticsManager;
window.analytics = analytics;
