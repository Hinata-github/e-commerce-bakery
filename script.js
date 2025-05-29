// Product data
const products = [
    {
        id: 1,
        name: "Artisan Sourdough",
        price: 8.99,
        description: "Traditional sourdough with crispy crust and soft interior. Made with natural fermentation process.",
        emoji: "🍞",
        stock: 12
    },
    {
        id: 2,
        name: "French Baguette",
        price: 5.99,
        description: "Authentic French baguette with perfect crust and airy texture. Baked fresh daily.",
        emoji: "🥖",
        stock: 8
    },
    {
        id: 3,
        name: "Whole Wheat Loaf",
        price: 7.99,
        description: "Nutritious whole wheat bread packed with fiber and natural goodness.",
        emoji: "🍞",
        stock: 15
    },
    {
        id: 4,
        name: "Cinnamon Rolls",
        price: 12.99,
        description: "Sweet and aromatic cinnamon rolls with cream cheese glaze. Perfect for breakfast.",
        emoji: "🧁",
        stock: 6
    },
    {
        id: 5,
        name: "Rye Bread",
        price: 9.99,
        description: "Dense and flavorful rye bread with caraway seeds. Great for sandwiches.",
        emoji: "🍞",
        stock: 10
    },
    {
        id: 6,
        name: "Croissants",
        price: 15.99,
        description: "Buttery, flaky croissants made with traditional French technique. Pack of 6.",
        emoji: "🥐",
        stock: 4
    },
    {
        id: 7,
        name: "Multigrain Bread",
        price: 9.49,
        description: "Healthy multigrain bread with seeds and nuts. Perfect for a nutritious meal.",
        emoji: "🍞",
        stock: 7
    },
    {
        id: 8,
        name: "Danish Pastries",
        price: 18.99,
        description: "Assorted Danish pastries with fruit and cream fillings. Box of 8.",
        emoji: "🧁",
        stock: 5
    }
];

// Cart functionality
let cart = [];

// DOM elements
const productGrid = document.getElementById('productGrid');
const cartSidebar = document.getElementById('cartSidebar');
const cartItems = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const cartTotal = document.getElementById('cartTotal');
const checkoutModal = document.getElementById('checkoutModal');
const checkoutForm = document.getElementById('checkoutForm');
const orderSummary = document.getElementById('orderSummary');
const notification = document.getElementById('notification');
const loading = document.getElementById('loading');
const scrollTop = document.getElementById('scrollTop');
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    hideLoading();
    loadProducts();
    setupEventListeners();
    updateCartUI();
});

// Hide loading screen
function hideLoading() {
    setTimeout(() => {
        loading.classList.add('hidden');
    }, 1500);
}

