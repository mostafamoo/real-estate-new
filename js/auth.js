/**
 * Authentication System
 * Client-side auth using localStorage (for demo purposes)
 */

const Auth = {
    STORAGE_KEY: 'egyptian_realestate_user',
    SESSION_KEY: 'egyptian_realestate_session',

    /**
     * Register a new user
     * @param {Object} userData - User registration data
     * @returns {Object} Result with success status and message
     */
    register(userData) {
        const { firstName, lastName, email, phone, password } = userData;

        // Validation
        if (!firstName || !lastName || !email || !password) {
            return { success: false, message: 'جميع الحقول مطلوبة', messageEn: 'All fields are required' };
        }

        if (!this.isValidEmail(email)) {
            return { success: false, message: 'البريد الإلكتروني غير صحيح', messageEn: 'Invalid email address' };
        }

        if (password.length < 6) {
            return { success: false, message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل', messageEn: 'Password must be at least 6 characters' };
        }

        // Check if user already exists
        const existingUsers = this.getAllUsers();
        if (existingUsers.find(u => u.email === email)) {
            return { success: false, message: 'هذا البريد مسجل بالفعل', messageEn: 'Email already registered' };
        }

        // Create user object
        const user = {
            id: this.generateId(),
            firstName,
            lastName,
            email,
            phone: phone || '',
            password: this.hashPassword(password), // Simple hash for demo
            createdAt: new Date().toISOString(),
            avatar: null,
            favorites: [],
            recentlyViewed: [],
            savedSearches: [],
            notifications: [],
            settings: {
                emailNotifications: true,
                priceAlerts: true,
                newListings: true
            }
        };

        // Save user
        existingUsers.push(user);
        localStorage.setItem(this.STORAGE_KEY + '_users', JSON.stringify(existingUsers));

        // Auto login after registration
        this.createSession(user);

        return { success: true, message: 'تم التسجيل بنجاح', messageEn: 'Registration successful', user: this.sanitizeUser(user) };
    },

    /**
     * Login user
     * @param {string} email 
     * @param {string} password 
     * @returns {Object} Result with success status
     */
    login(email, password) {
        if (!email || !password) {
            return { success: false, message: 'البريد وكلمة المرور مطلوبان', messageEn: 'Email and password required' };
        }

        const users = this.getAllUsers();
        const user = users.find(u => u.email === email);

        if (!user) {
            return { success: false, message: 'البريد غير مسجل', messageEn: 'Email not registered' };
        }

        if (user.password !== this.hashPassword(password)) {
            return { success: false, message: 'كلمة المرور غير صحيحة', messageEn: 'Incorrect password' };
        }

        this.createSession(user);
        return { success: true, message: 'تم تسجيل الدخول', messageEn: 'Login successful', user: this.sanitizeUser(user) };
    },

    /**
     * Logout current user
     */
    logout() {
        localStorage.removeItem(this.SESSION_KEY);
        window.location.href = 'index.html';
    },

    /**
     * Check if user is logged in
     * @returns {boolean}
     */
    isLoggedIn() {
        const session = localStorage.getItem(this.SESSION_KEY);
        return !!session;
    },

    /**
     * Get current logged in user
     * @returns {Object|null}
     */
    getCurrentUser() {
        const session = localStorage.getItem(this.SESSION_KEY);
        if (!session) return null;

        try {
            const sessionData = JSON.parse(session);
            const users = this.getAllUsers();
            const user = users.find(u => u.id === sessionData.userId);
            return user ? this.sanitizeUser(user) : null;
        } catch (e) {
            return null;
        }
    },

    /**
     * Update user profile
     * @param {Object} updates 
     * @returns {Object} Result
     */
    updateProfile(updates) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            return { success: false, message: 'يجب تسجيل الدخول أولاً' };
        }

        const users = this.getAllUsers();
        const userIndex = users.findIndex(u => u.id === currentUser.id);

        if (userIndex === -1) {
            return { success: false, message: 'المستخدم غير موجود' };
        }

        // Update allowed fields
        const allowedFields = ['firstName', 'lastName', 'phone', 'avatar', 'settings'];
        allowedFields.forEach(field => {
            if (updates[field] !== undefined) {
                users[userIndex][field] = updates[field];
            }
        });

        localStorage.setItem(this.STORAGE_KEY + '_users', JSON.stringify(users));
        return { success: true, message: 'تم تحديث الملف الشخصي', user: this.sanitizeUser(users[userIndex]) };
    },

    /**
     * Add property to favorites
     * @param {string} propertyId 
     */
    addToFavorites(propertyId) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) return { success: false, message: 'يجب تسجيل الدخول' };

        const users = this.getAllUsers();
        const userIndex = users.findIndex(u => u.id === currentUser.id);

        if (!users[userIndex].favorites.includes(propertyId)) {
            users[userIndex].favorites.push(propertyId);
            localStorage.setItem(this.STORAGE_KEY + '_users', JSON.stringify(users));
        }

        return { success: true, favorites: users[userIndex].favorites };
    },

    /**
     * Remove property from favorites
     * @param {string} propertyId 
     */
    removeFromFavorites(propertyId) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) return { success: false };

        const users = this.getAllUsers();
        const userIndex = users.findIndex(u => u.id === currentUser.id);

        users[userIndex].favorites = users[userIndex].favorites.filter(id => id !== propertyId);
        localStorage.setItem(this.STORAGE_KEY + '_users', JSON.stringify(users));

        return { success: true, favorites: users[userIndex].favorites };
    },

    /**
     * Get user's favorites
     * @returns {Array}
     */
    getFavorites() {
        const currentUser = this.getCurrentUser();
        if (!currentUser) return [];

        const users = this.getAllUsers();
        const user = users.find(u => u.id === currentUser.id);
        return user ? user.favorites : [];
    },

    /**
     * Add notification
     * @param {Object} notification 
     */
    addNotification(notification) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) return;

        const users = this.getAllUsers();
        const userIndex = users.findIndex(u => u.id === currentUser.id);

        const newNotification = {
            id: this.generateId(),
            ...notification,
            read: false,
            createdAt: new Date().toISOString()
        };

        users[userIndex].notifications.unshift(newNotification);
        // Keep only last 50 notifications
        users[userIndex].notifications = users[userIndex].notifications.slice(0, 50);
        localStorage.setItem(this.STORAGE_KEY + '_users', JSON.stringify(users));
    },

    /**
     * Get user notifications
     * @returns {Array}
     */
    getNotifications() {
        const currentUser = this.getCurrentUser();
        if (!currentUser) return [];

        const users = this.getAllUsers();
        const user = users.find(u => u.id === currentUser.id);
        return user ? user.notifications : [];
    },

    /**
     * Mark notification as read
     * @param {string} notificationId 
     */
    markNotificationRead(notificationId) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) return;

        const users = this.getAllUsers();
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        const notifIndex = users[userIndex].notifications.findIndex(n => n.id === notificationId);

        if (notifIndex !== -1) {
            users[userIndex].notifications[notifIndex].read = true;
            localStorage.setItem(this.STORAGE_KEY + '_users', JSON.stringify(users));
        }
    },

    /**
     * Get unread notification count
     * @returns {number}
     */
    getUnreadNotificationCount() {
        const notifications = this.getNotifications();
        return notifications.filter(n => !n.read).length;
    },

    // Helper methods
    getAllUsers() {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEY + '_users')) || [];
        } catch (e) {
            return [];
        }
    },

    createSession(user) {
        const session = {
            userId: user.id,
            createdAt: new Date().toISOString()
        };
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    },

    sanitizeUser(user) {
        const { password, ...safeUser } = user;
        return safeUser;
    },

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    hashPassword(password) {
        // Simple hash for demo - NOT secure for production!
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return 'hash_' + Math.abs(hash).toString(36);
    },

    generateId() {
        return 'user_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // Demo: Create sample notifications for new users
    createWelcomeNotifications(userId) {
        const users = this.getAllUsers();
        const userIndex = users.findIndex(u => u.id === userId);

        if (userIndex !== -1) {
            users[userIndex].notifications = [
                {
                    id: this.generateId(),
                    type: 'welcome',
                    title: 'مرحباً بك في منصة مصر العقارية',
                    titleEn: 'Welcome to Egyptian Real Estate Platform',
                    message: 'تم تسجيل حسابك بنجاح. ابدأ البحث عن عقارك المثالي!',
                    messageEn: 'Your account has been created. Start searching for your perfect property!',
                    read: false,
                    createdAt: new Date().toISOString()
                },
                {
                    id: this.generateId(),
                    type: 'tip',
                    title: 'نصيحة: احفظ عقاراتك المفضلة',
                    titleEn: 'Tip: Save your favorite properties',
                    message: 'اضغط على أيقونة القلب لحفظ العقارات في المفضلة',
                    messageEn: 'Click the heart icon to save properties to favorites',
                    read: false,
                    createdAt: new Date(Date.now() - 60000).toISOString()
                }
            ];
            localStorage.setItem(this.STORAGE_KEY + '_users', JSON.stringify(users));
        }
    }
};

