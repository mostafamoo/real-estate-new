// ============================================
// CHATBOT WIDGET - Real Estate Platform
// ============================================

class ChatbotWidget {
    constructor() {
        this.isOpen = false;
        this.conversationId = this.generateId();
        this.messages = [];
        this.currentAgent = null;
        this.isTyping = false;

        this.init();
    }

    init() {
        this.loadConversation();
        this.renderWidget();
        this.attachEventListeners();

        // Auto-greet if first time
        if (this.messages.length === 0) {
            setTimeout(() => this.sendGreeting(), 1000);
        }
    }

    generateId() {
        return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // ============================================
    // RENDER METHODS
    // ============================================

    renderWidget() {
        const container = document.createElement('div');
        container.id = 'chatbot-widget';
        container.innerHTML = `
            <!-- Chat Button -->
            <button class="chatbot-button" id="chatbot-toggle" aria-label="Open chat">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
            </button>

            <!-- Chat Window -->
            <div class="chatbot-window" id="chatbot-window">
                <!-- Header -->
                <div class="chatbot-header">
                    <div class="chatbot-agent-info">
                        <div class="chatbot-agent-avatar" id="agent-avatar">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                            </svg>
                        </div>
                        <div class="chatbot-agent-details">
                            <h4 id="agent-name" data-i18n="chat_header">Agent Support</h4>
                            <div class="chatbot-agent-status" id="agent-status">
                                <span class="status-dot"></span>
                                <span data-i18n="chat_online">Online</span>
                            </div>
                        </div>
                    </div>
                    <button class="chatbot-close" id="chatbot-close" aria-label="Close chat">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <!-- Messages -->
                <div class="chatbot-messages" id="chatbot-messages"></div>

                <!-- Quick Replies -->
                <div class="chatbot-quick-replies" id="chatbot-quick-replies"></div>

                <!-- Input -->
                <div class="chatbot-input-area">
                    <div class="chatbot-input-wrapper">
                        <input 
                            type="text" 
                            class="chatbot-input" 
                            id="chatbot-input" 
                            placeholder="Type your message..."
                            data-i18n-placeholder="chat_placeholder"
                        >
                        <button class="chatbot-send-btn" id="chatbot-send" aria-label="Send message">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(container);
        this.renderMessages();
    }

    renderMessages() {
        const messagesContainer = document.getElementById('chatbot-messages');
        if (!messagesContainer) return;

        messagesContainer.innerHTML = '';

        this.messages.forEach(msg => {
            const messageEl = this.createMessageElement(msg);
            messagesContainer.appendChild(messageEl);
        });

        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    createMessageElement(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chatbot-message ${message.sender}`;

        const avatar = document.createElement('div');
        avatar.className = 'chatbot-message-avatar';
        avatar.textContent = message.sender === 'user' ? 'U' : 'A';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'chatbot-message-content';

        const bubble = document.createElement('div');
        bubble.className = 'chatbot-message-bubble';
        bubble.textContent = message.text;

        const time = document.createElement('div');
        time.className = 'chatbot-message-time';
        time.textContent = this.formatTime(message.timestamp);

        contentDiv.appendChild(bubble);
        contentDiv.appendChild(time);

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(contentDiv);

        return messageDiv;
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('chatbot-messages');
        if (!messagesContainer) return;

        const typingDiv = document.createElement('div');
        typingDiv.className = 'chatbot-typing';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="chatbot-message-avatar">A</div>
            <div class="chatbot-typing-bubble">
                <div class="chatbot-typing-dot"></div>
                <div class="chatbot-typing-dot"></div>
                <div class="chatbot-typing-dot"></div>
            </div>
        `;

        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    showQuickReplies(replies) {
        const container = document.getElementById('chatbot-quick-replies');
        if (!container) return;

        container.innerHTML = '';

        replies.forEach(reply => {
            const button = document.createElement('button');
            button.className = 'chatbot-quick-reply';
            button.textContent = reply;
            button.onclick = () => {
                this.sendUserMessage(reply);
                container.innerHTML = ''; // Clear quick replies after use
            };
            container.appendChild(button);
        });
    }

    // ============================================
    // MESSAGE HANDLING
    // ============================================

    sendUserMessage(text) {
        if (!text || !text.trim()) return;

        const message = {
            id: this.generateId(),
            sender: 'user',
            text: text.trim(),
            timestamp: new Date().toISOString()
        };

        this.messages.push(message);
        this.saveConversation();
        this.renderMessages();

        // Clear input
        const input = document.getElementById('chatbot-input');
        if (input) input.value = '';

        // Agent response
        setTimeout(() => this.generateAgentResponse(text), 800);
    }

    sendAgentMessage(text) {
        const message = {
            id: this.generateId(),
            sender: 'agent',
            text: text,
            timestamp: new Date().toISOString()
        };

        this.messages.push(message);
        this.saveConversation();
        this.renderMessages();
    }

    sendGreeting() {
        const context = this.getPageContext();
        let greeting;

        if (context.page === 'property' && context.propertyTitle) {
            greeting = `مرحباً! أرى أنك مهتم بـ "${context.propertyTitle}". كيف يمكنني مساعدتك؟`;
        } else if (context.page === 'search') {
            greeting = 'مرحباً! يمكنني مساعدتك في العثور على العقار المثالي. ما الذي تبحث عنه؟';
        } else {
            greeting = 'مرحباً! أنا هنا لمساعدتك في إيجاد منزل أحلامك. كيف يمكنني مساعدتك؟';
        }

        this.sendAgentMessage(greeting);

        // Show quick replies
        setTimeout(() => {
            this.showQuickReplies([
                'أريد شراء عقار',
                'أريد بيع عقاري',
                'أريد الإستئجار',
                'جدولة معاينة'
            ]);
        }, 500);
    }

    generateAgentResponse(userMessage) {
        this.showTypingIndicator();

        setTimeout(() => {
            this.hideTypingIndicator();

            const response = this.getSmartResponse(userMessage);
            this.sendAgentMessage(response);
        }, 1500);
    }

    getSmartResponse(message) {
        const lowerMsg = message.toLowerCase();

        // Keyword detection
        if (lowerMsg.includes('سعر') || lowerMsg.includes('price') || lowerMsg.includes('كم')) {
            return 'يسرني أن أقدم لك معلومات مفصلة عن الأسعار. هل تريد جدولة مكالمة مع أحد وكلائنا لمناقشة التفاصيل؟';
        }

        if (lowerMsg.includes('موقع') || lowerMsg.includes('location') || lowerMsg.includes('منطقة')) {
            return 'يمكنني مساعدتك في العثور على عقارات في المنطقة التي تفضلها. أي منطقة تهتم بها؟';
        }

        if (lowerMsg.includes('معاينة') || lowerMsg.includes('زيارة') || lowerMsg.includes('tour') || lowerMsg.includes('visit')) {
            return 'رائع! يسعدني ترتيب معاينة لك. ما اليوم الذي يناسبك؟';
        }

        if (lowerMsg.includes('تمويل') || lowerMsg.includes('قرض') || lowerMsg.includes('mortgage') || lowerMsg.includes('finance')) {
            return 'نوفر خيارات تمويل متنوعة. يمكنك استخدام حاسبة القرض لدينا أو التحدث مع أحد مستشارينا الماليين.';
        }

        if (lowerMsg.includes('شراء') || lowerMsg.includes('buy')) {
            return 'ممتاز! نحن هنا لمساعدتك في العثور على المنزل المثالي. ما نوع العقار الذي تبحث عنه؟';
        }

        if (lowerMsg.includes('بيع') || lowerMsg.includes('sell')) {
            return 'يسعدنا مساعدتك في بيع عقارك. هل تريد الحصول على تقييم مجاني لعقارك؟';
        }

        if (lowerMsg.includes('إيجار') || lowerMsg.includes('استئجار') || lowerMsg.includes('rent')) {
            return 'لدينا مجموعة واسعة من العقارات المتاحة للإيجار. ما المواصفات التي تبحث عنها؟';
        }

        if (lowerMsg.includes('شكرا') || lowerMsg.includes('thanks') || lowerMsg.includes('thank')) {
            return 'على الرحب والسعة! هل هناك أي شيء آخر يمكنني مساعدتك فيه؟';
        }

        // Default response
        return 'شكراً لتواصلك معنا. سيقوم أحد وكلائنا بالرد عليك قريباً. هل لديك أي أسئلة أخرى في الوقت الحالي؟';
    }

    // ============================================
    // UTILITY METHODS
    // ============================================

    getPageContext() {
        const path = window.location.pathname;
        const context = {
            page: 'home',
            propertyId: null,
            propertyTitle: null
        };

        if (path.includes('property.html')) {
            context.page = 'property';
            // Try to get property title from page
            const titleEl = document.querySelector('.property-price-tag');
            if (titleEl) {
                context.propertyTitle = titleEl.nextElementSibling?.textContent || null;
            }
        } else if (path.includes('search.html')) {
            context.page = 'search';
        } else if (path.includes('sell.html')) {
            context.page = 'sell';
        }

        return context;
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    // ============================================
    // STORAGE
    // ============================================

    saveConversation() {
        try {
            const data = {
                conversationId: this.conversationId,
                messages: this.messages,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('chatbot_conversation', JSON.stringify(data));
        } catch (e) {
            console.warn('Could not save conversation:', e);
        }
    }

    loadConversation() {
        try {
            const saved = localStorage.getItem('chatbot_conversation');
            if (saved) {
                const data = JSON.parse(saved);
                this.conversationId = data.conversationId;
                this.messages = data.messages || [];
            }
        } catch (e) {
            console.warn('Could not load conversation:', e);
        }
    }

    clearConversation() {
        this.messages = [];
        this.conversationId = this.generateId();
        localStorage.removeItem('chatbot_conversation');
        this.renderMessages();
        setTimeout(() => this.sendGreeting(), 500);
    }

    // ============================================
    // EVENT HANDLERS
    // ============================================

    attachEventListeners() {
        // Toggle button
        const toggleBtn = document.getElementById('chatbot-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggleChat());
        }

        // Close button
        const closeBtn = document.getElementById('chatbot-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.toggleChat());
        }

        // Send button
        const sendBtn = document.getElementById('chatbot-send');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => {
                const input = document.getElementById('chatbot-input');
                if (input) {
                    this.sendUserMessage(input.value);
                }
            });
        }

        // Input enter key
        const input = document.getElementById('chatbot-input');
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendUserMessage(input.value);
                }
            });
        }

        // Close on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.toggleChat();
            }
        });
    }

    toggleChat() {
        this.isOpen = !this.isOpen;

        const window = document.getElementById('chatbot-window');
        const button = document.getElementById('chatbot-toggle');

        if (this.isOpen) {
            window?.classList.add('open');
            button?.classList.add('open');
            // Focus input
            setTimeout(() => {
                document.getElementById('chatbot-input')?.focus();
            }, 300);
        } else {
            window?.classList.remove('open');
            button?.classList.remove('open');
        }
    }
}

// ============================================
// INITIALIZATION
// ============================================

function initChatbot() {
    // Wait for DOM and other scripts to load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.chatbot = new ChatbotWidget();
        });
    } else {
        window.chatbot = new ChatbotWidget();
    }
}

// Auto-initialize
initChatbot();
