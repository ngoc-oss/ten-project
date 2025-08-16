// Dữ liệu sản phẩm mẫu
const products = [
    {
        id: 1,
        name: "iPhone 15 Pro Max",
        description: "Điện thoại thông minh cao cấp với chip A17 Pro, camera 48MP và màn hình Super Retina XDR",
        price: 29990000,
        icon: "📱",
        category: "electronics"
    },
    {
        id: 2,
        name: "MacBook Pro M3",
        description: "Laptop chuyên nghiệp với chip M3, màn hình Liquid Retina XDR và hiệu năng vượt trội",
        price: 52990000,
        icon: "💻",
        category: "electronics"
    },
    {
        id: 3,
        name: "AirPods Pro (Gen 2)",
        description: "Tai nghe không dây với công nghệ chống ồn chủ động và âm thanh Spatial Audio",
        price: 6490000,
        icon: "🎧",
        category: "audio"
    },
    {
        id: 4,
        name: "Apple Watch Ultra 2",
        description: "Đồng hồ thông minh cao cấp với GPS, cellular và khả năng chống nước đến 100m",
        price: 20990000,
        icon: "⌚",
        category: "wearables"
    },
    {
        id: 5,
        name: "iPad Pro 12.9 inch",
        description: "Máy tính bảng chuyên nghiệp với chip M2, màn hình Liquid Retina XDR và hỗ trợ Apple Pencil",
        price: 31990000,
        icon: "📱",
        category: "tablets"
    }
];

// Biến toàn cục
let cart = [];
let isCartOpen = false;
let isLoading = false;

// Khởi tạo website khi DOM được tải
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Khởi tạo ứng dụng
function initializeApp() {
    loadCartFromStorage();
    loadProducts();
    updateCartUI();
    setupEventListeners();
    setupScrollEffects();
    
    // Hiệu ứng loading ban đầu
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 500);
}

// Thiết lập các event listener
function setupEventListeners() {
    // Event listener cho form thanh toán
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', handleCheckoutSubmit);
    }

    // Event listener cho phím ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeCart();
            closeCheckoutModal();
            closeSuccessModal();
        }
    });

    // Event listener cho click outside modal
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-backdrop')) {
            closeCheckoutModal();
            closeSuccessModal();
        }
    });

    // Smooth scroll cho navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Thiết lập hiệu ứng scroll
function setupScrollEffects() {
    // Header scroll effect
    window.addEventListener('scroll', function() {
        const header = document.querySelector('.header');
        if (window.scrollY > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.98)';
            header.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.05)';
        }
    });

    // Intersection Observer cho animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
            }
        });
    }, observerOptions);

    // Observe product cards
    setTimeout(() => {
        const productCards = document.querySelectorAll('.product-card');
        productCards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
            card.style.animationPlayState = 'paused';
            observer.observe(card);
        });
    }, 1000);
}

// Tải và hiển thị sản phẩm
function loadProducts() {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;
    
    productsGrid.innerHTML = '';

    products.forEach((product, index) => {
        const productCard = createProductCard(product, index);
        productsGrid.appendChild(productCard);
    });
}

// Tạo card sản phẩm
function createProductCard(product, index) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.style.animationDelay = `${index * 0.1}s`;
    
    card.innerHTML = `
        <div class="product-image">
            <span style="font-size: 4rem;">${product.icon}</span>
        </div>
        <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-description">${product.description}</p>
            <div class="product-price">${formatPrice(product.price)}</div>
            <button class="add-to-cart" onclick="addToCart(${product.id})">
                <i class="fas fa-cart-plus"></i>
                <span>Thêm vào giỏ</span>
            </button>
        </div>
    `;
    
    return card;
}

// Thêm sản phẩm vào giỏ hàng
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    updateCartUI();
    saveCartToStorage();
    showNotification('Thành công!', `${product.name} đã được thêm vào giỏ hàng`, 'success');
    
    // Hiệu ứng animation cho nút giỏ hàng
    animateCartButton();
}

// Xóa sản phẩm khỏi giỏ hàng
function removeFromCart(productId) {
    const itemIndex = cart.findIndex(item => item.id === productId);
    if (itemIndex > -1) {
        const item = cart[itemIndex];
        cart.splice(itemIndex, 1);
        updateCartUI();
        saveCartToStorage();
        showNotification('Đã xóa!', `${item.name} đã được xóa khỏi giỏ hàng`, 'success');
    }
}

// Cập nhật số lượng sản phẩm
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;
    
    item.quantity += change;
    
    if (item.quantity <= 0) {
        removeFromCart(productId);
    } else {
        updateCartUI();
        saveCartToStorage();
    }
}

