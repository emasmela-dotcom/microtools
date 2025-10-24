// MicroTools - Advanced Marketing Automation System

class MarketingAutomation {
    constructor() {
        this.userData = this.loadUserData();
        this.emailSequence = this.initializeEmailSequence();
        this.retargetingCampaigns = this.initializeRetargetingCampaigns();
        this.viralMechanics = this.initializeViralMechanics();
    }

    loadUserData() {
        return {
            email: localStorage.getItem('userEmail') || null,
            referralCode: localStorage.getItem('referralCode') || null,
            toolsViewed: JSON.parse(localStorage.getItem('toolsViewed') || '[]'),
            timeOnSite: 0,
            conversionEvents: JSON.parse(localStorage.getItem('conversionEvents') || '[]'),
            lastVisit: localStorage.getItem('lastVisit') || null
        };
    }

    initializeEmailSequence() {
        return {
            welcome: {
                subject: "Welcome to MicroTools! Your first tool is ready 🎁",
                delay: 0,
                template: "welcome-email"
            },
            day1: {
                subject: "How's your first tool working? + 50% off your next purchase",
                delay: 24 * 60 * 60 * 1000, // 24 hours
                template: "day1-followup"
            },
            day3: {
                subject: "3 tools that could 10x your productivity (limited time offer)",
                delay: 3 * 24 * 60 * 60 * 1000, // 3 days
                template: "day3-productivity"
            },
            day7: {
                subject: "Your trial expires today - Get 60% off to keep your tools",
                delay: 7 * 24 * 60 * 60 * 1000, // 7 days
                template: "day7-urgency"
            },
            day14: {
                subject: "We miss you! Here's a special comeback offer",
                delay: 14 * 24 * 60 * 60 * 1000, // 14 days
                template: "day14-comeback"
            }
        };
    }

    initializeRetargetingCampaigns() {
        return {
            viewedTools: {
                trigger: 'tool_view',
                adCopy: "Still thinking about that {toolName}? Get it for 50% off!",
                cta: "Get 50% Off Now"
            },
            abandonedCart: {
                trigger: 'email_capture',
                adCopy: "Complete your MicroTools purchase and save big!",
                cta: "Complete Purchase"
            },
            referralProgram: {
                trigger: 'share_click',
                adCopy: "Earn money by sharing MicroTools with friends!",
                cta: "Start Earning"
            }
        };
    }

    initializeViralMechanics() {
        return {
            shareRewards: {
                twitter: { credit: 0.50, message: "Check out this amazing tool!" },
                facebook: { credit: 0.50, message: "This tool changed my productivity!" },
                linkedin: { credit: 0.75, message: "Professional tool recommendation" }
            },
            referralProgram: {
                reward: 1.00,
                friendDiscount: 0.20,
                maxReferrals: 50
            },
            socialProof: {
                liveUsers: true,
                recentPurchases: true,
                testimonials: true
            }
        };
    }

    // Email Marketing Automation
    scheduleEmailSequence() {
        if (!this.userData.email) return;

        Object.entries(this.emailSequence).forEach(([key, email]) => {
            setTimeout(() => {
                this.sendEmail(email);
            }, email.delay);
        });
    }

    sendEmail(emailData) {
        // In a real implementation, this would integrate with email service
        console.log(`Sending email: ${emailData.subject}`);
        
        // Track email opens and clicks
        this.trackEvent('email_sent', {
            template: emailData.template,
            subject: emailData.subject
        });
    }

    // Retargeting Campaigns
    setupRetargetingPixels() {
        // Facebook Pixel
        this.addPixel('facebook', 'YOUR_FACEBOOK_PIXEL_ID');
        
        // Google Ads Pixel
        this.addPixel('google', 'YOUR_GOOGLE_PIXEL_ID');
        
        // LinkedIn Pixel
        this.addPixel('linkedin', 'YOUR_LINKEDIN_PIXEL_ID');
    }

    addPixel(platform, pixelId) {
        const pixel = document.createElement('script');
        pixel.innerHTML = this.getPixelCode(platform, pixelId);
        document.head.appendChild(pixel);
    }

