/**
 * Super Calendar Floating Widget v4.0
 * A customizable floating scheduling widget with timer, date selection, and configurable buttons
 * 
 * Features:
 * - Floating chat-style widget
 * - Optional countdown timer with progress bar
 * - Dynamic date generation (next 5 days)
 * - Configurable buttons with multiple action types
 * - Starting position options (Open/Closed/Delayed Open)
 * - Theme color customization
 * - Font Awesome icons
 * - No overlay - natural floating behavior
 */

class SuperCalendar {
    constructor(options = {}) {
        this.options = {
            // Profile Settings
            profileName: options.profileName || 'Matt Deseno',
            profileTitle: options.profileTitle || 'CEO @ HLPT',
            profileAvatar: options.profileAvatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
            showOnlineIndicator: options.showOnlineIndicator !== false,
            
            // Content Settings
            mainHeading: options.mainHeading || 'HighLevel is Awesome — Until You Feel Lost In the Weeds',
            mainDescription: options.mainDescription || 'Make HighLevel easy with HLPT. Save 10+ hours each week with a 24/7 team supporting you & your customers 🔥',
            
            // Timer Settings
            enableTimer: options.enableTimer !== false,
            timerDuration: options.timerDuration || 180, // seconds
            timerText: options.timerText || 'Only few slots are left.',
            
            // Widget Behavior
            startingPosition: options.startingPosition || 'closed', // 'open', 'closed', 'delayed'
            delayTime: options.delayTime || 3, // seconds for delayed open
            
            // Button Configuration
            buttons: options.buttons || [
                {
                    text: 'Schedule a Demo',
                    style: 'primary',
                    action: 'popup',
                    url: 'https://your-calendar-url.com'
                },
                {
                    text: 'Start Free Trial',
                    style: 'secondary',
                    action: 'redirect',
                    url: 'https://your-website.com/trial'
                }
            ],
            
            // Theme Colors
            primaryColor: options.primaryColor || '#1e3a8a',
            progressBarColor: options.progressBarColor || '#3b82f6',
            
            // Widget Position
            position: options.position || 'bottom-right',
            offsetX: options.offsetX || 20,
            offsetY: options.offsetY || 20,
            
            // HighLevel Integration
            highlevelEmbedUrl: options.highlevelEmbedUrl || '',
            highlevelCalendarId: options.highlevelCalendarId || '',
            highlevelLocationId: options.highlevelLocationId || ''
        };
        
        this.isOpen = false;
        this.timerInterval = null;
        this.timeRemaining = this.options.timerDuration;
        this.timerHidden = false;
        
        // Generate unique IDs
        this.widgetId = 'super-calendar-' + Math.random().toString(36).substr(2, 9);
        this.buttonId = 'super-calendar-btn-' + Math.random().toString(36).substr(2, 9);
    }
    
    init() {
        this.injectStyles();
        this.createWidget();
        this.bindEvents();
        this.handleStartingPosition();
        
        // Auto-initialize if container exists
        const container = document.querySelector('[data-super-calendar]');
        if (container && !window.superCalendarInitialized) {
            window.superCalendarInitialized = true;
        }
        
        console.log('Super Calendar initialized');
    }
    