// Load products into the grid
function loadProducts() {
    productGrid.innerHTML = '';
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="stock-status ${product.stock === 0 ? 'out-of-stock' : ''}">
                ${product.stock === 0 ? 'Out of Stock' : 'In Stock'}
            </div>
            <div class="product-image">${product.emoji}</div>
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <div class="product-price">$${product.price.toFixed(2)}</div>
            <div class="product-actions">
                <div class="quantity-selector">
                    <button class="quantity-btn" onclick="changeQuantity(${product.id}, -1)">-</button>
                    <input type="number" class="quantity-input" id="qty-${product.id}" value="1" min="1" max="${product.stock}">
                    <button class="quantity-btn" onclick="changeQuantity(${product.id}, 1)">+</button>
                </div>
                <button class="add-to-cart-btn" onclick="addToCart(${product.id})" ${product.stock === 0 ? 'disabled' : ''}>
                    ${product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
            </div>
        `;
        productGrid.appendChild(productCard);
    });
}

// Setup event listeners
function setupEventListeners() {
    // Mobile menu toggle
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    // Close mobile menu when clicking on links
    navLinks.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            navLinks.classList.remove('active');
        }
    });

    // Smooth scrolling for navigation links
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

    // Scroll to top button visibility
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollTop.classList.add('visible');
        } else {
            scrollTop.classList.remove('visible');
        }
    });

    // Contact form submission
    const contactForm = document.getElementById('contactForm');
    contactForm.addEventListener('submit', handleContactForm);

    // Checkout form submission
    checkoutForm.addEventListener('submit', handleCheckout);

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === checkoutModal) {
            closeCheckout();
        }
    });
}

// Change quantity in product selector
function changeQuantity(productId, change) {
    const quantityInput = document.getElementById(`qty-${productId}`);
    const product = products.find(p => p.id === productId);
    let newValue = parseInt(quantityInput.value) + change;
    
    if (newValue < 1) newValue = 1;
    if (newValue > product.stock) newValue = product.stock;
    
    quantityInput.value = newValue;
}

// Add product to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const quantityInput = document.getElementById(`qty-${productId}`);
    const quantity = parseInt(quantityInput.value);
    
    if (!product || product.stock === 0) {
        showNotification('Product is out of stock!', 'error');
        return;
    }

    if (quantity > product.stock) {
        showNotification('Not enough stock available!', 'error');
        return;
    }

    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > product.stock) {
            showNotification('Not enough stock available!', 'error');
            return;
        }
        existingItem.quantity = newQuantity;
    } else {
        cart.push({
            id: productId,
            name: product.name,
            price: product.price,
            emoji: product.emoji,
            quantity: quantity
        });
    }

    // Update product stock
    product.stock -= quantity;
    
    updateCartUI();
    loadProducts(); // Reload products to update stock display
    showNotification(`${product.name} added to cart!`);
    
    // Reset quantity selector
    quantityInput.value = 1;
}

// Remove item from cart
function removeFromCart(productId) {
    const cartItem = cart.find(item => item.id === productId);
    if (cartItem) {
        // Restore stock
        const product = products.find(p => p.id === productId);
        if (product) {
            product.stock += cartItem.quantity;
        }
        
        cart = cart.filter(item => item.id !== productId);
        updateCartUI();
        loadProducts(); // Reload products to update stock display
        showNotification('Item removed from cart');
    }
}

// Update cart quantity
function updateCartQuantity(productId, newQuantity) {
    const cartItem = cart.find(item => item.id === productId);
    const product = products.find(p => p.id === productId);
    
    if (cartItem && product) {
        const difference = newQuantity - cartItem.quantity;
        
        if (difference > product.stock) {
            showNotification('Not enough stock available!', 'error');
            return;
        }
        
        if (newQuantity <= 0) {
            removeFromCart(productId);
            return;
        }
        
        // Update stock
        product.stock -= difference;
        cartItem.quantity = newQuantity;
        
        updateCartUI();
        loadProducts();
    }
}

// Update cart UI
function updateCartUI() {
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;

    // Update cart items
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; opacity: 0.7; padding: 2rem;">Your cart is empty</p>';
    } else {
        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div class="cart-item-image">${item.emoji}</div>
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">$${item.price.toFixed(2)} each</div>
                </div>
                <div class="cart-item-actions">
                    <div class="quantity-selector">
                        <button class="quantity-btn" onclick="updateCartQuantity(${item.id}, ${item.quantity - 1})">-</button>
                        <span style="margin: 0 0.5rem; font-weight: bold;">${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateCartQuantity(${item.id}, ${item.quantity + 1})">+</button>
                    </div>
                    <button class="remove-item" onclick="removeFromCart(${item.id})">Remove</button>
                </div>
            `;
            cartItems.appendChild(cartItem);
        });
    }

    // Update cart total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `$${total.toFixed(2)}`;

    // Enable/disable checkout button
    const checkoutBtn = document.getElementById('checkoutBtn');
    checkoutBtn.disabled = cart.length === 0;
}

// Toggle cart sidebar
function toggleCart() {
    cartSidebar.classList.toggle('open');
}

// Open checkout modal
function openCheckout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!', 'error');
        return;
    }
    
    updateOrderSummary();
    checkoutModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Close checkout modal
