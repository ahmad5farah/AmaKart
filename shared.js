// AmaKart - Shared JavaScript Functions and Firebase Configuration
// The central hub for all core website functionality and Firebase integration.
// It exposes a global 'window.AmaKart' object for other scripts to use.

// Import Firebase SDKs from CDN (browser-compatible)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
    getFirestore,
    collection,
    addDoc,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ✅ CRITICAL: Define and expose the global AmaKart object immediately
window.AmaKart = window.AmaKart || {};

// ✅ Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyD-ZeUiuD_laxz-50Kc5vOm-YafSoVHiYQ",
    authDomain: "amakart-demo.firebaseapp.com",
    projectId: "amakart-demo",
    storageBucket: "amakart-demo.firebasestorage.app",
    messagingSenderId: "481039794482",
    appId: "1:481039794482:web:ee73c35d47383fe133572b",
    measurementId: "G-7JBDL6X9F4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// Global variables
let currentUser = null;
let cart = [];
let wishlist = [];
let loginAttempts = 0;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
let lockoutUntil = 0;

// =======================
// Authentication State Listener
// =======================
onAuthStateChanged(auth, (user) => {
    currentUser = user;
    console.log('AUTH STATE CHANGED:', user ? 'signed in' : 'signed out', user);
    
    // Call home.js update function if it exists
    if (window.updateHeaderUI && typeof window.updateHeaderUI === 'function') {
        window.updateHeaderUI(user);
    } else {
        // Fallback to default UI update
        updateUserUI(!!user);
    }
});

function updateUserUI(isLoggedIn) {
    console.log('DEFAULT updateUserUI called:', isLoggedIn);
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const userMenu = document.getElementById('user-menu');
    
    if (loginBtn) loginBtn.style.display = isLoggedIn ? 'none' : 'block';
    if (logoutBtn) logoutBtn.style.display = isLoggedIn ? 'block' : 'none';
    if (userMenu) userMenu.style.display = isLoggedIn ? 'block' : 'none';
}

// Cache for products to reduce Firebase calls
let productCache = new Map();
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Initialize cart and wishlist from localStorage with validation
function initializeStorage() {
    try {
        const storedCart = localStorage.getItem('amakart_cart');
        const storedWishlist = localStorage.getItem('amakart_wishlist');
        
        if (storedCart && isValidJSON(storedCart)) {
            cart = JSON.parse(storedCart);
            // Validate cart structure
            cart = cart.filter(item =>
                item && typeof item === 'object' &&
                item.id && item.price && typeof item.quantity === 'number'
            );
        }
        
        if (storedWishlist && isValidJSON(storedWishlist)) {
            wishlist = JSON.parse(storedWishlist);
            // Validate wishlist structure
            wishlist = wishlist.filter(item =>
                item && typeof item === 'object' && item.id
            );
        }
    } catch (error) {
        console.warn('Storage initialization error, resetting:', error);
        cart = [];
        wishlist = [];
        localStorage.removeItem('amakart_cart');
        localStorage.removeItem('amakart_wishlist');
    }
}

// =======================
// Firebase Product Functions
// =======================

// Get all products with pagination and caching
async function getAllProducts(pageSize = 50) {
    try {
        // Check cache first
        if (productCache.has('all_products') &&
            Date.now() - cacheTimestamp < CACHE_DURATION) {
            return productCache.get('all_products');
        }
        const productsRef = collection(db, 'products');
        const q = query(productsRef, orderBy('created_date', 'desc'), limit(pageSize));
        const querySnapshot = await getDocs(q);
        const products = [];
        querySnapshot.forEach((doc) => {
            products.push({
                id: doc.id,
                ...doc.data(),
                title: doc.data().product_name || doc.data().title,
                image: doc.data().image_url || doc.data().image
            });
        });
        // Cache the results
        productCache.set('all_products', products);
        cacheTimestamp = Date.now();
        return products;
    } catch (error) {
        console.error('Error fetching all products:', error);
        throw new Error('Failed to load products. Please try again.');
    }
}

// Get products by category
async function getProductsByCategory(category) {
    try {
        const cacheKey = `category_${category}`;
        if (productCache.has(cacheKey) &&
            Date.now() - cacheTimestamp < CACHE_DURATION) {
            return productCache.get(cacheKey);
        }
        const productsRef = collection(db, 'products');
        const q = query(
            productsRef,
            where('category', '==', category),
            orderBy('created_date', 'desc'),
            limit(100)
        );
        const querySnapshot = await getDocs(q);
        const products = [];
        querySnapshot.forEach((doc) => {
            products.push({
                id: doc.id,
                ...doc.data(),
                title: doc.data().product_name || doc.data().title,
                image: doc.data().image_url || doc.data().image
            });
        });
        // Cache the results
        productCache.set(cacheKey, products);
        cacheTimestamp = Date.now();
        return products;
    } catch (error) {
        console.error('Error fetching products by category:', error);
        throw new Error(`Failed to load ${category} products. Please try again.`);
    }
}

