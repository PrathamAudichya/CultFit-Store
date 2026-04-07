const API_URL = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', () => {
    initDarkMode();
    injectTopBanner();
    injectSearchBar();
    initCart();
    initMobileNav();
    initAnimations();
    setupSpinners();
});

let cart = JSON.parse(localStorage.getItem('cart')) || [];
let userToken = localStorage.getItem('token') || null;

// --- OFFLINE MOCK DATA (mirrors cleaned DB — professional names + verified product-only local images) ---
const OFFLINE_PRODUCTS = [
    // Protein Powder
    {
        id: 1, title: 'MuscleBlaze Biozyme Whey', category_name: 'Protein Powder',
        price: 3199, discount_price: 2899, tax_percentage: 18,
        image_url: 'images/whey.png',
        product_brand: 'MuscleBlaze', avg_rating: 4.8, active_price: 2899
    },
    {
        id: 2, title: 'ON Gold Standard Whey', category_name: 'Protein Powder',
        price: 3699, discount_price: 3299, tax_percentage: 18,
        image_url: 'images/whey.png',
        product_brand: 'Optimum Nutrition', avg_rating: 4.9, active_price: 3299
    },
    {
        id: 3, title: 'BigMuscles Gold Whey', category_name: 'Protein Powder',
        price: 1999, discount_price: 1699, tax_percentage: 18,
        image_url: 'images/whey.png',
        product_brand: 'BigMuscles', avg_rating: 4.5, active_price: 1699
    },
    {
        id: 4, title: 'Asitis Atom Whey', category_name: 'Protein Powder',
        price: 1899, discount_price: 1599, tax_percentage: 18,
        image_url: 'images/whey.png',
        product_brand: 'Asitis', avg_rating: 4.6, active_price: 1599
    },
    // Mass Gainer
    {
        id: 5, title: 'MuscleBlaze Gainer', category_name: 'Mass Gainer',
        price: 1399, discount_price: 1199, tax_percentage: 18,
        image_url: 'images/gainer.png',
        product_brand: 'MuscleBlaze', avg_rating: 4.5, active_price: 1199
    },
    {
        id: 6, title: 'Labrada Gainer', category_name: 'Mass Gainer',
        price: 2699, discount_price: 2399, tax_percentage: 18,
        image_url: 'images/gainer.png',
        product_brand: 'Labrada', avg_rating: 4.6, active_price: 2399
    },
    // Creatine
    {
        id: 7, title: 'MuscleBlaze Creatine', category_name: 'Creatine',
        price: 999, discount_price: 799, tax_percentage: 18,
        image_url: 'images/creatine.png',
        product_brand: 'MuscleBlaze', avg_rating: 4.6, active_price: 799
    },
    {
        id: 8, title: 'ON Micronized Creatine', category_name: 'Creatine',
        price: 1499, discount_price: 1299, tax_percentage: 18,
        image_url: 'images/creatine.png',
        product_brand: 'Optimum Nutrition', avg_rating: 4.7, active_price: 1299
    },
    // Pre-workout
    {
        id: 9, title: 'Cellucor C4 Pre-Workout', category_name: 'Pre-workout',
        price: 2499, discount_price: 1999, tax_percentage: 18,
        image_url: 'images/preworkout.png',
        product_brand: 'Cellucor', avg_rating: 4.7, active_price: 1999
    },
    {
        id: 10, title: 'MuscleBlaze Pre-Workout', category_name: 'Pre-workout',
        price: 1199, discount_price: 899, tax_percentage: 18,
        image_url: 'images/preworkout.png',
        product_brand: 'MuscleBlaze', avg_rating: 4.5, active_price: 899
    },
    // Vegan Supplements
    {
        id: 11, title: 'Plix Plant Protein', category_name: 'Vegan Supplements',
        price: 1699, discount_price: 1499, tax_percentage: 18,
        image_url: 'images/plant.png',
        product_brand: 'Plix', avg_rating: 4.4, active_price: 1499
    },
    {
        id: 12, title: 'Fast&Up Plant Protein', category_name: 'Vegan Supplements',
        price: 2199, discount_price: 1899, tax_percentage: 18,
        image_url: 'images/plant.png',
        product_brand: 'Fast&Up', avg_rating: 4.6, active_price: 1899
    },
    // Fitness Equipment
    {
        id: 13, title: 'Adjustable Dumbbells (20kg)', category_name: 'Fitness Equipment',
        price: 4999, discount_price: 3999, tax_percentage: 12,
        image_url: 'images/dumbbells.png',
        product_brand: 'Cult.fit', avg_rating: 4.8, active_price: 3999
    },
    {
        id: 14, title: 'Boldfit Resistance Bands', category_name: 'Fitness Equipment',
        price: 1299, discount_price: 899, tax_percentage: 12,
        image_url: 'images/bands.png',
        product_brand: 'Boldfit', avg_rating: 4.7, active_price: 899
    },
    {
        id: 15, title: 'Home Gym Set (PVC)', category_name: 'Fitness Equipment',
        price: 2499, discount_price: 1499, tax_percentage: 12,
        image_url: 'images/homegym.png',
        product_brand: 'Kore', avg_rating: 4.4, active_price: 1499
    }
];

