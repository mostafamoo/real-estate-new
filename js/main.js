// Main JavaScript
document.addEventListener('DOMContentLoaded', function () {
    // Initialize all components
    initHeader();
    initMobileMenu();
    initDropdowns();
    initTabs();
    initModals();
    initAccordions();
    initScrollAnimations();
    initPropertyCards();
    initSearchTabs();
    initCarousels();
    initSearchPage();
    initMortgageCalculator();
});

// ========== MORTGAGE CALCULATOR ==========
// ========== MORTGAGE CALCULATOR (PREMIUM) ==========
function initMortgageCalculator() {
    const calculator = document.getElementById('mortgage-calculator');
    // If we are on the calculator page, we might have the wrapper but not necessarily the #mortgage-calculator *section* from before, 
    // but in my new HTML I kept id="mortgage-calculator" on the results column.
    // However, I should check if the *inputs* exist, which is safer.
    const priceInput = document.getElementById('home-price');
    if (!priceInput) return;

    // Elements
    const programSelect = document.getElementById('loan-program');
    const incomeInput = document.getElementById('monthly-income');
    const priceRange = document.getElementById('home-price-range');
    const downInput = document.getElementById('down-payment');
    const downRange = document.getElementById('down-payment-range');
    const rateInput = document.getElementById('interest-rate');
    const termInput = document.getElementById('loan-term');

    // Results
    const monthlyDisplay = document.getElementById('monthly-payment');
    const piDisplay = document.getElementById('breakdown-pi');
    const taxDisplay = document.getElementById('breakdown-tax');
    const insuranceDisplay = document.getElementById('breakdown-insurance');
    const badgeEl = document.getElementById('eligibility-badge');

    // MLS Search Elements
    const mlsInput = document.getElementById('mls-search-input');
    const mlsBtn = document.getElementById('mls-search-btn');
    const mlsError = document.getElementById('mls-error-msg');
    const mlsSuccess = document.getElementById('mls-success-msg');

    // Mock Data
    const MOCK_MLS = {
        '1001': { price: 2500000, income: 40000 }, // Luxury
        '1002': { price: 500000, income: 8000 },   // Affordable
        '1003': { price: 1200000, income: 15000 }  // Mid-range
    };

    function updateLoanProgram() {
        const program = programSelect.value;
        // Default values
        let rate = 10;
        let term = 20;

        if (program === '3') {
            rate = 3;
            term = 30;
        } else if (program === '8') {
            rate = 8;
            term = 25;
        } else {
            rate = 12; // Commercial
            term = 20;
        }

        rateInput.value = rate;
        termInput.value = term;
        // Trigger calculation
        calculateMortgage();
    }

    function calculateMortgage() {
        const price = parseFloat(priceInput.value) || 0;
        const down = parseFloat(downInput.value) || 0;
        const rate = parseFloat(rateInput.value) || 0;
        const term = parseFloat(termInput.value) || 30;
        const income = parseFloat(incomeInput.value) || 0;

        const principal = price - down;
        const monthlyRate = rate / 100 / 12;
        const months = term * 12;

        let monthlyPI = 0;
        if (rate === 0) {
            monthlyPI = principal / months;
        } else {
            monthlyPI = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
        }

        // Estimates (Egypt context approx)
        // 1.5% Tax/Maintenance annual? Let's keep it simple.
        const monthlyTax = (price * 0.001); // 0.1% monthly
        const monthlyInsurance = (price * 0.0005); // 0.05% monthly

        const totalMonthly = monthlyPI + monthlyTax + monthlyInsurance;

        // Eligibility Check (DTI 40%)
        const maxAffordable = income * 0.40;
        const isEligible = totalMonthly <= maxAffordable;

        // Update UI
        // Use I18n currency or generic EGP
        const fmt = (num) => Math.round(num).toLocaleString('en-US');

        if (monthlyDisplay) monthlyDisplay.textContent = `${fmt(totalMonthly)} EGP`;
        if (piDisplay) piDisplay.textContent = fmt(monthlyPI);
        if (taxDisplay) taxDisplay.textContent = fmt(monthlyTax);
        if (insuranceDisplay) insuranceDisplay.textContent = fmt(monthlyInsurance);

        if (badgeEl && income > 0) {
            if (isEligible) {
                badgeEl.innerHTML = `<span class="eligibility-tag tag-success"><i class="fas fa-check-circle"></i> Eligible</span>`;
            } else {
                badgeEl.innerHTML = `<span class="eligibility-tag tag-error"><i class="fas fa-exclamation-circle"></i> High DTI (${Math.round((totalMonthly / income) * 100)}%)</span>`;
            }
        }
    }

    function handleMlsSearch() {
        const mlsId = mlsInput.value.trim();
        mlsError.style.display = 'none';
        mlsSuccess.style.display = 'none';

        if (MOCK_MLS[mlsId]) {
            const data = MOCK_MLS[mlsId];
            priceInput.value = data.price;
            priceRange.value = data.price;
            incomeInput.value = data.income;

            // Auto calculate
            calculateMortgage();

            mlsSuccess.textContent = "Data Loaded!";
            mlsSuccess.style.display = 'inline';
        } else {
            mlsError.textContent = "MLS ID Not Found.";
            mlsError.style.display = 'inline';
        }
    }

    // Event Listeners
    if (programSelect) programSelect.addEventListener('change', updateLoanProgram);
    if (incomeInput) incomeInput.addEventListener('input', calculateMortgage);

    if (priceInput && priceRange) {
        priceInput.addEventListener('input', () => { priceRange.value = priceInput.value; calculateMortgage(); });
        priceRange.addEventListener('input', () => { priceInput.value = priceRange.value; calculateMortgage(); });
    }

    if (downInput && downRange) {
        downInput.addEventListener('input', () => { downRange.value = downInput.value; calculateMortgage(); });
        downRange.addEventListener('input', () => { downInput.value = downRange.value; calculateMortgage(); });
    }

    if (rateInput) rateInput.addEventListener('input', calculateMortgage);
    if (termInput) termInput.addEventListener('change', calculateMortgage);

    if (mlsBtn) mlsBtn.addEventListener('click', handleMlsSearch);

    // Initial Calculation
    updateLoanProgram();
}