// Cập nhật giao diện giỏ hàng
function updateCartUI() {
    const cartCount = document.getElementById('cart-count');
    const cartItems = document.getElementById('cart-items');
    const cartEmpty = document.getElementById('cart-empty');
    const cartTotal = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    if (!cartCount || !cartItems || !cartEmpty || !cartTotal || !checkoutBtn) return;
    
    // Cập nhật số lượng sản phẩm
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Hiển thị/ẩn giỏ hàng trống
    if (cart.length === 0) {
        cartItems.style.display = 'none';
        cartEmpty.style.display = 'block';
        checkoutBtn.disabled = true;
    } else {
        cartItems.style.display = 'block';
        cartEmpty.style.display = 'none';
        checkoutBtn.disabled = false;
        
        // Cập nhật danh sách sản phẩm trong giỏ
        cartItems.innerHTML = '';
        cart.forEach(item => {
            const cartItem = createCartItem(item);
            cartItems.appendChild(cartItem);
        });
    }
    
    // Cập nhật tổng tiền
    const total = calculateTotal();
    cartTotal.textContent = formatPrice(total);
}

// Tạo item trong giỏ hàng
function createCartItem(item) {
    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';
    
    cartItem.innerHTML = `
        <div class="cart-item-image">
            <span style="font-size: 1.5rem;">${item.icon}</span>
        </div>
        <div class="cart-item-info">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-price">${formatPrice(item.price)}</div>
            <div class="quantity-controls">
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">
                    <i class="fas fa-minus"></i>
                </button>
                <span class="quantity">${item.quantity}</span>
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">
                    <i class="fas fa-plus"></i>
                </button>
                <button class="remove-item" onclick="removeFromCart(${item.id})" title="Xóa sản phẩm">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
    
    return cartItem;
}

// Tính tổng tiền
function calculateTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Format giá tiền
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
}

// Toggle giỏ hàng
function toggleCart() {
    const cartSidebar = document.getElementById('cart-sidebar');
    const body = document.body;
    
    if (!cartSidebar) return;
    
    if (isCartOpen) {
        closeCart();
    } else {
        cartSidebar.classList.add('open');
        body.style.overflow = 'hidden';
        isCartOpen = true;
    }
}

// Đóng giỏ hàng
function closeCart() {
    const cartSidebar = document.getElementById('cart-sidebar');
    const body = document.body;
    
    if (!cartSidebar) return;
    
    cartSidebar.classList.remove('open');
    body.style.overflow = 'auto';
    isCartOpen = false;
}

// Hiển thị form thanh toán
function showCheckoutForm() {
    if (cart.length === 0) return;
    
    const modal = document.getElementById('checkout-modal');
    const orderItems = document.getElementById('order-items');
    const orderSubtotal = document.getElementById('order-subtotal');
    const orderTotal = document.getElementById('order-total');
    
    if (!modal || !orderItems || !orderSubtotal || !orderTotal) return;
    
    // Cập nhật tóm tắt đơn hàng
    orderItems.innerHTML = '';
    cart.forEach(item => {
        const orderItem = document.createElement('div');
        orderItem.className = 'order-item';
        orderItem.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span style="font-size: 1.25rem;">${item.icon}</span>
                <span>${item.name} x ${item.quantity}</span>
            </div>
            <span style="font-weight: 600; color: #6366f1;">${formatPrice(item.price * item.quantity)}</span>
        `;
        orderItems.appendChild(orderItem);
    });
    
    const total = calculateTotal();
    orderSubtotal.textContent = formatPrice(total);
    orderTotal.textContent = formatPrice(total);
    
    // Hiển thị modal
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
    
    // Focus vào trường đầu tiên
    setTimeout(() => {
        const firstInput = document.getElementById('customer-name');
        if (firstInput) firstInput.focus();
    }, 300);
}

// Đóng modal thanh toán
function closeCheckoutModal() {
    const modal = document.getElementById('checkout-modal');
    if (!modal) return;
    
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
    
    // Reset form
    const form = document.getElementById('checkout-form');
    if (form) form.reset();
}

// Xử lý submit form thanh toán
function handleCheckoutSubmit(e) {
    e.preventDefault();
    
    if (isLoading) return;
    
    // Validate form
    const form = e.target;
    const formData = new FormData(form);
    const customerData = Object.fromEntries(formData);
    
    // Kiểm tra các trường bắt buộc
    const requiredFields = ['customerName', 'customerEmail', 'customerPhone', 'customerAddress', 'paymentMethod'];
    const missingFields = requiredFields.filter(field => !customerData[field] || customerData[field].trim() === '');
    
    if (missingFields.length > 0) {
        showNotification('Lỗi!', 'Vui lòng điền đầy đủ thông tin bắt buộc', 'error');
        return;
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerData.customerEmail)) {
        showNotification('Lỗi!', 'Email không hợp lệ', 'error');
        return;
    }
    
    // Validate phone
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(customerData.customerPhone.replace(/\s/g, ''))) {
        showNotification('Lỗi!', 'Số điện thoại không hợp lệ', 'error');
        return;
    }
    
    // Hiển thị loading
    showLoading();
    isLoading = true;
    
    // Giả lập xử lý thanh toán
    setTimeout(() => {
        hideLoading();
        isLoading = false;
        closeCheckoutModal();
        showSuccessModal();
        
        // Lưu thông tin đơn hàng (có thể gửi lên server)
        const orderData = {
            id: generateOrderId(),
            customer: customerData,
            items: [...cart],
            total: calculateTotal(),
            timestamp: new Date().toISOString()
        };
        
        console.log('Order placed:', orderData);
        
        // Reset giỏ hàng
        cart = [];
        updateCartUI();
        saveCartToStorage();
        closeCart();
        
        showNotification('Thành công!', 'Đơn hàng đã được đặt thành công', 'success');
    }, 2500);
}