// Search products using search_tags
async function searchProducts(searchQuery) {
    try {
        if (!searchQuery || searchQuery.trim() === '') {
            return [];
        }
        const cacheKey = `search_${searchQuery.toLowerCase()}`;
        if (productCache.has(cacheKey) &&
            Date.now() - cacheTimestamp < CACHE_DURATION) {
            return productCache.get(cacheKey);
        }
        const searchTerms = searchQuery.toLowerCase()
            .trim()
            .split(/\s+/)
            .filter(term => term.length >= 2)
            .slice(0, 10);
        if (searchTerms.length === 0) {
            return [];
        }
        const productsRef = collection(db, 'products');
        const q = query(
            productsRef,
            where('search_tags', 'array-contains-any', searchTerms),
            limit(100)
        );
        const querySnapshot = await getDocs(q);
        const results = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const searchTags = data.search_tags || [];
            const matchingTerms = searchTerms.filter(term =>
                searchTags.some(tag => tag.includes(term))
            );
            const relevanceScore = matchingTerms.length / searchTerms.length;
            results.push({
                id: doc.id,
                ...data,
                id: data.product_id || doc.id,
                title: data.product_name || data.title,
                image: data.image_url || data.image,
                relevanceScore
            });
        });
        results.sort((a, b) => b.relevanceScore - a.relevanceScore);
        productCache.set(cacheKey, results);
        cacheTimestamp = Date.now();
        return results;
    } catch (error) {
        console.error('Search error:', error);
        throw new Error('Search failed. Please try again.');
    }
}

// Get single product by ID
async function getProductById(productId) {
    try {
        const cacheKey = `product_${productId}`;
        if (productCache.has(cacheKey) &&
            Date.now() - cacheTimestamp < CACHE_DURATION) {
            return productCache.get(cacheKey);
        }
        let docRef = doc(db, 'products', productId);
        let docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
            const productsRef = collection(db, 'products');
            const q = query(productsRef, where('product_id', '==', productId), limit(1));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                docSnap = querySnapshot.docs[0];
            }
        }
        if (docSnap.exists()) {
            const product = {
                id: docSnap.id,
                ...docSnap.data(),
                id: docSnap.data().product_id || docSnap.id,
                title: docSnap.data().product_name || docSnap.data().title,
                image: docSnap.data().image_url || docSnap.data().image
            };
            productCache.set(cacheKey, product);
            cacheTimestamp = Date.now();
            return product;
        } else {
            throw new Error('Product not found');
        }
    } catch (error) {
        console.error('Error fetching product:', error);
        throw new Error('Failed to load product. Please try again.');
    }
}

// Get featured products
async function getFeaturedProducts(limit_count = 20) {
    try {
        const cacheKey = `featured_products_${limit_count}`;
        if (productCache.has(cacheKey) &&
            Date.now() - cacheTimestamp < CACHE_DURATION) {
            return productCache.get(cacheKey);
        }
        const productsRef = collection(db, 'products');
        const q = query(
            productsRef,
            where('is_featured', '==', true),
            orderBy('rating', 'desc'),
            limit(limit_count)
        );
        const querySnapshot = await getDocs(q);
        const products = [];
        querySnapshot.forEach((doc) => {
            products.push({
                id: doc.id,
                ...doc.data(),
                title: doc.data().product_name || doc.data().title,
                image: doc.data().image_url || doc.data().image
            });
        });
        productCache.set(cacheKey, products);
        cacheTimestamp = Date.now();
        return products;
    } catch (error) {
        console.error('Error fetching featured products:', error);
        return [];
    }
}

// Get categories (optimized to avoid loading all products)
async function getProductCategories() {
    try {
        const cacheKey = 'product_categories';
        if (productCache.has(cacheKey) &&
            Date.now() - cacheTimestamp < CACHE_DURATION) {
            return productCache.get(cacheKey);
        }
        const productsRef = collection(db, 'products');
        const q = query(productsRef, limit(500));
        const querySnapshot = await getDocs(q);
        const categories = new Set();
        querySnapshot.forEach((doc) => {
            const category = doc.data().category;
            if (category) {
                categories.add(category);
            }
        });
        const categoryArray = Array.from(categories).sort();
        productCache.set(cacheKey, categoryArray);
        cacheTimestamp = Date.now();
        return categoryArray;
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
}

// Clear product cache (useful for admin updates)
function clearProductCache() {
    productCache.clear();
    cacheTimestamp = 0;
}

// =======================
// Enhanced Security Functions
// =======================
function isValidJSON(str) {
    try {
        JSON.parse(str);
        return true;
    } catch {
        return false;
    }
}

function sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    return input.trim().replace(/[<>]/g, '');
}