// Update UI based on auth state
function updateAuthUI() {
    const isLoggedIn = Auth.isLoggedIn();
    const user = Auth.getCurrentUser();

    // Find auth-related elements
    const loginLinks = document.querySelectorAll('a[href="login.html"]');
    const registerLinks = document.querySelectorAll('a[href="register.html"]');
    const logoutBtns = document.querySelectorAll('.logout-btn');
    const userMenus = document.querySelectorAll('.user-menu');
    const guestOnlyElements = document.querySelectorAll('.guest-only');
    const authOnlyElements = document.querySelectorAll('.auth-only');

    if (isLoggedIn && user) {
        // Hide login/register links
        loginLinks.forEach(el => el.style.display = 'none');
        registerLinks.forEach(el => el.style.display = 'none');
        guestOnlyElements.forEach(el => el.style.display = 'none');

        // Show user menu, logout
        logoutBtns.forEach(el => el.style.display = '');
        userMenus.forEach(el => el.style.display = '');
        authOnlyElements.forEach(el => el.style.display = 'block');

        // Update user name and initial
        const userNameEls = document.querySelectorAll('.user-display-name');
        userNameEls.forEach(el => {
            el.textContent = user.firstName;
        });

        const userInitialEls = document.querySelectorAll('.user-initial');
        userInitialEls.forEach(el => {
            el.textContent = user.firstName.charAt(0).toUpperCase();
        });

        // Load notifications into dropdown
        loadNotifications();
    } else {
        // Show login/register
        loginLinks.forEach(el => el.style.display = '');
        registerLinks.forEach(el => el.style.display = '');
        guestOnlyElements.forEach(el => el.style.display = '');

        // Hide user menu, logout
        logoutBtns.forEach(el => el.style.display = 'none');
        userMenus.forEach(el => el.style.display = 'none');
        authOnlyElements.forEach(el => el.style.display = 'none');
    }

    // Update notification badge
    updateNotificationBadge();
}