// ========== SEARCH PAGE LOGIC ==========
function initSearchPage() {
    // Only run on search page
    if (!window.location.pathname.includes('search.html')) return;

    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type');

    // Update Nav Active State based on type
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));

    if (type === 'rent') {
        const rentLink = document.querySelector('.nav-link[href*="type=rent"]');
        if (rentLink) rentLink.classList.add('active');

        // Update Page Title
        document.title = "Rent | Real Estate";

        // Update Results Text (Mock)
        const resultsCount = document.querySelector('.search-results-count');
        if (resultsCount) {
            resultsCount.innerHTML = '453 rentals';
            resultsCount.removeAttribute('data-i18n'); // Prevent overwrite
        }
    } else if (type === 'buy') {
        const buyLink = document.querySelector('.nav-link[href*="type=buy"]');
        if (buyLink) buyLink.classList.add('active');

        // Update Page Title
        document.title = "Buy | Real Estate";

        // Update Results Text (Mock)
        const resultsCount = document.querySelector('.search-results-count');
        if (resultsCount) {
            resultsCount.innerHTML = '245 homes for sale';
            resultsCount.removeAttribute('data-i18n');
        }
    } else {
        // Default to buy if no type specified
        const buyLink = document.querySelector('.nav-link[href*="type=buy"]');
        if (buyLink) buyLink.classList.add('active');
    }


    // Update Property Cards for Rent (Mock Data Transformation)
    if (type === 'rent') {
        document.querySelectorAll('.property-card').forEach(card => {
            // Change Price to Monthly
            const priceEl = card.querySelector('.property-price');
            if (priceEl && !priceEl.textContent.includes('/mo')) {
                // Simple heuristic: if price > 100k, it's likely sale price. Convert to dummy rent.
                let priceText = priceEl.textContent;
                let priceVal = parseInt(priceText.replace(/[^0-9]/g, ''));
                if (priceVal > 50000) {
                    let rentVal = Math.round(priceVal * 0.005); // Approx 0.5% rule
                    priceEl.innerHTML = '$' + rentVal.toLocaleString() + '<span style="font-size: 0.8em; font-weight: normal; color: var(--gray-600)">/mo</span>';
                }
            }

            // Change Badge
            const badge = card.querySelector('.card-badge');
            if (badge) {
                if (badge.dataset.i18n === 'badge_for_sale' || badge.textContent === 'For Sale') {
                    badge.textContent = 'For Rent';
                    badge.className = 'card-badge badge-blue'; // Ensure blue color for rent
                    badge.removeAttribute('data-i18n');
                }
            }
        });
    }

}


