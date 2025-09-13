// Orders Page JavaScript

let allOrders = [];
let filteredOrders = [];

document.addEventListener('DOMContentLoaded', function() {
    checkAuthentication();
    loadOrders();
    updateCartUI();
    updateWishlistUI();
});

// Check if user is authenticated
function checkAuthentication() {
    if (!AmaKart.currentUser) {
        AmaKart.showAlert('Please sign in to view your orders', 'warning');
        setTimeout(() => {
            window.location.href = 'signin.html';
        }, 2000);
        return;
    }
}

// Load orders
async function loadOrders() {
    // Load from database if user is logged in
    if (AmaKart.currentUser) {
        const result = await AmaKart.getUserOrders();
        if (result.success) {
            allOrders = result.orders;
        }
    }
    
    // Load from sessionStorage for demo
    const lastOrder = JSON.parse(sessionStorage.getItem('lastOrder') || '{}');
    if (lastOrder.orderId) {
        allOrders = [lastOrder, ...allOrders];
    }
    
    // Add some sample orders for demo
    if (allOrders.length === 0) {
        allOrders = generateSampleOrders();
    }
    
    filteredOrders = [...allOrders];
    displayOrders();
}

// Generate sample orders for demo
function generateSampleOrders() {
    const products = AmaKart.getSampleProducts();
    const statuses = ['confirmed', 'shipped', 'delivered', 'cancelled'];
    
    return [
        {
            orderId: 'AMK' + Date.now() + '001',
            status: 'delivered',
            orderDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            estimatedDelivery: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            items: [products[0], products[1]],
            address: {
                fullName: 'John Doe',
                address: '123 Main St',
                city: 'New York',
                state: 'NY',
                zipCode: '10001',
                phone: '555-0123'
            },
            paymentMethod: 'credit',
            subtotal: 1898,
            shipping: 0,
            tax: 151.84,
            total: 2049.84
        },
        {
            orderId: 'AMK' + Date.now() + '002',
            status: 'shipped',
            orderDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            estimatedDelivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
            items: [products[2], products[3]],
            address: {
                fullName: 'John Doe',
                address: '123 Main St',
                city: 'New York',
                state: 'NY',
                zipCode: '10001',
                phone: '555-0123'
            },
            paymentMethod: 'paypal',
            subtotal: 175,
            shipping: 9.99,
            tax: 14.8,
            total: 199.79
        },
        {
            orderId: 'AMK' + Date.now() + '003',
            status: 'confirmed',
            orderDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            estimatedDelivery: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
            items: [products[4]],
            address: {
                fullName: 'John Doe',
                address: '123 Main St',
                city: 'New York',
                state: 'NY',
                zipCode: '10001',
                phone: '555-0123'
            },
            paymentMethod: 'apple',
            subtotal: 1999,
            shipping: 0,
            tax: 159.92,
            total: 2158.92
        }
    ];
}

// Display orders
function displayOrders() {
    const ordersList = document.getElementById('orders-list');
    
    if (filteredOrders.length === 0) {
        ordersList.innerHTML = '<p class="text-muted text-center">No orders found.</p>';
        return;
    }
    
    ordersList.innerHTML = filteredOrders.map(order => `
        <div class="order-card">
            <div class="order-header">
                <div>
                    <div class="order-id">Order #${order.orderId}</div>
                    <div class="order-date">Placed on ${new Date(order.orderDate).toLocaleDateString()}</div>
                </div>
                <span class="order-status status-${order.status}">${order.status.toUpperCase()}</span>
            </div>
            
            <div class="order-items">
                ${order.items.map(item => `
                    <div class="order-item">
                        <img src="${item.image}" alt="${item.title}" class="order-item-image">
                        <div class="order-item-info">
                            <h4>${item.title}</h4>
                            <p>${item.category} • Quantity: ${item.quantity || 1}</p>
                        </div>
                        <div class="order-item-price">$${item.price.toFixed(2)}</div>
                    </div>
                `).join('')}
            </div>
            
            <div class="order-summary">
                <div class="order-details">
                    <h4>Shipping Address</h4>
                    <p>${order.address.fullName}</p>
                    <p>${order.address.address}</p>
                    <p>${order.address.city}, ${order.address.state} ${order.address.zipCode}</p>
                    <p>Phone: ${order.address.phone}</p>
                </div>
                <div class="order-total">
                    <h3>Order Total</h3>
                    <p>Subtotal: $${order.subtotal.toFixed(2)}</p>
                    <p>Shipping: ${order.shipping === 0 ? 'FREE' : `$${order.shipping.toFixed(2)}`}</p>
                    <p>Tax: $${order.tax.toFixed(2)}</p>
                    <h4>Total: $${order.total.toFixed(2)}</h4>
                </div>
            </div>
            
            <div class="order-timeline">
                <h4>Order Timeline</h4>
                ${generateOrderTimeline(order)}
            </div>
            
            <div class="order-actions">
                <button class="btn btn-primary" onclick="trackOrder('${order.orderId}')">Track Order</button>
                <button class="btn btn-outline" onclick="viewOrderDetails('${order.orderId}')">View Details</button>
                ${order.status === 'delivered' ? '<button class="btn btn-secondary" onclick="reorderItems(\'' + order.orderId + '\')">Reorder</button>' : ''}
                ${order.status === 'confirmed' ? '<button class="btn btn-danger" onclick="cancelOrder(\'' + order.orderId + '\')">Cancel Order</button>' : ''}
            </div>
        </div>
    `).join('');
}

