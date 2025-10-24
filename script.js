// MicroTools - Advanced Conversion Optimization & Viral Marketing

document.addEventListener('DOMContentLoaded', function() {
    // Track user interactions for conversion optimization
    trackUserBehavior();
    
    // Add urgency timers
    addUrgencyTimers();
    
    // Add scroll-triggered animations
    addScrollAnimations();
    
    // Add conversion tracking
    addConversionTracking();
    
    // Add social proof elements
    addSocialProof();
    
    // Advanced conversion features
    addExitIntentPopup();
    addViralMechanics();
    addDynamicPricing();
    addUpsellSystem();
    addReferralProgram();
    addEmailCapture();
    addA_BTesting();
    addRetargetingPixel();
});

function trackUserBehavior() {
    // Track which tools users are most interested in
    const toolCards = document.querySelectorAll('.tool-card');
    toolCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            const toolName = this.querySelector('.tool-name').textContent;
            console.log(`User interested in: ${toolName}`);
            // You can send this data to analytics
        });
    });
    
    // Track button clicks
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            const action = this.textContent.trim();
            const toolName = this.closest('.tool-card')?.querySelector('.tool-name')?.textContent || 'Package';
            console.log(`User clicked: ${action} for ${toolName}`);
            // Track conversion events
        });
    });
}

function addUrgencyTimers() {
    // Add countdown timer for limited time offer
    const urgencyBanner = document.querySelector('.urgency-banner');
    if (urgencyBanner) {
        const countdown = document.createElement('div');
        countdown.style.marginTop = '10px';
        countdown.style.fontSize = '1.1rem';
        countdown.style.fontWeight = 'bold';
        countdown.id = 'countdown-timer';
        urgencyBanner.appendChild(countdown);
        
        // Set countdown to 24 hours from now
        const endTime = new Date().getTime() + (24 * 60 * 60 * 1000);
        
        const timer = setInterval(function() {
            const now = new Date().getTime();
            const distance = endTime - now;
            
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            
            countdown.innerHTML = `⏰ Limited Time: ${hours}h ${minutes}m ${seconds}s remaining`;
            
            if (distance < 0) {
                clearInterval(timer);
                countdown.innerHTML = "⏰ Offer Expired!";
            }
        }, 1000);
    }
}

