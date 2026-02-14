
const MOCK_PROPERTIES = [
    // Buy - Houses
    {
        id: 'buy1',
        type: 'buy',
        category: 'house',
        price: 2500000,
        beds: 3,
        baths: 2,
        sqft: 1500,
        location: 'New Cairo, Cairo',
        title: 'Modern Family Home',
        image: 'assets/images/property-1.jpg',
        featured: true
    },
    {
        id: 'buy2',
        type: 'buy',
        category: 'house',
        price: 3200000,
        beds: 4,
        baths: 3,
        sqft: 2200,
        location: 'Sheikh Zayed, Giza',
        title: 'Luxury Villa with Garden',
        image: 'assets/images/property-2.jpg',
        featured: true
    },
    {
        id: 'buy3',
        type: 'buy',
        category: 'house',
        price: 1800000,
        beds: 2,
        baths: 1,
        sqft: 1100,
        location: 'Nasr City, Cairo',
        title: 'Cozy Townhouse',
        image: 'assets/images/property-3.jpg',
        featured: false
    },
    // Buy - Condos
    {
        id: 'buy4',
        type: 'buy',
        category: 'condo',
        price: 1200000,
        beds: 2,
        baths: 2,
        sqft: 950,
        location: 'Maadi, Cairo',
        title: 'Nile View Apartment',
        image: 'assets/images/property-4.jpg',
        featured: true
    },
    {
        id: 'buy5',
        type: 'buy',
        category: 'condo',
        price: 850000,
        beds: 1,
        baths: 1,
        sqft: 700,
        location: 'Heliopolis, Cairo',
        title: 'Modern Studio',
        image: 'assets/images/property-5.jpg',
        featured: false
    },
    // Rent - Apartments
    {
        id: 'rent1',
        type: 'rent',
        category: 'condo',
        price: 15000,
        beds: 2,
        baths: 2,
        sqft: 1100,
        location: 'Zamalek, Cairo',
        title: 'Furnished Apartment in Zamalek',
        image: 'assets/images/property-6.jpg',
        featured: true
    },
    {
        id: 'rent2',
        type: 'rent',
        category: 'house',
        price: 25000,
        beds: 3,
        baths: 3,
        sqft: 1800,
        location: 'New Cairo, Cairo',
        title: 'Spacious Villa for Rent',
        image: 'assets/images/property-1.jpg',
        featured: false
    },
    {
        id: 'rent3',
        type: 'rent',
        category: 'condo',
        price: 8000,
        beds: 2,
        baths: 1,
        sqft: 900,
        location: 'Dokki, Giza',
        title: 'Central City Apartment',
        image: 'assets/images/property-2.jpg',
        featured: false
    },
    {
        id: 'rent4',
        type: 'rent',
        category: 'townhouse',
        price: 12000,
        beds: 3,
        baths: 2,
        sqft: 1400,
        location: '6th of October, Giza',
        title: 'Family Townhouse',
        image: 'assets/images/property-3.jpg',
        featured: false
    }
];

document.addEventListener('DOMContentLoaded', () => {
    initSearch();
});

