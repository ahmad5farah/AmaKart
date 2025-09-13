console.log('home.js loaded');
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, user-menu-btn:', document.getElementById('user-menu-btn'));
    console.log('user-menu:', document.getElementById('user-menu'));
});

/* home.js
   Restored full-featured homepage logic:
   - Carousel with autoplay/touch/keyboard
   - Search that calls shared.performSearch (if present) and stores query
   - Featured products loaded from shared.getProducts() (Firestore) or fallback
   - Add to cart/wishlist support via shared APIs or localStorage fallback
   - Counts & UI updates
   - Newsletter subscribe wiring
   - DYNAMIC AUTHENTICATION UI
*/

/* ======== Lightweight AmaKart fallback & helpers (if no global AmaKart) ======== */
const AmaKartFallback = (function () {
    function sampleProducts() {
        // A small sample catalog in case Firebase not provided.
        return [
            { id: 'p-101', name: 'Wireless Headphones', title: 'Wireless Headphones', price: 49.99, image: 'https://picsum.photos/seed/p1/800/600', rating: 4.3, category: 'Accessories', isAvailable: true },
            { id: 'p-102', name: 'Smartphone X', title: 'Smartphone X', price: 699.00, image: 'https://picsum.photos/seed/p2/800/600', rating: 4.7, category: 'Phones', isAvailable: true },
            { id: 'p-103', name: 'Running Shoes', title: 'Running Shoes', price: 89.99, image: 'https://picsum.photos/seed/p3/800/600', rating: 4.1, category: 'Footwear', isAvailable: true },
            { id: 'p-104', name: 'Classic Tee', title: 'Classic Tee', price: 19.99, image: 'https://picsum.photos/seed/p4/800/600', rating: 4.0, category: 'Clothing', isAvailable: true },
            { id: 'p-105', name: 'Grocery Pack', title: 'Grocery Pack', price: 29.99, image: 'https://picsum.photos/seed/p5/800/600', rating: 3.9, category: 'Grocery', isAvailable: true },
            { id: 'p-106', name: 'Backpack', title: 'Everyday Backpack', price: 59.99, image: 'https://picsum.photos/seed/p6/800/600', rating: 4.2, category: 'Accessories', isAvailable: true },
            { id: 'p-107', name: 'Smart Watch', title: 'Smart Watch', price: 149.99, image: 'https://picsum.photos/seed/p7/800/600', rating: 4.5, category: 'Accessories', isAvailable: true },
            { id: 'p-108', name: 'Coffee Maker', title: 'Coffee Maker', price: 79.99, image: 'https://picsum.photos/seed/p8/800/600', rating: 4.0, category: 'Home', isAvailable: true }
        ];
    }

    function getCart() {
        try {
            return JSON.parse(localStorage.getItem('ak_cart') || '[]');
        } catch (e) {
            return [];
        }
    }
    function setCart(arr) {
        localStorage.setItem('ak_cart', JSON.stringify(arr));
    }
    function getWishlist() {
        try {
            return JSON.parse(localStorage.getItem('ak_wishlist') || '[]');
        } catch (e) {
            return [];
        }
    }
    function setWishlist(arr) {
        localStorage.setItem('ak_wishlist', JSON.stringify(arr));
    }

    return {
        getProducts: async function () {
            // fallback sync
            return sampleProducts();
        },
        addToCart: async function (productId) {
            const all = sampleProducts();
            const product = all.find(p => p.id === productId) || all[0];
            const cart = getCart();
            cart.push({ id: product.id, qty: 1, title: product.title, price: product.price, image: product.image });
            setCart(cart);
            return { ok: true, cartCount: cart.length };
        },
        addToWishlist: async function (productId) {
            const wish = getWishlist();
            if (!wish.includes(productId)) wish.push(productId);
            setWishlist(wish);
            return { ok: true, wishlistCount: wish.length };
        },
        getCartCount: function () {
            return getCart().length;
        },
        getWishlistCount: function () {
            return getWishlist().length;
        },
        performSearch: function (q) {
            // fallback: do nothing
            console.info('[AmaKartFallback] performSearch', q);
        },
        subscribeNewsletter: async function (email) {
            const s = JSON.parse(localStorage.getItem('ak_news') || '[]');
            if (!s.includes(email)) s.push(email);
            localStorage.setItem('ak_news', JSON.stringify(s));
            return { ok: true };
        }
    };
})();