function isValidEmail(email) {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email) && email.length <= 254;
}

function checkPasswordStrength(password) {
    if (!password) return { isValid: false, strength: "Invalid", details: {} };
    const lengthCheck = password.length >= 12;
    const uppercaseCheck = /[A-Z]/.test(password);
    const lowercaseCheck = /[a-z]/.test(password);
    const numberCheck = /[0-9]/.test(password);
    const specialCharCheck = /[!@#$%^&*(),.?":{}|<>[\]\\\/~`+=_-]/.test(password);
    const noCommonPatterns = !/(.)\1{2,}/.test(password) &&
                             !/123|abc|qwe|password|admin/i.test(password);
    const passedCriteria = [
        lengthCheck,
        uppercaseCheck,
        lowercaseCheck,
        numberCheck,
        specialCharCheck,
        noCommonPatterns
    ].filter(Boolean).length;
    let strength = "Very Weak";
    if (passedCriteria === 2) strength = "Weak";
    else if (passedCriteria === 3) strength = "Fair";
    else if (passedCriteria === 4) strength = "Good";
    else if (passedCriteria === 5) strength = "Strong";
    else if (passedCriteria === 6) strength = "Very Strong";
    const isValid = passedCriteria === 6;
    return {
        isValid,
        strength,
        details: {
            lengthCheck,
            uppercaseCheck,
            lowercaseCheck,
            numberCheck,
            specialCharCheck,
            noCommonPatterns
        }
    };
}

function isValidPassword(password) {
    return checkPasswordStrength(password).isValid;
}

function generateSecureHash(data) {
    const timestamp = Date.now().toString();
    const combined = JSON.stringify(data) + timestamp;
    return btoa(combined).slice(0, 32);
}

function checkRateLimit() {
    const now = Date.now();
    if (lockoutUntil > now) {
        const remainingTime = Math.ceil((lockoutUntil - now) / 1000 / 60);
        throw new Error(`Too many failed attempts. Try again in ${remainingTime} minutes.`);
    }
    return true;
}

function handleFailedLogin() {
    loginAttempts++;
    if (loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        lockoutUntil = Date.now() + LOCKOUT_DURATION;
        loginAttempts = 0;
        throw new Error(`Account temporarily locked due to too many failed attempts. Try again in 15 minutes.`);
    }
}

function resetLoginAttempts() {
    loginAttempts = 0;
    lockoutUntil = 0;
}

// =======================
// Enhanced Authentication Functions
// =======================
async function registerUser(email, password, userData) {
    try {
        email = sanitizeInput(email);
        if (!isValidEmail(email)) throw new Error('Please enter a valid email address');
        const passCheck = checkPasswordStrength(password);
        if (!passCheck.isValid) {
            const failed = [];
            if (!passCheck.details.lengthCheck) failed.push("at least 8 characters");
            if (!passCheck.details.uppercaseCheck) failed.push("an uppercase letter");
            if (!passCheck.details.lowercaseCheck) failed.push("a lowercase letter");
            if (!passCheck.details.numberCheck) failed.push("a number");
            if (!passCheck.details.specialCharCheck) failed.push("a special character");
            if (!passCheck.details.noCommonPatterns) failed.push("no common patterns or repeated characters");
            throw new Error('Password must contain: ' + failed.join(", "));
        }
        const sanitizedUserData = {};
        for (const [key, value] of Object.entries(userData)) {
            sanitizedUserData[key] = sanitizeInput(value);
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const secureUserData = {
            ...sanitizedUserData,
            email: user.email,
            uid: user.uid,
            createdAt: serverTimestamp(),
            dataIntegrity: generateSecureHash(sanitizedUserData),
            securityVersion: "2.0"
        };
        await addDoc(collection(db, 'users'), secureUserData);
        resetLoginAttempts();
        return { success: true, user };
    } catch (error) {
        console.error('Registration error:', error);
        return { success: false, error: error.message };
    }
}

async function signInUser(email, password) {
    try {
        checkRateLimit();
        email = sanitizeInput(email);
        if (!isValidEmail(email) || !password) {
            handleFailedLogin();
            throw new Error('Invalid email or password');
        }
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        resetLoginAttempts();
        console.log('User signed in:', user.uid);
        return { success: true, user };
    } catch (error) {
        if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
            handleFailedLogin();
        }
        console.error('Sign in error:', error);
        return { success: false, error: error.message };
    }
}

async function signOutUser() {
    try {
        await signOut(auth);
        localStorage.removeItem('amakart_cart');
        localStorage.removeItem('amakart_wishlist');
        cart = [];
        wishlist = [];
        resetLoginAttempts();
        clearProductCache();
        return { success: true };
    } catch (error) {
        console.error('Sign out error:', error);
        return { success: false, error: error.message };
    }
}

async function changePassword(currentPassword, newPassword) {
    try {
        if (!currentUser) throw new Error('User not authenticated');
        const passCheck = checkPasswordStrength(newPassword);
        if (!passCheck.isValid) {
            const failed = [];
            if (!passCheck.details.lengthCheck) failed.push("at least 12 characters");
            if (!passCheck.details.uppercaseCheck) failed.push("an uppercase letter");
            if (!passCheck.details.lowercaseCheck) failed.push("a lowercase letter");
            if (!passCheck.details.numberCheck) failed.push("a number");
            if (!passCheck.details.specialCharCheck) failed.push("a special character");
            if (!passCheck.details.noCommonPatterns) failed.push("no common patterns or repeated characters");
            throw new Error('New password must contain: ' + failed.join(", "));
        }
        const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
        await reauthenticateWithCredential(currentUser, credential);
        await updatePassword(currentUser, newPassword);
        return { success: true };
    } catch (error) {
        console.error('Password change error:', error);
        return { success: false, error: error.message };
    }
}

// =======================
// Enhanced Cart Management
// =======================
function validateProduct(product) {
    return product &&
           typeof product === 'object' &&
           (product.id || product.product_id) &&
           typeof product.price === 'number' &&
           product.price > 0 &&
           (product.title || product.product_name) &&
           typeof (product.title || product.product_name) === 'string';
}

function addToCart(product) {
    if (!validateProduct(product)) {
        throw new Error('Invalid product data');
    }
    const sanitizedProduct = {
        id: product.product_id || product.id,
        title: sanitizeInput(product.product_name || product.title),
        price: Math.max(0, parseFloat(product.price)),
        category: sanitizeInput(product.category || ''),
        image: sanitizeInput(product.image_url || product.image || ''),
        description: sanitizeInput(product.description || '')
    };
    const existingItem = cart.find(item => item.id === sanitizedProduct.id);
    if (existingItem) {
        existingItem.quantity = Math.min(existingItem.quantity + 1, 99);
    } else {
        cart.push({ ...sanitizedProduct, quantity: 1 });
    }
    secureSetStorage('amakart_cart', cart);
    updateCartUI();
}

function removeFromCart(productId) {
    if (!productId) return;
    cart = cart.filter(item => item.id !== productId);
    secureSetStorage('amakart_cart', cart);
    updateCartUI();
}

function updateCartQuantity(productId, quantity) {
    if (!productId || typeof quantity !== 'number') return;
    const item = cart.find(item => item.id === productId);
    if (item) {
        if (quantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = Math.min(Math.max(1, parseInt(quantity)), 99);
            secureSetStorage('amakart_cart', cart);
        }
    }
    updateCartUI();
}

function getCartTotal() {
    return cart.reduce((total, item) => {
        const price = parseFloat(item.price) || 0;
        const quantity = parseInt(item.quantity) || 0;
        return total + (price * quantity);
    }, 0);
}

function getCartItemCount() {
    return cart.reduce((total, item) => total + (parseInt(item.quantity) || 0), 0);
}

// =======================
// Enhanced Wishlist Management
// =======================
function addToWishlist(product) {
    if (!validateProduct(product)) {
        throw new Error('Invalid product data');
    }
    const sanitizedProduct = {
        id: product.product_id || product.id,
        title: sanitizeInput(product.product_name || product.title),
        price: Math.max(0, parseFloat(product.price)),
        category: sanitizeInput(product.category || ''),
        image: sanitizeInput(product.image_url || product.image || ''),
        description: sanitizeInput(product.description || '')
    };
    if (!wishlist.find(item => item.id === sanitizedProduct.id)) {
        wishlist.push(sanitizedProduct);
        secureSetStorage('amakart_wishlist', wishlist);
        updateWishlistUI();
    }
}

function removeFromWishlist(productId) {
    if (!productId) return;
    wishlist = wishlist.filter(item => item.id !== productId);
    secureSetStorage('amakart_wishlist', wishlist);
    updateWishlistUI();
}

// =======================
// Secure Storage Functions
// =======================
function secureSetStorage(key, data) {
    try {
        const jsonString = JSON.stringify(data);
        localStorage.setItem(key, jsonString);
    } catch (error) {
        console.error('Storage error:', error);
        showAlert('Unable to save data. Please check your browser settings.', 'error');
    }
}

// =======================
// UI Update Functions
// =======================
function updateCartUI() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        const count = getCartItemCount();
        cartCount.textContent = count > 99 ? '99+' : count.toString();
        count > 0 ? cartCount.classList.add('show') : cartCount.classList.remove('show');
    }
}

