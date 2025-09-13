// Product Detail Page JavaScript

let currentProduct = null;
let currentImageIndex = 0;

document.addEventListener('DOMContentLoaded', function() {
    loadProduct();
    updateCartUI();
    updateWishlistUI();
});

// Load product details
function loadProduct() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    
    if (!productId) {
        AmaKart.showAlert('Product not found', 'danger');
        window.location.href = 'catalog.html';
        return;
    }
    
    const products = AmaKart.getSampleProducts();
    currentProduct = products.find(p => p.id === productId);
    
    if (!currentProduct) {
        AmaKart.showAlert('Product not found', 'danger');
        window.location.href = 'catalog.html';
        return;
    }
    
    displayProduct();
    loadRelatedProducts();
    loadReviews();
}

// Display product details
function displayProduct() {
    const productDetail = document.getElementById('product-detail');
    const breadcrumbCategory = document.getElementById('breadcrumb-category');
    const breadcrumbProduct = document.getElementById('breadcrumb-product');
    
    // Update breadcrumb
    breadcrumbCategory.textContent = currentProduct.category;
    breadcrumbProduct.textContent = currentProduct.title;
    
    // Create product images
    const images = [
        currentProduct.image,
        'https://via.placeholder.com/300x200?text=Product+View+2',
        'https://via.placeholder.com/300x200?text=Product+View+3',
        'https://via.placeholder.com/300x200?text=Product+View+4'
    ];
    
    productDetail.innerHTML = `
        <div class="product-images">
            <img src="${images[0]}" alt="${currentProduct.title}" class="main-image" id="main-image">
            <div class="thumbnail-images">
                ${images.map((img, index) => `
                    <img src="${img}" alt="View ${index + 1}" class="thumbnail ${index === 0 ? 'active' : ''}" 
                         onclick="changeMainImage(${index})">
                `).join('')}
            </div>
        </div>
        
        <div class="product-info">
            <h1>${currentProduct.title}</h1>
            <div class="product-price">$${currentProduct.price}</div>
            
            <div class="product-rating">
                <span class="stars">${'★'.repeat(Math.floor(currentProduct.rating))}</span>
                <span class="rating-text">${currentProduct.rating} (${Math.floor(Math.random() * 100) + 50} reviews)</span>
            </div>
            
            <div class="product-description">
                <p>${currentProduct.description}</p>
                <p>Experience the perfect blend of quality and innovation with this amazing product. Designed to meet your needs and exceed your expectations.</p>
            </div>
            
            <div class="product-actions">
                <div class="quantity-selector">
                    <label for="quantity">Qty:</label>
                    <input type="number" id="quantity" class="quantity-input" value="1" min="1" max="10">
                </div>
                <button class="btn btn-primary" onclick="addToCart()">
                    Add to Cart
                </button>
                <button class="btn btn-outline" onclick="addToWishlist()">
                    Add to Wishlist
                </button>
            </div>
            
            <div class="product-features">
                <h3>Key Features</h3>
                <ul class="feature-list">
                    <li>High-quality materials and construction</li>
                    <li>30-day money-back guarantee</li>
                    <li>Free shipping on orders over $50</li>
                    <li>1-year manufacturer warranty</li>
                    <li>24/7 customer support</li>
                </ul>
            </div>
        </div>
    `;
}

// Change main product image
function changeMainImage(index) {
    const mainImage = document.getElementById('main-image');
    const thumbnails = document.querySelectorAll('.thumbnail');
    
    // Update main image
    const images = [
        currentProduct.image,
        'https://via.placeholder.com/300x200?text=Product+View+2',
        'https://via.placeholder.com/300x200?text=Product+View+3',
        'https://via.placeholder.com/300x200?text=Product+View+4'
    ];
    
    mainImage.src = images[index];
    currentImageIndex = index;
    
    // Update thumbnail active state
    thumbnails.forEach((thumb, i) => {
        thumb.classList.toggle('active', i === index);
    });
}

// Add to cart
function addToCart() {
    const quantity = parseInt(document.getElementById('quantity').value) || 1;
    
    if (quantity < 1 || quantity > 10) {
        AmaKart.showAlert('Please enter a valid quantity (1-10)', 'danger');
        return;
    }
    
    // Create product with quantity
    const productToAdd = { ...currentProduct, quantity: quantity };
    
    // Check if product already exists in cart
    const existingItem = AmaKart.cart.find(item => item.id === currentProduct.id);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        AmaKart.cart.push(productToAdd);
    }
    
    // Update localStorage
    localStorage.setItem('amakart_cart', JSON.stringify(AmaKart.cart));
    
    // Update UI
    updateCartUI();
    AmaKart.showAlert(`Added ${quantity} item(s) to cart!`, 'success');
}

// Add to wishlist
function addToWishlist() {
    AmaKart.addToWishlist(currentProduct);
    AmaKart.showAlert('Product added to wishlist!', 'success');
}

// Load related products
function loadRelatedProducts() {
    const products = AmaKart.getSampleProducts();
    const relatedProducts = products
        .filter(p => p.category === currentProduct.category && p.id !== currentProduct.id)
        .slice(0, 4);
    
    const relatedContainer = document.getElementById('related-products');
    
    relatedContainer.innerHTML = relatedProducts.map(product => `
        <div class="card product-card" onclick="viewProduct(${product.id})">
            <img src="${product.image}" alt="${product.title}" class="product-image">
            <div class="product-info">
                <h3 class="product-title">${product.title}</h3>
                <div class="product-price">$${product.price}</div>
                <div class="product-rating">
                    <span class="stars">${'★'.repeat(Math.floor(product.rating))}</span>
                    <span class="rating-text">(${product.rating})</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Load product reviews
function loadReviews() {
    const reviews = generateSampleReviews();
    const reviewsContainer = document.getElementById('reviews-section');
    
    reviewsContainer.innerHTML = `
        <div class="reviews-summary mb-4">
            <h4>Customer Reviews</h4>
            <div class="d-flex align-center gap-2 mb-2">
                <span class="stars">★★★★★</span>
                <span>${currentProduct.rating} out of 5</span>
                <span class="text-muted">(${reviews.length} reviews)</span>
            </div>
        </div>
        
        <div class="reviews-list">
            ${reviews.map(review => `
                <div class="review-item" style="border-bottom: 1px solid #eee; padding: 1rem 0;">
                    <div class="d-flex justify-between align-center mb-2">
                        <strong>${review.customerName}</strong>
                        <span class="stars">${'★'.repeat(review.rating)}</span>
                    </div>
                    <p class="mb-2">${review.comment}</p>
                    <small class="text-muted">${review.date}</small>
                </div>
            `).join('')}
        </div>
    `;
}

// Generate sample reviews
function generateSampleReviews() {
    const customers = ['John D.', 'Sarah M.', 'Mike R.', 'Lisa K.', 'David T.'];
    const comments = [
        'Great product! Exceeded my expectations.',
        'Fast shipping and excellent quality.',
        'Perfect for my needs. Highly recommended!',
        'Good value for money. Will buy again.',
        'Amazing product with great features.'
    ];
    
    return Array.from({ length: 5 }, (_, i) => ({
        customerName: customers[i],
        rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
        comment: comments[i],
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
    }));
}

// View product
function viewProduct(productId) {
    window.location.href = `product.html?id=${productId}`;
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
window.changeMainImage = changeMainImage;
window.addToCart = addToCart;
window.addToWishlist = addToWishlist;
window.viewProduct = viewProduct;
window.performSearch = performSearch;