/* Accessor that prefers window.shared (shared.js) if available */
const SharedAPI = (function () {
    const shared = window.shared || null;
    return {
        getProducts: async function () {
    // Return stored featured products if available
    if (currentFeaturedProducts && currentFeaturedProducts.length > 0) {
        return currentFeaturedProducts;
    }
    if (shared && typeof shared.getProducts === 'function') {
        return await shared.getProducts();
    }
    if (window.AmaKart && typeof window.AmaKart.getSampleProducts === 'function') {
        return window.AmaKart.getSampleProducts();
    }
    return AmaKartFallback.getProducts();
},

        addToCart: async function (productId) {
            if (shared && typeof shared.addToCart === 'function') {
                return await shared.addToCart(productId);
            }
            if (window.AmaKart && typeof window.AmaKart.addToCart === 'function') {
                return await window.AmaKart.addToCart(productId);
            }
            return await AmaKartFallback.addToCart(productId);
        },
        addToWishlist: async function (productId) {
            if (shared && typeof shared.addToWishlist === 'function') {
                return await shared.addToWishlist(productId);
            }
            return await AmaKartFallback.addToWishlist(productId);
        },
        getCartCount: function () {
            if (shared && typeof shared.getCartCount === 'function') return shared.getCartCount();
            if (window.AmaKart && typeof window.AmaKart.getCartItemCount === 'function') return window.AmaKart.getCartItemCount();
            return AmaKartFallback.getCartCount();
        },
        getWishlistCount: function () {
            if (shared && typeof shared.getWishlistCount === 'function') return shared.getWishlistCount();
            if (window.AmaKart && typeof window.AmaKart.getWishlistCount === 'function') return window.AmaKart.getWishlistCount();
            return AmaKartFallback.getWishlistCount();
        },
        performSearch: function (q) {
            if (shared && typeof shared.performSearch === 'function') {
                try { shared.performSearch(q); } catch (e) { console.warn('shared.performSearch error', e); }
            } else {
                AmaKartFallback.performSearch(q);
            }
        },
        subscribeNewsletter: async function (email) {
            if (shared && typeof shared.subscribeNewsletter === 'function') {
                return await shared.subscribeNewsletter(email);
            }
            return await AmaKartFallback.subscribeNewsletter(email);
        }
    };
})();

/* ======== DOM Helpers ======== */
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));
const createEl = (tag, props = {}) => {
    const el = document.createElement(tag);
    Object.entries(props).forEach(([k, v]) => {
        if (k === 'class') el.className = v;
        else if (k === 'html') el.innerHTML = v;
        else el.setAttribute(k, v);
    });
    return el;
};

/* ======== Carousel Logic (touch, keyboard, autoplay) ======== */
let carouselState = {
    currentIndex: 0,
    slideCount: 0,
    autoplayTimer: null,
    autoplayDelay: 5000,
    isPaused: false
};

function initCarousel() {
    const container = $('#carousel-container');
    if (!container) return;
    const slides = $$('.carousel-slide');
    carouselState.slideCount = slides.length;

    // Initialize dots
    const dots = $$('.carousel-dot');
    dots.forEach((dot, idx) => {
        dot.dataset.index = idx;
        dot.addEventListener('click', (e) => {
            e.stopPropagation();
            goToSlide(idx);
        });
    });

    $('#carousel-prev')?.addEventListener('click', () => prevSlide());
    $('#carousel-next')?.addEventListener('click', () => nextSlide());

    // Keyboard
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') prevSlide();
        if (e.key === 'ArrowRight') nextSlide();
    });

    // Touch support
    let startX = 0, currentX = 0, isDown = false;
    container.addEventListener('pointerdown', (e) => {
        isDown = true;
        startX = e.clientX;
        stopAutoplay();
    });
    container.addEventListener('pointermove', (e) => {
        if (!isDown) return;
        currentX = e.clientX;
    });
    container.addEventListener('pointerup', () => {
        isDown = false;
        const delta = currentX - startX;
        if (Math.abs(delta) > 40) {
            if (delta < 0) nextSlide(); else prevSlide();
        }
        startAutoplay();
    });
    container.addEventListener('pointerleave', () => {
        if (isDown) {
            isDown = false;
            startAutoplay();
        }
    });

    // Pause on hover/focus
    container.addEventListener('mouseenter', () => { carouselState.isPaused = true; stopAutoplay(); });
    container.addEventListener('mouseleave', () => { carouselState.isPaused = false; startAutoplay(); });

    // initial render
    renderCarousel();
    startAutoplay();
}

