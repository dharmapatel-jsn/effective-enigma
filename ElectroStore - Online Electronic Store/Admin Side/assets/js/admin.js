// ElectroStore Admin Panel - JavaScript Utilities
// This file contains all validation and functionality for admin panel

// ==================== UTILITY FUNCTIONS ====================

// Show notifications to admin users
function showAdminNotification(message, type = 'info') {
    // Remove any existing notification
    const existingNotification = document.querySelector('.admin-notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `admin-notification alert alert-${type === 'error' ? 'danger' : type === 'success' ? 'success' : type === 'warning' ? 'warning' : 'info'} alert-dismissible fade show`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 350px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        border-left: 4px solid ${type === 'error' ? '#dc3545' : type === 'success' ? '#28a745' : type === 'warning' ? '#ffc107' : '#007bff'};
    `;
    
    notification.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="fas fa-${type === 'error' ? 'exclamation-triangle' : type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-circle' : 'info-circle'} me-2"></i>
            <div>
                <strong>${type === 'error' ? 'Error!' : type === 'success' ? 'Success!' : type === 'warning' ? 'Warning!' : 'Info:'}</strong>
                <div>${message}</div>
            </div>
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 6 seconds
    setTimeout(() => {
        if (notification && notification.parentNode) {
            notification.remove();
        }
    }, 6000);
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

// Validate URL format
function validateURL(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

// Format currency for admin display
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
}

// Sanitize input to prevent XSS
function sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

// ==================== ADMIN LOGIN VALIDATION ====================

function validateAdminLogin(email, password) {
    const errors = [];
    
    // Email validation
    if (!email || !validateEmail(email)) {
        errors.push('Please enter a valid email address');
    }
    
    // Password validation
    if (!password || password.length < 6) {
        errors.push('Password must be at least 6 characters long');
    }
    
    return errors;
}

function handleAdminLogin(event) {
    event.preventDefault();
    
    console.log('Login function called'); // Debug log
    
    const form = event.target;
    const formData = new FormData(form);
    
    const email = formData.get('email');
    const password = formData.get('password');
    const rememberMe = formData.get('rememberMe');
    
    console.log('Form data:', { email, password, rememberMe }); // Debug log
    
    // Validate credentials
    const errors = validateAdminLogin(email, password);
    
    if (errors.length > 0) {
        showAdminNotification(errors.join('<br>'), 'error');
        return;
    }
    
    // Demo credentials check
    if (email === 'admin@electrostore.com' && password === 'admin123') {
        showAdminNotification('Login successful! Redirecting to dashboard...', 'success');
        
        // Save session (demo)
        const sessionData = {
            email: email,
            loginTime: new Date().toISOString(),
            rememberMe: !!rememberMe
        };
        
        if (rememberMe) {
            localStorage.setItem('admin_session', JSON.stringify(sessionData));
        } else {
            sessionStorage.setItem('admin_session', JSON.stringify(sessionData));
        }
        
        console.log('Session saved, redirecting...'); // Debug log
        
        // Redirect after short delay
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    } else {
        console.log('Invalid credentials'); // Debug log
        showAdminNotification('Invalid credentials! Use demo credentials provided.', 'error');
    }
}

// Backup simple login function
function simpleAdminLogin() {
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;
    
    if (email === 'admin@electrostore.com' && password === 'admin123') {
        alert('Login successful! Redirecting to dashboard...');
        window.location.href = 'dashboard.html';
    } else {
        alert('Invalid credentials! Use: admin@electrostore.com / admin123');
    }
}

// ==================== PRODUCT VALIDATION ====================

function validateProductData(productData) {
    const errors = [];
    
    // Product name validation
    if (!productData.name || productData.name.trim().length < 2) {
        errors.push('Product name must be at least 2 characters long');
    }
    
    // Category validation
    if (!productData.category) {
        errors.push('Please select a category');
    }
    
    // Price validation
    if (!productData.price || isNaN(productData.price) || parseFloat(productData.price) <= 0) {
        errors.push('Please enter a valid selling price');
    }
    
    // Original price validation (if provided)
    if (productData.originalPrice && (isNaN(productData.originalPrice) || parseFloat(productData.originalPrice) <= 0)) {
        errors.push('Please enter a valid original price');
    }
    
    // Stock validation
    if (!productData.stock || isNaN(productData.stock) || parseInt(productData.stock) < 0) {
        errors.push('Please enter a valid stock quantity');
    }
    
    // SKU validation
    if (!productData.sku || productData.sku.trim().length < 3) {
        errors.push('SKU must be at least 3 characters long');
    }
    
    // Image URL validation (if provided)
    if (productData.image && !validateURL(productData.image)) {
        errors.push('Please enter a valid image URL');
    }
    
    // Description validation (optional but if provided, check length)
    if (productData.description && productData.description.length > 1000) {
        errors.push('Description must not exceed 1000 characters');
    }
    
    return errors;
}

function handleAddProduct(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    // Get form data
    const productData = {
        name: formData.get('name'),
        category: formData.get('category'),
        brand: formData.get('brand'),
        description: formData.get('description'),
        image: formData.get('image'),
        price: formData.get('price'),
        originalPrice: formData.get('originalPrice'),
        stock: formData.get('stock'),
        sku: formData.get('sku'),
        status: formData.get('status') || 'active'
    };
    
    // Validate product data
    const errors = validateProductData(productData);
    
    if (errors.length > 0) {
        showAdminNotification(errors.join('<br>'), 'error');
        return;
    }
    
    // Show loading state
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Saving Product...';
    submitButton.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        // Reset button
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
        
        // Show success message
        showAdminNotification(`Product "${productData.name}" saved successfully!`, 'success');
        
        // Clear form
        form.reset();
        
        // Clear image preview
        const imagePreview = document.getElementById('imagePreview');
        if (imagePreview) {
            imagePreview.src = 'assets/images/preview-placeholder.jpg';
        }
        
        // In a real application, you would send the data to a server
        console.log('Product data:', productData);
    }, 2000);
}

// ==================== IMAGE PREVIEW FUNCTIONALITY ====================

function previewImage(input) {
    const imageUrl = input.value.trim();
    const preview = document.getElementById('imagePreview');
    
    if (preview) {
        if (imageUrl && validateURL(imageUrl)) {
            preview.src = imageUrl;
            preview.onerror = function() {
                this.src = 'assets/images/preview-placeholder.jpg';
                showAdminNotification('Could not load image from the provided URL', 'warning');
            };
        } else {
            preview.src = 'assets/images/preview-placeholder.jpg';
        }
    }
}

// ==================== SETTINGS VALIDATION ====================

function validateSettingsData(settingsData) {
    const errors = [];
    
    // Store name validation
    if (!settingsData.storeName || settingsData.storeName.trim().length < 2) {
        errors.push('Store name must be at least 2 characters long');
    }
    
    // Email validation
    if (!settingsData.email || !validateEmail(settingsData.email)) {
        errors.push('Please enter a valid email address');
    }
    
    // Phone validation
    if (!settingsData.phone || !validatePhone(settingsData.phone)) {
        errors.push('Please enter a valid 10-digit phone number');
    }
    
    // Address validation
    if (!settingsData.address || settingsData.address.trim().length < 10) {
        errors.push('Address must be at least 10 characters long');
    }
    
    // GST validation (optional)
    if (settingsData.gstNumber && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(settingsData.gstNumber)) {
        errors.push('Please enter a valid GST number');
    }
    
    return errors;
}

function handleSettingsUpdate(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    // Get settings data
    const settingsData = {
        storeName: formData.get('storeName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        gstNumber: formData.get('gstNumber'),
        currency: formData.get('currency') || 'INR',
        timezone: formData.get('timezone') || 'Asia/Kolkata'
    };
    
    // Validate settings
    const errors = validateSettingsData(settingsData);
    
    if (errors.length > 0) {
        showAdminNotification(errors.join('<br>'), 'error');
        return;
    }
    
    // Show loading state
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Updating Settings...';
    submitButton.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        // Reset button
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
        
        // Show success message
        showAdminNotification('Settings updated successfully!', 'success');
        
        // In a real application, you would send the data to a server
        console.log('Settings data:', settingsData);
    }, 1500);
}

// ==================== REAL-TIME VALIDATION SETUP ====================

function setupRealTimeValidation() {
    // Email field validation
    const emailFields = document.querySelectorAll('input[type="email"]');
    emailFields.forEach(field => {
        field.addEventListener('blur', function() {
            const value = this.value.trim();
            if (value.length > 0 && !validateEmail(value)) {
                this.classList.add('is-invalid');
                showFieldError(this, 'Please enter a valid email address');
            } else {
                this.classList.remove('is-invalid');
                hideFieldError(this);
            }
        });
    });
    
    // Phone field validation
    const phoneFields = document.querySelectorAll('input[type="tel"]');
    phoneFields.forEach(field => {
        field.addEventListener('blur', function() {
            const value = this.value.trim();
            if (value.length > 0 && !validatePhone(value)) {
                this.classList.add('is-invalid');
                showFieldError(this, 'Please enter a valid 10-digit phone number');
            } else {
                this.classList.remove('is-invalid');
                hideFieldError(this);
            }
        });
    });
    
    // URL field validation
    const urlFields = document.querySelectorAll('input[type="url"]');
    urlFields.forEach(field => {
        field.addEventListener('blur', function() {
            const value = this.value.trim();
            if (value.length > 0 && !validateURL(value)) {
                this.classList.add('is-invalid');
                showFieldError(this, 'Please enter a valid URL');
            } else {
                this.classList.remove('is-invalid');
                hideFieldError(this);
            }
        });
    });
    
    // Price field validation
    const priceFields = document.querySelectorAll('input[name="price"], input[name="originalPrice"]');
    priceFields.forEach(field => {
        field.addEventListener('blur', function() {
            const value = this.value.trim();
            if (value.length > 0 && (isNaN(value) || parseFloat(value) <= 0)) {
                this.classList.add('is-invalid');
                showFieldError(this, 'Please enter a valid price');
            } else {
                this.classList.remove('is-invalid');
                hideFieldError(this);
            }
        });
    });
    
    // Stock field validation
    const stockFields = document.querySelectorAll('input[name="stock"]');
    stockFields.forEach(field => {
        field.addEventListener('blur', function() {
            const value = this.value.trim();
            if (value.length > 0 && (isNaN(value) || parseInt(value) < 0)) {
                this.classList.add('is-invalid');
                showFieldError(this, 'Please enter a valid stock quantity');
            } else {
                this.classList.remove('is-invalid');
                hideFieldError(this);
            }
        });
    });
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

// ==================== SESSION MANAGEMENT ====================

function checkAdminSession() {
    const session = localStorage.getItem('admin_session') || sessionStorage.getItem('admin_session');
    
    if (session) {
        try {
            const sessionData = JSON.parse(session);
            return sessionData;
        } catch (error) {
            console.error('Invalid session data');
            return null;
        }
    }
    
    return null;
}

function logoutAdmin() {
    localStorage.removeItem('admin_session');
    sessionStorage.removeItem('admin_session');
    showAdminNotification('Logged out successfully!', 'success');
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1000);
}

// ==================== DATA TABLE FUNCTIONALITY ====================

function initializeDataTable(tableId) {
    const table = document.getElementById(tableId);
    if (!table) return;
    
    // Add search functionality
    const searchInput = document.querySelector(`#${tableId}_search`);
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterTable(tableId, this.value);
        });
    }
    
    // Add sorting functionality
    const headers = table.querySelectorAll('th[data-sort]');
    headers.forEach(header => {
        header.style.cursor = 'pointer';
        header.addEventListener('click', function() {
            sortTable(tableId, this.dataset.sort);
        });
    });
}

