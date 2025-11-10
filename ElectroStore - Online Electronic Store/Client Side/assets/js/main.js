// ElectroStore - Shared JavaScript Utilities
// This file contains all common functions used across the website

// ==================== UTILITY FUNCTIONS ====================

// Show notifications to users
function showNotification(message, type = 'info') {
    // Remove any existing notification
    const existingNotification = document.querySelector('.custom-notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `custom-notification alert alert-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'info'} alert-dismissible fade show`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    notification.innerHTML = `
        <strong>${type === 'error' ? 'Error!' : type === 'success' ? 'Success!' : 'Info:'}</strong> ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification && notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Validate email format
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate phone number (Indian format)
function validatePhone(phone) {
    const phoneRegex = /^[6-9][0-9]{9}$/;
    return phoneRegex.test(phone.replace(/[\s-]/g, ''));
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
}

// ==================== USER SESSION MANAGEMENT ====================

// Get current logged-in user
function getCurrentUser() {
    try {
        const currentUser = sessionStorage.getItem('electrostore_current_user');
        return currentUser ? JSON.parse(currentUser) : null;
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
}

// Check if user is logged in
function isLoggedIn() {
    return getCurrentUser() !== null;
}

// Logout user
function logoutUser() {
    try {
        sessionStorage.removeItem('electrostore_current_user');
        showNotification('Logged out successfully!', 'success');
        
        // Update UI elements
        updateUserInterface();
        
        // Redirect to login page after a short delay
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        
        return true;
    } catch (error) {
        console.error('Logout error:', error);
        showNotification('Error during logout', 'error');
        return false;
    }
}

// Update UI based on login status
function updateUserInterface() {
    const currentUser = getCurrentUser();
    const authLinks = document.querySelectorAll('.auth-links');
    const userGreeting = document.querySelector('.user-greeting');
    
    if (currentUser) {
        // User is logged in
        authLinks.forEach(link => {
            if (link.querySelector('a[href="login.html"]')) {
                link.innerHTML = `
                    <div class="dropdown">
                        <button class="btn btn-outline-primary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">
                            <i class="fas fa-user me-1"></i>${currentUser.firstName}
                        </button>
                        <ul class="dropdown-menu">
                            <li><a class="dropdown-item" href="orders.html"><i class="fas fa-shopping-bag me-2"></i>My Orders</a></li>
                            <li><a class="dropdown-item" href="#" onclick="logoutUser()"><i class="fas fa-sign-out-alt me-2"></i>Logout</a></li>
                        </ul>
                    </div>
                `;
            }
        });
        
        // Add user greeting if there's a place for it
        if (userGreeting) {
            userGreeting.innerHTML = `Welcome back, ${currentUser.firstName}!`;
        }
    } else {
        // User is not logged in - restore login links
        authLinks.forEach(link => {
            if (link.innerHTML.includes('dropdown')) {
                link.innerHTML = '<a href="login.html" class="btn btn-outline-primary btn-sm">Login</a>';
            }
        });
        
        if (userGreeting) {
            userGreeting.innerHTML = '';
        }
    }
}

// Get all registered users (for admin purposes)
function getAllUsers() {
    try {
        const users = localStorage.getItem('electrostore_users');
        return users ? JSON.parse(users) : [];
    } catch (error) {
        console.error('Error getting users:', error);
        return [];
    }
}

// Find user by email
function findUserByEmail(email) {
    const users = getAllUsers();
    return users.find(user => user.email.toLowerCase() === email.toLowerCase()) || null;
}

// ==================== SEARCH FUNCTIONALITY ====================

function searchProducts(query) {
    if (!query.trim()) {
        showNotification('Please enter a search term', 'error');
        return;
    }
    
    showNotification(`Searching for "${query}"... Search functionality will be enhanced soon!`, 'info');
    // In a real application, this would filter products or redirect to search results
}

// ==================== CART FUNCTIONALITY ====================

// Cart storage key
const CART_STORAGE_KEY = 'electrostore_cart';

// Get cart from localStorage
function getCart() {
    try {
        const cart = localStorage.getItem(CART_STORAGE_KEY);
        return cart ? JSON.parse(cart) : [];
    } catch (error) {
        console.error('Error getting cart:', error);
        return [];
    }
}

// Save cart to localStorage
function saveCart(cart) {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
        updateCartCounter();
        return true;
    } catch (error) {
        console.error('Error saving cart:', error);
        showNotification('Error saving to cart. Please try again.', 'error');
        return false;
    }
}

// Add item to cart
function addToCart(name, price, image = '', id = null) {
    const cart = getCart();
    
    // Generate ID if not provided
    const itemId = id || name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    // Check if item already exists
    const existingItemIndex = cart.findIndex(item => item.id === itemId);
    
    if (existingItemIndex > -1) {
        // Update quantity
        cart[existingItemIndex].quantity += 1;
        showNotification(`Updated quantity of ${name} in cart`, 'success');
    } else {
        // Add new item
        cart.push({
            id: itemId,
            name: name,
            price: price,
            image: image,
            quantity: 1,
            addedAt: new Date().toISOString()
        });
        showNotification(`${name} added to cart`, 'success');
    }
    
    saveCart(cart);
}

// Remove item from cart
function removeFromCart(itemId) {
    const cart = getCart();
    const updatedCart = cart.filter(item => item.id !== itemId);
    
    if (cart.length !== updatedCart.length) {
        saveCart(updatedCart);
        showNotification('Item removed from cart', 'success');
        
        // Refresh cart display if on cart page
        if (typeof displayCartItems === 'function') {
            displayCartItems();
        }
    }
}

// Update item quantity
function updateQuantity(itemId, newQuantity) {
    const cart = getCart();
    const itemIndex = cart.findIndex(item => item.id === itemId);
    
    if (itemIndex > -1) {
        if (newQuantity <= 0) {
            removeFromCart(itemId);
        } else {
            cart[itemIndex].quantity = parseInt(newQuantity);
            saveCart(cart);
            
            // Refresh cart display if on cart page
            if (typeof displayCartItems === 'function') {
                displayCartItems();
            }
        }
    }
}

// Clear entire cart
function clearCart() {
    if (confirm('Are you sure you want to clear your cart?')) {
        localStorage.removeItem(CART_STORAGE_KEY);
        updateCartCounter();
        showNotification('Cart cleared successfully', 'success');
        
        // Refresh cart display if on cart page
        if (typeof displayCartItems === 'function') {
            displayCartItems();
        }
    }
}

// Get cart total
function getCartTotal() {
    const cart = getCart();
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Get cart item count
function getCartItemCount() {
    const cart = getCart();
    return cart.reduce((total, item) => total + item.quantity, 0);
}

// Update cart counter in navigation
function updateCartCounter() {
    const cartCounters = document.querySelectorAll('.cart-count');
    const itemCount = getCartItemCount();
    
    cartCounters.forEach(counter => {
        counter.textContent = itemCount;
        counter.style.display = itemCount > 0 ? 'inline' : 'none';
    });
    
    // Update cart item count on cart page
    const cartItemCountElement = document.getElementById('cart-item-count');
    if (cartItemCountElement) {
        cartItemCountElement.textContent = itemCount;
    }
}

// ==================== FORM VALIDATION ====================

// Contact form validation
function validateContactForm(formData) {
    const errors = [];
    
    // Name validation
    if (!formData.name || formData.name.trim().length < 2) {
        errors.push('Name must be at least 2 characters long');
    }
    
    // Email validation
    if (!formData.email || !validateEmail(formData.email)) {
        errors.push('Please enter a valid email address');
    }
    
    // Phone validation (optional but if provided, must be valid)
    if (formData.phone && !validatePhone(formData.phone)) {
        errors.push('Please enter a valid 10-digit Indian phone number');
    }
    
    // Subject validation
    if (!formData.subject) {
        errors.push('Please select a subject');
    }
    
    // Message validation
    if (!formData.message || formData.message.trim().length < 10) {
        errors.push('Message must be at least 10 characters long');
    }
    
    return errors;
}

// Enhanced contact form handler
function handleContactForm(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    // Get form data
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        subject: formData.get('subject'),
        message: formData.get('message')
    };
    
    // Validate form
    const errors = validateContactForm(data);
    
    if (errors.length > 0) {
        showNotification(errors.join('<br>'), 'error');
        return;
    }
    
    // Show loading state
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Sending...';
    submitButton.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        // Reset form
        form.reset();
        
        // Reset button
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
        
        // Show success message
        showNotification('Thank you for contacting us! We will get back to you within 24 hours.', 'success');
        
        // In a real application, you would send the data to a server
        console.log('Contact form submitted:', data);
    }, 2000);
}