function renderCarousel() {
    const idx = carouselState.currentIndex;
    const container = $('#carousel-container');
    if (!container) return;
    container.style.transform = `translateX(-${idx * 100}%)`;
    $$('.carousel-dot').forEach((d, i) => d.classList.toggle('active', i === idx));
}

function prevSlide() { carouselState.currentIndex = (carouselState.currentIndex - 1 + carouselState.slideCount) % carouselState.slideCount; renderCarousel(); }
function nextSlide() { carouselState.currentIndex = (carouselState.currentIndex + 1) % carouselState.slideCount; renderCarousel(); }
function goToSlide(i) { if (i < 0) i = 0; if (i >= carouselState.slideCount) i = carouselState.slideCount - 1; carouselState.currentIndex = i; renderCarousel(); }

function startAutoplay() {
    stopAutoplay();
    carouselState.autoplayTimer = setInterval(() => {
        if (!carouselState.isPaused) nextSlide();
    }, carouselState.autoplayDelay);
}
function stopAutoplay() {
    if (carouselState.autoplayTimer) { clearInterval(carouselState.autoplayTimer); carouselState.autoplayTimer = null; }
}

/* ======== Featured products rendering & actions ======== */
// Add global variable to store featured products
let currentFeaturedProducts = [];

async function loadFeaturedProducts() {
    const container = $('#featured-products');
    if (!container) return;
    container.innerHTML = `<div class="card animate-pulse" style="padding:1.25rem; text-align:center;">Loading featured products...</div>`;
    
    try {
        // Use AmaKart.getFeaturedProducts from shared.js
        let products = await window.AmaKart.getFeaturedProducts(8);
        
        // If no featured products, get all products and pick random ones
        if (!products || products.length === 0) {
            console.log('No featured products, getting all products');
            products = await window.AmaKart.getAllProducts();
            if (products && products.length > 0) {
                const shuffled = products.slice().sort(() => 0.5 - Math.random());
                products = shuffled.slice(0, 8);
            }
        }

        if (!products || products.length === 0) throw new Error('No products returned');

        // Store products for later use
        currentFeaturedProducts = products;

        container.innerHTML = '';
        products.forEach(p => {
            const card = createProductCard(p);
            container.appendChild(card);
        });

        // Attach events
        container.querySelectorAll('.btn-add-to-cart').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                await handleAddToCart(id, btn);
            });
        });

        container.querySelectorAll('.btn-add-to-wishlist').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                await handleAddToWishlist(id, btn);
            });
        });

    } catch (err) {
        console.error('loadFeaturedProducts error', err);
        container.innerHTML = '<div class="card" style="padding:1.25rem; text-align:center;">Failed to load products. Please refresh the page.</div>';
    }
}

function createProductCard(p) {
    const article = document.createElement('article');
    article.className = 'product-card';
    article.tabIndex = 0;
    article.innerHTML = `
        <div class="product-image-container">
            <img class="product-image" src="${escapeHtml(p.image_url || '')}" alt="${escapeHtml(p.product_name || 'Product')}">
        </div>
        <div class="product-info">
            <div>
                <div class="product-title">${escapeHtml(p.product_name || '')}</div>
                <div class="product-price">$${Number(p.price || 0).toFixed(2)}</div>
            </div>
            <div class="product-cta">
                <button class="btn btn-primary btn-add-to-cart" data-id="${escapeHtml(p.product_id)}">Add to Cart</button>
                <button class="btn btn-outline btn-add-to-wishlist" data-id="${escapeHtml(p.product_id)}">♥</button>
            </div>
        </div>
    `;

    // clicking product -> product page (non-blocking)
article.addEventListener('click', () => {
    window.location.href = `product.html?id=${encodeURIComponent(p.product_id)}`;
});
    return article;
}