function filterTable(tableId, searchTerm) {
    const table = document.getElementById(tableId);
    const rows = table.querySelectorAll('tbody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        const matches = text.includes(searchTerm.toLowerCase());
        row.style.display = matches ? '' : 'none';
    });
}

function sortTable(tableId, column) {
    const table = document.getElementById(tableId);
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    
    rows.sort((a, b) => {
        const aText = a.cells[parseInt(column)].textContent.trim();
        const bText = b.cells[parseInt(column)].textContent.trim();
        
        // Check if values are numbers
        if (!isNaN(aText) && !isNaN(bText)) {
            return parseFloat(aText) - parseFloat(bText);
        }
        
        return aText.localeCompare(bText);
    });
    
    // Reappend sorted rows
    rows.forEach(row => tbody.appendChild(row));
}

// ==================== DASHBOARD WIDGETS ====================

function updateDashboardStats() {
    // Demo statistics - in real app, fetch from API
    const stats = {
        totalProducts: 247,
        totalOrders: 1834,
        totalRevenue: 2456789,
        activeUsers: 456
    };
    
    // Update stat cards
    document.getElementById('totalProducts')?.textContent = stats.totalProducts;
    document.getElementById('totalOrders')?.textContent = stats.totalOrders;
    document.getElementById('totalRevenue')?.textContent = formatCurrency(stats.totalRevenue);
    document.getElementById('activeUsers')?.textContent = stats.activeUsers;
}

// ==================== INITIALIZATION ====================

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Setup real-time validation
    setupRealTimeValidation();
    
    // Initialize data tables
    initializeDataTable('productsTable');
    initializeDataTable('ordersTable');
    initializeDataTable('usersTable');
    
    // Update dashboard stats if on dashboard
    if (window.location.pathname.includes('dashboard.html')) {
        updateDashboardStats();
    }
    
    // Check session for protected pages
    const protectedPages = ['dashboard.html', 'products.html', 'orders.html', 'users.html', 'settings.html', 'add-product.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (protectedPages.includes(currentPage)) {
        const session = checkAdminSession();
        if (!session) {
            showAdminNotification('Session expired. Please login again.', 'warning');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        }
    }
});

// Export functions for use in other scripts (if using modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showAdminNotification,
        validateEmail,
        validatePhone,
        validateURL,
        formatCurrency,
        handleAdminLogin,
        handleAddProduct,
        handleSettingsUpdate,
        previewImage,
        checkAdminSession,
        logoutAdmin
    };
}