// Real-time form validation
function setupRealTimeValidation() {
    // Name field validation
    const nameField = document.getElementById('name');
    if (nameField) {
        nameField.addEventListener('blur', function() {
            const value = this.value.trim();
            if (value.length > 0 && value.length < 2) {
                this.classList.add('is-invalid');
                showFieldError(this, 'Name must be at least 2 characters long');
            } else {
                this.classList.remove('is-invalid');
                hideFieldError(this);
            }
        });
    }
    
    // Email field validation
    const emailField = document.getElementById('email');
    if (emailField) {
        emailField.addEventListener('blur', function() {
            const value = this.value.trim();
            if (value.length > 0 && !validateEmail(value)) {
                this.classList.add('is-invalid');
                showFieldError(this, 'Please enter a valid email address');
            } else {
                this.classList.remove('is-invalid');
                hideFieldError(this);
            }
        });
    }
    
    // Phone field validation
    const phoneField = document.getElementById('phone');
    if (phoneField) {
        phoneField.addEventListener('blur', function() {
            const value = this.value.trim();
            if (value.length > 0 && !validatePhone(value)) {
                this.classList.add('is-invalid');
                showFieldError(this, 'Please enter a valid 10-digit phone number');
            } else {
                this.classList.remove('is-invalid');
                hideFieldError(this);
            }
        });
    }
    
    // Message field validation
    const messageField = document.getElementById('message');
    if (messageField) {
        messageField.addEventListener('blur', function() {
            const value = this.value.trim();
            if (value.length > 0 && value.length < 10) {
                this.classList.add('is-invalid');
                showFieldError(this, 'Message must be at least 10 characters long');
            } else {
                this.classList.remove('is-invalid');
                hideFieldError(this);
            }
        });
    }
}