async function handleAddToCart(productId, btnEl) {
    try {
        btnEl.disabled = true;
        btnEl.classList.add('loading');
        
        // Get the product from the current featured products array instead of fetching again
        const featuredProducts = await SharedAPI.getProducts();
        const product = featuredProducts.find(p => p.product_id === productId);
        
        if (!product) {
            throw new Error('Product not found');
        }
        
        // Call AmaKart.addToCart with the full product object
        window.AmaKart.addToCart(product);
        
        updateCartUI();
        flashButtonSuccess(btnEl, 'Added');
    } catch (err) {
        console.error('addToCart err', err);
        flashButtonError(btnEl, 'Error');
    } finally {
        btnEl.disabled = false;
        btnEl.classList.remove('loading');
    }
}

async function handleAddToWishlist(productId, btnEl) {
    try {
        btnEl.disabled = true;
        btnEl.classList.add('loading');
        
        // Get the product from the current featured products array instead of fetching again
        const featuredProducts = await SharedAPI.getProducts();
        const product = featuredProducts.find(p => p.product_id === productId);
        
        if (!product) {
            throw new Error('Product not found');
        }
        
        window.AmaKart.addToWishlist(product);
        
        updateWishlistUI();
        flashButtonSuccess(btnEl, 'Saved');
    } catch (err) {
        console.error('addToWishlist err', err);
        flashButtonError(btnEl, 'Error');
    } finally {
        btnEl.disabled = false;
        btnEl.classList.remove('loading');
    }
}

/* Small button feedback helpers */
function flashButtonSuccess(btn, label) {
    const original = btn.innerHTML;
    btn.innerHTML = label;
    setTimeout(() => btn.innerHTML = original, 1000);
}
function flashButtonError(btn, label) {
    const original = btn.innerHTML;
    btn.innerHTML = label;
    setTimeout(() => btn.innerHTML = original, 1200);
}

/* ======== Search ======== */
function bindSearch() {
    const searchBtn = $('#search-btn');
    const searchInput = $('#search-input');

    if (!searchBtn || !searchInput) return;

    const doSearch = () => {
        const q = (searchInput.value || '').trim();
        if (!q) {
            // accessible inline feedback - tiny toast (console fallback)
            console.info('Please enter a search term');
            searchInput.focus();
            return;
        }
        // store query for catalog
        sessionStorage.setItem('searchQuery', q);

        // call shared search pre-warm hook if available
        try {
            SharedAPI.performSearch(q);
        } catch (err) {
            console.warn('performSearch hook failed', err);
        }

        // navigate to catalog
        window.location.href = 'catalog.html';
    };

    searchBtn.addEventListener('click', (e) => { e.preventDefault(); doSearch(); });
    searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); doSearch(); } });
}

/* ======== Counts & UI updates ======== */
function updateCartUI() {
    const el = $('#cart-count');
    if (!el) return;
    try {
        const count = SharedAPI.getCartCount();
        el.textContent = (typeof count === 'number') ? count : 0;
    } catch (err) { el.textContent = 0; }
}
function updateWishlistUI() {
    const el = $('#wishlist-count');
    if (!el) return;
    try {
        const count = SharedAPI.getWishlistCount();
        el.textContent = (typeof count === 'number') ? count : 0;
    } catch (err) { el.textContent = 0; }
}

/* ======== Newsletter ======== */
function bindNewsletter() {
    const btn = $('#newsletter-btn');
    const input = $('#newsletter-email');
    if (!btn || !input) return;
    btn.addEventListener('click', async () => {
        const email = (input.value || '').trim();
        if (!validateEmail(email)) {
            alert('Please enter a valid email address');
            input.focus();
            return;
        }
        btn.disabled = true;
        try {
            await SharedAPI.subscribeNewsletter(email);
            input.value = '';
            // small success feedback
            alert('Thanks — you are subscribed!');
        } catch (err) {
            console.error('newsletter err', err);
            alert('Unable to subscribe. Please try again later.');
        } finally {
            btn.disabled = false;
        }
    });
}

