/**
 * Social Proof Manager
 * Handles dynamic user count, live activity feed, and social proof interactions
 */

class SocialProofManager {
    constructor() {
        this.userCount = 2847;
        this.activityItems = [];
        this.isInitialized = false;
        
        this.init();
    }
    
    /**
     * Initialize social proof features
     */
    init() {
        this.setupUserCountAnimation();
        this.setupLiveActivityFeed();
        this.setupTestimonialInteractions();
        this.setupTrustIndicators();
        this.startPeriodicUpdates();
        
        this.isInitialized = true;
        console.log('Social Proof Manager initialized');
    }
    
    /**
     * Setup animated user count
     */
    setupUserCountAnimation() {
        const userCountElement = document.getElementById('userCount');
        if (!userCountElement) return;
        
        // Animate count on page load
        this.animateUserCount(userCountElement, 0, this.userCount, 2000);
        
        // Update count periodically
        setInterval(() => {
            this.incrementUserCount();
        }, 30000); // Update every 30 seconds
    }
    
    /**
     * Animate user count from start to end
     */
    animateUserCount(element, start, end, duration) {
        const startTime = performance.now();
        const startValue = parseInt(element.textContent) || start;
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = Math.round(startValue + (end - startValue) * easeOutQuart);
            
            element.textContent = this.formatNumber(currentValue);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.classList.add('animating');
                setTimeout(() => {
                    element.classList.remove('animating');
                }, 1000);
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    /**
     * Increment user count with animation
     */
    incrementUserCount() {
        const userCountElement = document.getElementById('userCount');
        if (!userCountElement) return;
        
        const currentCount = parseInt(userCountElement.textContent.replace(/,/g, ''));
        const increment = Math.floor(Math.random() * 3) + 1; // 1-3 new users
        const newCount = currentCount + increment;
        
        this.userCount = newCount;
        this.animateUserCount(userCountElement, currentCount, newCount, 1000);
        
        // Track user count update
        if (window.analytics) {
            window.analytics.trackEvent('user_count_updated', {
                new_count: newCount,
                increment: increment,
                timestamp: new Date().toISOString()
            });
        }
    }
    
    /**
     * Format number with commas
     */
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    
    /**
     * Setup live activity feed
     */
    setupLiveActivityFeed() {
        this.activityItems = [
            {
                icon: '👋',
                text: 'Sarah from Seattle joined the Philosophy community',
                time: '2 minutes ago'
            },
            {
                icon: '🤝',
                text: 'Mike and Lisa connected over their love of hiking',
                time: '5 minutes ago'
            },
            {
                icon: '📚',
                text: 'Emma shared a book recommendation in the Books community',
                time: '8 minutes ago'
            },
            {
                icon: '🎨',
                text: 'David posted his latest artwork in the Art community',
                time: '12 minutes ago'
            },
            {
                icon: '🧘',
                text: 'Maria started a meditation group in the Wellness community',
                time: '15 minutes ago'
            },
            {
                icon: '🎵',
                text: 'Alex shared a playlist in the Music community',
                time: '18 minutes ago'
            },
            {
                icon: '🌿',
                text: 'Tom organized a nature walk in the Outdoor community',
                time: '22 minutes ago'
            },
            {
                icon: '💭',
                text: 'Sophie started a discussion about Stoicism',
                time: '25 minutes ago'
            }
        ];
        
        this.updateActivityFeed();
        
        // Update activity feed every 30 seconds
        setInterval(() => {
            this.updateActivityFeed();
        }, 30000);
    }
    
    /**
     * Update activity feed with new items
     */
    updateActivityFeed() {
        const activityFeed = document.getElementById('activityFeed');
        if (!activityFeed) return;
        
        // Get random activity items
        const shuffled = [...this.activityItems].sort(() => 0.5 - Math.random());
        const selectedItems = shuffled.slice(0, 3);
        
        // Clear existing items
        activityFeed.innerHTML = '';
        
        // Add new items with animation
        selectedItems.forEach((item, index) => {
            const activityElement = document.createElement('div');
            activityElement.className = 'activity-item';
            activityElement.style.opacity = '0';
            activityElement.style.transform = 'translateX(-20px)';
            
            activityElement.innerHTML = `
                <span class="activity-icon">${item.icon}</span>
                <span class="activity-text">${item.text}</span>
                <span class="activity-time">${item.time}</span>
            `;
            
            activityFeed.appendChild(activityElement);
            
            // Animate in
            setTimeout(() => {
                activityElement.style.transition = 'all 0.5s ease-out';
                activityElement.style.opacity = '1';
                activityElement.style.transform = 'translateX(0)';
            }, index * 200);
        });
    }
    
    /**
     * Setup testimonial interactions
     */
    setupTestimonialInteractions() {
        const testimonialCards = document.querySelectorAll('.testimonial-card');
        
        testimonialCards.forEach((card, index) => {
            // Add entrance animation
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.6s ease-out';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 500 + (index * 200));
            
            // Add hover effects
            card.addEventListener('mouseenter', () => {
                if (window.analytics) {
                    window.analytics.trackEvent('testimonial_hover', {
                        testimonial_index: index,
                        timestamp: new Date().toISOString()
                    });
                }
            });
        });
    }
    
    /**
     * Setup trust indicators
     */
    setupTrustIndicators() {
        const trustItems = document.querySelectorAll('.trust-item');
        
        trustItems.forEach((item, index) => {
            // Add entrance animation
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                item.style.transition = 'all 0.5s ease-out';
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, 1000 + (index * 100));
            
            // Add click tracking
            item.addEventListener('click', () => {
                const trustText = item.querySelector('.trust-text').textContent;
                
                if (window.analytics) {
                    window.analytics.trackEvent('trust_indicator_click', {
                        indicator: trustText,
                        timestamp: new Date().toISOString()
                    });
                }
            });
        });
    }
    
