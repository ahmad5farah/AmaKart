// Payment Page JavaScript

let selectedPaymentMethod = null;

document.addEventListener('DOMContentLoaded', function() {
    loadOrderSummary();
    updateCartUI();
    setupPaymentForm();
});

// Load order summary
function loadOrderSummary() {
    const orderItems = document.getElementById('order-items');
    const subtotalEl = document.getElementById('subtotal');
    const shippingEl = document.getElementById('shipping');
    const taxEl = document.getElementById('tax');
    const totalEl = document.getElementById('total');
    
    if (AmaKart.cart.length === 0) {
        window.location.href = 'cart.html';
        return;
    }
    
    const subtotal = AmaKart.getCartTotal();
    const shipping = subtotal > 50 ? 0 : 9.99;
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + shipping + tax;
    
    // Display order items
    orderItems.innerHTML = AmaKart.cart.map(item => `
        <div class="summary-item">
            <span>${item.title} x${item.quantity}</span>
            <span>$${(item.price * item.quantity).toFixed(2)}</span>
        </div>
    `).join('');
    
    // Update totals
    subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    shippingEl.textContent = shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`;
    taxEl.textContent = `$${tax.toFixed(2)}`;
    totalEl.textContent = `$${total.toFixed(2)}`;
}

// Setup payment form
function setupPaymentForm() {
    // Add card number formatting
    const cardNumberInput = document.querySelector('.card-number');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s/g, '');
            let formattedValue = value.replace(/(.{4})/g, '$1 ').trim();
            e.target.value = formattedValue;
        });
    }
    
    // Add expiry date formatting
    const expiryInput = document.querySelector('input[placeholder="MM/YY"]');
    if (expiryInput) {
        expiryInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            e.target.value = value;
        });
    }
    
    // Add CVV formatting
    const cvvInput = document.querySelector('input[placeholder="CVV"]');
    if (cvvInput) {
        cvvInput.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/\D/g, '');
        });
    }
}

// Select payment method
function selectPaymentMethod(method) {
    // Update radio button
    document.getElementById(method + (method === 'credit' ? '-card' : method === 'apple' ? '-pay' : method === 'google' ? '-pay' : '')).checked = true;
    
    // Remove previous selection
    document.querySelectorAll('.payment-method').forEach(pm => {
        pm.classList.remove('selected');
    });
    
    // Hide all forms
    document.querySelectorAll('.payment-form').forEach(form => {
        form.classList.remove('active');
    });
    
    // Show selected method
    const selectedMethod = event.currentTarget;
    selectedMethod.classList.add('selected');
    
    // Show corresponding form
    const formId = method + '-form';
    const form = document.getElementById(formId);
    if (form) {
        form.classList.add('active');
    }
    
    selectedPaymentMethod = method;
    updateContinueButton();
}

// Update continue button
function updateContinueButton() {
    const continueBtn = document.getElementById('continue-btn');
    continueBtn.disabled = !selectedPaymentMethod;
}

// Proceed to review
function proceedToReview() {
    if (!selectedPaymentMethod) {
        AmaKart.showAlert('Please select a payment method', 'warning');
        return;
    }
    
    // Validate payment form if credit card is selected
    if (selectedPaymentMethod === 'credit') {
        const validation = validateCreditCardForm();
        if (!validation.isValid) {
            showValidationErrors(validation.errors);
            return;
        }
    }
    
    // Store payment method in sessionStorage
    sessionStorage.setItem('selectedPaymentMethod', selectedPaymentMethod);
    
    // Proceed to order summary
    window.location.href = 'ordersummary.html';
}

// Validate credit card form
function validateCreditCardForm() {
    const errors = {};
    
    const cardNumber = document.querySelector('.card-number').value.replace(/\s/g, '');
    const cvv = document.querySelector('input[placeholder="CVV"]').value;
    const expiry = document.querySelector('input[placeholder="MM/YY"]').value;
    const cardholderName = document.querySelector('input[placeholder="Cardholder Name"]').value;
    
    // Card number validation (Luhn algorithm)
    if (!cardNumber || !isValidCardNumber(cardNumber)) {
        errors.cardNumber = 'Please enter a valid card number';
    }
    
    // CVV validation
    if (!cvv || !/^\d{3,4}$/.test(cvv)) {
        errors.cvv = 'Please enter a valid CVV';
    }
    
    // Expiry date validation
    if (!expiry || !isValidExpiryDate(expiry)) {
        errors.expiry = 'Please enter a valid expiry date (MM/YY)';
    }
    
    // Cardholder name validation
    if (!cardholderName || cardholderName.trim() === '') {
        errors.cardholderName = 'Please enter the cardholder name';
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors: errors
    };
}

// Validate card number using Luhn algorithm
function isValidCardNumber(cardNumber) {
    // Remove spaces and check if it's all digits
    const cleaned = cardNumber.replace(/\s/g, '');
    if (!/^\d{13,19}$/.test(cleaned)) {
        return false;
    }
    
    // Luhn algorithm
    let sum = 0;
    let isEven = false;
    
    for (let i = cleaned.length - 1; i >= 0; i--) {
        let digit = parseInt(cleaned[i]);
        
        if (isEven) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }
        
        sum += digit;
        isEven = !isEven;
    }
    
    return sum % 10 === 0;
}

// Validate expiry date
function isValidExpiryDate(expiry) {
    const regex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!regex.test(expiry)) {
        return false;
    }
    
    const [month, year] = expiry.split('/');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;
    
    const expYear = parseInt(year);
    const expMonth = parseInt(month);
    
    if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
        return false;
    }
    
    return true;
}

// Show validation errors
function showValidationErrors(errors) {
    // Clear previous errors
    clearValidationErrors();
    
    // Show new errors
    Object.keys(errors).forEach(field => {
        let input;
        switch (field) {
            case 'cardNumber':
                input = document.querySelector('.card-number');
                break;
            case 'cvv':
                input = document.querySelector('input[placeholder="CVV"]');
                break;
            case 'expiry':
                input = document.querySelector('input[placeholder="MM/YY"]');
                break;
            case 'cardholderName':
                input = document.querySelector('input[placeholder="Cardholder Name"]');
                break;
        }
        
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
    const inputs = document.querySelectorAll('.form-input');
    inputs.forEach(input => {
        input.style.borderColor = '#ddd';
    });
    
    // Remove error messages
    const errorMessages = document.querySelectorAll('.alert-danger');
    errorMessages.forEach(error => {
        if (error.textContent.includes('valid') || error.textContent.includes('enter')) {
            error.remove();
        }
    });
}

// Update cart UI
function updateCartUI() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        cartCount.textContent = AmaKart.getCartItemCount();
    }
}

// Make functions globally available
window.selectPaymentMethod = selectPaymentMethod;
window.proceedToReview = proceedToReview;
