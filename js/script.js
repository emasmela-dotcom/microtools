/**
 * Landing Page Form Handler
 * Handles form validation, submission simulation, and user feedback
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get form elements
    const form = document.getElementById('signupForm');
    const nameInput = document.getElementById('userName');
    const emailInput = document.getElementById('userEmail');
    const submitBtn = document.getElementById('submitBtn');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const messageContainer = document.getElementById('messageContainer');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');
    const nameError = document.getElementById('nameError');
    const emailError = document.getElementById('emailError');
    const interestsError = document.getElementById('interestsError');
    const interestsContainer = document.getElementById('interestsContainer');
    const hobbiesInput = document.getElementById('hobbies');
    const hobbiesCount = document.getElementById('hobbiesCount');
    const hobbiesError = document.getElementById('hobbiesError');

    // Form state management
    let isSubmitting = false;
    let validationTimeout = null;

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Initialize form functionality
    initForm();
    
    // Initialize entrance animations
    initEntranceAnimations();

    /**
     * Initialize all form functionality
     */
    function initForm() {
        // Add event listeners
        form.addEventListener('submit', handleFormSubmit);
        nameInput.addEventListener('input', debounce(validateName, 300));
        nameInput.addEventListener('blur', validateName);
        emailInput.addEventListener('input', debounce(validateEmail, 300));
        emailInput.addEventListener('blur', validateEmail);
        
        // Add interests validation
        const interestCheckboxes = document.querySelectorAll('input[name="interests"]');
        interestCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                // Add/remove checked class for styling
                const option = this.closest('.interest-option');
                if (this.checked) {
                    option.classList.add('checked');
                    // Add a subtle pulse effect
                    option.style.animation = 'bounceIn 0.3s ease-out';
                    setTimeout(() => {
                        option.style.animation = '';
                    }, 300);
                } else {
                    option.classList.remove('checked');
                }
                validateInterests();
            });
        });
        
        // Add hobbies character counter
        hobbiesInput.addEventListener('input', updateHobbiesCounter);
        
        // Add focus animations
        addFocusAnimations();
        
        // Hide any existing messages
        hideAllMessages();
    }

    /**
     * Handle form submission
     */
    function handleFormSubmit(e) {
        e.preventDefault();
        
        // Track submit button click
        if (window.analytics) {
            window.analytics.trackButtonClick('submit_form', 'signup_form');
        }
        
        // Prevent multiple submissions
        if (isSubmitting) {
            return;
        }

        // Validate all fields
        const isNameValid = validateName();
        const isEmailValid = validateEmail();
        const isInterestsValid = validateInterests();

        if (!isNameValid || !isEmailValid || !isInterestsValid) {
            // Do not show global error for validation issues; keep errors inline
            hideAllMessages();
            // Focus the first invalid field for better UX
            if (!isNameValid) {
                nameInput.focus();
            } else if (!isEmailValid) {
                emailInput.focus();
            } else if (!isInterestsValid) {
                interestsContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        // Start submission process
        startSubmission();
    }

    /**
     * Start the form submission simulation
     */
    function startSubmission() {
        isSubmitting = true;
        
        // Show loading state
        showLoadingState();
        
        // Hide any existing messages
        hideAllMessages();
        
        // Simulate network request (2-3 second delay)
        const delay = Math.random() * 1000 + 2000; // 2-3 seconds
        
        setTimeout(() => {
            // Simulate success (90% success rate)
            const isSuccess = Math.random() > 0.1;
            
            if (isSuccess) {
                handleSubmissionSuccess();
            } else {
                handleSubmissionError();
            }
        }, delay);
    }

    /**
     * Handle successful submission
     */
    async function handleSubmissionSuccess() {
        hideLoadingState();
        showSuccessMessage();
        
        // Track successful form submission
        if (window.analytics) {
            const selectedInterests = Array.from(document.querySelectorAll('input[name="interests"]:checked'))
                .map(checkbox => checkbox.value);
            
            window.analytics.trackFormSubmission({
                name: nameInput.value,
                email: emailInput.value,
                interests: selectedInterests,
                hobbies: hobbiesInput.value
            });
        }
        
        // Track A/B test conversion
        if (window.abTesting) {
            // Track conversion for all active tests
            Object.keys(window.abTesting.getAllVariants()).forEach(testKey => {
                window.abTesting.trackConversion(testKey, 'form_submission');
            });
        }
        
        // Save submission to localStorage for admin dashboard
        const selectedInterests = Array.from(document.querySelectorAll('input[name="interests"]:checked'))
            .map(checkbox => checkbox.value);
        
        const submission = {
            id: Date.now(),
            name: nameInput.value,
            email: emailInput.value,
            interests: selectedInterests,
            hobbies: hobbiesInput.value,
            timestamp: new Date().toISOString(),
            ip: '127.0.0.1', // Would be real IP in production
            userAgent: navigator.userAgent,
            location: 'Unknown' // Would be determined by IP in production
        };
        
        // Get existing submissions
        const existingSubmissions = JSON.parse(localStorage.getItem('digital_hermit_submissions') || '[]');
        existingSubmissions.unshift(submission); // Add to beginning
        
        // Save back to localStorage
        localStorage.setItem('digital_hermit_submissions', JSON.stringify(existingSubmissions));
        
        // Trigger email marketing subscription (only if enabled)
        if (window.emailMarketing && window.emailMarketing.isEnabled && window.emailMarketing.isEnabled()) {
            try {
                const emailResult = await window.emailMarketing.handleFormSubmission({
                    name: nameInput.value,
                    email: emailInput.value,
                    interests: selectedInterests,
                    hobbies: hobbiesInput.value
                });
                
                // Show email subscription success message
                if (emailResult && emailResult.message) {
                    console.log('Email subscription:', emailResult.message);
                }
            } catch (error) {
                console.warn('Email subscription failed:', error.message);
                // Don't show error to user as form submission was successful
            }
        }
        
        // Update social proof elements
        if (window.socialProof) {
            // Increment user count
            window.socialProof.incrementUserCount();
            
            // Add new activity item
            const interests = Array.from(document.querySelectorAll('input[name="interests"]:checked'))
                .map(checkbox => checkbox.value);
            const interestText = interests.length > 0 ? interests[0] : 'various interests';
            
            window.socialProof.addActivityItem(
                '🎉',
                `${nameInput.value} joined the ${interestText} community`,
                'just now'
            );
            
            // Track social proof interaction
            window.socialProof.trackSocialProofInteraction('form_submission', {
                user_name: nameInput.value,
                interests_count: interests.length
            });
        }
        
        resetForm();
        isSubmitting = false;
        
        // Log success for debugging
        console.log('Form submitted successfully:', {
            name: nameInput.value,
            email: emailInput.value,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Handle submission error
     */
    function handleSubmissionError() {
        hideLoadingState();
        showError('Something went wrong. Please try again in a moment.');
        
        // Track form submission error
        if (window.analytics) {
            window.analytics.trackFormValidationError('form_submission', 'server_error');
        }
        
        isSubmitting = false;
        
        // Log error for debugging
        console.error('Form submission failed');
    }

    /**
     * Validate name field
     */
    function validateName() {
        const value = nameInput.value.trim();
        const isValid = value.length >= 2;
        
        if (!isValid) {
            showFieldError(nameError, 'Name must be at least 2 characters long');
            nameInput.classList.add('error');
            
            // Track validation error
            if (window.analytics) {
                window.analytics.trackFormValidationError('name', 'min_length');
            }
        } else {
            hideFieldError(nameError);
            nameInput.classList.remove('error');
        }
        
        return isValid;
    }

    /**
     * Validate email field
     */
    function validateEmail() {
        const value = emailInput.value.trim();
        const isValid = value.length > 0 && emailRegex.test(value);
        
        if (!isValid) {
            if (value.length === 0) {
                showFieldError(emailError, 'Email address is required');
                // Track validation error
                if (window.analytics) {
                    window.analytics.trackFormValidationError('email', 'required');
                }
            } else {
                showFieldError(emailError, 'Please enter a valid email address');
                // Track validation error
                if (window.analytics) {
                    window.analytics.trackFormValidationError('email', 'invalid_format');
                }
            }
            emailInput.classList.add('error');
        } else {
            hideFieldError(emailError);
            emailInput.classList.remove('error');
        }
        
        return isValid;
    }

    /**
     * Validate interests selection
     */
    function validateInterests() {
        const selectedInterests = document.querySelectorAll('input[name="interests"]:checked');
        const count = selectedInterests.length;
        const isValid = count >= 3 && count <= 5;
        
        if (!isValid) {
            if (count < 3) {
                showFieldError(interestsError, 'Please select at least 3 interests');
                // Track validation error
                if (window.analytics) {
                    window.analytics.trackFormValidationError('interests', 'min_selection');
                }
            } else if (count > 5) {
                showFieldError(interestsError, 'Please select no more than 5 interests');
                // Track validation error
                if (window.analytics) {
                    window.analytics.trackFormValidationError('interests', 'max_selection');
                }
            }
        } else {
            hideFieldError(interestsError);
        }
        
        return isValid;
    }

    /**
     * Update hobbies character counter
     */
    function updateHobbiesCounter() {
        const count = hobbiesInput.value.length;
        hobbiesCount.textContent = count;
        
        // Update counter color based on length
        const counterElement = hobbiesCount.parentElement;
        counterElement.classList.remove('warning', 'danger');
        
        if (count > 400) {
            counterElement.classList.add('danger');
        } else if (count > 300) {
            counterElement.classList.add('warning');
        }
    }

    /**
     * Show field error message
     */
    function showFieldError(errorElement, message) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }

    /**
     * Hide field error message
     */
    function hideFieldError(errorElement) {
        errorElement.classList.remove('show');
        errorElement.textContent = '';
    }

    /**
     * Show loading state
     */
    function showLoadingState() {
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        
        // Add a subtle pulse animation to the button
        submitBtn.style.animation = 'pulse 1s ease-in-out infinite';
    }

    /**
     * Hide loading state
     */
    function hideLoadingState() {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        
        // Remove pulse animation
        submitBtn.style.animation = '';
    }

    /**
     * Show success message
     */
    function showSuccessMessage() {
        hideAllMessages();
        successMessage.classList.add('show');
        
        // Scroll to message
        setTimeout(() => {
            messageContainer.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
        }, 100);
    }

    /**
     * Show error message
     */
    function showError(message) {
        hideAllMessages();
        errorMessage.querySelector('.message-content p').textContent = message;
        errorMessage.classList.add('show');
        
        // Scroll to message
        setTimeout(() => {
            messageContainer.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
        }, 100);
    }

    /**
     * Hide all messages
     */
    function hideAllMessages() {
        successMessage.classList.remove('show');
        errorMessage.classList.remove('show');
    }

    /**
     * Reset form to initial state
     */
    function resetForm() {
        form.reset();
        hideAllMessages();
        hideFieldError(nameError);
        hideFieldError(emailError);
        hideFieldError(interestsError);
        hideFieldError(hobbiesError);
        nameInput.classList.remove('error');
        emailInput.classList.remove('error');
        
        // Reset interests checkboxes
        const interestCheckboxes = document.querySelectorAll('input[name="interests"]');
        interestCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
            const option = checkbox.closest('.interest-option');
            option.classList.remove('checked');
        });
        
        // Reset hobbies field
        hobbiesInput.value = '';
        updateHobbiesCounter();
        
        // Focus on name input
        setTimeout(() => {
            nameInput.focus();
        }, 500);
    }

    /**
     * Add focus animations to form inputs
     */
    function addFocusAnimations() {
        const inputs = [nameInput, emailInput];
        
        inputs.forEach(input => {
            input.addEventListener('focus', function() {
                this.parentElement.classList.add('focused');
            });
            
            input.addEventListener('blur', function() {
                this.parentElement.classList.remove('focused');
            });
        });
    }

    /**
     * Debounce function to limit validation calls
     */
    function debounce(func, wait) {
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(validationTimeout);
                func(...args);
            };
            clearTimeout(validationTimeout);
            validationTimeout = setTimeout(later, wait);
        };
    }

    /**
     * Handle keyboard shortcuts
     */
    document.addEventListener('keydown', function(e) {
        // Allow form submission with Enter key
        if (e.key === 'Enter' && !isSubmitting) {
            const activeElement = document.activeElement;
            if (activeElement === nameInput || activeElement === emailInput) {
                e.preventDefault();
                form.dispatchEvent(new Event('submit'));
            }
        }
        
        // Escape key to close messages
        if (e.key === 'Escape') {
            hideAllMessages();
        }
    });

    /**
     * Handle form reset with keyboard shortcut (Ctrl/Cmd + R)
     */
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            resetForm();
        }
    });

    /**
     * Add smooth scrolling for better UX
     */
    function smoothScrollToElement(element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }

    /**
     * Handle window resize for responsive adjustments
     */
    window.addEventListener('resize', debounce(function() {
        // Recalculate any size-dependent elements if needed
        console.log('Window resized, checking responsive layout');
    }, 250));

    /**
     * Add analytics tracking (placeholder for future implementation)
     */
    function trackEvent(eventName, eventData) {
        // Placeholder for analytics tracking
        console.log('Analytics Event:', eventName, eventData);
        
        // Example: Google Analytics 4
        // gtag('event', eventName, eventData);
    }

    /**
     * Initialize accessibility features
     */
    function initAccessibility() {
        // Add ARIA labels and roles
        form.setAttribute('role', 'form');
        form.setAttribute('aria-label', 'Sign up form');
        
        nameInput.setAttribute('aria-describedby', 'nameError');
        emailInput.setAttribute('aria-describedby', 'emailError');
        
        // Add live region for dynamic content
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        document.body.appendChild(liveRegion);
        
        // Update live region when messages change
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const target = mutation.target;
                    if (target.classList.contains('show')) {
                        const message = target.querySelector('.message-content p').textContent;
                        liveRegion.textContent = message;
                    }
                }
            });
        });
        
        observer.observe(successMessage, { attributes: true });
        observer.observe(errorMessage, { attributes: true });
    }

    // Initialize accessibility features
    initAccessibility();

    /**
     * Initialize entrance animations
     */
    function initEntranceAnimations() {
        console.log('Initializing entrance animations...');
        
        // Force trigger animations with JavaScript as fallback
        const navBrand = document.querySelector('.nav-brand h2');
        const heroImages = document.querySelector('.hero-images');
        const heroTitle = document.querySelector('.hero-title');
        const heroSubtitle = document.querySelector('.hero-subtitle');
        const heroDescription = document.querySelector('.hero-description');
        const heroForm = document.querySelector('.hero-form');
        const formGroups = document.querySelectorAll('.form-group');
        const interestsGrid = document.querySelector('.interests-grid');
        const submitBtn = document.querySelector('.form-submit');
        
        // Reset all elements to initial state
        if (navBrand) {
            navBrand.style.opacity = '0';
            navBrand.style.transform = 'translateY(-20px)';
        }
        
        if (heroImages) {
            heroImages.style.opacity = '0';
            heroImages.style.transform = 'translateY(20px)';
        }
        
        if (heroTitle) {
            heroTitle.style.opacity = '0';
            heroTitle.style.transform = 'translateY(-30px)';
        }
        
        if (heroSubtitle) {
            heroSubtitle.style.opacity = '0';
            heroSubtitle.style.transform = 'translateY(40px)';
        }
        
        if (heroDescription) {
            heroDescription.style.opacity = '0';
            heroDescription.style.transform = 'translateY(40px)';
        }
        
        if (heroForm) {
            heroForm.style.opacity = '0';
            heroForm.style.transform = 'scale(0.95) translateY(20px)';
        }
        
        formGroups.forEach((group, index) => {
            group.style.opacity = '0';
            group.style.transform = 'translateY(20px)';
        });
        
        if (interestsGrid) {
            interestsGrid.style.opacity = '0';
            interestsGrid.style.transform = 'translateY(20px)';
        }
        
        if (submitBtn) {
            submitBtn.style.opacity = '0';
            submitBtn.style.transform = 'translateY(20px)';
        }
        
        // Animate elements in sequence
        setTimeout(() => {
            if (navBrand) {
                navBrand.style.transition = 'all 0.6s ease-out';
                navBrand.style.opacity = '1';
                navBrand.style.transform = 'translateY(0)';
            }
        }, 100);
        
        setTimeout(() => {
            if (heroImages) {
                heroImages.style.transition = 'all 0.8s ease-out';
                heroImages.style.opacity = '1';
                heroImages.style.transform = 'translateY(0)';
            }
        }, 400);
        
        setTimeout(() => {
            if (heroTitle) {
                heroTitle.style.transition = 'all 0.8s ease-out';
                heroTitle.style.opacity = '1';
                heroTitle.style.transform = 'translateY(0)';
            }
        }, 200);
        
        setTimeout(() => {
            if (heroSubtitle) {
                heroSubtitle.style.transition = 'all 0.8s ease-out';
                heroSubtitle.style.opacity = '0.9';
                heroSubtitle.style.transform = 'translateY(0)';
            }
        }, 600);
        
        setTimeout(() => {
            if (heroDescription) {
                heroDescription.style.transition = 'all 0.8s ease-out';
                heroDescription.style.opacity = '1';
                heroDescription.style.transform = 'translateY(0)';
            }
        }, 800);
        
        setTimeout(() => {
            if (heroForm) {
                heroForm.style.transition = 'all 0.8s ease-out';
                heroForm.style.opacity = '1';
                heroForm.style.transform = 'scale(1) translateY(0)';
            }
        }, 1000);
        
        // Animate interests grid
        setTimeout(() => {
            if (interestsGrid) {
                interestsGrid.style.transition = 'all 0.6s ease-out';
                interestsGrid.style.opacity = '1';
                interestsGrid.style.transform = 'translateY(0)';
            }
        }, 1800);
        
        // Animate form groups
        formGroups.forEach((group, index) => {
            setTimeout(() => {
                group.style.transition = 'all 0.6s ease-out';
                group.style.opacity = '1';
                group.style.transform = 'translateY(0)';
            }, 1400 + (index * 200));
        });
        
        setTimeout(() => {
            if (submitBtn) {
                submitBtn.style.transition = 'all 0.6s ease-out';
                submitBtn.style.opacity = '1';
                submitBtn.style.transform = 'translateY(0)';
            }
        }, 2400);
        
        console.log('Entrance animations triggered via JavaScript');
        console.log('Elements found:', {
            navBrand: !!navBrand,
            heroImages: !!heroImages,
            heroTitle: !!heroTitle,
            heroSubtitle: !!heroSubtitle,
            heroForm: !!heroForm,
            formGroups: formGroups.length,
            interestsGrid: !!interestsGrid,
            submitBtn: !!submitBtn
        });
    }


    // Log initialization
    console.log('Landing page form initialized successfully');
});

/**
 * Utility function to sanitize input
 */
function sanitizeInput(input) {
    return input.trim().replace(/[<>]/g, '');
}

/**
 * Utility function to format name
 */
function formatName(name) {
    return name.trim().split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
}

/**
 * Utility function to validate email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Screen reader only class for accessibility
 */
const srOnlyCSS = `
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}
`;

// Inject screen reader CSS
const style = document.createElement('style');
style.textContent = srOnlyCSS;
document.head.appendChild(style);
