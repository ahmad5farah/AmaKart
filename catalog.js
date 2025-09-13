// AmaKart - Catalog Page Script
// This script handles product display, searching, filtering, and pagination.

// =======================
// Global UI Elements and State
// =======================
// Move these inside DOMContentLoaded to ensure elements exist
let productsContainer, categoryFilter, searchInput, searchForm, paginationContainer, sortSelect, loader;

// Initialize elements after DOM loads
function initializeElements() {
    productsContainer = document.getElementById('products-grid'); // Note: using products-grid from HTML
    categoryFilter = document.getElementById('category-filter');
    searchInput = document.getElementById('search-input');
    searchForm = document.querySelector('.search-bar'); // Using search bar form
    paginationContainer = document.getElementById('pagination');
    sortSelect = document.getElementById('sort-select');
    loader = document.querySelector('.catalog-content'); // Using catalog content for loader
}

// State variables for pagination and filters
let currentPage = 1;
const productsPerPage = 12; // A constant for easy management
let allProducts = [];
let filteredProducts = [];
let currentCategory = null;
let currentSearchQuery = null;

// =======================
// Product Display Functions
// =======================

/**
 * Generates and displays skeleton cards while products are loading.
 */
function showSkeletonLoader() {
    loader.classList.add('active');
    const skeletonCards = `
        ${getSkeletonCards(productsPerPage)}
    `;
    productsContainer.innerHTML = skeletonCards;
}

/**
 * Creates the HTML for a single product card.
 * @param {object} product - The product data object.
 * @returns {string} The HTML string for the product card.
 */