const OFFLINE_REVIEWS = [
    { productId: 101, user: "Pratham", comment: "Bass is amazing, perfect for gym!", rating: 5 },
    { productId: 101, user: "Rahul", comment: "Good but delivery was late.", rating: 4 },
    { productId: 104, user: "Priya V.", comment: "Super comfortable sneakers.", rating: 5 },
    { productId: 108, user: "Amit S.", comment: "High quality wood, looks premium on my desk.", rating: 5 }
];

// -- OPTIONAL PREMIUM FEATURES (Search, Wishlist, Dark Mode, Banner) --

function initDarkMode() {
    // Determine default mode
    let theme = localStorage.getItem('theme');
    if (!theme) {
        theme = 'dark'; // Keep dark mode default as requested
        localStorage.setItem('theme', 'dark');
    }

    if (theme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
    } else {
        document.body.removeAttribute('data-theme');
    }

    // Add toggle to navbar
    const navActions = document.querySelector('.nav-actions');
    if(navActions) {
        let existingToggle = document.getElementById('theme-toggle');
        if (!existingToggle) {
            const toggleBtn = document.createElement('button');
            toggleBtn.className = 'nav-action-btn';
            toggleBtn.id = 'theme-toggle';
            toggleBtn.innerHTML = theme === 'dark' ? '☀️' : '🌗';
            toggleBtn.setAttribute('title', 'Toggle Light/Dark Theme');
            
            toggleBtn.onclick = () => {
                if(document.body.getAttribute('data-theme') === 'dark') {
                    document.body.removeAttribute('data-theme');
                    localStorage.setItem('theme', 'light');
                    toggleBtn.innerHTML = '🌗';
                } else {
                    document.body.setAttribute('data-theme', 'dark');
                    localStorage.setItem('theme', 'dark');
                    toggleBtn.innerHTML = '☀️';
                }
            };
            navActions.prepend(toggleBtn);
        }
    }
}

function injectTopBanner() {
    if(!document.querySelector('.discount-banner')) {
        const banner = document.createElement('div');
        banner.className = 'discount-banner';
        banner.innerText = '⚡ MEGA GYM SALE: Get 20% OFF on all Supplements & Equipment! Limited Time Only. 💪';
        document.body.prepend(banner);
    }
}

