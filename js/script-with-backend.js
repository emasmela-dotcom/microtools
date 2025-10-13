/**
 * Landing Page Form Handler with Backend Integration
 * This version includes PHP backend integration for real form submission
 * 
 * To use this version:
 * 1. Rename script.js to script-original.js
 * 2. Rename this file to script.js
 * 3. Make sure process-form.php is in the same directory as index.html
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

    // Form state management
    let isSubmitting = false;
    let validationTimeout = null;

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Configuration
    const config = {
        useBackend: true, // Set to false to use simulation mode
        backendUrl: 'process-form.php',
        timeout: 10000 // 10 seconds timeout
    };

    // Initialize form functionality
    initForm();

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
        
        // Add focus animations
        addFocusAnimations();
        
        // Hide any existing messages
        hideAllMessages();
        
        console.log('Landing page form initialized with backend integration');
    }

    /**
     * Handle form submission
     */
    function handleFormSubmit(e) {
        e.preventDefault();
        
        // Prevent multiple submissions
        if (isSubmitting) {
            return;
        }

        // Validate all fields
        const isNameValid = validateName();
        const isEmailValid = validateEmail();

        if (!isNameValid || !isEmailValid) {
            showError('Please fix the errors above and try again.');
            return;
        }

        // Start submission process
        if (config.useBackend) {
            submitToBackend();
        } else {
            simulateSubmission();
        }
    }

    /**
     * Submit form to PHP backend
     */
    async function submitToBackend() {
        isSubmitting = true;
        showLoadingState();
        hideAllMessages();

        try {
            // Prepare form data
            const formData = new FormData();
            formData.append('userName', nameInput.value.trim());
            formData.append('userEmail', emailInput.value.trim());

            // Create AbortController for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), config.timeout);

            // Submit to backend
            const response = await fetch(config.backendUrl, {
                method: 'POST',
                body: formData,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            // Parse response
            const result = await response.json();

            if (response.ok && result.success) {
                handleSubmissionSuccess(result);
            } else {
                handleSubmissionError(result);
            }

        } catch (error) {
            console.error('Submission error:', error);
            
            if (error.name === 'AbortError') {
                showError('Request timed out. Please check your connection and try again.');
            } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
                showError('Unable to connect to server. Please try again later.');
            } else {
                showError('An unexpected error occurred. Please try again.');
            }
        } finally {
            hideLoadingState();
            isSubmitting = false;
        }
    }

    /**
     * Simulate form submission (fallback mode)
     */
    function simulateSubmission() {
        isSubmitting = true;
        showLoadingState();
        hideAllMessages();
        
        // Simulate network request (2-3 second delay)
        const delay = Math.random() * 1000 + 2000;
        
        setTimeout(() => {
            const isSuccess = Math.random() > 0.1; // 90% success rate
            
            if (isSuccess) {
                handleSubmissionSuccess({
                    message: 'Thank you for signing up! We\'ll be in touch soon.',
                    data: {
                        name: nameInput.value.trim(),
                        email: emailInput.value.trim(),
                        timestamp: new Date().toISOString()
                    }
                });
            } else {
                handleSubmissionError({
                    message: 'Something went wrong. Please try again in a moment.'
                });
            }
            
            hideLoadingState();
            isSubmitting = false;
        }, delay);
    }

    /**
     * Handle successful submission
     */
    function handleSubmissionSuccess(result) {
        showSuccessMessage(result.message || 'Thank you for signing up! We\'ll be in touch soon.');
        
        // Track successful form submission
        if (window.analytics) {
            const selectedInterests = Array.from(document.querySelectorAll('input[name="interests"]:checked'))
                .map(checkbox => checkbox.value);
            
            window.analytics.trackFormSubmission({
                name: result.data?.name || nameInput.value.trim(),
                email: result.data?.email || emailInput.value.trim(),
                interests: selectedInterests,
                hobbies: document.getElementById('hobbies')?.value || ''
            });
        }
        
        resetForm();
        
        // Log success for debugging
        console.log('Form submitted successfully:', result);
        
        // Track analytics event (legacy)
        trackEvent('form_submission_success', {
            name: result.data?.name || nameInput.value.trim(),
            email: result.data?.email || emailInput.value.trim()
        });
    }

    /**
     * Handle submission error
     */
    function handleSubmissionError(result) {
        let errorMessage = 'Something went wrong. Please try again.';
        
        if (result.errors && Array.isArray(result.errors)) {
            errorMessage = result.errors.join('. ');
        } else if (result.message) {
            errorMessage = result.message;
        }
        
        showError(errorMessage);
        
        // Log error for debugging
        console.error('Form submission failed:', result);
        
        // Track analytics event
        trackEvent('form_submission_error', {
            error: errorMessage
        });
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
            } else {
                showFieldError(emailError, 'Please enter a valid email address');
            }
            emailInput.classList.add('error');
        } else {
            hideFieldError(emailError);
            emailInput.classList.remove('error');
        }
        
        return isValid;
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
    }

    /**
     * Hide loading state
     */
    function hideLoadingState() {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }

    /**
     * Show success message
     */
    function showSuccessMessage(message) {
        hideAllMessages();
        successMessage.querySelector('.message-content p').textContent = message;
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
        nameInput.classList.remove('error');
        emailInput.classList.remove('error');
        
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
     * Track analytics events
     */
    function trackEvent(eventName, eventData) {
        console.log('Analytics Event:', eventName, eventData);
        
        // Example: Google Analytics 4
        // if (typeof gtag !== 'undefined') {
        //     gtag('event', eventName, eventData);
        // }
        
        // Example: Custom analytics endpoint
        // fetch('/analytics', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ event: eventName, data: eventData })
        // }).catch(console.error);
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
});

/**
 * Utility functions
 */
function sanitizeInput(input) {
    return input.trim().replace(/[<>]/g, '');
}

function formatName(name) {
    return name.trim().split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Screen reader only class for accessibility
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
