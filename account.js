// Account Page JavaScript

let userOrders = [];
let userAddresses = [];

document.addEventListener('DOMContentLoaded', function() {
    // Wait for Firebase auth state
    AmaKart.onAuthStateChanged(AmaKart.auth, async (user) => {
        AmaKart.currentUser = user;

        if (!user) {
            AmaKart.showAlert('Please sign in to access your account', 'warning');
            setTimeout(() => {
                window.location.href = 'signin.html';
            }, 2000);
            return;
        }

        // User is signed in, load account page
        await loadUserData();
        updateCartUI();
        updateWishlistUI();
        setupForms();
    });
});

// Load user data
async function loadUserData() {
    const userEmail = document.getElementById('user-email');
    if (userEmail) {
        userEmail.textContent = AmaKart.currentUser.email || 'demo@amakart.com';
    }

    await loadUserOrders();
    await loadUserAddresses();
    loadDashboardStats();
    loadRecentOrders();
}

// Load user orders
async function loadUserOrders() {
    if (AmaKart.currentUser && AmaKart.getUserOrders) {
        const result = await AmaKart.getUserOrders();
        if (result.success) {
            userOrders = result.orders;
        }
    }

    // Load from sessionStorage for demo
    const lastOrder = JSON.parse(sessionStorage.getItem('lastOrder') || '{}');
    if (lastOrder.orderId) {
        userOrders = [lastOrder, ...userOrders];
    }

    displayOrders();
}

// Load user addresses
async function loadUserAddresses() {
    if (AmaKart.currentUser && AmaKart.getUserAddresses) {
        const result = await AmaKart.getUserAddresses();
        if (result.success) {
            userAddresses = result.addresses;
        }
    }

    displayAddresses();
}