// Generate order timeline
function generateOrderTimeline(order) {
    const timeline = [
        { status: 'confirmed', label: 'Order Confirmed', date: order.orderDate },
        { status: 'shipped', label: 'Order Shipped', date: order.estimatedDelivery },
        { status: 'delivered', label: 'Order Delivered', date: order.estimatedDelivery }
    ];
    
    let currentStatusIndex = 0;
    switch (order.status) {
        case 'confirmed':
            currentStatusIndex = 0;
            break;
        case 'shipped':
            currentStatusIndex = 1;
            break;
        case 'delivered':
            currentStatusIndex = 2;
            break;
        case 'cancelled':
            return '<p class="text-muted">Order was cancelled.</p>';
    }
    
    return timeline.map((item, index) => {
        let dotClass = 'timeline-dot';
        if (index < currentStatusIndex) {
            dotClass += ' completed';
        } else if (index === currentStatusIndex) {
            dotClass += ' active';
        }
        
        return `
            <div class="timeline-item">
                <div class="${dotClass}"></div>
                <div class="timeline-content">
                    <div>${item.label}</div>
                    <div class="timeline-date">${new Date(item.date).toLocaleDateString()}</div>
                </div>
            </div>
        `;
    }).join('');
}

// Filter orders
function filterOrders(status) {
    // Update filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Filter orders
    if (status === 'all') {
        filteredOrders = [...allOrders];
    } else {
        filteredOrders = allOrders.filter(order => order.status === status);
    }
    
    displayOrders();
}

// Track order
function trackOrder(orderId) {
    const order = allOrders.find(o => o.orderId === orderId);
    if (order) {
        AmaKart.showAlert(`Tracking information for order ${orderId}: ${order.status.toUpperCase()}`, 'info');
    }
}

// View order details
function viewOrderDetails(orderId) {
    const order = allOrders.find(o => o.orderId === orderId);
    if (order) {
        // Store order ID for detailed view
        sessionStorage.setItem('viewOrderId', orderId);
        // In a real app, this would open a modal or navigate to a details page
        AmaKart.showAlert(`Order details for ${orderId} would be displayed here.`, 'info');
    }
}

// Reorder items
function reorderItems(orderId) {
    const order = allOrders.find(o => o.orderId === orderId);
    if (order) {
        // Add items to cart
        order.items.forEach(item => {
            AmaKart.addToCart(item);
        });
        AmaKart.showAlert('Items added to cart for reorder!', 'success');
        updateCartUI();
    }
}

// Cancel order
function cancelOrder(orderId) {
    if (!confirm('Are you sure you want to cancel this order?')) {
        return;
    }
    
    const orderIndex = allOrders.findIndex(o => o.orderId === orderId);
    if (orderIndex !== -1) {
        allOrders[orderIndex].status = 'cancelled';
        filteredOrders = [...allOrders];
        displayOrders();
        AmaKart.showAlert('Order cancelled successfully', 'success');
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
window.filterOrders = filterOrders;
window.trackOrder = trackOrder;
window.viewOrderDetails = viewOrderDetails;
window.reorderItems = reorderItems;
window.cancelOrder = cancelOrder;
window.performSearch = performSearch;
