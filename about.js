// About Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    updateCartUI();
    updateWishlistUI();
});

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
window.performSearch = performSearch;
