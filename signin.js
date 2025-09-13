// signin.js - Handles Sign In page logic
// Import shared.js to make sure the AmaKart global object is defined
import "./shared.js";

document.addEventListener('DOMContentLoaded', function() {
    const signinForm = document.getElementById('signin-form');
    const signinBtn = document.getElementById('signin-btn');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    // Attach form submission handler
    signinForm.addEventListener('submit', handleSignIn);

    // Attach real-time validation for a better user experience
    emailInput.addEventListener('blur', () => validateField('email', emailInput));
    passwordInput.addEventListener('blur', () => validateField('password', passwordInput));

    /**
     * Handles the form submission process, including validation and Firebase authentication.
     * @param {Event} e - The form submission event.
     */
    async function handleSignIn(e) {
        e.preventDefault();
        
        // Use the function from shared.js
        window.AmaKart.clearAllValidationErrors();

        const formData = new FormData(signinForm);
        const email = formData.get('email');
        const password = formData.get('password');

        // ✅ CRITICAL FIX: Pass 'true' for the isLogin parameter
        const validation = window.AmaKart.validateForm({ email, password }, ['email', 'password'], true);
        if (!validation.isValid) {
            showValidationErrors(validation.errors);
            return;
        }

        const originalText = signinBtn.innerHTML;
        window.AmaKart.showLoading?.('signin-btn');

        try {
            const result = await window.AmaKart.signInUser(email, password);

            if (result.success) {
                window.AmaKart.showAlert('Successfully signed in!', 'success');
                setTimeout(() => {
                    window.location.href = 'home.html';
                }, 1500);
            } else {
                window.AmaKart.showAlert(result.error || 'Sign in failed. Please try again.', 'danger');
            }
        } catch (error) {
            console.error('Sign in error:', error);
            window.AmaKart.showAlert('An unexpected error occurred. Please try again.', 'danger');
        } finally {
            window.AmaKart.hideLoading?.('signin-btn', originalText);
        }
    }

    /**
     * Validates a single field and shows an error message if it's invalid.
     * @param {string} fieldId - The ID of the input field.
     * @param {HTMLElement} inputElement - The input element to validate.
     */
    function validateField(fieldId, inputElement) {
        // Use the function from shared.js
        window.AmaKart.clearValidationErrorsForField(inputElement);

        const value = inputElement.value.trim();
        // ✅ CRITICAL FIX: Pass 'true' for the isLogin parameter
        const validation = window.AmaKart.validateForm({ [fieldId]: value }, [fieldId], true);
        
        if (value && !validation.isValid) {
            inputElement.classList.add('is-invalid');
            const errorDiv = document.createElement('div');
            errorDiv.className = 'validation-error-message text-danger mt-1';
            errorDiv.textContent = validation.errors[fieldId];
            inputElement.parentNode.insertBefore(errorDiv, inputElement.nextSibling);
        } else {
            inputElement.classList.remove('is-invalid');
        }
    }

    /**
     * Displays a list of validation errors for multiple fields.
     * @param {object} errors - An object containing field names and error messages.
     */
    function showValidationErrors(errors) {
        Object.keys(errors).forEach(field => {
            const input = document.getElementById(field);
            if (input) {
                input.classList.add('is-invalid');
                const errorDiv = document.createElement('div');
                errorDiv.className = 'validation-error-message alert alert-danger mt-1';
                errorDiv.textContent = errors[field];
                input.parentNode.insertBefore(errorDiv, input.nextSibling);
            }
        });
    }

    window.fillDemoCredentials = function() {
        document.getElementById('email').value = 'demo@amakart.com';
        document.getElementById('password').value = 'Demo123456';
        window.AmaKart.clearAllValidationErrors();
    };
});