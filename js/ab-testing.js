/**
 * A/B Testing Framework for Digital Hermit Landing Page
 * 
 * This system allows you to test different versions of headlines, CTAs, and other elements
 * to optimize conversion rates and user engagement.
 */

// A/B Testing Configuration
const AB_TEST_CONFIG = {
    // Test Configuration
    enabled: true,
    debug: false, // Set to true for development/testing
    
    // Test Variations
    tests: {
        // Headline Test
        headline: {
            enabled: true,
            name: 'Headline Test',
            description: 'Test different headline variations',
            variants: {
                control: {
                    name: 'Control',
                    tagline: 'Find Your Digital Sanctuary',
                    title: 'Digital Hermit',
                    subtitle: 'The anti-social social media platform. Connect only with people who share your specific interests. No noise, no algorithms, just meaningful connections based on mutual topics.'
                },
                variant_a: {
                    name: 'Variant A - Privacy Focus',
                    tagline: 'Your Privacy-First Social Network',
                    title: 'Digital Hermit',
                    subtitle: 'Connect with like-minded people without compromising your privacy. No data mining, no algorithms, just authentic conversations based on shared interests.'
                },
                variant_b: {
                    name: 'Variant B - Community Focus',
                    tagline: 'Find Your Tribe',
                    title: 'Digital Hermit',
                    subtitle: 'Join a community of thoughtful individuals who value meaningful connections over social media noise. Discover people who share your passions and interests.'
                },
                variant_c: {
                    name: 'Variant C - Anti-Social Focus',
                    tagline: 'The Anti-Social Social Network',
                    title: 'Digital Hermit',
                    subtitle: 'Finally, a social platform that respects your time and attention. No endless scrolling, no manipulation, just genuine connections with people who matter.'
                }
            }
        },
        
        // CTA Button Test
        cta_button: {
            enabled: true,
            name: 'CTA Button Test',
            description: 'Test different call-to-action button text',
            variants: {
                control: {
                    name: 'Control',
                    text: 'Find My Digital Tribe',
                    class: 'form-submit'
                },
                variant_a: {
                    name: 'Variant A - Action Focus',
                    text: 'Join the Community',
                    class: 'form-submit'
                },
                variant_b: {
                    name: 'Variant B - Benefit Focus',
                    text: 'Start Connecting',
                    class: 'form-submit'
                },
                variant_c: {
                    name: 'Variant C - Urgency Focus',
                    text: 'Get Started Now',
                    class: 'form-submit'
                }
            }
        },
        
        // Form Description Test
        form_description: {
            enabled: true,
            name: 'Form Description Test',
            description: 'Test different form descriptions',
            variants: {
                control: {
                    name: 'Control',
                    text: 'This is really just a site to willingly exchange harmless information in order to find what you may be interested in with like minded people! This could be called an anti-social social media platform.'
                },
                variant_a: {
                    name: 'Variant A - Simple',
                    text: 'Join thousands of people who have found their digital tribe. Connect with others who share your interests and values.'
                },
                variant_b: {
                    name: 'Variant B - Benefits',
                    text: 'Discover meaningful connections without the noise. Our platform matches you with people who share your passions and interests.'
                },
                variant_c: {
                    name: 'Variant C - Social Proof',
                    text: 'Over 1,000 Digital Hermits have already found their community. Join them in building authentic relationships based on shared interests.'
                }
            }
        },
        
        // Interest Categories Test
        interest_categories: {
            enabled: true,
            name: 'Interest Categories Test',
            description: 'Test different interest category layouts',
            variants: {
                control: {
                    name: 'Control',
                    layout: 'grid',
                    showCount: true,
                    categories: [
                        { icon: '🧘', name: 'Meditation' },
                        { icon: '📚', name: 'Books' },
                        { icon: '🎨', name: 'Art' },
                        { icon: '🌿', name: 'Nature' },
                        { icon: '🎵', name: 'Music' },
                        { icon: '💭', name: 'Philosophy' },
                        { icon: '💼', name: 'Profession' },
                        { icon: '🔬', name: 'Science' },
                        { icon: '🏛️', name: 'History' }
                    ]
                },
                variant_a: {
                    name: 'Variant A - Minimal',
                    layout: 'list',
                    showCount: false,
                    categories: [
                        { icon: '🧘', name: 'Meditation' },
                        { icon: '📚', name: 'Books' },
                        { icon: '🎨', name: 'Art' },
                        { icon: '🌿', name: 'Nature' },
                        { icon: '🎵', name: 'Music' },
                        { icon: '💭', name: 'Philosophy' }
                    ]
                },
                variant_b: {
                    name: 'Variant B - Expanded',
                    layout: 'grid',
                    showCount: true,
                    categories: [
                        { icon: '🧘', name: 'Meditation' },
                        { icon: '📚', name: 'Books' },
                        { icon: '🎨', name: 'Art' },
                        { icon: '🌿', name: 'Nature' },
                        { icon: '🎵', name: 'Music' },
                        { icon: '💭', name: 'Philosophy' },
                        { icon: '💼', name: 'Profession' },
                        { icon: '🔬', name: 'Science' },
                        { icon: '🏛️', name: 'History' },
                        { icon: '🎬', name: 'Films' },
                        { icon: '🏃', name: 'Fitness' },
                        { icon: '🍳', name: 'Cooking' }
                    ]
                }
            }
        }
    },
    
    // Test Settings
    settings: {
        // Traffic allocation (percentage of users who see each variant)
        trafficAllocation: {
            control: 25,    // 25% see control
            variant_a: 25,  // 25% see variant A
            variant_b: 25,  // 25% see variant B
            variant_c: 25   // 25% see variant C
        },
        
        // Test duration (in days)
        testDuration: 30,
        
        // Minimum sample size per variant
        minSampleSize: 100,
        
        // Statistical significance threshold
        significanceThreshold: 0.95,
        
        // Cookie settings
        cookieName: 'digital_hermit_ab_test',
        cookieExpiry: 30, // days
        
        // Analytics integration
        trackInAnalytics: true,
        analyticsEventPrefix: 'ab_test_'
    }
};