let allProductsCache = [];
async function injectSearchBar() {
    const navContainer = document.querySelector('.nav-container');
    const existingSearchWrapper = document.querySelector('.search-wrapper');
    if (navContainer && !existingSearchWrapper) {
        const searchHtml = `
            <div class="search-wrapper">
                <span class="search-icon">🔍</span>
                <input type="text" class="search-input" id="global-search" placeholder="Search Supplements or Gear...">
                <div class="search-suggestions" id="search-suggestions"></div>
            </div>
        `;
        // Insert after nav links
        const navLinks = document.querySelector('.nav-links');
        if(navLinks) navLinks.insertAdjacentHTML('afterend', searchHtml);
        
        const input = document.getElementById('global-search');
        if(!input) return;
        input.addEventListener('input', async (e) => {
            const query = e.target.value.toLowerCase();
            const suggBox = document.getElementById('search-suggestions');
            if (query.length < 2) { suggBox.style.display = 'none'; return; }
            
            if(allProductsCache.length === 0) {
                try {
                    const res = await fetch(`${API_URL}/products`);
                    if(res.ok) {
                        allProductsCache = await res.json();
                    } else {
                        allProductsCache = OFFLINE_PRODUCTS;
                    }
                } catch(e) {
                    allProductsCache = OFFLINE_PRODUCTS;
                }
            }
            
            const matches = allProductsCache.filter(p => p.title.toLowerCase().includes(query) || (p.category_name && p.category_name.toLowerCase().includes(query)) || (p.product_brand && p.product_brand.toLowerCase().includes(query))).slice(0, 5);
            if (matches.length > 0) {
                suggBox.innerHTML = matches.map(p => {
                    const regex = new RegExp(`(${query})`, 'gi');
                    const hlTitle = p.title.replace(regex, '<span style="color:var(--primary-color); font-weight:800; background:rgba(0,0,0,0.1); padding:0 2px; border-radius:2px;">$1</span>');
                    return `
                    <div class="suggestion-item" onclick="window.location.href='product.html?id=${p.id}'">
                        <img src="${p.image_url}" style="width:30px; height:30px; border-radius:4px; object-fit:cover;" onerror="this.onerror=null; this.src='images/generic_supp.png';">
                        <div style="font-size:0.85rem; font-weight:600;">${hlTitle} <span style="font-weight:normal; color:var(--text-secondary); margin-left:10px;">${formatPrice(p.discount_price || p.price)}</span></div>
                    </div>
                `}).join('');
                suggBox.style.display = 'block';
            } else {
                suggBox.style.display = 'none';
            }
        });
        
        document.addEventListener('click', (e) => {
            if(!e.target.closest('.search-wrapper')) {
                const suggBox = document.getElementById('search-suggestions');
                if(suggBox) suggBox.style.display = 'none';
            }
        });
    }
}

// Shared SVG heart markup
const HEART_SVG = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;

// Global Wishlist Toggle
window.toggleWishlist = function(btn, productId) {
    const isActive = btn.classList.toggle('active');
    btn.innerHTML = HEART_SVG;
    // Trigger pop animation
    btn.classList.remove('pop');
    void btn.offsetWidth; // reflow to restart animation
    btn.classList.add('pop');
    showToast(isActive ? 'Added to Wishlist ❤️' : 'Removed from Wishlist');
}

// -- MAIN LOGIC --

async function syncCartToBackend() {
    if(!userToken || userToken === 'offline_mode_token') return;
    try {
        await fetch(`${API_URL}/cart/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` },
            body: JSON.stringify({ cart: cart.map(c => ({ id: c.id, quantity: c.quantity })) })
        });
    } catch(err) { console.error('Failed to sync cart', err); }
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartIcon();
    updateCartTotal();
    syncCartToBackend();
}

// Recalculate cart total from current cart array and dispatch custom event
// so every page (index hero, cart summary, etc.) can react in real-time
function updateCartTotal() {
    const currentCart = JSON.parse(localStorage.getItem('cart')) || [];
    let subtotal = 0;
    let totalGst = 0;
    currentCart.forEach(item => {
        const activePrice = Number(item.discount_price) || Number(item.price) || 0;
        const taxRate = Number(item.tax_percentage) || 18;
        const qty = Number(item.quantity) || 1;
        const itemTotal = activePrice * qty;
        subtotal += itemTotal;
        totalGst += itemTotal * (taxRate / 100);
    });
    const grandTotal = subtotal + totalGst;
    console.log('[Cart] Total updated: ₹' + grandTotal.toFixed(2));

    // Update hero-cart-total if it exists on the page
    const heroEl = document.getElementById('hero-cart-total');
    if (heroEl) heroEl.textContent = formatPrice(subtotal);

    // Dispatch event so page-specific code can react
    window.dispatchEvent(new CustomEvent('cart-updated', {
        detail: { subtotal, totalGst, grandTotal, itemCount: currentCart.length }
    }));
}

