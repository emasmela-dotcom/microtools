/**
 * Enhanced Signup Form Handler - PHP Backend Version
 * Handles the comprehensive Digital Hermit community signup form with MySQL database
 */

document.addEventListener('DOMContentLoaded', function() {
    // Form elements
    const form = document.getElementById('enhancedSignupForm');
    const submitBtn = document.getElementById('submitBtn');
    const messageContainer = document.getElementById('messageContainer');
    const progressFill = document.getElementById('progressFill');
    
    // Form fields
    const firstName = document.getElementById('firstName');
    const lastName = document.getElementById('lastName');
    const email = document.getElementById('email');
    const bio = document.getElementById('bio');
    const bioCounter = document.getElementById('bioCounter');
    const hobbies = document.getElementById('hobbies');
    const hobbiesCounter = document.getElementById('hobbiesCounter');
    
    // Error elements
    const firstNameError = document.getElementById('firstNameError');
    const lastNameError = document.getElementById('lastNameError');
    const emailError = document.getElementById('emailError');
    const bioError = document.getElementById('bioError');
    const interestsError = document.getElementById('interestsError');
    
    // Form state
    let isSubmitting = false;
    let formProgress = 0;
    
    // Initialize form
    initForm();
    
    /**
     * Initialize form functionality
     */
    function initForm() {
        // Add event listeners
        form.addEventListener('submit', handleFormSubmit);
        
        // Real-time validation
        firstName.addEventListener('input', () => validateName(firstName, firstNameError));
        lastName.addEventListener('input', () => validateName(lastName, lastNameError));
        email.addEventListener('input', () => validateEmail());
        bio.addEventListener('input', updateBioCounter);
        hobbies.addEventListener('input', updateHobbiesCounter);
        
        // Interest checkboxes
        const interestCheckboxes = document.querySelectorAll('input[name="interests"]');
        interestCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const option = this.closest('.interest-option');
                if (this.checked) {
                    option.classList.add('checked');
                } else {
                    option.classList.remove('checked');
                }
                validateInterests();
                updateProgress();
            });
        });
        
        // Update progress on any form change
        const allInputs = form.querySelectorAll('input, select, textarea');
        allInputs.forEach(input => {
            input.addEventListener('input', updateProgress);
            input.addEventListener('change', updateProgress);
        });
        
        // Initial progress update
        updateProgress();
    }
    
    /**
     * Handle form submission
     */
    async function handleFormSubmit(e) {
        e.preventDefault();
        
        if (isSubmitting) return;
        
        // Validate all fields
        const isValid = validateAllFields();
        if (!isValid) {
            showMessage('Please fix the errors below before submitting.', 'error');
            return;
        }
        
        // Start submission
        isSubmitting = true;
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
        submitBtn.textContent = 'Creating Your Profile...';
        
        try {
            // Collect form data
            const formData = collectFormData();
            
            // Submit to PHP backend
            const response = await fetch('process-form.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Show success message
                showMessage(result.data.message, 'success');
                
                // Reset form
                setTimeout(() => {
                    form.reset();
                    updateProgress();
                    resetInterestOptions();
                }, 2000);
                
            } else {
                throw new Error(result.error || 'Failed to create profile');
            }
            
        } catch (error) {
            console.error('Form submission error:', error);
            showMessage('Sorry, there was an error creating your profile. Please try again.', 'error');
        } finally {
            isSubmitting = false;
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
            submitBtn.textContent = 'Join Digital Hermit Community';
        }
    }
    
    /**
     * Collect all form data
     */
    function collectFormData() {
        const selectedInterests = Array.from(document.querySelectorAll('input[name="interests"]:checked'))
            .map(checkbox => checkbox.value);
        
        return {
            form_type: 'enhanced',
            // Basic info
            firstName: firstName.value.trim(),
            lastName: lastName.value.trim(),
            email: email.value.trim(),
            age: document.getElementById('age').value,
            location: document.getElementById('location').value.trim(),
            
            // Digital Hermit profile
            bio: bio.value.trim(),
            techInterests: document.getElementById('techInterests').value.trim(),
            mindfulnessPractices: document.getElementById('mindfulnessPractices').value.trim(),
            workStyle: document.getElementById('workStyle').value,
            
            // Interests & hobbies
            interests: selectedInterests,
            hobbies: hobbies.value.trim(),
            
            // Community preferences
            connectionType: document.getElementById('connectionType').value,
            privacyLevel: document.getElementById('privacyLevel').value,
            newsletter: document.getElementById('newsletter').checked
        };
    }
    
    /**
     * Validate all form fields
     */
    function validateAllFields() {
        const nameValid = validateName(firstName, firstNameError) && validateName(lastName, lastNameError);
        const emailValid = validateEmail();
        const bioValid = validateBio();
        const interestsValid = validateInterests();
        
        return nameValid && emailValid && bioValid && interestsValid;
    }
    
    /**
     * Validate name field
     */
    function validateName(field, errorElement) {
        const value = field.value.trim();
        const isValid = value.length >= 2;
        
        if (!isValid) {
            showFieldError(errorElement, 'Name must be at least 2 characters long');
            field.style.borderColor = '#e74c3c';
        } else {
            hideFieldError(errorElement);
            field.style.borderColor = '#e1e8ed';
        }
        
        return isValid;
    }
    
    /**
     * Validate email field
     */
    function validateEmail() {
        const value = email.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = value.length > 0 && emailRegex.test(value);
        
        if (!isValid) {
            if (value.length === 0) {
                showFieldError(emailError, 'Email address is required');
            } else {
                showFieldError(emailError, 'Please enter a valid email address');
            }
            email.style.borderColor = '#e74c3c';
        } else {
            hideFieldError(emailError);
            email.style.borderColor = '#e1e8ed';
        }
        
        return isValid;
    }
    
    /**
     * Validate bio field
     */
    function validateBio() {
        const value = bio.value.trim();
        const isValid = value.length >= 50 && value.length <= 500;
        
        if (!isValid) {
            if (value.length < 50) {
                showFieldError(bioError, 'Bio must be at least 50 characters long');
            } else if (value.length > 500) {
                showFieldError(bioError, 'Bio must be no more than 500 characters');
            }
            bio.style.borderColor = '#e74c3c';
        } else {
            hideFieldError(bioError);
            bio.style.borderColor = '#e1e8ed';
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
            } else if (count > 5) {
                showFieldError(interestsError, 'Please select no more than 5 interests');
            }
        } else {
            hideFieldError(interestsError);
        }
        
        return isValid;
    }
    
    /**
     * Update bio character counter
     */
    function updateBioCounter() {
        const count = bio.value.length;
        bioCounter.textContent = `${count} / 500`;
        
        // Update counter color
        bioCounter.className = 'character-counter';
        if (count > 450) {
            bioCounter.classList.add('danger');
        } else if (count > 400) {
            bioCounter.classList.add('warning');
        }
        
        // Validate bio in real-time
        validateBio();
    }
    
    /**
     * Update hobbies character counter
     */
    function updateHobbiesCounter() {
        const count = hobbies.value.length;
        hobbiesCounter.textContent = `${count} / 300`;
        
        // Update counter color
        hobbiesCounter.className = 'character-counter';
        if (count > 250) {
            hobbiesCounter.classList.add('danger');
        } else if (count > 200) {
            hobbiesCounter.classList.add('warning');
        }
    }
    
    /**
     * Update form progress
     */
    function updateProgress() {
        let completedFields = 0;
        let totalFields = 0;
        
        // Required fields
        const requiredFields = [firstName, lastName, email, bio];
        requiredFields.forEach(field => {
            totalFields++;
            if (field.value.trim().length > 0) {
                completedFields++;
            }
        });
        
        // Interests (count as one field)
        totalFields++;
        const selectedInterests = document.querySelectorAll('input[name="interests"]:checked');
        if (selectedInterests.length >= 3) {
            completedFields++;
        }
        
        // Calculate progress percentage
        formProgress = Math.round((completedFields / totalFields) * 100);
        progressFill.style.width = `${formProgress}%`;
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
     * Show message to user
     */
    function showMessage(text, type) {
        messageContainer.textContent = text;
        messageContainer.className = `message ${type}`;
        messageContainer.style.display = 'block';
        
        // Scroll to message
        messageContainer.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            messageContainer.style.display = 'none';
        }, 5000);
    }
    
    /**
     * Reset interest options styling
     */
    function resetInterestOptions() {
        const interestOptions = document.querySelectorAll('.interest-option');
        interestOptions.forEach(option => {
            option.classList.remove('checked');
        });
    }
    
    // Initialize character counters
    updateBioCounter();
    updateHobbiesCounter();
    
    console.log('Enhanced signup form (PHP version) initialized');
});