    injectStyles() {
        if (document.getElementById('super-calendar-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'super-calendar-styles';
        style.textContent = `
            .super-calendar-floating-button {
                position: fixed;
                ${this.options.position.includes('bottom') ? 'bottom' : 'top'}: ${this.options.offsetY}px;
                ${this.options.position.includes('right') ? 'right' : 'left'}: ${this.options.offsetX}px;
                width: 60px;
                height: 60px;
                background: linear-gradient(135deg, ${this.options.primaryColor}, ${this.options.primaryColor}dd);
                border: none;
                border-radius: 50%;
                color: white;
                font-size: 1.5rem;
                cursor: pointer;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                transition: all 0.3s ease;
                z-index: 1000;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: 'Font Awesome 6 Free', sans-serif;
            }
            
            .super-calendar-floating-button:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
            }
            
            .super-calendar-widget {
                position: fixed;
                ${this.options.position.includes('bottom') ? 'bottom' : 'top'}: ${this.options.offsetY + 80}px;
                ${this.options.position.includes('right') ? 'right' : 'left'}: ${this.options.offsetX}px;
                width: 380px;
                max-width: calc(100vw - 40px);
                background: white;
                border-radius: 16px;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                z-index: 1001;
                display: none;
                animation: slideUp 0.3s ease;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            
            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .super-calendar-content {
                padding: 1.5rem;
            }
            
            .super-calendar-header {
                display: flex;
                align-items: center;
                margin-bottom: 1rem;
            }
            
            .super-calendar-profile {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                flex: 1;
            }
            
            .super-calendar-avatar {
                position: relative;
            }
            
            .super-calendar-avatar img {
                width: 48px;
                height: 48px;
                border-radius: 50%;
                object-fit: cover;
            }
            
            .super-calendar-online {
                position: absolute;
                bottom: 0;
                right: 0;
                width: 12px;
                height: 12px;
                background: #10b981;
                border: 2px solid white;
                border-radius: 50%;
            }
            
            .super-calendar-profile-info {
                flex: 1;
            }
            
            .super-calendar-name {
                font-weight: 600;
                color: #1a202c;
                font-size: 0.9rem;
                margin: 0;
            }
            
            .super-calendar-title {
                color: #6b7280;
                font-size: 0.8rem;
                margin: 0;
            }
            
            .super-calendar-close {
                background: none;
                border: none;
                font-size: 1.2rem;
                cursor: pointer;
                color: #6b7280;
                padding: 0.25rem;
                border-radius: 4px;
                transition: background-color 0.2s ease;
            }
            
            .super-calendar-close:hover {
                background-color: #f3f4f6;
            }
            
            .super-calendar-heading {
                font-size: 1.1rem;
                font-weight: 600;
                color: #1a202c;
                margin: 0 0 0.5rem 0;
                line-height: 1.3;
            }
            
            .super-calendar-description {
                color: #4a5568;
                margin: 0 0 1rem 0;
                font-size: 0.9rem;
                line-height: 1.4;
            }
            
            .super-calendar-timer {
                background: #f7fafc;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 1rem;
                margin-bottom: 1rem;
                position: relative;
                overflow: hidden;
                transition: all 0.5s ease;
            }
            
            .super-calendar-timer.hidden {
                opacity: 0;
                height: 0;
                padding: 0;
                margin: 0;
                overflow: hidden;
            }
            
            .super-calendar-progress {
                position: absolute;
                top: 0;
                left: 0;
                height: 4px;
                background: linear-gradient(90deg, ${this.options.progressBarColor}, ${this.options.progressBarColor}aa);
                transition: width 1s ease;
            }
            
            .super-calendar-timer-content {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-top: 0.25rem;
            }
            
            .super-calendar-timer-text {
                font-weight: 500;
                color: #4a5568;
            }
            
            .super-calendar-timer-countdown {
                font-weight: 600;
                color: #1a202c;
                font-family: monospace;
            }
            
            .super-calendar-dates {
                display: flex;
                gap: 0.5rem;
                margin-bottom: 1rem;
                flex-wrap: nowrap;
            }
            
            .super-calendar-date {
                flex: 1;
                min-width: 50px;
                max-width: 65px;
                padding: 0.75rem 0.25rem;
                border: 2px solid #e2e8f0;
                background: white;
                color: #4a5568;
                border-radius: 8px;
                font-size: 0.75rem;
                font-weight: 500;
                cursor: pointer;
                white-space: pre-line;
                line-height: 1.2;
                transition: all 0.2s ease;
            }
            
            .super-calendar-date:hover {
                border-color: ${this.options.primaryColor};
                background-color: ${this.options.primaryColor}10;
            }
            
            .super-calendar-date.selected {
                border-color: ${this.options.primaryColor};
                background: ${this.options.primaryColor};
                color: white;
            }
            
            .super-calendar-buttons {
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
            }
            
            .super-calendar-button {
                width: 100%;
                padding: 0.875rem;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                font-size: 0.9rem;
            }
            
            .super-calendar-button.primary {
                border: 2px solid ${this.options.primaryColor};
                background: ${this.options.primaryColor};
                color: white;
            }
            
            .super-calendar-button.primary:hover {
                background: ${this.options.primaryColor}dd;
                transform: translateY(-1px);
            }
            
            .super-calendar-button.secondary {
                border: 2px solid ${this.options.primaryColor};
                background: white;
                color: ${this.options.primaryColor};
            }
            
            .super-calendar-button.secondary:hover {
                background: ${this.options.primaryColor}10;
                transform: translateY(-1px);
            }
            
            @media (max-width: 480px) {
                .super-calendar-widget {
                    width: calc(100vw - 20px);
                    right: 10px;
                    left: 10px;
                }
            }
        `;
        
        document.head.appendChild(style);
        
        // Load Font Awesome if not already loaded
        if (!document.querySelector('link[href*="font-awesome"]')) {
            const fontAwesome = document.createElement('link');
            fontAwesome.rel = 'stylesheet';
            fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
            document.head.appendChild(fontAwesome);
        }
    }
    
    createWidget() {
        // Create floating button
        const button = document.createElement('button');
        button.id = this.buttonId;
        button.className = 'super-calendar-floating-button';
        button.innerHTML = '<i class="fas fa-calendar"></i>';
        
        // Create widget container
        const widget = document.createElement('div');
        widget.id = this.widgetId;
        widget.className = 'super-calendar-widget';
        
        // Generate dates
        const dates = this.generateDates();
        
        widget.innerHTML = `
            <div class="super-calendar-content">
                <div class="super-calendar-header">
                    <div class="super-calendar-profile">
                        <div class="super-calendar-avatar">
                            <img src="${this.options.profileAvatar}" alt="${this.options.profileName}">
                            ${this.options.showOnlineIndicator ? '<div class="super-calendar-online"></div>' : ''}
                        </div>
                        <div class="super-calendar-profile-info">
                            <div class="super-calendar-name">${this.options.profileName}</div>
                            <div class="super-calendar-title">${this.options.profileTitle}</div>
                        </div>
                    </div>
                    <button class="super-calendar-close">×</button>
                </div>
                
                <h3 class="super-calendar-heading">${this.options.mainHeading}</h3>
                <p class="super-calendar-description">${this.options.mainDescription}</p>
                
                ${this.options.enableTimer ? `
                <div class="super-calendar-timer">
                    <div class="super-calendar-progress" style="width: 100%;"></div>
                    <div class="super-calendar-timer-content">
                        <span class="super-calendar-timer-text">${this.options.timerText}</span>
                        <span class="super-calendar-timer-countdown">${this.formatTime(this.timeRemaining)}</span>
                    </div>
                </div>
                ` : ''}
                
                <div class="super-calendar-dates">
                    ${dates.map((date, index) => `
                        <button class="super-calendar-date ${index === 0 ? 'selected' : ''}" data-date="${date.full}">
                            ${date.day}<br>${date.date}
                        </button>
                    `).join('')}
                </div>
                
                <div class="super-calendar-buttons">
                    ${this.options.buttons.map(button => `
                        <button class="super-calendar-button ${button.style}" 
                                data-action="${button.action}" 
                                data-url="${button.url || ''}">
                            ${button.text}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
        
        document.body.appendChild(button);
        document.body.appendChild(widget);
        
        this.button = button;
        this.widget = widget;
    }
    
    bindEvents() {
        // Floating button click
        this.button.addEventListener('click', () => this.toggle());
        
        // Close button click
        this.widget.querySelector('.super-calendar-close').addEventListener('click', () => this.close());
        
        // Date button clicks
        this.widget.querySelectorAll('.super-calendar-date').forEach(dateBtn => {
            dateBtn.addEventListener('click', (e) => {
                // Remove selected class from all dates
                this.widget.querySelectorAll('.super-calendar-date').forEach(btn => btn.classList.remove('selected'));
                // Add selected class to clicked date
                e.target.classList.add('selected');
                // Trigger action
                this.handleDateClick(e.target.dataset.date);
            });
        });
        
        // Action button clicks
        this.widget.querySelectorAll('.super-calendar-button').forEach(actionBtn => {
            actionBtn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                const url = e.target.dataset.url;
                this.handleButtonClick(action, url);
            });
        });
        
        // Start timer if enabled
        if (this.options.enableTimer) {
            this.startTimer();
        }
    }
    
