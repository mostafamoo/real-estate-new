
const ComparisonManager = {
    key: 'zillow_compare_list',
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
        // Show success message or toast
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
        document.querySelectorAll('.card-compare').forEach(btn => {
            const id = btn.dataset.id;
            if (this.isInComparison(id)) {
                btn.classList.add('active');
                btn.innerHTML = '<i class="fas fa-check"></i>';
            } else {
                btn.classList.remove('active');
                btn.innerHTML = '<i class="fas fa-exchange-alt"></i>';
            }
        });
    },

    bindEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.card-compare')) {
                const btn = e.target.closest('.card-compare');
                const card = btn.closest('.property-card');
                const id = btn.dataset.id || this.generateId(card);

                if (this.isInComparison(id)) {
                    this.removeProperty(id);
                } else {
                    const data = this.extractData(card, id);
                    this.addProperty(data);
                }
            }
        });
    },

    generateId(card) {
        // Fallback ID generation based on address or price if no ID
        const address = card.querySelector('.property-address')?.textContent || '';
        return address.replace(/\s+/g, '-').toLowerCase();
    },

    extractData(card, id) {
        return {
            id: id,
            image: card.querySelector('.card-image img')?.src,
            price: card.querySelector('.property-price')?.textContent,
            address: card.querySelector('.property-address')?.textContent,
            beds: card.querySelector('[data-i18n="card_bed"]')?.previousSibling?.textContent?.trim(),
            baths: card.querySelector('[data-i18n="card_bath"]')?.previousSibling?.textContent?.trim(),
            sqft: card.querySelector('[data-i18n="card_sqft"]')?.previousSibling?.textContent?.trim()
        };
    }
};

document.addEventListener('DOMContentLoaded', () => {
    ComparisonManager.init();
});
