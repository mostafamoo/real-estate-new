
const ComparisonManager = {
    key: 'property_comparison_list',
    maxItems: 3,

    init() {
        this.updateUI();
        this.bindEvents();
    },

    getList() {
        const list = localStorage.getItem(this.key);
        return list ? JSON.parse(list) : [];
    },

    addProperty(property) {
        const list = this.getList();
        if (list.some(item => item.id === property.id)) {
            alert('This property is already in your comparison list.');
            return;
        }
        if (list.length >= this.maxItems) {
            alert(`You can compare up to ${this.maxItems} properties only.`);
            return;
        }
        list.push(property);
        localStorage.setItem(this.key, JSON.stringify(list));
        this.updateUI();

        // Visual feedback
        const btn = document.querySelector(`.card-compare-label[data-id="${property.id}"]`) ||
            document.querySelector(`.card-compare[data-id="${property.id}"]`);
        if (btn) {
            btn.innerHTML = 'Added <i class="fas fa-check"></i>';
            setTimeout(() => this.updateUI(), 1000);
        }
    },

    removeProperty(id) {
        let list = this.getList();
        list = list.filter(item => item.id !== id);
        localStorage.setItem(this.key, JSON.stringify(list));
        this.updateUI();
    },

    isInComparison(id) {
        const list = this.getList();
        return list.some(item => item.id === id);
    },

    updateUI() {
        const list = this.getList();
        const count = list.length;

        // Update floating button count if exists
        const badge = document.getElementById('compare-count');
        if (badge) {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        }

        // Update header badge count
        const headerBadge = document.getElementById('header-compare-count');
        if (headerBadge) {
            headerBadge.textContent = count;
            headerBadge.style.display = count > 0 ? 'inline-block' : 'none';
        }

        // Update card buttons state
        const selector = '.card-compare, .card-compare-label';
        document.querySelectorAll(selector).forEach(btn => {
            // Try to get ID from data attribute or parent card
            let id = btn.dataset.id;
            if (!id) {
                const card = btn.closest('.property-card');
                if (card) id = this.generateId(card);
            }

            if (id && this.isInComparison(id)) {
                btn.classList.add('active');
                btn.innerHTML = 'Compare <i class="fas fa-check" style="color: var(--primary)"></i>';
                // For card-compare-label specifically
                if (btn.classList.contains('card-compare-label')) {
                    btn.style.color = 'var(--primary)';
                    btn.style.fontWeight = 'bold';
                }
            } else {
                btn.classList.remove('active');
                btn.innerHTML = 'Compare <i class="fas fa-exchange-alt"></i>';
                if (btn.classList.contains('card-compare-label')) {
                    btn.style.color = '';
                    btn.style.fontWeight = '';
                }
            }
        });
    },

    bindEvents() {
        document.addEventListener('click', (e) => {
            console.log('Document click detected', e.target);
            const btn = e.target.closest('.card-compare') || e.target.closest('.card-compare-label');
            if (btn) {
                console.log('Compare button clicked', btn);
                e.preventDefault(); // Ensure we don't navigate if it's inside a link
                e.stopPropagation();

                const card = btn.closest('.property-card');
                if (!card) return;

                const id = btn.dataset.id || this.generateId(card);

                if (this.isInComparison(id)) {
                    console.log('Removing from comparison', id);
                    this.removeProperty(id);
                } else {
                    const data = this.extractData(card, id);
                    console.log('Adding to comparison', data);
                    if (data) this.addProperty(data);
                }
            }
        });
    },

    generateId(card) {
        // Try to find a unique identifier
        // 1. Link with ID
        const link = card.querySelector('a[href*="id="]');
        if (link) {
            const match = link.href.match(/id=([^&]+)/);
            if (match) return match[1];
        }

        // 2. Name/Title
        const title = card.querySelector('.property-name')?.textContent ||
            card.querySelector('.property-title')?.textContent;

        if (title) {
            return title.trim().replace(/\s+/g, '-').toLowerCase();
        }

        // 3. Fallback
        return 'unknown-' + Math.random().toString(36).substr(2, 9);
    },

    extractData(card, id) {
        // Log for debugging
        const img = card.querySelector('.card-image img');
        const price = card.querySelector('.property-price-new') || card.querySelector('.property-price') || card.querySelector('.price');
        const title = card.querySelector('.property-name') || card.querySelector('.property-title') || card.querySelector('h3');
        const specs = card.querySelectorAll('.spec-value'); // Beds, Baths, Sqft usually in order

        console.log('Extracted details:', { price: price?.textContent, title: title?.textContent });

        return {
            id: id,
            image: img ? img.src : '',
            price: price ? price.textContent.trim() : 'N/A',
            address: title ? title.textContent.trim() : 'Unknown Location',
            beds: specs[0] ? specs[0].textContent.trim() : '',
            baths: specs[1] ? specs[1].textContent.trim() : '',
            sqft: specs[2] ? specs[2].textContent.trim() : ''
        };
    }
};

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ComparisonManager.init());
} else {
    // DOM already loaded
    ComparisonManager.init();
}