    handleStartingPosition() {
        switch (this.options.startingPosition) {
            case 'open':
                setTimeout(() => this.open(), 100);
                break;
            case 'delayed':
                setTimeout(() => this.open(), this.options.delayTime * 1000);
                break;
            case 'closed':
            default:
                // Widget starts closed
                break;
        }
    }
    
    generateDates() {
        const dates = [];
        const today = new Date();
        
        for (let i = 0; i < 5; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            
            const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
            const day = dayNames[date.getDay()];
            const dateNum = date.getDate().toString().padStart(2, '0');
            
            dates.push({
                day: day,
                date: dateNum,
                full: date.toISOString().split('T')[0]
            });
        }
        
        return dates;
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timeRemaining--;
            
            const countdown = this.widget.querySelector('.super-calendar-timer-countdown');
            const progress = this.widget.querySelector('.super-calendar-progress');
            
            if (countdown) {
                countdown.textContent = this.formatTime(this.timeRemaining);
            }
            
            if (progress) {
                const percentage = (this.timeRemaining / this.options.timerDuration) * 100;
                progress.style.width = `${Math.max(0, percentage)}%`;
            }
            
            if (this.timeRemaining <= 0) {
                this.hideTimer();
            }
        }, 1000);
    }
    
    hideTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        const timer = this.widget.querySelector('.super-calendar-timer');
        if (timer && !this.timerHidden) {
            timer.classList.add('hidden');
            this.timerHidden = true;
        }
    }
    
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
    
    open() {
        this.widget.style.display = 'block';
        this.button.innerHTML = '<i class="fas fa-chevron-down"></i>';
        this.isOpen = true;
    }
    
    close() {
        this.widget.style.display = 'none';
        this.button.innerHTML = '<i class="fas fa-calendar"></i>';
        this.isOpen = false;
    }
    
    handleDateClick(date) {
        console.log('Date clicked:', date);
        this.openHighLevelCalendar();
    }
    
    handleButtonClick(action, url) {
        console.log('Button clicked:', action, url);
        
        switch (action) {
            case 'popup':
                this.openHighLevelCalendar();
                break;
            case 'redirect':
                if (url) {
                    window.location.href = url;
                }
                break;
            case 'new-tab':
                if (url) {
                    window.open(url, '_blank');
                }
                break;
            default:
                console.log('Unknown action:', action);
        }
    }
    
    openHighLevelCalendar() {
        // Method 1: Direct embed URL
        if (this.options.highlevelEmbedUrl) {
            window.open(this.options.highlevelEmbedUrl, 'highlevel-calendar', 'width=800,height=600,scrollbars=yes,resizable=yes');
            return;
        }
        
        // Method 2: HighLevel Calendar API
        if (this.options.highlevelCalendarId && this.options.highlevelLocationId) {
            const calendarUrl = `https://api.leadconnectorhq.com/widget/booking/${this.options.highlevelCalendarId}?location_id=${this.options.highlevelLocationId}`;
            window.open(calendarUrl, 'highlevel-calendar', 'width=800,height=600,scrollbars=yes,resizable=yes');
            return;
        }
        
        // Method 3: Check for HighLevel widget on page
        if (window.HighLevelCalendar && typeof window.HighLevelCalendar.open === 'function') {
            window.HighLevelCalendar.open();
            return;
        }
        
        // Fallback: Alert user to configure HighLevel integration
        console.log('HighLevel calendar integration not configured. Please set highlevelEmbedUrl or highlevelCalendarId/highlevelLocationId options.');
        alert('Please configure your calendar booking system.');
    }
    
    destroy() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        if (this.button) {
            this.button.remove();
        }
        
        if (this.widget) {
            this.widget.remove();
        }
        
        const styles = document.getElementById('super-calendar-styles');
        if (styles) {
            styles.remove();
        }
    }
}

// Auto-initialize if data attribute is found
document.addEventListener('DOMContentLoaded', function() {
    const containers = document.querySelectorAll('[data-super-calendar]');
    containers.forEach(container => {
        const options = {};
        
        // Parse data attributes
        Object.keys(container.dataset).forEach(key => {
            if (key.startsWith('superCalendar')) {
                const optionKey = key.replace('superCalendar', '').toLowerCase();
                let value = container.dataset[key];
                
                // Parse boolean values
                if (value === 'true') value = true;
                if (value === 'false') value = false;
                
                // Parse numbers
                if (!isNaN(value) && value !== '') value = Number(value);
                
                options[optionKey] = value;
            }
        });
        
        const widget = new SuperCalendar(options);
        widget.init();
    });
});

// Global access
window.SuperCalendar = SuperCalendar;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SuperCalendar;
}