/**
 * A/B Testing Manager Class
 */
class ABTestingManager {
    constructor(config) {
        this.config = config;
        this.userVariants = {};
        this.testResults = {};
        this.isInitialized = false;
        
        this.init();
    }
    
    /**
     * Initialize A/B testing
     */
    init() {
        if (!this.config.enabled) {
            console.log('A/B Testing disabled');
            return;
        }
        
        this.loadUserVariants();
        this.assignVariants();
        this.applyVariants();
        this.trackTestAssignment();
        
        this.isInitialized = true;
        console.log('A/B Testing initialized', this.userVariants);
    }
    
    /**
     * Load user's assigned variants from cookie
     */
    loadUserVariants() {
        const cookieValue = this.getCookie(this.config.settings.cookieName);
        if (cookieValue) {
            try {
                this.userVariants = JSON.parse(cookieValue);
            } catch (e) {
                console.warn('Invalid A/B test cookie, reassigning variants');
                this.userVariants = {};
            }
        }
    }
    
    /**
     * Assign variants to user if not already assigned
     */
    assignVariants() {
        Object.keys(this.config.tests).forEach(testKey => {
            const test = this.config.tests[testKey];
            if (test.enabled && !this.userVariants[testKey]) {
                this.userVariants[testKey] = this.selectVariant(testKey);
            }
        });
        
        // Save variants to cookie
        this.setCookie(
            this.config.settings.cookieName,
            JSON.stringify(this.userVariants),
            this.config.settings.cookieExpiry
        );
    }
    
    /**
     * Select a variant based on traffic allocation
     */
    selectVariant(testKey) {
        const random = Math.random() * 100;
        const allocation = this.config.settings.trafficAllocation;
        
        if (random < allocation.control) {
            return 'control';
        } else if (random < allocation.control + allocation.variant_a) {
            return 'variant_a';
        } else if (random < allocation.control + allocation.variant_a + allocation.variant_b) {
            return 'variant_b';
        } else {
            return 'variant_c';
        }
    }
    
    /**
     * Apply assigned variants to the page
     */
    applyVariants() {
        Object.keys(this.userVariants).forEach(testKey => {
            const variant = this.userVariants[testKey];
            this.applyVariant(testKey, variant);
        });
    }
    
    /**
     * Apply a specific variant to the page
     */
    applyVariant(testKey, variantKey) {
        const test = this.config.tests[testKey];
        const variant = test.variants[variantKey];
        
        if (!variant) {
            console.warn(`Variant ${variantKey} not found for test ${testKey}`);
            return;
        }
        
        switch (testKey) {
            case 'headline':
                this.applyHeadlineVariant(variant);
                break;
            case 'cta_button':
                this.applyCTAButtonVariant(variant);
                break;
            case 'form_description':
                this.applyFormDescriptionVariant(variant);
                break;
            case 'interest_categories':
                this.applyInterestCategoriesVariant(variant);
                break;
        }
        
        // Add variant class to body for CSS targeting
        document.body.classList.add(`ab-test-${testKey}-${variantKey}`);
        
        if (this.config.debug) {
            console.log(`Applied ${testKey} variant: ${variantKey}`, variant);
        }
    }
    
