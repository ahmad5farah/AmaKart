// Cart Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    loadCart();
    updateCartUI();
    updateWishlistUI();
});

// Load cart content
function loadCart() {
    const cartContent = document.getElementById('cart-content');
    
    if (AmaKart.cart.length === 0) {
        showEmptyCart();
        return;
    }
    
    const subtotal = AmaKart.getCartTotal();
    const shipping = subtotal > 50 ? 0 : 9.99;
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + shipping + tax;
    
    cartContent.innerHTML = `
        <div class="cart-container">
            <div class="cart-items">
                <h2>Cart Items (${AmaKart.cart.length})</h2>
                ${AmaKart.cart.map(item => `
                    <div class="cart-item" data-product-id="${item.id}">
                        <img src="${item.image}" alt="${item.title}" class="cart-item-image">
                        <div class="cart-item-info">
                            <h3>${item.title}</h3>
                            <p class="text-muted">${item.category}</p>
                        </div>
                        <div class="cart-item-price">$${item.price}</div>
                        <div class="quantity-controls">
                            <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                            <input type="number" class="quantity-input" value="${item.quantity}" 
                                   min="1" max="10" onchange="updateQuantity(${item.id}, this.value)">
                            <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                        </div>
                        <button class="remove-btn" onclick="removeItem(${item.id})">Remove</button>
                    </div>
                `).join('')}
            </div>
            
            <div class="cart-summary">
                <h3>Order Summary</h3>
                <div class="summary-row">
                    <span>Subtotal (${AmaKart.cart.length} items)</span>
                    <span>$${subtotal.toFixed(2)}</span>
                </div>
                <div class="summary-row">
                    <span>Shipping</span>
                    <span>${shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div class="summary-row">
                    <span>Tax</span>
                    <span>$${tax.toFixed(2)}</span>
                </div>
                <div class="summary-row summary-total">
                    <span>Total</span>
                    <span>$${total.toFixed(2)}</span>
                </div>
                
                <button class="btn btn-primary w-100 mb-2" onclick="proceedToCheckout()">
                    Proceed to Checkout
                </button>
                
                <a href="catalog.html" class="btn btn-outline w-100">
                    Continue Shopping
                </a>
                
                <div class="mt-3">
                    <div class="security-badge">
                        🔒 Secure Checkout
                    </div>
                    <p class="text-muted mt-2" style="font-size: 0.9rem;">
                        Your payment information is encrypted and secure.
                    </p>
                </div>
            </div>
        </div>
    `;
}

// Show empty cart
function showEmptyCart() {
    const cartContent = document.getElementById('cart-content');
    cartContent.innerHTML = `
        <div class="empty-cart">
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added any items to your cart yet.</p>
            <a href="catalog.html" class="btn btn-primary">Start Shopping</a>
        </div>
    `;
}

// Update item quantity
function updateQuantity(productId, newQuantity) {
    newQuantity = parseInt(newQuantity);
    
    if (newQuantity < 1) {
        removeItem(productId);
        return;
    }
    
    if (newQuantity > 10) {
        AmaKart.showAlert('Maximum quantity per item is 10', 'warning');
        return;
    }
    
    AmaKart.updateCartQuantity(productId, newQuantity);
    loadCart();
    updateCartUI();
}

// Remove item from cart
function removeItem(productId) {
    AmaKart.removeFromCart(productId);
    loadCart();
    updateCartUI();
    AmaKart.showAlert('Item removed from cart', 'success');
}

// Proceed to checkout
function proceedToCheckout() {
    if (AmaKart.cart.length === 0) {
        AmaKart.showAlert('Your cart is empty', 'warning');
        return;
    }
    
    // Check if user is logged in
    if (!AmaKart.currentUser) {
        AmaKart.showAlert('Please sign in to proceed with checkout', 'warning');
        setTimeout(() => {
            window.location.href = 'signin.html';
        }, 2000);
        return;
    }
    
    // Proceed to addresses page
    window.location.href = 'addresses.html';
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

// Clear cart (for testing)
function clearCart() {
    AmaKart.cart = [];
    localStorage.setItem('amakart_cart', JSON.stringify(AmaKart.cart));
    loadCart();
    updateCartUI();
    AmaKart.showAlert('Cart cleared', 'success');
}

// Make functions globally available
window.updateQuantity = updateQuantity;
window.removeItem = removeItem;
window.proceedToCheckout = proceedToCheckout;
window.performSearch = performSearch;
window.clearCart = clearCart;