// Display orders
function displayOrders() {
    const ordersList = document.getElementById('orders-list');
    if (!ordersList) return;

    if (userOrders.length === 0) {
        ordersList.innerHTML = '<p class="text-muted">No orders found.</p>';
        return;
    }

    ordersList.innerHTML = userOrders.map(order => `
        <div class="card mb-3">
            <div class="card-body">
                <div class="d-flex justify-between align-center mb-2">
                    <h4>Order #${order.orderId}</h4>
                    <span class="order-status status-${order.status}">${order.status.toUpperCase()}</span>
                </div>
                <p class="text-muted mb-2">Placed on ${new Date(order.orderDate).toLocaleDateString()}</p>
                <p class="mb-2">Total: $${order.total.toFixed(2)}</p>
                <div class="order-actions">
                    <button class="btn btn-outline btn-sm" onclick="viewOrder('${order.orderId}')">View Details</button>
                    <button class="btn btn-primary btn-sm" onclick="trackOrder('${order.orderId}')">Track Order</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Display addresses
function displayAddresses() {
    const addressesList = document.getElementById('addresses-list');
    if (!addressesList) return;

    if (userAddresses.length === 0) {
        addressesList.innerHTML = '<p class="text-muted">No saved addresses found.</p>';
        return;
    }

    addressesList.innerHTML = userAddresses.map((address, index) => `
        <div class="card mb-3">
            <div class="card-body">
                <h4>${address.fullName}</h4>
                <p>${address.address}</p>
                <p>${address.city}, ${address.state} ${address.zipCode}</p>
                <p>Phone: ${address.phone}</p>
                <div class="d-flex gap-2">
                    <button class="btn btn-outline btn-sm" onclick="editAddress(${index})">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteAddress(${index})">Delete</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Display wishlist items
function displayWishlistItems() {
    const wishlistItems = document.getElementById('wishlist-items');
    if (!wishlistItems) return;

    if (AmaKart.wishlist.length === 0) {
        wishlistItems.innerHTML = '<p class="text-muted">Your wishlist is empty.</p>';
        return;
    }

    wishlistItems.innerHTML = `
        <div class="grid grid-3">
            ${AmaKart.wishlist.map(item => `
                <div class="card product-card">
                    <img src="${item.image}" alt="${item.title}" class="product-image">
                    <div class="product-info">
                        <h3 class="product-title">${item.title}</h3>
                        <div class="product-price">$${item.price}</div>
                        <div class="d-flex gap-2">
                            <button class="btn btn-primary btn-sm" onclick="addToCartFromWishlist(${item.id})">Add to Cart</button>
                            <button class="btn btn-outline btn-sm" onclick="removeFromWishlist(${item.id})">Remove</button>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Load dashboard stats
function loadDashboardStats() {
    document.getElementById('total-orders').textContent = userOrders.length;
    const totalSpent = userOrders.reduce((total, order) => total + order.total, 0);
    document.getElementById('total-spent').textContent = `$${totalSpent.toFixed(2)}`;
    document.getElementById('wishlist-items').textContent = AmaKart.wishlist.length;
    document.getElementById('saved-addresses').textContent = userAddresses.length;
}

// Load recent orders
function loadRecentOrders() {
    const recentOrdersList = document.getElementById('recent-orders-list');
    if (!recentOrdersList) return;

    const recentOrders = userOrders.slice(0, 3);
    if (recentOrders.length === 0) {
        recentOrdersList.innerHTML = '<p class="text-muted">No recent orders.</p>';
        return;
    }

    recentOrdersList.innerHTML = recentOrders.map(order => `
        <div class="order-item">
            <div class="order-image" style="background: #f8f9fa; display: flex; align-items: center; justify-content: center; color: #666;">
                📦
            </div>
            <div class="order-info">
                <h4>Order #${order.orderId}</h4>
                <p>${new Date(order.orderDate).toLocaleDateString()} • $${order.total.toFixed(2)}</p>
            </div>
            <span class="order-status status-${order.status}">${order.status.toUpperCase()}</span>
            <div class="order-actions">
                <button class="btn btn-outline btn-sm" onclick="viewOrder('${order.orderId}')">View</button>
            </div>
        </div>
    `).join('');
}

// Show section
function showSection(sectionName) {
    document.querySelectorAll('.account-section').forEach(section => section.style.display = 'none');
    document.querySelectorAll('.account-nav a').forEach(link => link.classList.remove('active'));

    const targetSection = document.getElementById(sectionName + '-section');
    if (targetSection) targetSection.style.display = 'block';

    const activeLink = document.querySelector(`[onclick="showSection('${sectionName}')"]`);
    if (activeLink) activeLink.classList.add('active');

    if (sectionName === 'wishlist') displayWishlistItems();
}

// Setup forms
function setupForms() {
    const settingsForm = document.getElementById('account-settings-form');
    if (settingsForm) {
        settingsForm.addEventListener('submit', e => {
            e.preventDefault();
            AmaKart.showAlert('Settings updated successfully!', 'success');
        });
    }

    const passwordForm = document.getElementById('change-password-form');
    if (passwordForm) {
        passwordForm.addEventListener('submit', e => {
            e.preventDefault();
            const formData = new FormData(passwordForm);
            const currentPassword = formData.get('currentPassword');
            const newPassword = formData.get('newPassword');
            const confirmPassword = formData.get('confirmPassword');

            if (newPassword !== confirmPassword) {
                AmaKart.showAlert('New passwords do not match', 'danger');
                return;
            }

            if (newPassword.length < 8) {
                AmaKart.showAlert('Password must be at least 8 characters long', 'danger');
                return;
            }

            AmaKart.showAlert('Password changed successfully!', 'success');
            passwordForm.reset();
        });
    }
}

// Add/edit/delete address, view/track order, wishlist/cart functions remain same
window.showSection = showSection;
window.addNewAddress = () => window.location.href = 'addresses.html';
window.editAddress = (index) => window.location.href = 'addresses.html?edit=' + index;
window.deleteAddress = async (index) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    userAddresses.splice(index, 1);
    displayAddresses();
    loadDashboardStats();
    AmaKart.showAlert('Address deleted successfully', 'success');
};
window.viewOrder = (orderId) => {
    sessionStorage.setItem('viewOrderId', orderId);
    window.location.href = 'orders.html';
};
window.trackOrder = (orderId) => AmaKart.showAlert(`Tracking info for order ${orderId}`, 'info');
window.addToCartFromWishlist = (productId) => {
    const product = AmaKart.wishlist.find(item => item.id === productId);
    if (product) {
        AmaKart.addToCart(product);
        AmaKart.showAlert('Product added to cart!', 'success');
        updateCartUI();
    }
};
window.removeFromWishlist = (productId) => {
    AmaKart.removeFromWishlist(productId);
    displayWishlistItems();
    updateWishlistUI();
    loadDashboardStats();
    AmaKart.showAlert('Product removed from wishlist', 'success');
};
window.performSearch = () => {
    const query = document.getElementById('search-input')?.value.trim();
    if (query) {
        sessionStorage.setItem('searchQuery', query);
        window.location.href = 'catalog.html';
    }
};

// UI updates
function updateCartUI() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) cartCount.textContent = AmaKart.getCartItemCount();
}
function updateWishlistUI() {
    const wishlistCount = document.getElementById('wishlist-count');
    if (wishlistCount) wishlistCount.textContent = AmaKart.wishlist.length;
}