    /**
     * Apply headline variant
     */
    applyHeadlineVariant(variant) {
        const taglineEl = document.querySelector('.hero-tagline');
        const titleEl = document.querySelector('.hero-title');
        const subtitleEl = document.querySelector('.hero-subtitle');
        
        if (taglineEl) taglineEl.textContent = variant.tagline;
        if (titleEl) titleEl.textContent = variant.title;
        if (subtitleEl) subtitleEl.textContent = variant.subtitle;
    }
    
    /**
     * Apply CTA button variant
     */
    applyCTAButtonVariant(variant) {
        const buttonEl = document.querySelector('.form-submit .btn-text');
        if (buttonEl) {
            buttonEl.textContent = variant.text;
        }
    }
    
    /**
     * Apply form description variant
     */
    applyFormDescriptionVariant(variant) {
        const descriptionEl = document.querySelector('.hero-description p:first-child');
        if (descriptionEl) {
            descriptionEl.textContent = variant.text;
        }
    }
    
    /**
     * Apply interest categories variant
     */
    applyInterestCategoriesVariant(variant) {
        const containerEl = document.querySelector('.categories-grid');
        if (!containerEl) return;
        
        // Clear existing categories
        containerEl.innerHTML = '';
        
        // Add new categories
        variant.categories.forEach(category => {
            const categoryEl = document.createElement('div');
            categoryEl.className = 'category-item';
            categoryEl.innerHTML = `
                <span class="category-icon">${category.icon}</span>
                <span class="category-name">${category.name}</span>
            `;
            containerEl.appendChild(categoryEl);
        });
        
        // Update layout class
        containerEl.className = `categories-grid categories-${variant.layout}`;
        
        // Show/hide count
        const ctaEl = document.querySelector('.categories-cta');
        if (ctaEl) {
            ctaEl.style.display = variant.showCount ? 'block' : 'none';
        }
    }
    
    /**
     * Track test assignment in analytics
     */
    trackTestAssignment() {
        if (!this.config.settings.trackInAnalytics || !window.analytics) {
            return;
        }
        
        Object.keys(this.userVariants).forEach(testKey => {
            const variant = this.userVariants[testKey];
            const test = this.config.tests[testKey];
            
            window.analytics.trackEvent('ab_test_assignment', {
                test_name: test.name,
                test_key: testKey,
                variant: variant,
                variant_name: test.variants[variant].name,
                assignment_timestamp: new Date().toISOString()
            });
        });
    }
    
    /**
     * Track conversion for A/B test
     */
    trackConversion(testKey, conversionType = 'form_submission') {
        if (!this.config.settings.trackInAnalytics || !window.analytics) {
            return;
        }
        
        const variant = this.userVariants[testKey];
        const test = this.config.tests[testKey];
        
        window.analytics.trackEvent('ab_test_conversion', {
            test_name: test.name,
            test_key: testKey,
            variant: variant,
            variant_name: test.variants[variant].name,
            conversion_type: conversionType,
            conversion_timestamp: new Date().toISOString()
        });
    }
    
    /**
     * Get current variant for a test
     */
    getVariant(testKey) {
        return this.userVariants[testKey] || 'control';
    }
    
    /**
     * Get all user variants
     */
    getAllVariants() {
        return { ...this.userVariants };
    }
    
    /**
     * Force a specific variant (for testing)
     */
    forceVariant(testKey, variantKey) {
        if (this.config.debug) {
            this.userVariants[testKey] = variantKey;
            this.applyVariant(testKey, variantKey);
            this.setCookie(
                this.config.settings.cookieName,
                JSON.stringify(this.userVariants),
                this.config.settings.cookieExpiry
            );
            console.log(`Forced ${testKey} to ${variantKey}`);
        }
    }
    
    /**
     * Cookie utility functions
     */
    setCookie(name, value, days) {
        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
    }
    
    getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }
    
    /**
     * Get test statistics
     */
    getTestStats() {
        // This would typically connect to your analytics system
        // For now, return mock data
        return {
            totalUsers: 1000,
            conversions: 150,
            conversionRate: 0.15,
            variants: {
                control: { users: 250, conversions: 35, rate: 0.14 },
                variant_a: { users: 250, conversions: 40, rate: 0.16 },
                variant_b: { users: 250, conversions: 38, rate: 0.152 },
                variant_c: { users: 250, conversions: 37, rate: 0.148 }
            }
        };
    }
}

// Initialize A/B Testing Manager
const abTesting = new ABTestingManager(AB_TEST_CONFIG);

// Export for use in other scripts
window.ABTestingManager = ABTestingManager;
window.abTesting = abTesting;
