/* =============================================
   AURELIAN — Main Script
   ============================================= */

'use strict';

/* ---- State ---- */
const state = {
    cart: [],
    wishlist: new Set(),
};

/* ---- DOM helpers ---- */
const $ = (id) => document.getElementById(id);
const $$ = (sel, ctx = document) => ctx.querySelectorAll(sel);

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    loadWishlist();

    initNavbar();
    initSearch();
    initMobileMenu();
    initCart();
    initFilters();
    initProducts();
    initNewsletter();
    initSmoothScroll();
});

/* ============================================================
   NAVBAR — scroll + hide on fast downscroll
   ============================================================ */
function initNavbar() {
    const navbar = $('navbar');
    if (!navbar) return;

    let lastY = 0;

    window.addEventListener('scroll', () => {
        const y = window.scrollY;
        if (y > 80) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        lastY = y;
    }, { passive: true });
}

/* ============================================================
   SEARCH
   ============================================================ */
function initSearch() {
    const toggle = $('searchToggle');
    const bar = $('searchBar');
    const close = $('searchClose');
    const input = $('searchInput');
    if (!toggle || !bar) return;

    const openSearch = () => {
        bar.classList.add('open');
        setTimeout(() => input?.focus(), 100);
    };
    const closeSearch = () => {
        bar.classList.remove('open');
        if (input) input.value = '';
    };

    toggle.addEventListener('click', openSearch);
    close?.addEventListener('click', closeSearch);

    // Live search filter
    input?.addEventListener('input', () => {
        const q = input.value.trim().toLowerCase();
        const cards = $$('.product-card');
        let visible = 0;

        cards.forEach(card => {
            const name = card.dataset.name?.toLowerCase() || '';
            const cat  = card.dataset.category?.toLowerCase() || '';
            const match = !q || name.includes(q) || cat.includes(q);
            card.classList.toggle('hidden', !match);
            if (match) visible++;
        });

        updateProductCount(visible);
        $('noResults')?.toggleAttribute('hidden', visible > 0);
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && bar.classList.contains('open')) closeSearch();
    });
}

/* ============================================================
   MOBILE MENU
   ============================================================ */
function initMobileMenu() {
    const toggle = $('menuToggle');
    const menu   = $('mobileMenu');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', () => {
        const isOpen = menu.classList.toggle('open');
        toggle.setAttribute('aria-expanded', isOpen);
        const [s1, s2, s3] = toggle.querySelectorAll('span');

        if (isOpen) {
            s1.style.transform = 'rotate(45deg) translateY(9px)';
            s2.style.opacity   = '0';
            s3.style.transform = 'rotate(-45deg) translateY(-9px)';
        } else {
            s1.style.transform = s2.style.opacity = s3.style.transform = '';
        }
    });

    // Close menu on link click
    $$('a', menu).forEach(a => {
        a.addEventListener('click', () => {
            menu.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
        });
    });
}

/* ============================================================
   CART
   ============================================================ */
function initCart() {
    // Icon opens cart
    $('cartIcon')?.addEventListener('click', openCart);

    // Close buttons
    $('closeCart')?.addEventListener('click', closeCart);
    $('cartOverlay')?.addEventListener('click', closeCart);
    $('continueShoppingBtn')?.addEventListener('click', closeCart);

    // Empty cart CTA closes sidebar and scrolls
    $('emptyCartCta')?.addEventListener('click', closeCart);

    // Checkout (placeholder)
    document.querySelector('.checkout-button')?.addEventListener('click', () => {
        showToast('Checkout coming soon!');
    });

    renderCart();
}

