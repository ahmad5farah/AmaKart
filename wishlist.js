// Wishlist Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    loadWishlist();
    updateCartUI();
    updateWishlistUI();
});

// Load wishlist
function loadWishlist() {
    const wishlistContent = document.getElementById('wishlist-content');
    
    if (AmaKart.wishlist.length === 0) {
        showEmptyWishlist();
        return;
    }
    
    displayWishlistItems();
}

// Show empty wishlist
function showEmptyWishlist() {
    const wishlistContent = document.getElementById('wishlist-content');
    wishlistContent.innerHTML = `
        <div class="text-center" style="padding: 4rem 2rem;">
            <h2 style="color: #666; margin-bottom: 1rem;">Your wishlist is empty</h2>
            <p style="color: #999; margin-bottom: 2rem;">Start adding items you love to your wishlist!</p>
            <a href="catalog.html" class="btn btn-primary">Browse Products</a>
        </div>
    `;
}

// Display wishlist items
function displayWishlistItems() {
    const wishlistContent = document.getElementById('wishlist-content');
    
    wishlistContent.innerHTML = `
        <div class="grid grid-3">
            ${AmaKart.wishlist.map(item => `
                <div class="card product-card">
                    <img src="${item.image}" alt="${item.title}" class="product-image" onclick="viewProduct(${item.id})">
                    <div class="product-info">
                        <h3 class="product-title" onclick="viewProduct(${item.id})">${item.title}</h3>
                        <div class="product-price">$${item.price}</div>
                        <div class="product-rating">
                            <span class="stars">${'★'.repeat(Math.floor(item.rating))}</span>
                            <span class="rating-text">(${item.rating})</span>
                        </div>
                        <div class="d-flex justify-between align-center">
                            <button class="btn btn-primary" onclick="addToCart(${item.id})">
                                Add to Cart
                            </button>
                            <button class="btn btn-outline" onclick="removeFromWishlist(${item.id})">
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div class="text-center mt-4">
            <button class="btn btn-primary" onclick="addAllToCart()">
                Add All to Cart
            </button>
            <button class="btn btn-outline ml-2" onclick="clearWishlist()">
                Clear Wishlist
            </button>
        </div>
    `;
}

// View product
function viewProduct(productId) {
    window.location.href = `product.html?id=${productId}`;
}

// Add to cart
function addToCart(productId) {
    const product = AmaKart.wishlist.find(item => item.id === productId);
    if (product) {
        AmaKart.addToCart(product);
        AmaKart.showAlert('Product added to cart!', 'success');
        updateCartUI();
    }
}

// Remove from wishlist
function removeFromWishlist(productId) {
    AmaKart.removeFromWishlist(productId);
    loadWishlist();
    updateWishlistUI();
    AmaKart.showAlert('Product removed from wishlist', 'success');
}

// Add all to cart
function addAllToCart() {
    if (AmaKart.wishlist.length === 0) {
        AmaKart.showAlert('Your wishlist is empty', 'warning');
        return;
    }
    
    AmaKart.wishlist.forEach(product => {
        AmaKart.addToCart(product);
    });
    
    AmaKart.showAlert('All items added to cart!', 'success');
    updateCartUI();
}

// Clear wishlist
function clearWishlist() {
    if (!confirm('Are you sure you want to clear your wishlist?')) {
        return;
    }
    
    AmaKart.wishlist = [];
    localStorage.setItem('amakart_wishlist', JSON.stringify(AmaKart.wishlist));
    loadWishlist();
    updateWishlistUI();
    AmaKart.showAlert('Wishlist cleared', 'success');
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
window.viewProduct = viewProduct;
window.addToCart = addToCart;
window.removeFromWishlist = removeFromWishlist;
window.addAllToCart = addAllToCart;
window.clearWishlist = clearWishlist;
window.performSearch = performSearch;