function updateCartIcon() {
    const counts = document.querySelectorAll('.cart-badge');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    counts.forEach(badge => {
        badge.innerText = totalItems;
        badge.style.display = totalItems > 0 ? 'inline-flex' : 'none';
        badge.classList.remove('bounce');
        void badge.offsetWidth; // trigger reflow
        if(totalItems > 0) badge.classList.add('bounce');
        setTimeout(() => badge.classList.remove('bounce'), 300);
    });
}

function initCart() {
    updateCartIcon();
    const activeLinks = document.querySelectorAll('#desktop-profile-link, #mobile-profile-link');
    
    if (userToken) {
        activeLinks.forEach(link => {
            if(link.tagName === 'A') {
                if(link.querySelector('span')) link.querySelector('span').innerText = "Dashboard";
                else link.innerText = "Dashboard";
                link.href = "dashboard.html";
            }
        });
    }
}

window.addToCart = function(productStr) {
    try {
        const product = JSON.parse(decodeURIComponent(productStr));
        console.log('[Cart] Raw product received:', product);

        // Normalize price: try every known field name with strict Number() coercion.
        // Using Number() instead of parseFloat catches edge-cases like undefined → NaN → 0.
        const resolvedPrice = (
            Number(product.active_price) ||
            Number(product.discount_price) ||
            Number(product.sale_price) ||
            Number(product.price)
        ) || 0;

        // discount_price is the "sale" price shown in the cart UI
        const resolvedDiscountPrice = (
            Number(product.discount_price) ||
            Number(product.active_price) ||
            Number(product.sale_price) ||
            Number(product.price)
        ) || 0;

        if (resolvedPrice === 0) {
            console.warn('[Cart] ⚠️ Price resolved to 0 for product:', product.title, '| raw fields:', {
                active_price: product.active_price,
                discount_price: product.discount_price,
                sale_price: product.sale_price,
                price: product.price
            });
        }

        const itemId = product.id || product.product_id;
        const existing = cart.find(i => i.id === itemId);

        if (existing) {
            existing.quantity += 1;
            console.log('[Cart] Quantity bumped for:', existing.title, '| new qty:', existing.quantity);
        } else {
            const cartItem = {
                id: itemId,
                title: product.title || 'Unknown Product',
                price: resolvedPrice,
                discount_price: resolvedDiscountPrice,
                image_url: product.image_url || '',
                product_brand: product.product_brand || '',
                category_name: product.category_name || '',
                tax_percentage: Number(product.tax_percentage) || 18,
                quantity: 1
            };
            cart.push(cartItem);
            console.log('[Cart] New item added:', cartItem);
        }

        console.log('[Cart] Full cart state after update:', JSON.parse(JSON.stringify(cart)));

        // Recompute total and log so any price bug is immediately visible in console
        const total = cart.reduce(
            (sum, item) => sum + (Number(item.discount_price) || Number(item.price) || 0) * item.quantity,
            0
        );
        console.log('[Cart] ✅ Recomputed cart total: ₹' + total.toFixed(2));

        saveCart();
        showToast('Added to cart! 🛒');
    } catch(e) { console.error('[Cart] ❌ Error adding to cart:', e); }
};

// Make updateCartTotal globally accessible
window.updateCartTotal = updateCartTotal;

window.formatPrice = (price) => {
    const num = parseFloat(price) || 0;
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);
};

function setupSpinners() {
    const spinnerHtml = `<div id="global-spinner" class="spinner-overlay" style="display:none;"><div class="loader"></div></div>`;
    document.body.insertAdjacentHTML('beforeend', spinnerHtml);
}

