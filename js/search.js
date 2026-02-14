
const MOCK_PROPERTIES = [
    // Buy - Houses
    {
        id: 'buy1',
        type: 'buy',
        category: 'house',
        subCategory: 'residential',
        price: 2500000,
        beds: 3,
        baths: 2,
        sqft: 1500,
        location: 'New Cairo, Cairo',
        title: 'Modern Family Home',
        image: 'assets/images/property-1.png',
        featured: true
    },
    {
        id: 'buy2',
        type: 'buy',
        category: 'house',
        subCategory: 'residential',
        price: 3200000,
        beds: 4,
        baths: 3,
        sqft: 2200,
        location: 'Sheikh Zayed, Giza',
        title: 'Luxury Villa with Garden',
        image: 'assets/images/property-2.png',
        featured: true
    },
    {
        id: 'buy3',
        type: 'buy',
        category: 'house',
        subCategory: 'residential',
        price: 1800000,
        beds: 2,
        baths: 1,
        sqft: 1100,
        location: 'Nasr City, Cairo',
        title: 'Cozy Townhouse',
        image: 'assets/images/property-2.png',
        featured: false
    },
    // Buy - Condos
    {
        id: 'buy4',
        type: 'buy',
        category: 'condo',
        subCategory: 'residential',
        price: 1200000,
        beds: 2,
        baths: 2,
        sqft: 950,
        location: 'Maadi, Cairo',
        title: 'Nile View Apartment',
        image: 'assets/images/property-1.png',
        featured: true
    },
    {
        id: 'buy5',
        type: 'buy',
        category: 'condo',
        subCategory: 'residential',
        price: 850000,
        beds: 1,
        baths: 1,
        sqft: 700,
        location: 'Heliopolis, Cairo',
        title: 'Modern Studio',
        image: 'assets/images/property-1.png',
        featured: false
    },
    // Rent - Apartments
    {
        id: 'rent1',
        type: 'rent',
        category: 'condo',
        subCategory: 'residential',
        price: 15000,
        beds: 2,
        baths: 2,
        sqft: 1100,
        location: 'Zamalek, Cairo',
        title: 'Furnished Apartment in Zamalek',
        image: 'assets/images/property-2.png',
        featured: true
    },
    {
        id: 'rent2',
        type: 'rent',
        category: 'house',
        subCategory: 'residential',
        price: 25000,
        beds: 3,
        baths: 3,
        sqft: 1800,
        location: 'New Cairo, Cairo',
        title: 'Spacious Villa for Rent',
        image: 'assets/images/property-2.png',
        featured: false
    },
    {
        id: 'rent3',
        type: 'rent',
        category: 'condo',
        subCategory: 'residential',
        price: 8000,
        beds: 2,
        baths: 1,
        sqft: 900,
        location: 'Dokki, Giza',
        title: 'Central City Apartment',
        image: 'assets/images/property-2.png',
        featured: false
    },
    {
        id: 'rent4',
        type: 'rent',
        category: 'townhouse',
        subCategory: 'residential',
        price: 12000,
        beds: 3,
        baths: 2,
        sqft: 1400,
        location: '6th of October, Giza',
        title: 'Family Townhouse',
        image: 'assets/images/property-1.png',
        featured: false
    }
];

document.addEventListener('DOMContentLoaded', () => {
    initSearch();
});