// Hiển thị modal thành công
function showSuccessModal() {
    const modal = document.getElementById('success-modal');
    if (!modal) return;
    
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

// Đóng modal thành công
function closeSuccessModal() {
    const modal = document.getElementById('success-modal');
    if (!modal) return;
    
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
}

// Hiển thị loading
function showLoading() {
    const loading = document.getElementById('loading-overlay');
    if (loading) {
        loading.classList.add('show');
    }
}

// Ẩn loading
function hideLoading() {
    const loading = document.getElementById('loading-overlay');
    if (loading) {
        loading.classList.remove('show');
    }
}

// Hiển thị thông báo
function showNotification(title, message, type = 'success') {
    const container = document.getElementById('notification-container');
    if (!container) return;
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icon = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
    
    notification.innerHTML = `
        <i class="${icon}"></i>
        <div class="notification-content">
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
        </div>
    `;
    
    container.appendChild(notification);
    
    // Tự động xóa sau 4 giây
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease forwards';
            setTimeout(() => {
                if (notification.parentNode) {
                    container.removeChild(notification);
                }
            }, 300);
        }
    }, 4000);
}

// Animation cho nút giỏ hàng
function animateCartButton() {
    const cartToggle = document.querySelector('.cart-toggle');
    if (!cartToggle) return;
    
    cartToggle.style.transform = 'scale(1.1)';
    setTimeout(() => {
        cartToggle.style.transform = 'scale(1)';
    }, 200);
}

// Scroll to products section
function scrollToProducts() {
    const productsSection = document.getElementById('products');
    if (productsSection) {
        productsSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Local Storage functions
function saveCartToStorage() {
    try {
        localStorage.setItem('miniShopCart', JSON.stringify(cart));
    } catch (error) {
        console.error('Error saving cart to localStorage:', error);
    }
}

function loadCartFromStorage() {
    try {
        const savedCart = localStorage.getItem('miniShopCart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
        }
    } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        cart = [];
    }
}

// Generate order ID
function generateOrderId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `ORDER-${timestamp}-${random}`;
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Performance optimization
const debouncedSaveCart = debounce(saveCartToStorage, 300);

// Override save functions to use debounced version
const originalUpdateCartUI = updateCartUI;
updateCartUI = function() {
    originalUpdateCartUI();
    debouncedSaveCart();
};

// Error handling
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
    showNotification('Lỗi!', 'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.', 'error');
});

// Service Worker registration (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('ServiceWorker registration successful');
            })
            .catch(function(err) {
                console.log('ServiceWorker registration failed');
            });
    });
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + K to open cart
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        toggleCart();
    }
    
    // Ctrl/Cmd + Enter to checkout (when cart is open)
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && isCartOpen && cart.length > 0) {
        e.preventDefault();
        showCheckoutForm();
    }
});

// Touch gestures for mobile
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', function(e) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 100;
    const swipeDistance = touchEndX - touchStartX;
    
    // Swipe left to open cart
    if (swipeDistance < -swipeThreshold && !isCartOpen) {
        toggleCart();
    }
    
    // Swipe right to close cart
    if (swipeDistance > swipeThreshold && isCartOpen) {
        closeCart();
    }
}

// Analytics tracking (placeholder)
function trackEvent(eventName, eventData) {
    console.log('Analytics event:', eventName, eventData);
    // Here you would integrate with your analytics service
    // Example: gtag('event', eventName, eventData);
}

// Track important events
const originalAddToCart = addToCart;
addToCart = function(productId) {
    const product = products.find(p => p.id === productId);
    trackEvent('add_to_cart', {
        item_id: productId,
        item_name: product?.name,
        item_category: product?.category,
        price: product?.price
    });
    originalAddToCart(productId);
};

// Initialize tooltips (if needed)
function initializeTooltips() {
    const tooltipElements = document.querySelectorAll('[title]');
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            // Tooltip implementation
        });
    });
}

// Call initialization functions
document.addEventListener('DOMContentLoaded', function() {
    initializeTooltips();
});

// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        addToCart,
        removeFromCart,
        updateQuantity,
        calculateTotal,
        formatPrice
    };
}

