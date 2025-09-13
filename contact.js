// Contact Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    updateCartUI();
    updateWishlistUI();
    setupContactForm();
});

// Setup contact form
function setupContactForm() {
    const contactForm = document.getElementById('contact-form');
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(contactForm);
        const contactData = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            subject: formData.get('subject'),
            message: formData.get('message')
        };
        
        // Validate form
        const validation = validateContactForm(contactData);
        if (!validation.isValid) {
            showValidationErrors(validation.errors);
            return;
        }
        
        // Simulate form submission
        submitContactForm(contactData);
    });
}

// Validate contact form
function validateContactForm(data) {
    const errors = {};
    
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
    
    if (!data.subject || data.subject === '') {
        errors.subject = 'Please select a subject';
    }
    
    if (!data.message || data.message.trim() === '') {
        errors.message = 'Message is required';
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors: errors
    };
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
    // Reset border colors
    const inputs = document.querySelectorAll('.form-input, .form-textarea');
    inputs.forEach(input => {
        input.style.borderColor = '#ddd';
    });
    
    // Remove error messages
    const errorMessages = document.querySelectorAll('.alert-danger');
    errorMessages.forEach(error => {
        if (error.textContent.includes('required') || error.textContent.includes('valid') || error.textContent.includes('select')) {
            error.remove();
        }
    });
}

// Submit contact form
async function submitContactForm(contactData) {
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    // Show loading state
    submitBtn.innerHTML = '<div class="loading"></div> Sending...';
    submitBtn.disabled = true;
    
    try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // In a real application, this would send the data to a server
        console.log('Contact form submitted:', contactData);
        
        // Show success message
        AmaKart.showAlert('Thank you for your message! We\'ll get back to you soon.', 'success');
        
        // Reset form
        contactForm.reset();
        
    } catch (error) {
        console.error('Contact form error:', error);
        AmaKart.showAlert('Failed to send message. Please try again.', 'danger');
    } finally {
        // Reset button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Toggle FAQ
function toggleFAQ(element) {
    const answer = element.nextElementSibling;
    const toggle = element.querySelector('.faq-toggle');
    
    // Close all other FAQs
    document.querySelectorAll('.faq-answer').forEach(faq => {
        if (faq !== answer) {
            faq.classList.remove('active');
        }
    });
    
    document.querySelectorAll('.faq-toggle').forEach(toggle => {
        if (toggle !== element.querySelector('.faq-toggle')) {
            toggle.classList.remove('rotated');
        }
    });
    
    // Toggle current FAQ
    answer.classList.toggle('active');
    toggle.classList.toggle('rotated');
}

// Search functionality
function performSearch() {
    const searchInput = document.getElementById('search-input');
    const query = searchInput.value.trim();
    
    if (query) {
        sessionStorage.setItem('searchQuery', query);
        window.location.href = 'catalog.html';
    }
}

// Update UI functions
function updateCartUI() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        cartCount.textContent = AmaKart.getCartItemCount();
    }
}

function updateWishlistUI() {
    const wishlistCount = document.getElementById('wishlist-count');
    if (wishlistCount) {
        wishlistCount.textContent = AmaKart.wishlist.length;
    }
}

// Make functions globally available
window.toggleFAQ = toggleFAQ;
window.performSearch = performSearch;