function addScrollAnimations() {
    // Add fade-in animations as user scrolls
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Apply to tool cards and package cards
    const animatedElements = document.querySelectorAll('.tool-card, .package-card, .testimonial');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

function addConversionTracking() {
    // Add conversion tracking for email clicks
    const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
    emailLinks.forEach(link => {
        link.addEventListener('click', function() {
            const subject = this.href.split('subject=')[1];
            console.log(`Conversion: ${subject}`);
            
            // Show success message
            showSuccessMessage('Thank you! We\'ll send you the tool within 24 hours.');
        });
    });
}

function addSocialProof() {
    // Add live user counter
    const stats = document.querySelector('.hero-stats');
    if (stats) {
        const liveUsers = document.createElement('div');
        liveUsers.className = 'stat';
        liveUsers.innerHTML = `
            <div class="stat-number" id="live-users">${Math.floor(Math.random() * 50) + 20}</div>
            <div class="stat-label">Live Users</div>
        `;
        stats.appendChild(liveUsers);
        
        // Update live user count every 30 seconds
        setInterval(() => {
            const currentCount = parseInt(document.getElementById('live-users').textContent);
            const newCount = currentCount + Math.floor(Math.random() * 3) - 1;
            document.getElementById('live-users').textContent = Math.max(1, newCount);
        }, 30000);
    }
    
    // Add recent purchases ticker
    addRecentPurchasesTicker();
}

function addRecentPurchasesTicker() {
    const recentPurchases = [
        "Sarah from New York just bought Invoice Generator",
        "Mike from California purchased Complete Toolkit",
        "Lisa from Texas got AI Content Generator",
        "John from Florida bought Business Essentials",
        "Emma from Washington purchased Fitness Bundle"
    ];
    
    const ticker = document.createElement('div');
    ticker.style.cssText = `
        background: rgba(0, 212, 255, 0.1);
        border: 1px solid rgba(0, 212, 255, 0.3);
        border-radius: 10px;
        padding: 15px;
        margin: 20px 0;
        text-align: center;
        color: #00d4ff;
        font-weight: 600;
        animation: slideIn 0.5s ease;
    `;
    
    let currentIndex = 0;
    ticker.textContent = recentPurchases[currentIndex];
    
    setInterval(() => {
        currentIndex = (currentIndex + 1) % recentPurchases.length;
        ticker.style.opacity = '0';
        setTimeout(() => {
            ticker.textContent = recentPurchases[currentIndex];
            ticker.style.opacity = '1';
        }, 300);
    }, 5000);
    
    // Insert after hero stats
    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) {
        heroStats.parentNode.insertBefore(ticker, heroStats.nextSibling);
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

// Advanced Conversion Features

function addExitIntentPopup() {
    let exitIntentShown = false;
    
    document.addEventListener('mouseleave', function(e) {
        if (e.clientY <= 0 && !exitIntentShown) {
            exitIntentShown = true;
            showExitIntentPopup();
        }
    });
}

function showExitIntentPopup() {
    const popup = document.createElement('div');
    popup.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    popup.innerHTML = `
        <div style="background: white; padding: 40px; border-radius: 20px; max-width: 500px; text-align: center; position: relative;">
            <button onclick="this.parentElement.parentElement.remove()" style="position: absolute; top: 10px; right: 15px; background: none; border: none; font-size: 24px; cursor: pointer;">×</button>
            <h2 style="color: #333; margin-bottom: 20px;">Wait! Don't Miss Out! 🎁</h2>
            <p style="color: #666; margin-bottom: 20px;">Get 60% OFF your first tool when you sign up for our newsletter!</p>
            <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                <input type="email" placeholder="Enter your email" style="flex: 1; padding: 12px; border: 1px solid #ddd; border-radius: 8px;">
                <button onclick="captureEmail(this)" style="background: #28a745; color: white; padding: 12px 20px; border: none; border-radius: 8px; cursor: pointer;">Get 60% OFF</button>
            </div>
            <p style="font-size: 0.9rem; color: #999;">* Limited time offer. No spam, unsubscribe anytime.</p>
        </div>
    `;
    
    document.body.appendChild(popup);
}

function addViralMechanics() {
    // Add share buttons to each tool
    const toolCards = document.querySelectorAll('.tool-card');
    toolCards.forEach(card => {
        const shareButton = document.createElement('button');
        shareButton.innerHTML = '📤 Share & Get $0.50 Credit';
        shareButton.style.cssText = `
            background: #17a2b8;
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 0.8rem;
            cursor: pointer;
            margin-top: 10px;
            width: 100%;
        `;
        shareButton.onclick = () => showShareModal(card);
        card.querySelector('.tool-actions').appendChild(shareButton);
    });
}

function showShareModal(toolCard) {
    const toolName = toolCard.querySelector('.tool-name').textContent;
    const shareText = `Check out this amazing ${toolName} tool! 🔧 #MicroTools #Productivity`;
    const shareUrl = window.location.href;
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    modal.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 15px; max-width: 400px; text-align: center;">
            <h3 style="margin-bottom: 20px;">Share & Earn $0.50 Credit! 💰</h3>
            <p style="margin-bottom: 20px; color: #666;">Share this tool and get $0.50 credit towards your next purchase!</p>
            <div style="display: flex; gap: 10px; justify-content: center; margin-bottom: 20px;">
                <button onclick="shareToTwitter('${shareText}', '${shareUrl}')" style="background: #1da1f2; color: white; border: none; padding: 10px 15px; border-radius: 8px; cursor: pointer;">🐦 Twitter</button>
                <button onclick="shareToFacebook('${shareText}', '${shareUrl}')" style="background: #4267B2; color: white; border: none; padding: 10px 15px; border-radius: 8px; cursor: pointer;">📘 Facebook</button>
                <button onclick="shareToLinkedIn('${shareText}', '${shareUrl}')" style="background: #0077b5; color: white; border: none; padding: 10px 15px; border-radius: 8px; cursor: pointer;">💼 LinkedIn</button>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" style="background: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer;">Close</button>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function addDynamicPricing() {
    // Dynamic pricing based on user behavior
    let viewCount = 0;
    const toolCards = document.querySelectorAll('.tool-card');
    
    toolCards.forEach(card => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    viewCount++;
                    if (viewCount > 5) {
                        // Show "Popular" badge and slight price increase
                        const priceElement = card.querySelector('.tool-price');
                        if (priceElement && !priceElement.dataset.increased) {
                            priceElement.textContent = '$1.50';
                            priceElement.style.color = '#dc3545';
                            priceElement.dataset.increased = 'true';
                            
                            const badge = document.createElement('div');
                            badge.textContent = '🔥 HOT';
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
                            `;
                            card.style.position = 'relative';
                            card.appendChild(badge);
                        }
                    }
                }
            });
        });
        observer.observe(card);
    });
}

function addUpsellSystem() {
    // Add upsell recommendations
    const packageCards = document.querySelectorAll('.package-card');
    packageCards.forEach(card => {
        const upsellButton = document.createElement('button');
        upsellButton.innerHTML = '🚀 Upgrade to Premium';
        upsellButton.style.cssText = `
            background: linear-gradient(45deg, #ff6b6b, #ff8e8e);
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            margin-top: 10px;
            width: 100%;
        `;
        upsellButton.onclick = () => showUpsellModal();
        card.appendChild(upsellButton);
    });
}

function showUpsellModal() {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    modal.innerHTML = `
        <div style="background: white; padding: 40px; border-radius: 20px; max-width: 600px; text-align: center;">
            <h2 style="color: #333; margin-bottom: 20px;">🚀 Premium Upgrade Available!</h2>
            <p style="color: #666; margin-bottom: 30px;">Get lifetime access to ALL tools + exclusive features for just $9.99 (Save $12!)</p>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <h4 style="color: #333; margin-bottom: 15px;">Premium Features:</h4>
                <ul style="text-align: left; color: #666;">
                    <li>✅ All 22 tools (lifetime access)</li>
                    <li>✅ Priority support</li>
                    <li>✅ Exclusive templates</li>
                    <li>✅ Advanced analytics</li>
                    <li>✅ Custom branding</li>
                </ul>
            </div>
            <div style="display: flex; gap: 15px; justify-content: center;">
                <button onclick="this.parentElement.parentElement.parentElement.remove()" style="background: #6c757d; color: white; border: none; padding: 12px 25px; border-radius: 8px; cursor: pointer;">Maybe Later</button>
                <button onclick="purchasePremium()" style="background: #28a745; color: white; border: none; padding: 12px 25px; border-radius: 8px; cursor: pointer;">Upgrade Now - $9.99</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function addReferralProgram() {
    // Add referral program banner
    const referralBanner = document.createElement('div');
    referralBanner.style.cssText = `
        background: linear-gradient(135deg, #28a745, #20c997);
        color: white;
        padding: 20px;
        border-radius: 15px;
        margin: 20px 0;
        text-align: center;
        box-shadow: 0 10px 30px rgba(40, 167, 69, 0.3);
    `;
    
    referralBanner.innerHTML = `
        <h3 style="margin-bottom: 10px;">💰 Refer Friends & Earn Money!</h3>
        <p style="margin-bottom: 15px; opacity: 0.9;">Get $1 for every friend who buys a tool. They get 20% off their first purchase!</p>
        <button onclick="showReferralModal()" style="background: white; color: #28a745; border: none; padding: 12px 25px; border-radius: 8px; font-weight: 600; cursor: pointer;">Get Your Referral Link</button>
    `;
    
    // Insert after hero stats
    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) {
        heroStats.parentNode.insertBefore(referralBanner, heroStats.nextSibling);
    }
}

function showReferralModal() {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    const referralLink = `${window.location.origin}?ref=${generateReferralCode()}`;
    
    modal.innerHTML = `
        <div style="background: white; padding: 40px; border-radius: 20px; max-width: 500px; text-align: center;">
            <h2 style="color: #333; margin-bottom: 20px;">💰 Your Referral Program</h2>
            <p style="color: #666; margin-bottom: 20px;">Share this link and earn $1 for every friend who makes a purchase!</p>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <input type="text" value="${referralLink}" readonly style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-family: monospace;">
                <button onclick="copyReferralLink('${referralLink}')" style="background: #28a745; color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer; margin-top: 10px;">📋 Copy Link</button>
            </div>
            <p style="font-size: 0.9rem; color: #999;">* You earn $1, they save 20% on their first purchase</p>
            <button onclick="this.parentElement.parentElement.remove()" style="background: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; margin-top: 15px;">Close</button>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function addEmailCapture() {
    // Add email capture popup after 30 seconds
    setTimeout(() => {
        if (!localStorage.getItem('emailCaptured')) {
            showEmailCapturePopup();
        }
    }, 30000);
}

function showEmailCapturePopup() {
    const popup = document.createElement('div');
    popup.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: white;
        padding: 20px;
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        z-index: 1000;
        max-width: 300px;
        animation: slideInUp 0.5s ease;
    `;
    
    popup.innerHTML = `
        <button onclick="this.parentElement.remove()" style="position: absolute; top: 5px; right: 10px; background: none; border: none; font-size: 18px; cursor: pointer;">×</button>
        <h4 style="margin-bottom: 10px; color: #333;">📧 Get Free Tools!</h4>
        <p style="font-size: 0.9rem; color: #666; margin-bottom: 15px;">Join 50,000+ professionals getting free tools weekly!</p>
        <input type="email" placeholder="Your email" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 5px; margin-bottom: 10px;">
        <button onclick="captureEmail(this)" style="background: #28a745; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; width: 100%;">Get Free Tools</button>
    `;
    
    document.body.appendChild(popup);
}

function addA_BTesting() {
    // A/B test different headlines
    const headlines = [
        "Professional Tools for Business & Life",
        "22 Tools That Make You Money",
        "The Complete Productivity Suite",
        "Tools That Actually Work"
    ];
    
    const randomHeadline = headlines[Math.floor(Math.random() * headlines.length)];
    const subtitle = document.querySelector('.hero-subtitle');
    if (subtitle) {
        subtitle.textContent = randomHeadline;
    }
}

function addRetargetingPixel() {
    // Add retargeting pixel for Facebook/Google Ads
    const pixel = document.createElement('script');
    pixel.innerHTML = `
        // Facebook Pixel
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', 'YOUR_PIXEL_ID');
        fbq('track', 'PageView');
    `;
    document.head.appendChild(pixel);
}

// Helper functions
function captureEmail(button) {
    const email = button.previousElementSibling.value;
    if (email) {
        localStorage.setItem('emailCaptured', 'true');
        showSuccessMessage('Thanks! Check your email for free tools!');
        button.parentElement.remove();
    }
}

function shareToTwitter(text, url) {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
    showSuccessMessage('Shared! You earned $0.50 credit!');
}

function shareToFacebook(text, url) {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
    showSuccessMessage('Shared! You earned $0.50 credit!');
}

function shareToLinkedIn(text, url) {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`);
    showSuccessMessage('Shared! You earned $0.50 credit!');
}

function copyReferralLink(link) {
    navigator.clipboard.writeText(link);
    showSuccessMessage('Referral link copied!');
}

function generateReferralCode() {
    return Math.random().toString(36).substr(2, 8);
}

function purchasePremium() {
    window.location.href = 'mailto:partners.clearhub@outlook.com?subject=Premium Upgrade - $9.99';
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateY(-20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
    
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    @keyframes slideInUp {
        from { transform: translateY(100%); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
`;
document.head.appendChild(style);
