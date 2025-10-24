// MicroTools - Conversion Optimization & Analytics

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
`;
document.head.appendChild(style);