/* ======== Category Buttons ======== */
function bindCategories() {
    $$('.category-card').forEach(btn => {
        btn.addEventListener('click', () => {
            const cat = btn.dataset.category;
            if (cat) {
                sessionStorage.setItem('selectedCategory', cat);
                // navigate to catalog with search parameter
window.location.href = `catalog.html?search=${encodeURIComponent(q)}`;
            }
        });
    });
}

/* ======== Auth UI Logic ======== */
function updateHeaderUI(user) {
    const loginBtn = $('#login-btn');
    const userMenu = $('#user-menu');
    const userMenuBtn = $('#user-menu-btn');

    if (user) {
        loginBtn.style.display = 'none';
        userMenu.style.display = 'block';
        
        const name = user.displayName || user.firstName || user.email?.split('@')[0] || 'User';
        userMenuBtn.textContent = `Hi, ${name}`;
    } else {
        loginBtn.style.display = 'inline-block';
        userMenu.style.display = 'none';
    }
}

function initDropdown() {
    const userMenuBtn = document.getElementById('user-menu-btn');
    const userMenu = document.getElementById('user-menu');
    
    if (!userMenuBtn || !userMenu) {
        console.log('Dropdown elements not found');
        return;
    }
    
    userMenuBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Button clicked');
        userMenu.classList.toggle('show');
    });
    
    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!userMenu.contains(e.target)) {
            userMenu.classList.remove('show');
        }
    });
}

/* ======== Init & DOM ready ======== */
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Wait for AmaKart to be available and set up auth state listener
if (window.AmaKart) {
    // Override the updateUserUI function that shared.js calls
    window.AmaKart.updateUserUI = function(isLoggedIn) {
        const user = window.AmaKart.currentUser;
        updateHeaderUI(user);
    };
    
    // Also call it immediately to set initial state
    const user = window.AmaKart.currentUser;
    updateHeaderUI(user);
} else {
    // Fallback: wait for AmaKart to load
    setTimeout(() => {
        if (window.AmaKart) {
            window.AmaKart.updateUserUI = function(isLoggedIn) {
                const user = window.AmaKart.currentUser;
                updateHeaderUI(user);
            };
            const user = window.AmaKart.currentUser;
            updateHeaderUI(user);
        }
    }, 1000);
}

        initCarousel();
        await loadFeaturedProducts();
        updateCartUI();
        updateWishlistUI();
        bindSearch();
        bindCategories();
        bindNewsletter();

        // cart / wishlist nav handlers
        $('#cart-btn')?.addEventListener('click', () => window.location.href = 'cart.html');
        $('#wishlist-btn')?.addEventListener('click', () => window.location.href = 'wishlist.html');

        // Logout button handler
        $('#logout-btn')?.addEventListener('click', async () => {
            if (window.AmaKart && window.AmaKart.signOutUser) {
                const result = await window.AmaKart.signOutUser();
                if (result.success) {
                    // The onAuthChange listener will handle the UI update
                    window.AmaKart.showAlert?.('Signed out successfully!', 'success');
                } else {
                    window.AmaKart.showAlert?.('Sign out failed. Please try again.', 'error');
                }
            }
        });
        
        // Initialize dropdown
initDropdown();

// Initial UI update on page load  
const user = window.AmaKart?.currentUser;
updateHeaderUI(user);

    } catch (err) {
        console.error('home.js init error', err);
    }
});

/* ======== Utilities ======== */
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function validateEmail(email) {
    if (!email) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* Exported functions useful for debugging / manual interactions */
window.ak = window.ak || {};
window.ak.reloadFeatured = loadFeaturedProducts;
window.ak.addToCart = (id) => SharedAPI.addToCart(id);
window.ak.addToWishlist = (id) => SharedAPI.addToWishlist(id);