function closeCheckout() {
    checkoutModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Update order summary in checkout
function updateOrderSummary() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 50 ? 0 : 5.99;
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + shipping + tax;

    orderSummary.innerHTML = `
        <h3>Order Summary</h3>
        ${cart.map(item => `
            <div class="summary-item">
                <span>${item.name} × ${item.quantity}</span>
                <span>$${(item.price * item.quantity).toFixed(2)}</span>
            </div>
        `).join('')}
        <hr style="margin: 1rem 0; border: none; border-top: 1px solid var(--primary);">
        <div class="summary-item">
            <span>Subtotal</span>
            <span>$${subtotal.toFixed(2)}</span>
        </div>
        <div class="summary-item">
            <span>Shipping</span>
            <span>${shipping === 0 ? 'FREE' : '$' + shipping.toFixed(2)}</span>
        </div>
        <div class="summary-item">
            <span>Tax</span>
            <span>$${tax.toFixed(2)}</span>
        </div>
        <div class="summary-item summary-total">
            <span>Total</span>
            <span>$${total.toFixed(2)}</span>
        </div>
        ${subtotal < 50 ? '<p style="font-size: 0.9rem; opacity: 0.8; margin-top: 1rem;">💡 Free shipping on orders over $50!</p>' : ''}
    `;
}

// Handle contact form submission
function handleContactForm(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const email = formData.get('email');
    const subject = formData.get('subject');
    const message = formData.get('message');

    // Simulate form submission
    showNotification('Thank you for your message! We\'ll get back to you soon.');
    e.target.reset();
}

// Handle checkout form submission
function handleCheckout(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const customerData = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        address: formData.get('address'),
        city: formData.get('city'),
        zipCode: formData.get('zipCode'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        paymentMethod: formData.get('paymentMethod'),
        specialInstructions: formData.get('specialInstructions')
    };

    // Generate order number
    const orderNumber = 'CB' + Date.now().toString().slice(-6);

    // Show success message
    document.getElementById('checkoutContent').innerHTML = `
        <div class="success-message">
            <h2>🎉 Order Placed Successfully!</h2>
            <p>Thank you for your order, ${customerData.firstName}!</p>
            <p><strong>Order Number:</strong> ${orderNumber}</p>
            <p>You will receive a confirmation email shortly at ${customerData.email}</p>
            <p>Your delicious CloudBread products will be prepared fresh and delivered to:</p>
            <p><strong>${customerData.address}, ${customerData.city} ${customerData.zipCode}</strong></p>
            <button class="checkout-btn" onclick="finishOrder()">Continue Shopping</button>
        </div>
    `;

    // Clear cart after successful order
    setTimeout(() => {
        cart = [];
        updateCartUI();
        showNotification('Order confirmation sent to your email!');
    }, 1000);
}

// Finish order and close modal
function finishOrder() {
    closeCheckout();
    toggleCart(); // Close cart sidebar if open
}

// Show notification
function showNotification(message, type = 'success') {
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Animate elements on scroll
function animateOnScroll() {
    const elements = document.querySelectorAll('.product-card, .about-content, .contact-form');
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }
    });
}

// Initialize scroll animations
window.addEventListener('scroll', animateOnScroll);

// Add CSS for scroll animations
const style = document.createElement('style');
style.textContent = `
    .product-card, .about-content, .contact-form {
        opacity: 0;
        transform: translateY(50px);
        transition: all 0.6s ease;
    }
`;
document.head.appendChild(style);

// Initialize animations on load
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(animateOnScroll, 100);
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // ESC key to close modals
    if (e.key === 'Escape') {
        if (checkoutModal.style.display === 'block') {
            closeCheckout();
        }
        if (cartSidebar.classList.contains('open')) {
            toggleCart();
        }
    }
    
    // Ctrl/Cmd + K to open cart
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        toggleCart();
    }
});

// Add to cart with Enter key on quantity inputs
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.classList.contains('quantity-input')) {
        const productId = parseInt(e.target.id.split('-')[1]);
        addToCart(productId);
    }
});

// Auto-save cart to prevent data loss (using in-memory storage only)
let cartBackup = [];

// Backup cart data every 30 seconds
setInterval(() => {
    cartBackup = [...cart];
}, 30000);

// Restore cart if page is refreshed (within session)
window.addEventListener('beforeunload', () => {
    // Cart data will be lost on refresh since we can't use localStorage
    // This is a limitation of the Claude.ai environment
});

// Enhanced error handling
window.addEventListener('error', (e) => {
    console.error('CloudBread Error:', e.error);
    showNotification('Something went wrong. Please try again.', 'error');
});

// Performance optimization: Lazy loading for images
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

// Initialize lazy loading if supported
if ('IntersectionObserver' in window) {
    document.addEventListener('DOMContentLoaded', lazyLoadImages);
}

console.log('CloudBread E-commerce System Loaded Successfully! 🍞✨');