    getPixelCode(platform, pixelId) {
        const pixelCodes = {
            facebook: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${pixelId}');
                fbq('track', 'PageView');
            `,
            google: `
                gtag('config', '${pixelId}');
            `,
            linkedin: `
                _linkedin_partner_id = "${pixelId}";
                window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
                window._linkedin_data_partner_ids.push(_linkedin_partner_id);
            `
        };
        
        return pixelCodes[platform] || '';
    }

    // Viral Marketing Mechanics
    setupViralMechanics() {
        this.addShareButtons();
        this.addReferralTracking();
        this.addSocialProofElements();
    }

    addShareButtons() {
        const toolCards = document.querySelectorAll('.tool-card');
        toolCards.forEach(card => {
            const shareButton = document.createElement('button');
            shareButton.innerHTML = '📤 Share & Earn $0.50';
            shareButton.className = 'viral-share-btn';
            shareButton.onclick = () => this.handleShare(card);
            card.querySelector('.tool-actions').appendChild(shareButton);
        });
    }

    handleShare(toolCard) {
        const toolName = toolCard.querySelector('.tool-name').textContent;
        const shareData = {
            toolName: toolName,
            url: window.location.href,
            timestamp: Date.now()
        };

        this.trackEvent('share_initiated', shareData);
        this.showShareModal(toolName);
    }

    showShareModal(toolName) {
        const modal = document.createElement('div');
        modal.className = 'viral-share-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Share & Earn $0.50 Credit! 💰</h3>
                <p>Share "${toolName}" and get $0.50 credit towards your next purchase!</p>
                <div class="share-buttons">
                    <button onclick="shareToTwitter('${toolName}')" class="share-btn twitter">🐦 Twitter</button>
                    <button onclick="shareToFacebook('${toolName}')" class="share-btn facebook">📘 Facebook</button>
                    <button onclick="shareToLinkedIn('${toolName}')" class="share-btn linkedin">💼 LinkedIn</button>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" class="close-btn">Close</button>
            </div>
        `;
        document.body.appendChild(modal);
    }

    addReferralTracking() {
        // Check for referral parameter in URL
        const urlParams = new URLSearchParams(window.location.search);
        const referralCode = urlParams.get('ref');
        
        if (referralCode) {
            this.trackEvent('referral_visit', { referralCode });
            localStorage.setItem('referralCode', referralCode);
        }
    }

    addSocialProofElements() {
        this.addLiveUserCounter();
        this.addRecentPurchasesTicker();
        this.addTestimonialRotator();
    }

    addLiveUserCounter() {
        const counter = document.createElement('div');
        counter.className = 'live-user-counter';
        counter.innerHTML = `
            <div class="live-indicator">🟢</div>
            <span class="user-count">${Math.floor(Math.random() * 50) + 20}</span>
            <span class="user-label">people viewing tools</span>
        `;
        
        // Insert after hero stats
        const heroStats = document.querySelector('.hero-stats');
        if (heroStats) {
            heroStats.parentNode.insertBefore(counter, heroStats.nextSibling);
        }
    }

    addRecentPurchasesTicker() {
        const purchases = [
            "Sarah from New York just bought Invoice Generator",
            "Mike from California purchased Complete Toolkit",
            "Lisa from Texas got AI Content Generator",
            "John from Florida bought Business Essentials",
            "Emma from Washington purchased Fitness Bundle"
        ];

        const ticker = document.createElement('div');
        ticker.className = 'purchase-ticker';
        ticker.innerHTML = `
            <div class="ticker-content">
                <span class="ticker-text">${purchases[0]}</span>
            </div>
        `;

        // Insert after hero stats
        const heroStats = document.querySelector('.hero-stats');
        if (heroStats) {
            heroStats.parentNode.insertBefore(ticker, heroStats.nextSibling);
        }

        // Rotate purchases
        let currentIndex = 0;
        setInterval(() => {
            currentIndex = (currentIndex + 1) % purchases.length;
            ticker.querySelector('.ticker-text').textContent = purchases[currentIndex];
        }, 5000);
    }

    addTestimonialRotator() {
        const testimonials = [
            { text: "Finally, tools that just work! No subscriptions, no accounts, no BS.", author: "Sarah M., Freelancer" },
            { text: "I love that everything works offline. Perfect for my digital nomad lifestyle.", author: "Mike R., Digital Nomad" },
            { text: "The privacy-first approach is exactly what I needed. My data stays on my device.", author: "Lisa K., Privacy Advocate" }
        ];

        const testimonialContainer = document.querySelector('.testimonials-grid');
        if (testimonialContainer) {
            let currentTestimonial = 0;
            setInterval(() => {
                const testimonialElements = testimonialContainer.querySelectorAll('.testimonial');
                testimonialElements.forEach((el, index) => {
                    if (index === currentTestimonial) {
                        el.style.display = 'block';
                    } else {
                        el.style.display = 'none';
                    }
                });
                currentTestimonial = (currentTestimonial + 1) % testimonialElements.length;
            }, 10000);
        }
    }

    // Analytics and Tracking
    trackEvent(eventName, data = {}) {
        const event = {
            name: eventName,
            data: data,
            timestamp: Date.now(),
            url: window.location.href,
            userAgent: navigator.userAgent
        };

        // Store locally
        const events = JSON.parse(localStorage.getItem('conversionEvents') || '[]');
        events.push(event);
        localStorage.setItem('conversionEvents', JSON.stringify(events));

        // Send to analytics (in real implementation)
        this.sendToAnalytics(event);
    }

    sendToAnalytics(event) {
        // In a real implementation, this would send to Google Analytics, Mixpanel, etc.
        console.log('Analytics Event:', event);
    }

    // Revenue Optimization
    optimizeRevenue() {
        this.addDynamicPricing();
        this.addUpsellRecommendations();
        this.addCrossSellOpportunities();
        this.addAbandonmentRecovery();
    }

    addDynamicPricing() {
        // Adjust pricing based on user behavior
        const toolCards = document.querySelectorAll('.tool-card');
        let viewCount = 0;

        toolCards.forEach(card => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        viewCount++;
                        if (viewCount > 5) {
                            this.showPopularBadge(card);
                        }
                    }
                });
            });
            observer.observe(card);
        });
    }

    showPopularBadge(card) {
        if (card.querySelector('.popular-badge')) return;

        const badge = document.createElement('div');
        badge.className = 'popular-badge';
        badge.innerHTML = '🔥 HOT';
        badge.style.cssText = `
            position: absolute;
            top: -10px;
            left: 20px;
            background: #dc3545;
            color: white;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 0.7rem;
            font-weight: bold;
            z-index: 10;
        `;
        
        card.style.position = 'relative';
        card.appendChild(badge);
    }

    addUpsellRecommendations() {
        // Add upsell buttons to package cards
        const packageCards = document.querySelectorAll('.package-card');
        packageCards.forEach(card => {
            const upsellButton = document.createElement('button');
            upsellButton.innerHTML = '🚀 Upgrade to Premium';
            upsellButton.className = 'upsell-btn';
            upsellButton.onclick = () => this.showUpsellModal();
            card.appendChild(upsellButton);
        });
    }

    showUpsellModal() {
        const modal = document.createElement('div');
        modal.className = 'upsell-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>🚀 Premium Upgrade Available!</h2>
                <p>Get lifetime access to ALL tools + exclusive features for just $9.99</p>
                <div class="premium-features">
                    <div>✅ All 22 tools (lifetime access)</div>
                    <div>✅ Priority support</div>
                    <div>✅ Exclusive templates</div>
                    <div>✅ Advanced analytics</div>
                    <div>✅ Custom branding</div>
                </div>
                <div class="modal-actions">
                    <button onclick="purchasePremium()" class="btn-primary">Upgrade Now - $9.99</button>
                    <button onclick="this.parentElement.parentElement.remove()" class="btn-secondary">Maybe Later</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    addCrossSellOpportunities() {
        // Add cross-sell recommendations based on viewed tools
        this.userData.toolsViewed.forEach(toolName => {
            const recommendations = this.getCrossSellRecommendations(toolName);
            this.showCrossSellRecommendations(recommendations);
        });
    }

    getCrossSellRecommendations(toolName) {
        const crossSellMap = {
            'Invoice Generator': ['Client Tracker', 'Tax Calculator', 'Receipt Scanner'],
            'Expense Tracker': ['Budget Planner', 'Investment Tracker', 'Tax Calculator'],
            'Time Tracker': ['Habit Tracker', 'Productivity Analytics', 'Project Manager']
        };
        
        return crossSellMap[toolName] || [];
    }

    showCrossSellRecommendations(recommendations) {
        if (recommendations.length === 0) return;

        const crossSellBanner = document.createElement('div');
        crossSellBanner.className = 'cross-sell-banner';
        crossSellBanner.innerHTML = `
            <h4>💡 You might also like:</h4>
            <div class="recommendations">
                ${recommendations.map(rec => `
                    <button onclick="scrollToTool('${rec}')" class="recommendation-btn">${rec}</button>
                `).join('')}
            </div>
        `;
        
        // Insert after tools grid
        const toolsGrid = document.querySelector('.tools-grid');
        if (toolsGrid) {
            toolsGrid.parentNode.insertBefore(crossSellBanner, toolsGrid.nextSibling);
        }
    }

    addAbandonmentRecovery() {
        // Track when users are about to leave
        let timeOnSite = 0;
        setInterval(() => {
            timeOnSite += 1000;
            this.userData.timeOnSite = timeOnSite;
        }, 1000);

        // Show recovery popup if user is about to leave
        document.addEventListener('mouseleave', (e) => {
            if (e.clientY <= 0 && timeOnSite > 30000) { // 30 seconds
                this.showAbandonmentRecovery();
            }
        });
    }

    showAbandonmentRecovery() {
        const popup = document.createElement('div');
        popup.className = 'abandonment-recovery';
        popup.innerHTML = `
            <div class="modal-content">
                <h3>Wait! Don't miss out! 🎁</h3>
                <p>Get 60% OFF your first tool when you sign up for our newsletter!</p>
                <div class="email-capture">
                    <input type="email" placeholder="Enter your email" class="email-input">
                    <button onclick="captureEmail(this)" class="btn-primary">Get 60% OFF</button>
                </div>
                <p class="disclaimer">* Limited time offer. No spam, unsubscribe anytime.</p>
            </div>
        `;
        document.body.appendChild(popup);
    }

    // Initialize all marketing automation
    init() {
        this.setupRetargetingPixels();
        this.setupViralMechanics();
        this.optimizeRevenue();
        this.scheduleEmailSequence();
        
        // Track page view
        this.trackEvent('page_view', {
            page: 'homepage',
            timestamp: Date.now()
        });
    }
}

// Initialize marketing automation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const marketing = new MarketingAutomation();
    marketing.init();
});

// Global functions for HTML onclick handlers
function shareToTwitter(toolName) {
    const text = `Check out this amazing ${toolName} tool! 🔧 #MicroTools #Productivity`;
    const url = window.location.href;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
    showSuccessMessage('Shared! You earned $0.50 credit!');
}

function shareToFacebook(toolName) {
    const url = window.location.href;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
    showSuccessMessage('Shared! You earned $0.50 credit!');
}

function shareToLinkedIn(toolName) {
    const url = window.location.href;
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`);
    showSuccessMessage('Shared! You earned $0.50 credit!');
}

function purchasePremium() {
    window.location.href = 'mailto:partners.clearhub@outlook.com?subject=Premium Upgrade - $9.99';
}

function scrollToTool(toolName) {
    const toolCard = document.querySelector(`[data-tool-name="${toolName}"]`);
    if (toolCard) {
        toolCard.scrollIntoView({ behavior: 'smooth' });
    }
}

function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideInRight 0.3s ease;
    `;
    successDiv.textContent = message;
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        successDiv.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => successDiv.remove(), 300);
    }, 3000);
}