function updateNotificationBadge() {
    const count = Auth.getUnreadNotificationCount();
    const badges = document.querySelectorAll('.notification-badge');

    badges.forEach(badge => {
        if (count > 0) {
            badge.textContent = count > 9 ? '9+' : count;
            badge.style.display = 'block';
        } else {
            badge.style.display = 'none';
        }
    });
}

/**
 * UI Toggle Functions
 */

function toggleNotifications() {
    const dropdown = document.getElementById('notificationsDropdown');
    const userMenu = document.getElementById('userMenu');

    if (userMenu) userMenu.style.display = 'none';

    if (dropdown) {
        const isHidden = dropdown.style.display === 'none';
        dropdown.style.display = isHidden ? 'block' : 'none';

        if (isHidden) {
            loadNotifications();
            // Close dropdown when clicking outside
            const closeHandler = (e) => {
                if (!e.target.closest('.notifications-wrapper')) {
                    dropdown.style.display = 'none';
                    document.removeEventListener('click', closeHandler);
                }
            };
            setTimeout(() => document.addEventListener('click', closeHandler), 10);
        }
    }
}

function toggleUserMenu() {
    const dropdown = document.getElementById('userMenu');
    const notifDropdown = document.getElementById('notificationsDropdown');

    if (notifDropdown) notifDropdown.style.display = 'none';

    if (dropdown) {
        const isHidden = dropdown.style.display === 'none';
        dropdown.style.display = isHidden ? 'block' : 'none';

        if (isHidden) {
            const closeHandler = (e) => {
                if (!e.target.closest('.user-menu')) {
                    dropdown.style.display = 'none';
                    document.removeEventListener('click', closeHandler);
                }
            };
            setTimeout(() => document.addEventListener('click', closeHandler), 10);
        }
    }
}

function loadNotifications() {
    const list = document.getElementById('notificationsList');
    if (!list) return;

    const notifications = Auth.getNotifications();
    const currentLang = localStorage.getItem('preferred_language') || 'en';
    const isAr = currentLang === 'ar';

    if (notifications.length === 0) {
        const emptyText = (window.I18n && I18n.translate) ? I18n.translate('notifications_empty') : (isAr ? 'لا توجد إشعارات' : 'No notifications');
        list.innerHTML = `<div style="padding: 24px; text-align: center; color: #999;">${emptyText}</div>`;
        return;
    }

    let html = '';
    // Show only first 5 in dropdown
    notifications.slice(0, 5).forEach(n => {
        const title = isAr ? (n.title || n.titleEn) : (n.titleEn || n.title);
        const message = isAr ? (n.message || n.messageEn) : (n.messageEn || n.message);
        const link = n.link || 'notifications.html';

        html += `
            <a href="${link}" style="display: block; padding: 12px 16px; border-bottom: 1px solid #f5f5f5; text-decoration: none; transition: background 0.2s;" onclick="Auth.markNotificationRead('${n.id}')">
                <div style="display: flex; gap: 12px; align-items: flex-start;">
                    <div style="width: 8px; height: 8px; border-radius: 50%; background: ${n.read ? 'transparent' : 'var(--primary)'}; margin-top: 6px; flex-shrink: 0;"></div>
                    <div style="flex: 1;">
                        <div style="font-weight: 600; font-size: 13px; color: #333; margin-bottom: 2px;">${title}</div>
                        <div style="font-size: 12px; color: #666; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${message}</div>
                        <div style="font-size: 10px; color: #999; margin-top: 4px;">${new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                </div>
            </a>
        `;
    });

    // Add "View All" link
    const viewAllText = (window.I18n && I18n.translate) ? I18n.translate('notifications_view_all') : (isAr ? 'عرض جميع الإشعارات' : 'View All Notifications');
    html += `
        <a href="notifications.html" style="display: block; padding: 12px; text-align: center; font-size: 13px; color: var(--primary); font-weight: 600; background: #fcfcfc; text-decoration: none; border-top: 1px solid #eee;">
            ${viewAllText}
        </a>
    `;

    list.innerHTML = html;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();
});

// Expose to window
window.Auth = Auth;
window.updateAuthUI = updateAuthUI;
window.toggleNotifications = toggleNotifications;
window.toggleUserMenu = toggleUserMenu;
window.loadNotifications = loadNotifications;
