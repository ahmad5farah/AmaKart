// Forgot Password Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    const resetBtn = document.getElementById('reset-btn');
    
    // Handle form submission
    forgotPasswordForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(forgotPasswordForm);
        const email = formData.get('email');
        
        // Validate email
        const validation = AmaKart.validateForm({ email }, ['email']);
        if (!validation.isValid) {
            AmaKart.showAlert('Please enter a valid email address.', 'danger');
            return;
        }
        
        // Show loading state
        const originalText = resetBtn.innerHTML;
        AmaKart.showLoading('reset-btn');
        
        try {
            // Simulate password reset request
            // In a real application, this would send a reset email
            const result = await simulatePasswordReset(email);
            
            if (result.success) {
                AmaKart.showAlert('Password reset link sent! Check your email for instructions.', 'success');
                
                // Clear form
                document.getElementById('email').value = '';
                
                // Show additional information
                setTimeout(() => {
                    showResetInstructions();
                }, 2000);
            } else {
                AmaKart.showAlert(result.error || 'Failed to send reset link. Please try again.', 'danger');
            }
        } catch (error) {
            console.error('Password reset error:', error);
            AmaKart.showAlert('An error occurred. Please try again.', 'danger');
        } finally {
            // Hide loading state
            AmaKart.hideLoading('reset-btn', originalText);
        }
    });
    
    // Real-time email validation
    document.getElementById('email').addEventListener('blur', function() {
        const email = this.value.trim();
        if (email && AmaKart.validateForm({ email }, ['email']).isValid) {
            this.style.borderColor = '#27ae60';
        } else if (email) {
            this.style.borderColor = '#e74c3c';
        } else {
            this.style.borderColor = '#ddd';
        }
    });
});

// Simulate password reset request
async function simulatePasswordReset(email) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Demo: Accept demo@amakart.com or any valid email format
    if (email === 'demo@amakart.com') {
        return {
            success: true,
            message: 'Password reset link sent to demo@amakart.com'
        };
    } else if (AmaKart.validateForm({ email }, ['email']).isValid) {
        // For demo purposes, accept any valid email format
        return {
            success: true,
            message: `Password reset link sent to ${email}`
        };
    } else {
        return {
            success: false,
            error: 'Invalid email address'
        };
    }
}

// Show reset instructions
function showResetInstructions() {
    const instructionsDiv = document.createElement('div');
    instructionsDiv.className = 'card mt-4';
    instructionsDiv.innerHTML = `
        <div class="card-header">
            <h3>📧 Next Steps</h3>
        </div>
        <div class="card-body">
            <p><strong>Check your email for the password reset link.</strong></p>
            <ul style="text-align: left; margin: 0; padding-left: 1.5rem;">
                <li>Look for an email from AmaKart</li>
                <li>Click the reset link in the email</li>
                <li>Create a new password</li>
                <li>Sign in with your new password</li>
            </ul>
            <p class="mt-3">
                <small class="text-muted">
                    <strong>Note:</strong> The reset link will expire in 1 hour for security reasons.
                    If you don't see the email, check your spam folder.
                </small>
            </p>
        </div>
    `;
    
    // Insert after the main card
    const mainCard = document.querySelector('.card');
    mainCard.parentNode.insertBefore(instructionsDiv, mainCard.nextSibling);
}

// Security: Rate limiting simulation
let resetAttempts = 0;
const maxAttempts = 3;
const resetWindow = 15 * 60 * 1000; // 15 minutes
let lastResetTime = 0;

function checkRateLimit() {
    const now = Date.now();
    
    // Reset attempts if enough time has passed
    if (now - lastResetTime > resetWindow) {
        resetAttempts = 0;
    }
    
    if (resetAttempts >= maxAttempts) {
        const remainingTime = Math.ceil((resetWindow - (now - lastResetTime)) / 60000);
        return {
            allowed: false,
            message: `Too many reset attempts. Please wait ${remainingTime} minutes before trying again.`
        };
    }
    
    return { allowed: true };
}

// Enhanced password reset with rate limiting
async function enhancedPasswordReset(email) {
    const rateLimitCheck = checkRateLimit();
    if (!rateLimitCheck.allowed) {
        return {
            success: false,
            error: rateLimitCheck.message
        };
    }
    
    resetAttempts++;
    lastResetTime = Date.now();
    
    // Simulate the actual reset process
    return await simulatePasswordReset(email);
}

// Security: Email enumeration protection
function protectEmailEnumeration(email) {
    // In a real application, always return success for valid email format
    // to prevent attackers from determining which emails are registered
    const isValidFormat = AmaKart.validateForm({ email }, ['email']).isValid;
    
    if (isValidFormat) {
        return {
            success: true,
            message: 'If an account with this email exists, you will receive a reset link.'
        };
    } else {
        return {
            success: false,
            error: 'Please enter a valid email address.'
        };
    }
}

// Make functions globally available
window.simulatePasswordReset = simulatePasswordReset;
window.showResetInstructions = showResetInstructions;