// Show field error
function showFieldError(field, message) {
    hideFieldError(field); // Remove existing error first
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'invalid-feedback';
    errorDiv.textContent = message;
    
    field.parentNode.appendChild(errorDiv);
}

// Hide field error
function hideFieldError(field) {
    const existingError = field.parentNode.querySelector('.invalid-feedback');
    if (existingError) {
        existingError.remove();
    }
}

// ==================== NEWSLETTER FUNCTIONALITY ====================

function subscribeNewsletter(event) {
    event.preventDefault();
    
    const form = event.target;
    const emailInput = form.querySelector('input[type="email"]');
    const email = emailInput.value.trim();
    
    if (!validateEmail(email)) {
        showNotification('Please enter a valid email address!', 'error');
        return;
    }
    
    // Show loading state
    const submitButton = form.querySelector('button');
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Subscribing...';
    submitButton.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        form.reset();
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
        showNotification('Successfully subscribed to our newsletter!', 'success');
    }, 1500);
}

// ==================== INITIALIZATION ====================

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Update cart counter
    updateCartCounter();
    
    // Setup real-time validation if on contact page
    setupRealTimeValidation();
    
    // Setup search functionality
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchProducts(this.value);
            }
        });
    }
});

// ==================== PAGE INITIALIZATION ====================

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Update cart counter on page load
        updateCartCounter();
        
        // Update user interface based on login status
        updateUserInterface();
        
        // Add click handlers for logout buttons (if any exist)
        const logoutButtons = document.querySelectorAll('[onclick="logoutUser()"]');
        logoutButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                logoutUser();
            });
        });
        
        console.log('ElectroStore: Page initialized successfully');
    } catch (error) {
        console.error('ElectroStore initialization error:', error);
    }
});

// Export functions for use in other scripts (if using modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showNotification,
        validateEmail,
        validatePhone,
        formatCurrency,
        getCurrentUser,
        isLoggedIn,
        logoutUser,
        updateUserInterface,
        findUserByEmail,
        searchProducts,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCart,
        getCartTotal,
        getCartItemCount,
        updateCartCounter,
        handleContactForm,
        subscribeNewsletter
    };
}