function createProductCard(product) {
    const ratingHtml = getRatingStars(product.rating || 0);
    const salePrice = product.discount_percentage > 0 ? 
        (product.price * (1 - product.discount_percentage / 100)) : null;
    const priceDisplay = salePrice ?
        `<span class="product-sale-price">$${salePrice.toFixed(2)}</span>
         <span class="product-price old-price">$${product.price.toFixed(2)}</span>` :
        `<span class="product-price">$${product.price.toFixed(2)}</span>`;

    return `
        <div class="product-card" data-id="${product.product_id}" onclick="viewProduct('${product.product_id}')">
            <div class="product-image-container">
                <img src="${product.image_url}" alt="${product.product_name}" class="product-image" loading="lazy">

                <div class="product-actions">
                    <button class="product-action-btn" onclick="event.stopPropagation(); handleAddToWishlist('${product.id}')" title="Add to Wishlist">
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
                        </svg>
                    </button>
                    <button class="product-action-btn" onclick="event.stopPropagation(); quickView('${product.id}')" title="Quick View">
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <h3 class="product-title">${product.title}</h3>
                <div class="product-rating">
                    ${ratingHtml}
                </div>
                <div class="product-price-container">
                    ${priceDisplay}
                </div>
                <div class="product-cta">
                    <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); handleAddToCart('${product.id}')">Add to Cart</button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Handles all product display logic, including filtering, sorting, and pagination.
 * @param {Array} products - The array of product objects to display.
 */
function displayProducts(products) {
    loader.classList.remove('active');
    filteredProducts = products;
    sortProducts();
    updatePagination();
    renderCurrentPage();
}

function renderCurrentPage() {
    productsContainer.innerHTML = '';
    const start = (currentPage - 1) * productsPerPage;
    const end = start + productsPerPage;
    const productsToDisplay = filteredProducts.slice(start, end);
    
    if (productsToDisplay.length === 0) {
        productsContainer.innerHTML = '<p class="no-results">No products found. Try a different search or filter.</p>';
    } else {
        productsToDisplay.forEach(product => {
            productsContainer.innerHTML += createProductCard(product);
        });
    }
}

// =======================
// Filtering and Sorting
// =======================

async function setupFilters() {
    try {
        const categories = await window.AmaKart.getProductCategories();
        categoryFilter.innerHTML = '<option value="">All Categories</option>';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
        
        // Check for URL parameters and apply filters
const urlParams = new URLSearchParams(window.location.search);
currentCategory = urlParams.get('category') || null;
currentSearchQuery = urlParams.get('search') || sessionStorage.getItem('searchQuery') || null;

// Clear sessionStorage after reading
if (sessionStorage.getItem('searchQuery')) {
    sessionStorage.removeItem('searchQuery');
}

        if (currentCategory) {
            categoryFilter.value = currentCategory;
            await filterAndLoadProducts();
        } else if (currentSearchQuery) {
            searchInput.value = currentSearchQuery;
            await filterAndLoadProducts();
        } else {
            // Load all products initially
            await filterAndLoadProducts();
        }
    } catch (error) {
    console.error('Setup filters error:', error);
    if (window.AmaKart && window.AmaKart.showAlert) {
        window.AmaKart.showAlert(error.message, 'error');
    }
    if (productsContainer) {
        productsContainer.innerHTML = '<p class="error-message">Failed to load categories. Please try reloading the page.</p>';
    }
    if (loader) loader.classList.remove('active');
}
}

async function filterAndLoadProducts() {
    showSkeletonLoader();
    try {
        let products;
        if (currentSearchQuery) {
            products = await window.AmaKart.searchProducts(currentSearchQuery);
        } else if (currentCategory) {
            products = await window.AmaKart.getProductsByCategory(currentCategory);
        } else {
            products = await window.AmaKart.getAllProducts();
        }
        displayProducts(products);
    } catch (error) {
        console.error('filterAndLoadProducts error:', error);
        productsContainer.innerHTML = '<p class="error-message">Failed to load products. Please check your internet connection and try again.</p>';
        loader.classList.remove('active');
    }
}

function sortProducts() {
    const sortValue = sortSelect.value;
    switch (sortValue) {
        case 'price-asc':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'rating-desc':
            filteredProducts.sort((a, b) => b.rating - a.rating);
            break;
        case 'name-asc':
            filteredProducts.sort((a, b) => a.title.localeCompare(b.title));
            break;
    }
}

// =======================
// Pagination
// =======================
function updatePagination() {
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    paginationContainer.innerHTML = '';
    
    if (totalPages <= 1) return;
    
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage + 1 < maxPagesToShow) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    // Previous button
    if (currentPage > 1) {
        const prevBtn = document.createElement('button');
        prevBtn.textContent = '«';
        prevBtn.classList.add('pagination-btn');
        prevBtn.onclick = () => { currentPage--; renderCurrentPage(); updatePagination(); };
        paginationContainer.appendChild(prevBtn);
    }

    // Page buttons
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.textContent = i;
        pageBtn.classList.add('pagination-btn');
        if (i === currentPage) {
            pageBtn.classList.add('active');
        }
        pageBtn.onclick = () => { currentPage = i; renderCurrentPage(); updatePagination(); };
        paginationContainer.appendChild(pageBtn);
    }

    // Next button
    if (currentPage < totalPages) {
        const nextBtn = document.createElement('button');
        nextBtn.textContent = '»';
        nextBtn.classList.add('pagination-btn');
        nextBtn.onclick = () => { currentPage++; renderCurrentPage(); updatePagination(); };
        paginationContainer.appendChild(nextBtn);
    }
}

// =======================
// Utility Functions
// =======================

function getRatingStars(rating) {
    const fullStars = '★'.repeat(Math.floor(rating));
    const emptyStars = '☆'.repeat(5 - Math.floor(rating));
    return `<div class="product-stars">${fullStars}${emptyStars}</div>`;
}

function getSkeletonCards(count) {
    let cards = '';
    for (let i = 0; i < count; i++) {
        cards += `
            <div class="product-card skeleton-card">
                <div class="skeleton skeleton-image"></div>
                <div class="product-info">
                    <div class="skeleton skeleton-text skeleton-line-sm"></div>
                    <div class="skeleton skeleton-text skeleton-line-lg"></div>
                    <div class="skeleton skeleton-text skeleton-line-md"></div>
                    <div class="skeleton skeleton-text skeleton-line-sm"></div>
                </div>
            </div>
        `;
    }
    return cards;
}

// Placeholder for now
async function getSampleProducts() {
    return [
        { id: 'sample1', title: 'Ergonomic Office Chair', category: 'Furniture', price: 299.99, rating: 4.5, image: 'https://via.placeholder.com/400x300.png?text=Ergonomic+Chair' },
        { id: 'sample2', title: '4K Ultra HD Monitor', category: 'Electronics', price: 450.00, sale_price: 399.99, rating: 4.8, image: 'https://via.placeholder.com/400x300.png?text=4K+Monitor' },
        { id: 'sample3', title: 'Noise-Cancelling Headphones', category: 'Electronics', price: 199.50, rating: 4.7, image: 'https://via.placeholder.com/400x300.png?text=Headphones' },
        { id: 'sample4', title: 'Men\'s Running Shoes', category: 'Footwear', price: 75.00, rating: 4.2, image: 'https://via.placeholder.com/400x300.png?text=Running+Shoes' },
        { id: 'sample5', title: 'Espresso Machine', category: 'Appliances', price: 349.99, rating: 4.9, image: 'https://via.placeholder.com/400x300.png?text=Espresso+Machine' },
        { id: 'sample6', title: 'Portable Power Bank', category: 'Accessories', price: 25.00, rating: 4.1, image: 'https://via.placeholder.com/400x300.png?text=Power+Bank' },
        { id: 'sample7', title: 'Yoga Mat', category: 'Fitness', price: 35.00, rating: 4.6, image: 'https://via.placeholder.com/400x300.png?text=Yoga+Mat' },
        { id: 'sample8', title: 'Bluetooth Speaker', category: 'Electronics', price: 80.00, rating: 4.3, image: 'https://via.placeholder.com/400x300.png?text=Bluetooth+Speaker' },
        { id: 'sample9', title: 'Cookbook: Italian Cuisine', category: 'Books', price: 22.00, rating: 4.4, image: 'https://via.placeholder.com/400x300.png?text=Cookbook' },
        { id: 'sample10', title: 'Smart Watch', category: 'Electronics', price: 150.00, rating: 4.8, image: 'https://via.placeholder.com/400x300.png?text=Smart+Watch' },
        { id: 'sample11', title: 'Ceramic Coffee Mug', category: 'Kitchenware', price: 12.00, rating: 4.1, image: 'https://via.placeholder.com/400x300.png?text=Coffee+Mug' },
        { id: 'sample12', title: 'Weighted Blanket', category: 'Home Goods', price: 89.99, rating: 4.7, image: 'https://via.placeholder.com/400x300.png?text=Weighted+Blanket' },
        { id: 'sample13', title: 'Gaming Mouse', category: 'Gaming', price: 55.00, rating: 4.6, image: 'https://via.placeholder.com/400x300.png?text=Gaming+Mouse' },
        { id: 'sample14', title: 'Dumbbell Set', category: 'Fitness', price: 99.00, rating: 4.5, image: 'https://via.placeholder.com/400x300.png?text=Dumbbell+Set' },
        { id: 'sample15', title: 'Desk Lamp with USB Port', category: 'Lighting', price: 45.00, rating: 4.3, image: 'https://via.placeholder.com/400x300.png?text=Desk+Lamp' }
    ];
}

// =======================
// Event Listeners and Initial Load
// =======================
document.addEventListener('DOMContentLoaded', () => {
    initializeElements();
    setupFilters();

    if (categoryFilter) {
        categoryFilter.addEventListener('change', (event) => {
            currentCategory = event.target.value || null;
            currentSearchQuery = null;
            currentPage = 1;
            if (searchInput) searchInput.value = '';
            filterAndLoadProducts();
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            currentPage = 1;
            sortProducts();
            renderCurrentPage();
        });
    }

    // Add search button handler since there's no form
    const searchBtn = document.getElementById('search-btn');
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', () => {
            currentSearchQuery = searchInput.value.trim() || null;
            currentCategory = null;
            currentPage = 1;
            filterAndLoadProducts();
        });
    }
});
    }

    if (searchForm) {
        searchForm.addEventListener('submit', (event) => {
            event.preventDefault();
            currentSearchQuery = searchInput ? searchInput.value.trim() || null : null;
            currentCategory = null;
            currentPage = 1;
            filterAndLoadProducts();
        });
    }
});


// Expose these functions to the global scope so they can be called from onclick attributes in HTML.
window.handleAddToCart = (productId) => {
    const product = filteredProducts.find(p => p.product_id === productId);
    if (product) {
        window.AmaKart.addToCart(product);
        window.AmaKart.showAlert?.('Product added to cart!', 'success');
        updateCartUI();
    }
};

window.handleAddToWishlist = (productId) => {
    const product = filteredProducts.find(p => p.product_id === productId);
    if (product) {
        window.AmaKart.addToWishlist(product);
        window.AmaKart.showAlert?.('Product added to wishlist!', 'success');
        updateWishlistUI();
    }
};


window.viewProduct = (productId) => {
    window.location.href = `product.html?id=${productId}`;
};

window.quickView = (productId) => {
    showNotification('Quick view feature is coming soon!', 'info');
};

// Toggle Grid / List view
function setView(view) {
    const grid = document.getElementById('products-grid');
    const list = document.getElementById('products-list');

    if(view === 'grid') {
        grid.style.display = 'grid';
        list.style.display = 'none';
    } else {
        grid.style.display = 'none';
        list.style.display = 'block';
    }

    document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.view-btn[onclick="setView('${view}')"]`).classList.add('active');
}