// ========== HEADER ==========
function initHeader() {
    const header = document.querySelector('.header');
    if (!header) return;

    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });
}

// ========== MOBILE MENU ==========
function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (!menuToggle || !navMenu) return;

    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        menuToggle.classList.toggle('active');
        document.body.classList.toggle('menu-open');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
            navMenu.classList.remove('active');
            menuToggle.classList.remove('active');
            document.body.classList.remove('menu-open');
        }
    });
}

// ========== DROPDOWNS ==========
function initDropdowns() {
    const dropdowns = document.querySelectorAll('[data-dropdown]');

    dropdowns.forEach(dropdown => {
        const trigger = dropdown.querySelector('[data-dropdown-trigger]');
        const content = dropdown.querySelector('[data-dropdown-content]');

        if (!trigger || !content) return;

        trigger.addEventListener('click', (e) => {
            e.stopPropagation();

            // Close other dropdowns
            dropdowns.forEach(d => {
                if (d !== dropdown) {
                    d.classList.remove('active');
                }
            });

            dropdown.classList.toggle('active');
        });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', () => {
        dropdowns.forEach(dropdown => {
            dropdown.classList.remove('active');
        });
    });
}

// ========== TABS ==========
function initTabs() {
    const tabContainers = document.querySelectorAll('[data-tabs]');

    tabContainers.forEach(container => {
        const tabs = container.querySelectorAll('[data-tab]');
        const panes = container.querySelectorAll('[data-tab-pane]');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const target = tab.dataset.tab;

                // Update active tab
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Update active pane
                panes.forEach(pane => {
                    pane.classList.remove('active');
                    if (pane.dataset.tabPane === target) {
                        pane.classList.add('active');
                    }
                });
            });
        });
    });
}

// ========== SEARCH TABS ==========
function initSearchTabs() {
    const searchTabs = document.querySelectorAll('.search-tab');

    searchTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            searchTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });
}

// ========== MODALS ==========
function initModals() {
    const modalTriggers = document.querySelectorAll('[data-modal]');
    const modalCloses = document.querySelectorAll('[data-modal-close]');
    const modalBackdrops = document.querySelectorAll('.modal-backdrop');

    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const modalId = trigger.dataset.modal;
            const modal = document.getElementById(modalId);
            const backdrop = document.querySelector(`.modal-backdrop[data-modal-backdrop="${modalId}"]`);

            if (modal) openModal(modal, backdrop);
        });
    });

    modalCloses.forEach(close => {
        close.addEventListener('click', () => {
            const modal = close.closest('.modal');
            const modalId = modal.id;
            const backdrop = document.querySelector(`.modal-backdrop[data-modal-backdrop="${modalId}"]`);

            closeModal(modal, backdrop);
        });
    });

    modalBackdrops.forEach(backdrop => {
        backdrop.addEventListener('click', () => {
            const modalId = backdrop.dataset.modalBackdrop;
            const modal = document.getElementById(modalId);

            closeModal(modal, backdrop);
        });
    });
}