function updateWishlistUI() {
    const wishlistCount = document.getElementById('wishlist-count');
    if (wishlistCount) {
        const count = wishlist.length;
        wishlistCount.textContent = count > 99 ? '99+' : count.toString();
        count > 0 ? wishlistCount.classList.add('show') : wishlistCount.classList.remove('show');
    }
}

// =======================
// Dark Mode Toggle
// =======================
function toggleDarkMode() {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('amakart_darkmode', isDark ? 'enabled' : 'disabled');
}

// Initialize dark mode on load
(function () {
    const darkPref = localStorage.getItem('amakart_darkmode');
    if (darkPref === 'enabled') {
        document.body.classList.add('dark-mode');
    }
})();

// =======================
// Search Redirect Handler
// =======================
function performSearch() {
    const input = document.getElementById('search-input');
    if (!input) return;
    const query = input.value.trim();
    if (query) {
        sessionStorage.setItem('amakart_search_query', query);
        window.location.href = 'catalog.html';
    }
}

// =======================
// Initialization
// =======================
document.addEventListener('DOMContentLoaded', () => {
    initializeStorage();
    updateCartUI();
    updateWishlistUI();
});

// ✅ FINAL EXPORT: EXPOSE ALL FUNCTIONS TO THE AmaKart GLOBAL OBJECT
window.AmaKart = {
    getAllProducts,
    getProductsByCategory,
    searchProducts,
    getProductById,
    getFeaturedProducts,
    getProductCategories,
    clearProductCache,
    isValidJSON,
    sanitizeInput,
    isValidEmail,
    checkPasswordStrength,
    isValidPassword,
    generateSecureHash,
    checkRateLimit,
    handleFailedLogin,
    resetLoginAttempts,
    registerUser,
    signInUser,
    signOutUser,
    changePassword,
    validateProduct,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    getCartTotal,
    getCartItemCount,
    addToWishlist,
    removeFromWishlist,
    secureSetStorage,
    updateCartUI,
    updateWishlistUI,
    toggleDarkMode,
    performSearch,
    // Utility functions needed for validation and UI feedback
    validateForm(formData, requiredFields, isLogin = false) {
        const errors = {};
        let isValid = true;
        for (const field of requiredFields) {
            const value = formData[field]?.trim();
            if (!value) {
                errors[field] = 'This field is required.';
                isValid = false;
            } else if (field === 'email' && !this.isValidEmail(value)) {
                errors[field] = 'Please enter a valid email address.';
                isValid = false;
            } else if (field === 'password' && !isLogin && !this.checkPasswordStrength(value).isValid) {
                // ✅ CRITICAL FIX: This check is now skipped for the login form.
                errors[field] = 'Password is not strong enough.';
                isValid = false;
            }
        }
        return { isValid, errors };
    },
    showLoading: (buttonId) => {
        const btn = document.getElementById(buttonId);
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = `<span class="spinner"></span> Loading...`;
        }
    },
    hideLoading: (buttonId, originalText) => {
        const btn = document.getElementById(buttonId);
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    },
    showAlert: (message, type) => {
        const alertContainer = document.querySelector('.alert-container') || document.body;
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;
        alertContainer.prepend(alert);
        setTimeout(() => alert.remove(), 3000);
    },
    clearAllValidationErrors: () => {
        const errorMessages = document.querySelectorAll('.validation-error-message');
        errorMessages.forEach(error => error.remove());
        const invalidInputs = document.querySelectorAll('.is-invalid');
        invalidInputs.forEach(input => {
            input.classList.remove('is-invalid');
            input.style.borderColor = '';
        });
    },
    // Add these new properties:
    get currentUser() { return currentUser; },
    getCurrentUser: () => currentUser,
    get cart() { return [...cart]; },
    get wishlist() { return [...wishlist]; }
};