    /**
     * Start periodic updates
     */
    startPeriodicUpdates() {
        // Update user count every 30 seconds
        setInterval(() => {
            this.incrementUserCount();
        }, 30000);
        
        // Update activity feed every 30 seconds
        setInterval(() => {
            this.updateActivityFeed();
        }, 30000);
        
        // Add new testimonials periodically (simulate)
        setInterval(() => {
            this.addNewTestimonial();
        }, 120000); // Every 2 minutes
    }
    
    /**
     * Add new testimonial (simulation)
     */
    addNewTestimonial() {
        const testimonialsGrid = document.querySelector('.testimonials-grid');
        if (!testimonialsGrid) return;
        
        // This would typically add a new testimonial from your database
        // For now, we'll just track the event
        if (window.analytics) {
            window.analytics.trackEvent('new_testimonial_added', {
                timestamp: new Date().toISOString()
            });
        }
    }
    
    /**
     * Get current user count
     */
    getCurrentUserCount() {
        return this.userCount;
    }
    
    /**
     * Set user count (for testing)
     */
    setUserCount(count) {
        this.userCount = count;
        const userCountElement = document.getElementById('userCount');
        if (userCountElement) {
            userCountElement.textContent = this.formatNumber(count);
        }
    }
    
    /**
     * Add custom activity item
     */
    addActivityItem(icon, text, time = 'just now') {
        const activityFeed = document.getElementById('activityFeed');
        if (!activityFeed) return;
        
        const activityElement = document.createElement('div');
        activityElement.className = 'activity-item';
        activityElement.style.opacity = '0';
        activityElement.style.transform = 'translateX(-20px)';
        
        activityElement.innerHTML = `
            <span class="activity-icon">${icon}</span>
            <span class="activity-text">${text}</span>
            <span class="activity-time">${time}</span>
        `;
        
        // Insert at the top
        activityFeed.insertBefore(activityElement, activityFeed.firstChild);
        
        // Remove oldest item if more than 3
        const items = activityFeed.querySelectorAll('.activity-item');
        if (items.length > 3) {
            items[items.length - 1].remove();
        }
        
        // Animate in
        setTimeout(() => {
            activityElement.style.transition = 'all 0.5s ease-out';
            activityElement.style.opacity = '1';
            activityElement.style.transform = 'translateX(0)';
        }, 100);
    }
    
    /**
     * Track social proof interactions
     */
    trackSocialProofInteraction(type, data = {}) {
        if (window.analytics) {
            window.analytics.trackEvent('social_proof_interaction', {
                interaction_type: type,
                ...data,
                timestamp: new Date().toISOString()
            });
        }
    }
}

// Initialize Social Proof Manager
const socialProof = new SocialProofManager();

// Export for use in other scripts
window.SocialProofManager = SocialProofManager;
window.socialProof = socialProof;