window.showSpinner = () => { const o = document.getElementById('global-spinner'); if(o) o.style.display = 'flex'; };
window.hideSpinner = () => { const o = document.getElementById('global-spinner'); if(o) o.style.display = 'none'; };

window.showToast = (msg) => {
    const toast = document.createElement('div');
    toast.className = 'toast show';
    toast.innerText = msg;
    document.body.appendChild(toast);
    setTimeout(() => { toast.classList.remove('show'); setTimeout(()=>toast.remove(), 300); }, 3000);
}

function initAnimations() {
    const faders = document.querySelectorAll('.fade-in');
    const appearOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };
    
    const appearOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
        });
    }, appearOptions);

    faders.forEach(fader => {
        fader.style.opacity = '0';
        fader.style.transform = 'translateY(20px)';
        fader.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        appearOnScroll.observe(fader);
    });
}

function initMobileNav() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link, .bottom-nav-item').forEach(el => {
        if (el.getAttribute('href') === path) {
            el.classList.add('active');
        }
    });
}

// --- PRODUCT MODAL LOGIC ---
window.showProductModal = function(productId) {
    const product = OFFLINE_PRODUCTS.find(p => p.id === productId);
    if(!product) return;

    let modal = document.getElementById('quick-view-modal');
    if(!modal) {
        modal = document.createElement('div');
        modal.id = 'quick-view-modal';
        modal.className = 'modal fade-in';
        document.body.appendChild(modal);
    }

    const reviews = OFFLINE_REVIEWS.filter(r => r.productId === productId);
    let reviewsHtml = reviews.length > 0 
        ? reviews.map(r => `<div style="padding: 10px; background: rgba(0,0,0,0.02); border-radius: 8px; margin-bottom: 8px;"><strong>${r.user}</strong> <span style="color:#f1c40f;">${'⭐'.repeat(r.rating)}</span><p style="margin-top:4px; font-size:0.9rem;">${r.comment}</p></div>`).join('')
        : '<p style="color:var(--text-secondary); font-size:0.9rem;">No reviews yet. Be the first!</p>';

    const encodedProduct = encodeURIComponent(JSON.stringify(product));

    modal.innerHTML = `
        <div class="modal-content glass-card fade-in" style="transform: translateY(0);">
            <button class="modal-close" onclick="document.getElementById('quick-view-modal').style.display='none'">✕</button>
            <div style="display:flex; gap: 2rem; flex-wrap: wrap;">
                <img src="${product.image_url}" style="width:100%; max-width: 300px; height: 300px; object-fit: cover; border-radius: 12px; box-shadow: var(--shadow-soft);" loading="lazy" onerror="this.onerror=null; this.src='images/generic_supp.png';">
                <div style="flex:1; min-width: 250px;">
                    <h2 style="font-size: 1.8rem; margin-bottom: 0.5rem;">${product.title}</h2>
                    <div style="color:var(--text-secondary); margin-bottom: 1rem;">Brand: <strong style="color:var(--text-primary);">${product.product_brand || 'CultFit'}</strong> | Rating: ⭐ ${product.rating || '4.5'}</div>
                    <div style="font-size: 1.5rem; font-weight: 700; color: var(--primary-color); margin-bottom: 1.5rem;">${formatPrice(product.discount_price || product.price)}</div>
                    
                    <button class="btn" style="width: 100%; margin-bottom: 2rem;" onclick="addToCart('${encodedProduct}'); document.getElementById('quick-view-modal').style.display='none';">Add to Cart 🛒</button>
                    
                    <h3 style="font-size: 1.1rem; border-bottom: 1px solid rgba(166,180,200,0.3); padding-bottom: 0.5rem; margin-bottom: 1rem;">Customer Reviews</h3>
                    <div style="max-height: 200px; overflow-y: auto;">
                        ${reviewsHtml}
                    </div>
                </div>
            </div>
        </div>
    `;
    modal.style.display = 'flex';
};