function openCart() {
    $('cartSidebar')?.classList.add('open');
    $('cartSidebar')?.setAttribute('aria-hidden', 'false');
    $('cartOverlay')?.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCart() {
    $('cartSidebar')?.classList.remove('open');
    $('cartSidebar')?.setAttribute('aria-hidden', 'true');
    $('cartOverlay')?.classList.remove('active');
    document.body.style.overflow = '';
}

/* --- Cart data --- */
function loadCart() {
    try {
        const saved = localStorage.getItem('aurelian_cart');
        if (saved) state.cart = JSON.parse(saved);
    } catch { state.cart = []; }
}

function saveCart() {
    localStorage.setItem('aurelian_cart', JSON.stringify(state.cart));
}

function addToCart(id, name, price, category = '') {
    const existing = state.cart.find(i => i.id === id);
    if (existing) {
        existing.qty++;
    } else {
        state.cart.push({ id, name, price, category, qty: 1 });
    }
    saveCart();
    renderCart();
    openCart();
    showToast(`${name} added to cart`);
}

function removeFromCart(id) {
    state.cart = state.cart.filter(i => i.id !== id);
    saveCart();
    renderCart();
}

function changeQty(id, delta) {
    const item = state.cart.find(i => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) removeFromCart(id);
    else { saveCart(); renderCart(); }
}

/* --- Cart render --- */
function renderCart() {
    const container  = $('cartItems');
    const footer     = $('cartFooter');
    const totalEl    = $('totalPrice');
    const countEl    = $('cartCount');
    const headerCount = $('cartHeaderCount');

    if (!container) return;

    const totalQty  = state.cart.reduce((s, i) => s + i.qty, 0);
    const totalPrice = state.cart.reduce((s, i) => s + i.price * i.qty, 0);

    // Badge
    if (countEl) {
        countEl.textContent = totalQty;
        countEl.classList.toggle('visible', totalQty > 0);
    }

    // Header count
    if (headerCount) {
        headerCount.textContent = totalQty > 0 ? `(${totalQty})` : '';
    }

    // Total
    if (totalEl) totalEl.textContent = totalPrice.toFixed(2);

    // Footer visibility
    if (footer) footer.toggleAttribute('hidden', state.cart.length === 0);

    // Items
    if (state.cart.length === 0) {
        container.innerHTML = `
            <div class="empty-cart">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
                <p>Your cart is empty</p>
                <a href="#products" class="empty-cart-cta" id="emptyCartCta">Browse Collection</a>
            </div>
        `;
        $('emptyCartCta')?.addEventListener('click', closeCart);
        return;
    }

    container.innerHTML = state.cart.map(item => `
        <div class="cart-item" data-id="${item.id}">
            <div class="cart-item-img">
                <img src="" alt="${item.name}" onerror="this.style.display='none'">
            </div>
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p class="item-category">${item.category}</p>
                <div class="qty-controls">
                    <button class="qty-btn qty-minus" data-id="${item.id}" aria-label="Decrease quantity">−</button>
                    <span class="qty-display" aria-live="polite">${item.qty}</span>
                    <button class="qty-btn qty-plus" data-id="${item.id}" aria-label="Increase quantity">+</button>
                </div>
                <button class="remove-item" data-id="${item.id}">Remove</button>
            </div>
            <div class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</div>
        </div>
    `).join('');

    // Bind buttons
    $$('.qty-minus', container).forEach(btn =>
        btn.addEventListener('click', () => changeQty(btn.dataset.id, -1))
    );
    $$('.qty-plus', container).forEach(btn =>
        btn.addEventListener('click', () => changeQty(btn.dataset.id, 1))
    );
    $$('.remove-item', container).forEach(btn =>
        btn.addEventListener('click', () => removeFromCart(btn.dataset.id))
    );
}

/* ============================================================
   PRODUCT CARDS — add to cart + wishlist
   ============================================================ */
function initProducts() {
    $$('.product-card').forEach(card => {
        const id       = card.dataset.id;
        const name     = card.dataset.name;
        const price    = parseFloat(card.dataset.price);
        const category = card.querySelector('.product-category')?.textContent || '';

        // Quick add
        card.querySelector('.quick-add')?.addEventListener('click', (e) => {
            e.stopPropagation();
            addToCart(id, name, price, category);
        });

        // Wishlist
        const wishBtn = card.querySelector('.wishlist-btn');
        wishBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            if (state.wishlist.has(id)) {
                state.wishlist.delete(id);
                wishBtn.classList.remove('active');
                showToast(`${name} removed from wishlist`);
            } else {
                state.wishlist.add(id);
                wishBtn.classList.add('active');
                showToast(`${name} saved to wishlist`);
            }
            saveWishlist();
        });

        // Restore wishlist state
        if (state.wishlist.has(id)) wishBtn?.classList.add('active');
    });
}

/* ============================================================
   FILTERS
   ============================================================ */
function initFilters() {
    const pills = $$('.pill');

    pills.forEach(pill => {
        pill.addEventListener('click', () => {
            pills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            filterProducts(pill.dataset.category);
        });
    });
}

function filterProducts(category) {
    const cards = $$('.product-card');
    let visible = 0;

    cards.forEach(card => {
        const cats = card.dataset.category.split(' ');
        const show = category === 'all' || cats.includes(category);
        card.classList.toggle('hidden', !show);
        if (show) visible++;
    });

    updateProductCount(visible);
    const noResults = $('noResults');
    if (noResults) noResults.toggleAttribute('hidden', visible > 0);

    // Reset search
    const searchInput = $('searchInput');
    if (searchInput) searchInput.value = '';
}

function updateProductCount(n) {
    const el = $('productCount');
    if (el) el.textContent = `${n} piece${n !== 1 ? 's' : ''}`;
}

/* ============================================================
   WISHLIST persistence
   ============================================================ */
function loadWishlist() {
    try {
        const saved = localStorage.getItem('aurelian_wishlist');
        if (saved) state.wishlist = new Set(JSON.parse(saved));
    } catch { state.wishlist = new Set(); }
}

function saveWishlist() {
    localStorage.setItem('aurelian_wishlist', JSON.stringify([...state.wishlist]));
}

/* ============================================================
   NEWSLETTER
   ============================================================ */
function initNewsletter() {
    const form = $('newsletterForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input  = form.querySelector('input');
        const button = form.querySelector('button');
        if (!input?.value) return;

        button.textContent = 'Subscribing…';
        button.disabled = true;

        setTimeout(() => {
            button.textContent = 'Subscribed ✓';
            input.value = '';
            showToast('Welcome to AURELIAN');
            setTimeout(() => {
                button.textContent = 'Subscribe';
                button.disabled = false;
            }, 3000);
        }, 1000);
    });
}

/* ============================================================
   SMOOTH SCROLL
   ============================================================ */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', (e) => {
            const href = a.getAttribute('href');
            if (!href || href === '#') return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

/* ============================================================
   TOAST
   ============================================================ */
let toastTimer;
function showToast(message) {
    const toast = $('toast');
    if (!toast) return;
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('show');
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

/* ============================================================
   PUBLIC API (optional external access)
   ============================================================ */
window.aurelian = {
    addToCart,
    removeFromCart,
    changeQty,
    openCart,
    closeCart,
    getCart: () => state.cart,
    showToast,
};