function openModal(modal, backdrop) {
    if (backdrop) backdrop.classList.add('active');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(modal, backdrop) {
    if (backdrop) backdrop.classList.remove('active');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// ========== ACCORDIONS ==========
function initAccordions() {
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.closest('.accordion-item');
            const isActive = item.classList.contains('active');

            // Close all items in this accordion
            const accordion = header.closest('.accordion');
            if (accordion) {
                const allItems = accordion.querySelectorAll('.accordion-item');
                allItems.forEach(i => i.classList.remove('active'));
            }

            // Toggle current item
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}

// ========== SCROLL ANIMATIONS ==========
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('[data-animate]');

    if (!animatedElements.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const animation = entry.target.dataset.animate;
                entry.target.classList.add(`animate-${animation}`);
                entry.target.style.opacity = '1';
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    animatedElements.forEach(el => {
        el.style.opacity = '0';
        observer.observe(el);
    });
}

// ========== PROPERTY CARDS ==========
function initPropertyCards() {
    const saveButtons = document.querySelectorAll('.card-save');

    saveButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            btn.classList.toggle('active');

            // Update heart icon
            const icon = btn.querySelector('svg');
            if (icon) {
                if (btn.classList.contains('active')) {
                    icon.setAttribute('fill', 'currentColor');
                } else {
                    icon.setAttribute('fill', 'none');
                }
            }
        });
    });
}

// ========== CAROUSELS ==========
function initCarousels() {
    const carousels = document.querySelectorAll('[data-carousel]');

    carousels.forEach(carousel => {
        const track = carousel.querySelector('[data-carousel-track]');
        const prevBtn = carousel.querySelector('[data-carousel-prev]');
        const nextBtn = carousel.querySelector('[data-carousel-next]');
        const items = carousel.querySelectorAll('[data-carousel-item]');

        if (!track || !items.length) return;

        let currentIndex = 0;
        const itemWidth = items[0].offsetWidth;
        const gap = parseInt(getComputedStyle(track).gap) || 24;
        const visibleItems = Math.floor(carousel.offsetWidth / (itemWidth + gap));
        const maxIndex = Math.max(0, items.length - visibleItems);

        function updateCarousel() {
            const offset = currentIndex * (itemWidth + gap);
            track.style.transform = `translateX(-${offset}px)`;

            if (prevBtn) prevBtn.disabled = currentIndex === 0;
            if (nextBtn) nextBtn.disabled = currentIndex >= maxIndex;
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                currentIndex = Math.max(0, currentIndex - 1);
                updateCarousel();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                currentIndex = Math.min(maxIndex, currentIndex + 1);
                updateCarousel();
            });
        }

        updateCarousel();
    });
}

// ========== FORM VALIDATION ==========
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^[\d\s\-\+\(\)]{10,}$/;
    return re.test(phone);
}

function showFormError(input, message) {
    const formGroup = input.closest('.form-group');
    if (!formGroup) return;

    // Remove existing error
    const existingError = formGroup.querySelector('.form-error');
    if (existingError) existingError.remove();

    // Add error
    input.classList.add('error');
    const errorEl = document.createElement('span');
    errorEl.className = 'form-error';
    errorEl.textContent = message;
    formGroup.appendChild(errorEl);
}

function clearFormError(input) {
    const formGroup = input.closest('.form-group');
    if (!formGroup) return;

    input.classList.remove('error');
    const existingError = formGroup.querySelector('.form-error');
    if (existingError) existingError.remove();
}

// ========== UTILITIES ==========
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
    }).format(amount);
}

function formatNumber(num) {
    return new Intl.NumberFormat('en-US').format(num);
}

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

function throttle(func, limit) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Export functions for use in other scripts
window.RealEstate = {
    openModal,
    closeModal,
    formatCurrency,
    formatNumber,
    validateEmail,
    validatePhone,
    showFormError,
    clearFormError,
    debounce,
    throttle
};
