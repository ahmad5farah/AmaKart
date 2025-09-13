// Customer Service Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    updateCartUI();
    updateWishlistUI();
});

// Show help tab
function showHelpTab(tabName) {
    // Remove active class from all tabs
    document.querySelectorAll('.help-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Hide all help content
    document.querySelectorAll('.help-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Add active class to selected tab
    event.target.classList.add('active');
    
    // Show selected help content
    const helpContent = document.getElementById(tabName + '-help');
    if (helpContent) {
        helpContent.classList.add('active');
    }
}

// Show support method
function showSupportMethod(method) {
    switch (method) {
        case 'phone':
            AmaKart.showAlert('Phone support: +1 (555) 123-4567. Available 24/7 for your convenience.', 'info');
            break;
        case 'chat':
            AmaKart.showAlert('Live chat is available 9 AM - 9 PM EST. Click here to start chatting with our support team.', 'info');
            break;
        case 'email':
            AmaKart.showAlert('Email us at support@amakart-demo.com. We\'ll respond within 24 hours.', 'info');
            break;
        default:
            AmaKart.showAlert('Please select a support method.', 'warning');
    }
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
window.showHelpTab = showHelpTab;
window.showSupportMethod = showSupportMethod;
window.performSearch = performSearch;