// Search button click
document.getElementById('search-btn').addEventListener('click', () => {
    applyFilters(); // calls your existing filter/search function
});

// Category checkbox logic
const categoryCheckboxes = document.querySelectorAll('#category-filters input[type="checkbox"]');
categoryCheckboxes.forEach(cb => {
    cb.addEventListener('change', () => {
        if(cb.value !== 'all' && cb.checked) {
            document.querySelector('#category-filters input[value="all"]').checked = false;
        }
        if(cb.value === 'all' && cb.checked) {
            categoryCheckboxes.forEach(other => {
                if(other.value !== 'all') other.checked = false;
            });
        }
    });
});

// Add these functions after the existing functions in catalog.js

function applyFilters() {
    // Get selected categories
    const categoryCheckboxes = document.querySelectorAll('#category-filters input[type="checkbox"]:checked');
    const selectedCategories = Array.from(categoryCheckboxes)
        .map(cb => cb.value)
        .filter(val => val !== 'all');

    // Get price range
    const minPrice = document.getElementById('min-price')?.value;
    const maxPrice = document.getElementById('max-price')?.value;

    // Get selected ratings
    const ratingCheckboxes = document.querySelectorAll('#rating-filters input[type="checkbox"]:checked');
    const selectedRatings = Array.from(ratingCheckboxes)
        .map(cb => cb.value)
        .filter(val => val !== 'all');

    // Apply filters
    currentPage = 1;
    applyCurrentFilters(selectedCategories, minPrice, maxPrice, selectedRatings);
}