function initSearch() {
    const params = new URLSearchParams(window.location.search);
    const searchType = params.get('type') || 'buy'; // 'buy' or 'rent'

    // Mock initial filter state
    let filters = {
        type: searchType, // buy/rent
        propertyType: 'all',
        location: '',
        priceMin: 0,
        priceMax: 10000000,
        beds: 'any',
        baths: 'any',
        sqftMin: 0,
        sqftMax: 10000
    };

    // DOM Elements
    const grid = document.querySelector('.listings-grid');
    const resultsCount = document.querySelector('.search-results-count');

    // Inputs
    const inputLocation = document.getElementById('filterLocation');
    const inputTypeContainer = document.getElementById('filterType');
    const inputPriceMin = document.getElementById('filterPriceMin');
    const inputPriceMax = document.getElementById('filterPriceMax');
    const inputPriceRange = document.getElementById('filterPriceRange');
    const inputBedsContainer = document.getElementById('filterBeds');
    const inputBathsContainer = document.getElementById('filterBaths');
    const inputSqftMin = document.getElementById('filterSqftMin');
    const inputSqftMax = document.getElementById('filterSqftMax');

    // Initialize UI based on URL params
    if (params.get('location')) {
        filters.location = params.get('location');
        if (inputLocation) inputLocation.value = filters.location;
    }

    // Render Helpers
    function renderListings() {
        if (!grid) return;

        // Filter logic
        const filtered = MOCK_PROPERTIES.filter(p => {
            // 1. Transaction Type (Buy/Rent)
            if (p.type !== filters.type) return false;

            // 2. Property Category
            if (filters.propertyType !== 'all' && p.category !== filters.propertyType) return false;

            // 3. Location (Partial Match)
            if (filters.location && !p.location.toLowerCase().includes(filters.location.toLowerCase())) return false;

            // 4. Price
            if (p.price < filters.priceMin || p.price > filters.priceMax) return false;

            // 5. Beds
            if (filters.beds !== 'any' && p.beds < parseInt(filters.beds)) return false;

            // 6. Baths
            if (filters.baths !== 'any' && p.baths < parseInt(filters.baths)) return false;

            // 7. Sqft
            if (filters.sqftMin > 0 && p.sqft < filters.sqftMin) return false;
            if (filters.sqftMax > 0 && filters.sqftMax < 10000 && p.sqft > filters.sqftMax) return false;

            return true;
        });

        // Update Count
        if (resultsCount) {
            const count = filtered.length;
            const typeText = filters.type === 'rent' ? 'rentals' : 'homes for sale';
            resultsCount.textContent = `${count} ${typeText}`;
            // Try to translate if i18n exists
            if (typeof I18n !== 'undefined' && I18n.translations && I18n.translations[I18n.currentLang]) {
                const t = I18n.translations[I18n.currentLang];
                const suffix = filters.type === 'rent' ? (t.nav_rent || 'Rent') : (t.nav_buy || 'Buy');
                resultsCount.textContent = `${count} - ${suffix}`;
            }
        }

        // Generate HTML
        grid.innerHTML = filtered.map(p => `
            <article class="card property-card">
                <a href="property.html?id=${p.id}">
                    <div class="card-image">
                        <span class="card-badge ${p.type === 'rent' ? 'badge-blue' : ''}">${p.type === 'rent' ? 'For Rent' : 'For Sale'}</span>
                        <button class="card-compare-label" onclick="event.preventDefault();">Compare <i class="fas fa-exchange-alt"></i></button>
                        <div class="card-overlay-actions">
                            <button class="overlay-btn" onclick="event.preventDefault();"><i class="fas fa-share-alt"></i></button>
                            <button class="overlay-btn" onclick="event.preventDefault();"><i class="far fa-heart"></i></button>
                        </div>
                        <img src="${p.image}" alt="${p.title}" onerror="this.src='https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80'">
                    </div>
                </a>
                <div class="card-body">
                    <span class="card-type-badge"><i class="fas fa-star"></i> Distinct</span>
                    <div class="property-national-id">Property National ID Number <span>${Math.floor(1000000000000000 + Math.random() * 9000000000000000)}</span></div>
                    <div class="property-name">${p.title}</div>
                    <div class="property-mls">MLS ID number <span>E${Math.floor(100000 + Math.random() * 900000)}</span></div>
                    <div class="property-specs-new">
                        <div class="spec-item"><i class="fas fa-bed"></i> <span class="spec-value">${p.beds}</span> Rooms</div>
                        <div class="spec-divider"></div>
                        <div class="spec-item"><i class="fas fa-bath"></i> <span class="spec-value">${p.baths}</span> Bathroom</div>
                        <div class="spec-divider"></div>
                        <div class="spec-item"><i class="fas fa-vector-square"></i> <span class="spec-value">${p.sqft}</span> SQ MT</div>
                    </div>
                    <div class="property-price-new">
                        ${p.price.toLocaleString()} EGP
                        ${p.type === 'rent' ? '<span style="font-size:0.8em; font-weight:normal">/mo</span>' : ''}
                    </div>
                    <div class="card-actions-new">
                        <a href="property.html?id=${p.id}" class="btn-book-tour"><i class="far fa-calendar-alt"></i> Book a tour</a>
                        <a href="https://wa.me/201000000000" target="_blank" class="btn-circle-icon whatsapp-icon"><i class="fab fa-whatsapp"></i></a>
                        <a href="tel:+201000000000" class="btn-circle-icon"><i class="fas fa-phone-alt"></i></a>
                    </div>
                </div>
            </article>
        `).join('');

        if (filtered.length === 0) {
            grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--gray-500);">
                <i class="fas fa-search" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
                <p>No results found matching your criteria.</p>
                <button class="btn btn-primary btn-sm" id="resetFilters" style="margin-top: 16px;">Reset Filters</button>
            </div>`;

            const resetBtn = document.getElementById('resetFilters');
            if (resetBtn) {
                resetBtn.addEventListener('click', () => {
                    // Reset logic could go here or just reload
                    window.location.reload();
                });
            }
        }
    }

    // Event Listeners for Filters

    // Location
    if (inputLocation) {
        inputLocation.addEventListener('input', (e) => {
            filters.location = e.target.value;
            renderListings();
        });
    }

    // Property Type (Chips)
    if (inputTypeContainer) {
        const chips = inputTypeContainer.querySelectorAll('.filter-chip');
        chips.forEach(chip => {
            chip.addEventListener('click', () => {
                chips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                filters.propertyType = chip.dataset.value;
                renderListings();
            });
        });
    }

    // Price Inputs
    function updatePrice() {
        const min = parseInt(inputPriceMin.value.replace(/[^0-9]/g, '')) || 0;
        const max = parseInt(inputPriceMax.value.replace(/[^0-9]/g, '')) || 10000000;
        filters.priceMin = min;
        filters.priceMax = max;
        renderListings();
    }
    if (inputPriceMin) inputPriceMin.addEventListener('change', updatePrice);
    if (inputPriceMax) inputPriceMax.addEventListener('change', updatePrice);
    if (inputPriceRange) {
        inputPriceRange.addEventListener('input', (e) => {
            // Logarithmic scale or simple direct mapping for demo
            // Trying to make the slider somewhat useful for the range 0 - 2M+
            filters.priceMax = parseInt(e.target.value);
            inputPriceMax.value = filters.priceMax.toLocaleString();
            renderListings();
        });
    }

    // Beds
    if (inputBedsContainer) {
        const chips = inputBedsContainer.querySelectorAll('.filter-chip');
        chips.forEach(chip => {
            chip.addEventListener('click', () => {
                chips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                filters.beds = chip.dataset.value;
                renderListings();
            });
        });
    }

    // Baths
    if (inputBathsContainer) {
        const chips = inputBathsContainer.querySelectorAll('.filter-chip');
        chips.forEach(chip => {
            chip.addEventListener('click', () => {
                chips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                filters.baths = chip.dataset.value;
                renderListings();
            });
        });
    }

    // Initial Render
    renderListings();
}
