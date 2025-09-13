// Registration Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('register-form');
    const registerBtn = document.getElementById('register-btn');
    
    // Handle form submission
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(registerForm);
        const userData = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            password: formData.get('password'),
            confirmPassword: formData.get('confirmPassword'),
            terms: formData.get('terms'),
            newsletter: formData.get('newsletter')
        };
        
        // Validate form data
        const validation = validateRegistrationForm(userData);
        if (!validation.isValid) {
            showValidationErrors(validation.errors);
            return;
        }
        
        // Show loading state
        const originalText = registerBtn.innerHTML;
        AmaKart.showLoading('register-btn');
        
        try {
            // Attempt to register user
            const result = await AmaKart.registerUser(userData.email, userData.password, {
                firstName: userData.firstName,
                lastName: userData.lastName,
                phone: userData.phone,
                newsletter: userData.newsletter === 'on'
            });
            
            if (result.success) {
                AmaKart.showAlert('Account created successfully! Welcome to AmaKart!', 'success');
                
                // Redirect to home page after successful registration
                setTimeout(() => {
                    window.location.href = 'home.html';
                }, 2000);
            } else {
                AmaKart.showAlert(result.error || 'Registration failed. Please try again.', 'danger');
            }
        } catch (error) {
            console.error('Registration error:', error);
            AmaKart.showAlert('An error occurred. Please try again.', 'danger');
        } finally {
            // Hide loading state
            AmaKart.hideLoading('register-btn', originalText);
        }
    });
    
    // Real-time validation
    setupRealTimeValidation();
});

// Validate registration form
function validateRegistrationForm(data) {
    const errors = {};
    
    // Required fields
    if (!data.firstName || data.firstName.trim() === '') {
        errors.firstName = 'First name is required';
    }
    
    if (!data.lastName || data.lastName.trim() === '') {
        errors.lastName = 'Last name is required';
    }
    
    if (!data.email || data.email.trim() === '') {
        errors.email = 'Email is required';
    } else if (!AmaKart.validateForm({ email: data.email }, ['email']).isValid) {
        errors.email = 'Please enter a valid email address';
    }
    
    if (!data.password || data.password === '') {
        errors.password = 'Password is required';
    } else if (!AmaKart.validateForm({ password: data.password }, ['password']).isValid) {
        errors.password = 'Password must be at least 8 characters with uppercase letter and number';
    }
    
    if (!data.confirmPassword || data.confirmPassword === '') {
        errors.confirmPassword = 'Please confirm your password';
    } else if (data.password !== data.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
    }
    
    if (!data.terms) {
        errors.terms = 'You must agree to the Terms of Service and Privacy Policy';
    }
    
    // Phone validation (optional)
    if (data.phone && data.phone.trim() !== '') {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(data.phone.replace(/\s/g, ''))) {
            errors.phone = 'Please enter a valid phone number';
        }
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors: errors
    };
}

// Setup real-time validation
function setupRealTimeValidation() {
    // First name validation
    document.getElementById('firstName').addEventListener('blur', function() {
        const value = this.value.trim();
        if (value === '') {
            this.style.borderColor = '#e74c3c';
        } else {
            this.style.borderColor = '#27ae60';
        }
    });
    
    // Last name validation
    document.getElementById('lastName').addEventListener('blur', function() {
        const value = this.value.trim();
        if (value === '') {
            this.style.borderColor = '#e74c3c';
        } else {
            this.style.borderColor = '#27ae60';
        }
    });
    
    // Email validation
    document.getElementById('email').addEventListener('blur', function() {
        const email = this.value.trim();
        if (email === '') {
            this.style.borderColor = '#e74c3c';
        } else if (AmaKart.validateForm({ email }, ['email']).isValid) {
            this.style.borderColor = '#27ae60';
        } else {
            this.style.borderColor = '#e74c3c';
        }
    });
    
    // Password validation
    document.getElementById('password').addEventListener('input', function() {
        const password = this.value;
        const strength = getPasswordStrength(password);
        
        // Update password strength indicator
        updatePasswordStrength(strength);
        
        // Validate password
        if (password === '') {
            this.style.borderColor = '#e74c3c';
        } else if (AmaKart.validateForm({ password }, ['password']).isValid) {
            this.style.borderColor = '#27ae60';
        } else {
            this.style.borderColor = '#e74c3c';
        }
        
        // Check password match
        const confirmPassword = document.getElementById('confirmPassword');
        if (confirmPassword.value !== '') {
            validatePasswordMatch();
        }
    });
    
    // Confirm password validation
    document.getElementById('confirmPassword').addEventListener('input', validatePasswordMatch);
    
    // Phone validation
    document.getElementById('phone').addEventListener('blur', function() {
        const phone = this.value.trim();
        if (phone === '') {
            this.style.borderColor = '#ddd';
        } else {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            if (phoneRegex.test(phone.replace(/\s/g, ''))) {
                this.style.borderColor = '#27ae60';
            } else {
                this.style.borderColor = '#e74c3c';
            }
        }
    });
}