function clearFilters() {
    // Clear category checkboxes
    document.querySelectorAll('#category-filters input[type="checkbox"]').forEach(cb => {
        cb.checked = cb.value === 'all';
    });

    // Clear price inputs
    const minPriceInput = document.getElementById('min-price');
    const maxPriceInput = document.getElementById('max-price');
    if (minPriceInput) minPriceInput.value = '';
    if (maxPriceInput) maxPriceInput.value = '';

    // Clear rating checkboxes
    document.querySelectorAll('#rating-filters input[type="checkbox"]').forEach(cb => {
        cb.checked = cb.value === 'all';
    });

    // Reset filters
    currentCategory = null;
    currentSearchQuery = null;
    currentPage = 1;
    filterAndLoadProducts();
}

async function applyCurrentFilters(categories, minPrice, maxPrice, ratings) {
    showSkeletonLoader();
    try {
        let products = await window.AmaKart.getAllProducts();
        
        // Filter by categories
        if (categories.length > 0) {
            products = products.filter(p => categories.includes(p.category));
        }

        // Filter by price range
        if (minPrice) {
            products = products.filter(p => p.price >= parseFloat(minPrice));
        }
        if (maxPrice) {
            products = products.filter(p => p.price <= parseFloat(maxPrice));
        }

        // Filter by ratings
        if (ratings.length > 0 && !ratings.includes('all')) {
            products = products.filter(p => {
                const rating = p.rating || 0;
                return ratings.some(r => {
                    if (r === '5') return rating >= 5;
                    if (r === '4') return rating >= 4;
                    if (r === '3') return rating >= 3;
                    return false;
                });
            });
        }

        displayProducts(products);
    } catch (error) {
        console.error('Apply filters error:', error);
        if (productsContainer) {
            productsContainer.innerHTML = '<p class="error-message">Failed to load products. Please try again.</p>';
        }
    }
}