function initSearch() {
    const params = new URLSearchParams(window.location.search);
    // Default to 'rent' if on rent.html, otherwise 'buy'
    const searchType = params.get('type') || (window.location.pathname.includes('rent.html') ? 'rent' : 'buy');

    // Initial Filter State
    let filters = {
        type: searchType, // buy/rent
        mainCategory: 'type', // type, price, beds
        subCategory: 'residential',
        location: '',
        propertyTypes: ['apartment'] // Default checked
    };

    // DOM Elements
    const grid = document.querySelector('.listings-grid');
    const resultsCount = document.querySelector('.search-results-count');
    const searchBtn = document.getElementById('sidebarSearchBtn');
    const inputLocation = document.getElementById('filterLocation');
    const clearBtn = document.getElementById('clearFilters');

    // --- Event Listeners ---

    // 1. Search Button
    if (searchBtn) {
        searchBtn.addEventListener('click', renderListings);
    }

    // 2. Clear Filters
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            // Reset to defaults
            filters.location = '';
            filters.propertyTypes = [];
            if (inputLocation) inputLocation.value = '';
            document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
            renderListings();
        });
    }

    // 3. Location Input
    if (inputLocation) {
        inputLocation.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                filters.location = e.target.value;
                renderListings();
            }
        });
        inputLocation.addEventListener('blur', (e) => {
            filters.location = e.target.value;
        });
    }

    // 4. Pills (Main & Sub Category)
    const pills = document.querySelectorAll('.filter-pill');
    pills.forEach(pill => {
        pill.addEventListener('click', () => {
            const group = pill.dataset.group;

            // Toggle active state in group
            document.querySelectorAll(`.filter-pill[data-group="${group}"]`).forEach(p => {
                p.classList.remove('active', 'active-red');
            });

            if (group === 'main-cat') {
                pill.classList.add('active');
                filters.mainCategory = pill.dataset.value;
                // You could swap the checkbox list view here based on category
            } else if (group === 'sub-cat') {
                pill.classList.add('active-red');
                filters.subCategory = pill.dataset.value;
            }
            renderListings();
        });
    });

    // 5. Checkboxes
    const checkboxes = document.querySelectorAll('.custom-checkbox-container input[type="checkbox"]');
    checkboxes.forEach(cb => {
        cb.addEventListener('change', () => {
            const val = cb.value;
            if (cb.checked) {
                if (!filters.propertyTypes.includes(val)) filters.propertyTypes.push(val);
            } else {
                filters.propertyTypes = filters.propertyTypes.filter(t => t !== val);
            }
            // Optional: Auto-search on checkbox (or wait for button)
            // renderListings(); 
        });
    });


    // --- Render Function ---
    function renderListings() {
        if (!grid) return;

        console.log('Searching with filters:', filters);

        // Filter logic
        const filtered = MOCK_PROPERTIES.filter(p => {
            // 1. Transaction Type (Buy/Rent)
            if (p.type !== filters.type) return false;

            // 2. Location (Partial Match)
            if (filters.location && !p.location.toLowerCase().includes(filters.location.toLowerCase()) &&
                !p.title.toLowerCase().includes(filters.location.toLowerCase())) return false;

            // 3. Property Type (Checkboxes)
            // If strictly matching sub-category 'residential' vs 'commercial', logic would be here.
            // For now, mapping checkbox values 'apartment', 'villa' etc to mock category 'house', 'condo' etc.
            // Adjust MOCK_PROPERTIES category or logic as needed.

            // Allow all if no checkboxes selected? Or strict? 
            // Let's say if checkboxes selected, match ONE of them.
            if (filters.propertyTypes.length > 0) {
                // Simple mapping for demo
                const typeMap = {
                    'apartment': 'condo',
                    'villa': 'house',
                    'townhouse': 'townhouse',
                    'duplex': 'condo'
                };

                // check if property category is in the selected mapped types
                const match = filters.propertyTypes.some(selectedType => {
                    return typeMap[selectedType] === p.category || p.category.includes(selectedType);
                });

                // if (!match) return false; // Strict filtering disabled for demo to show results always
            }

            return true;
        });

        // Update Count
        if (resultsCount) {
            resultsCount.textContent = `${filtered.length} homes`;
        }

        // Generate HTML
        grid.innerHTML = filtered.map(p => `
            <article class="card property-card">
                <a href="property.html?id=${p.id}">
                    <div class="card-image">
                        <span class="card-badge ${p.type === 'rent' ? 'badge-blue' : ''}">${p.type === 'rent' ? 'For Rent' : 'For Sale'}</span>
                        <button class="card-compare-label" data-id="${p.id}" onclick="event.preventDefault();">Compare <i class="fas fa-exchange-alt"></i></button>
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
                <button class="btn btn-primary btn-sm" id="resetFilters" onclick="window.location.reload()">Reset Filters</button>
            </div>`;
        }
    }

    // Initial Render
    renderListings();
}