// Validate password match
function validatePasswordMatch() {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const confirmInput = document.getElementById('confirmPassword');
    
    if (confirmPassword === '') {
        confirmInput.style.borderColor = '#e74c3c';
    } else if (password === confirmPassword) {
        confirmInput.style.borderColor = '#27ae60';
    } else {
        confirmInput.style.borderColor = '#e74c3c';
    }
}

// Get password strength
function getPasswordStrength(password) {
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    return strength;
}

// Update password strength indicator
function updatePasswordStrength(strength) {
    let strengthIndicator = document.getElementById('password-strength');
    
    if (!strengthIndicator) {
        strengthIndicator = document.createElement('div');
        strengthIndicator.id = 'password-strength';
        strengthIndicator.style.marginTop = '0.5rem';
        strengthIndicator.style.fontSize = '0.9rem';
        document.getElementById('password').parentNode.appendChild(strengthIndicator);
    }
    
    const strengthText = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const strengthColors = ['#e74c3c', '#f39c12', '#f1c40f', '#2ecc71', '#27ae60'];
    
    strengthIndicator.textContent = `Password Strength: ${strengthText[strength] || 'Very Weak'}`;
    strengthIndicator.style.color = strengthColors[strength] || '#e74c3c';
}

// Toggle password visibility
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.getElementById('password-toggle');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.textContent = 'Hide';
    } else {
        passwordInput.type = 'password';
        toggleBtn.textContent = 'Show';
    }
}

// Show validation errors
function showValidationErrors(errors) {
    // Clear previous errors
    clearValidationErrors();
    
    // Show new errors
    Object.keys(errors).forEach(field => {
        const input = document.getElementById(field);
        if (input) {
            input.style.borderColor = '#e74c3c';
            
            // Create error message
            const errorDiv = document.createElement('div');
            errorDiv.className = 'alert alert-danger';
            errorDiv.style.marginTop = '0.5rem';
            errorDiv.style.fontSize = '0.9rem';
            errorDiv.textContent = errors[field];
            
            // Insert after input
            input.parentNode.insertBefore(errorDiv, input.nextSibling);
        }
    });
}

// Clear validation errors
function clearValidationErrors() {
    // Remove error messages
    const errorMessages = document.querySelectorAll('.alert-danger');
    errorMessages.forEach(error => {
        if (error.textContent.includes('required') || 
            error.textContent.includes('valid') || 
            error.textContent.includes('match') ||
            error.textContent.includes('agree')) {
            error.remove();
        }
    });
}

// Show terms modal (placeholder)
function showTerms() {
    AmaKart.showAlert('Terms of Service: This is a demo website for educational purposes only. No real transactions or data processing occurs.', 'info');
}

// Show privacy modal (placeholder)
function showPrivacy() {
    AmaKart.showAlert('Privacy Policy: This is a demo website. All data is for educational purposes only and is not stored or processed.', 'info');
}

// Make functions globally available
window.togglePasswordVisibility = togglePasswordVisibility;
window.showTerms = showTerms;
window.showPrivacy = showPrivacy;
