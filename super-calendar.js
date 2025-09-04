/**
 * Super Calendar Floating Widget v4.0
 * A floating scheduling widget with HighLevel integration
 * Appears as a chat widget in bottom-right corner
 */

class SuperCalendarFloating {
    constructor(config = {}) {
        this.config = {
            // HighLevel Integration
            highlevelCalendarId: '', // HighLevel calendar ID
            highlevelLocationId: '', // HighLevel location ID
            highlevelApiKey: '', // HighLevel API key (if needed)
            highlevelEmbedUrl: '', // Direct embed URL
            
            // Profile settings
            profileName: 'Demo User',
            profileTitle: 'Demo Title',
            profileAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
            showOnlineIndicator: true,
            
            // Content settings
            mainHeading: 'Your Funnel\'s Fine — Until the Calendar Kills It',
            mainDescription: 'Fix your funnel with iClosed Scheduler. Saves leads drop-offs and filters out unqualified bookings 🔥',
            
            // Timer settings
            timerDuration: 180, // seconds
            timerText: 'Only few slots are left.',
            
            // Button configuration
            buttons: [
                {
                    text: 'Schedule a demo',
                    style: 'primary',
                    action: 'popup',
                    url: '' // HighLevel popup - URL not needed for popup action
                },
                {
                    text: 'Start Free Trial',
                    style: 'secondary',
                    action: 'redirect',
                    url: 'https://your-landing-page.com/trial'
                }
            ],
            
            // Theme colors
            primaryColor: '#1e3a8a',
            progressBarColor: '#3b82f6',
            
            // Floating widget settings
            position: 'bottom-right', // bottom-right, bottom-left
            offsetX: 20, // pixels from edge
            offsetY: 20, // pixels from edge
            
            // Display options
            showFooter: true,
            poweredByText: 'Powered by iClosed',
            
            // Technical
            source: 'super-calendar-floating',
            
            // Merge with provided config
            ...config
        };
        
        this.currentTime = this.config.timerDuration;
        this.timerInterval = null;
        this.isOpen = false;
        this.container = null;
        this.floatingButton = null;
        this.widget = null;
    }
    
    init() {
        console.log('Super Calendar Floating v4.0 initializing...');
        
        // Create floating container
        this.createFloatingContainer();
        
        // Inject styles
        this.injectStyles();
        
        // Create floating button
        this.createFloatingButton();
        
        // Create widget (hidden initially)
        this.createWidget();
        
        console.log('Super Calendar Floating v4.0 initialized successfully');
    }
    
    createFloatingContainer() {
        // Remove existing container
        const existing = document.getElementById('super-calendar-floating-container');
        if (existing) {
            existing.remove();
        }
        
        this.container = document.createElement('div');
        this.container.id = 'super-calendar-floating-container';
        this.container.className = 'super-calendar-floating-container';
        
        document.body.appendChild(this.container);
    }
    
    injectStyles() {
        // Remove existing styles
        const existingStyles = document.getElementById('super-calendar-floating-styles');
        if (existingStyles) {
            existingStyles.remove();
        }
        
        const styles = document.createElement('style');
        styles.id = 'super-calendar-floating-styles';
        styles.textContent = `
            .super-calendar-floating-container {
                position: fixed;
                ${this.config.position.includes('bottom') ? 'bottom' : 'top'}: ${this.config.offsetY}px;
                ${this.config.position.includes('right') ? 'right' : 'left'}: ${this.config.offsetX}px;
                z-index: 10000;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            }
            
            .super-calendar-floating-button {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: ${this.config.primaryColor};
                color: white;
                border: none;
                cursor: pointer;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
            }
            
            .super-calendar-floating-button:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 25px rgba(0, 0, 0, 0.2);
            }
            
            .super-calendar-floating-button.open {
                background: #374151;
            }
            
            .super-calendar-floating-widget {
                position: absolute;
                bottom: 70px;
                right: 0;
                width: 380px;
                max-width: calc(100vw - 40px);
                background: white;
                border-radius: 16px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
                border: 1px solid #e5e7eb;
                opacity: 0;
                transform: translateY(20px) scale(0.95);
                transition: all 0.3s ease;
                pointer-events: none;
                overflow: hidden;
            }
            
            .super-calendar-floating-widget.open {
                opacity: 1;
                transform: translateY(0) scale(1);
                pointer-events: all;
            }
            
            .super-calendar-floating-widget * {
                box-sizing: border-box;
            }
            
            .super-calendar-floating-widget .profile-section {
                padding: 20px 20px 16px 20px;
                border-bottom: 1px solid #f3f4f6;
            }
            
            .super-calendar-floating-widget .profile-info {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .super-calendar-floating-widget .profile-avatar {
                position: relative;
                width: 44px;
                height: 44px;
                border-radius: 50%;
                overflow: hidden;
                flex-shrink: 0;
            }
            
            .super-calendar-floating-widget .profile-avatar img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            
            .super-calendar-floating-widget .online-indicator {
                position: absolute;
                bottom: 2px;
                right: 2px;
                width: 10px;
                height: 10px;
                background: #10b981;
                border: 2px solid white;
                border-radius: 50%;
            }
            
            .super-calendar-floating-widget .profile-details h3 {
                margin: 0;
                font-size: 15px;
                font-weight: 600;
                color: #111827;
                line-height: 1.2;
            }
            
            .super-calendar-floating-widget .profile-details p {
                margin: 2px 0 0 0;
                font-size: 13px;
                color: #6b7280;
                line-height: 1.2;
            }
            
            .super-calendar-floating-widget .content-section {
                padding: 20px;
            }
            
            .super-calendar-floating-widget .main-heading {
                margin: 0 0 10px 0;
                font-size: 18px;
                font-weight: 700;
                color: #111827;
                line-height: 1.3;
            }
            
            .super-calendar-floating-widget .main-description {
                margin: 0 0 20px 0;
                font-size: 13px;
                color: #6b7280;
                line-height: 1.4;
            }
            
            .super-calendar-floating-widget .timer-section {
                background: #f3f4f6;
                border-radius: 10px;
                padding: 14px;
                margin-bottom: 20px;
                position: relative;
                overflow: hidden;
                transition: opacity 0.5s ease, height 0.5s ease, margin 0.5s ease;
            }
            
            .super-calendar-floating-widget .progress-bar {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 3px;
                background: #e5e7eb;
                overflow: hidden;
            }
            
            .super-calendar-floating-widget .progress-fill {
                height: 100%;
                background: linear-gradient(135deg, ${this.config.primaryColor} 0%, ${this.config.progressBarColor} 100%);
                transition: width 1s linear;
                border-radius: 0;
            }
            
            .super-calendar-floating-widget .timer-content {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding-top: 3px;
            }
            
            .super-calendar-floating-widget .timer-text {
                font-size: 14px;
                font-weight: 600;
                color: #374151;
            }
            
            .super-calendar-floating-widget .timer-display {
                font-size: 18px;
                font-weight: 700;
                font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
                color: #111827;
            }
            
            .super-calendar-floating-widget .dates-section {
                margin-bottom: 20px;
            }
            
            .super-calendar-floating-widget .dates-grid {
                display: grid;
                grid-template-columns: repeat(5, 1fr);
                gap: 6px;
            }
            
            .super-calendar-floating-widget .date-button {
                background: white;
                border: 2px solid #e5e7eb;
                border-radius: 10px;
                padding: 10px 6px;
                text-align: center;
                cursor: pointer;
                transition: all 0.2s ease;
                font-size: 13px;
            }
            
            .super-calendar-floating-widget .date-button:hover {
                border-color: ${this.config.primaryColor};
                background: #f8fafc;
                transform: translateY(-1px);
            }
            
            .super-calendar-floating-widget .date-button .day {
                font-weight: 600;
                font-size: 11px;
                text-transform: uppercase;
                margin-bottom: 3px;
                opacity: 0.8;
                color: #6b7280;
            }
            
            .super-calendar-floating-widget .date-button .date {
                font-weight: 700;
                font-size: 16px;
                color: #111827;
            }
            
            .super-calendar-floating-widget .buttons-section {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            
            .super-calendar-floating-widget .action-button {
                width: 100%;
                padding: 14px 20px;
                border-radius: 10px;
                font-size: 15px;
                font-weight: 600;
                text-align: center;
                cursor: pointer;
                transition: all 0.2s ease;
                text-decoration: none;
                display: inline-block;
                border: none;
                font-family: inherit;
            }
            
            .super-calendar-floating-widget .action-button.primary {
                background: ${this.config.primaryColor};
                color: white;
                border: 2px solid ${this.config.primaryColor};
            }
            
            .super-calendar-floating-widget .action-button.primary:hover {
                background: #1e40af;
                border-color: #1e40af;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(30, 58, 138, 0.3);
            }
            
            .super-calendar-floating-widget .action-button.secondary {
                background: white;
                color: ${this.config.primaryColor};
                border: 2px solid ${this.config.primaryColor};
            }
            
            .super-calendar-floating-widget .action-button.secondary:hover {
                background: ${this.config.primaryColor};
                color: white;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(30, 58, 138, 0.2);
            }
            
            .super-calendar-floating-widget .footer {
                padding: 12px 20px;
                text-align: center;
                border-top: 1px solid #f3f4f6;
                background: #fafafa;
            }
            
            .super-calendar-floating-widget .footer p {
                margin: 0;
                font-size: 11px;
                color: #9ca3af;
            }
            
            /* Mobile responsive */
            @media (max-width: 480px) {
                .super-calendar-floating-container {
                    right: 10px !important;
                    bottom: 10px !important;
                }
                
                .super-calendar-floating-widget {
                    width: calc(100vw - 20px);
                    right: -10px;
                }
            }
            
            /* Calendar and chevron icons */
            .calendar-icon {
                width: 28px;
                height: 28px;
                fill: currentColor;
            }
            
            .chevron-icon {
                width: 20px;
                height: 20px;
                fill: currentColor;
                transform: rotate(180deg);
            }
        `;
        
        document.head.appendChild(styles);
    }
    
    createFloatingButton() {
        this.floatingButton = document.createElement('button');
        this.floatingButton.className = 'super-calendar-floating-button';
        this.floatingButton.innerHTML = `
            <svg class="calendar-icon" viewBox="0 0 24 24">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
            </svg>
        `;
        
        this.floatingButton.addEventListener('click', () => {
            this.toggle();
        });
        
        this.container.appendChild(this.floatingButton);
    }
    
    createWidget() {
        this.widget = document.createElement('div');
        this.widget.className = 'super-calendar-floating-widget';
        
        const dates = this.generateDates();
        const buttonsHtml = this.config.buttons.map((button, index) => 
            `<button class="action-button ${button.style}" data-action="${button.action}" data-url="${button.url || ''}" data-button-index="${index}">
                ${button.text}
            </button>`
        ).join('');
        
        this.widget.innerHTML = `
            <div class="profile-section">
                <div class="profile-info">
                    <div class="profile-avatar">
                        <img src="${this.config.profileAvatar}" alt="${this.config.profileName}">
                        ${this.config.showOnlineIndicator ? '<div class="online-indicator"></div>' : ''}
                    </div>
                    <div class="profile-details">
                        <h3>${this.config.profileName}</h3>
                        <p>${this.config.profileTitle}</p>
                    </div>
                </div>
            </div>
            
            <div class="content-section">
                <h2 class="main-heading">${this.config.mainHeading}</h2>
                <p class="main-description">${this.config.mainDescription}</p>
                
                <div class="timer-section" id="super-calendar-timer-${this.config.source}">
                    <div class="progress-bar">
                        <div class="progress-fill" id="progress-fill-${this.config.source}" style="width: 100%;"></div>
                    </div>
                    <div class="timer-content">
                        <span class="timer-text">${this.config.timerText}</span>
                        <span class="timer-display" id="timer-display-${this.config.source}">03:00</span>
                    </div>
                </div>
                
                <div class="dates-section">
                    <div class="dates-grid">
                        ${dates.map((date, index) => `
                            <div class="date-button" data-date="${date.full}">
                                <div class="day">${date.day}</div>
                                <div class="date">${date.date}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="buttons-section">
                    ${buttonsHtml}
                </div>
            </div>
            
            ${this.config.showFooter ? `
                <div class="footer">
                    <p>${this.config.poweredByText}</p>
                </div>
            ` : ''}
        `;
        
        this.container.appendChild(this.widget);
        this.bindEvents();
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
    
    bindEvents() {
        // Date selection - all dates trigger HighLevel popup
        const dateButtons = this.widget.querySelectorAll('.date-button');
        dateButtons.forEach(button => {
            button.addEventListener('click', () => {
                console.log('Super Calendar: Date selected:', button.dataset.date);
                this.openHighLevelCalendar(button.dataset.date);
            });
        });
        
        // Button actions - handle based on action type
        const actionButtons = this.widget.querySelectorAll('.action-button');
        actionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const action = button.dataset.action;
                const url = button.dataset.url;
                const buttonIndex = button.dataset.buttonIndex;
                
                console.log('Super Calendar: Button clicked:', { action, url, buttonIndex });
                
                // Handle different action types
                switch (action) {
                    case 'popup':
                        // Popup action opens HighLevel calendar
                        this.openHighLevelCalendar();
                        break;
                        
                    case 'redirect':
                        // Redirect to custom URL
                        if (url) {
                            window.location.href = url;
                        }
                        break;
                        
                    case 'new-tab':
                        // Open custom URL in new tab
                        if (url) {
                            window.open(url, '_blank');
                        }
                        break;
                        
                    case 'highlevel':
                        // Legacy support - opens HighLevel calendar
                        this.openHighLevelCalendar();
                        break;
                        
                    default:
                        console.warn(`Super Calendar: Unknown action type: ${action}`);
                }
            });
        });
        
        // Close widget when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.container.contains(e.target)) {
                this.close();
            }
        });
        
        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    }
    
    openHighLevelCalendar(selectedDate = null) {
        console.log('Opening HighLevel calendar...', { selectedDate });
        
        // Method 1: Direct embed URL
        if (this.config.highlevelEmbedUrl) {
            let url = this.config.highlevelEmbedUrl;
            
            // Add selected date as parameter if provided
            if (selectedDate) {
                const separator = url.includes('?') ? '&' : '?';
                url += `${separator}date=${selectedDate}`;
            }
            
            this.openPopup(url, 'HighLevel Calendar');
            return;
        }
        
        // Method 2: HighLevel widget API
        if (this.config.highlevelCalendarId) {
            const baseUrl = 'https://api.leadconnectorhq.com/widget/booking';
            let url = `${baseUrl}/${this.config.highlevelCalendarId}`;
            
            if (this.config.highlevelLocationId) {
                url += `?locationId=${this.config.highlevelLocationId}`;
            }
            
            if (selectedDate) {
                const separator = url.includes('?') ? '&' : '?';
                url += `${separator}date=${selectedDate}`;
            }
            
            this.openPopup(url, 'HighLevel Calendar');
            return;
        }
        
        // Method 3: HighLevel iframe embed
        if (window.HighLevelCalendar) {
            window.HighLevelCalendar.open({
                calendarId: this.config.highlevelCalendarId,
                locationId: this.config.highlevelLocationId,
                selectedDate: selectedDate
            });
            return;
        }
        
        // Fallback: Generic popup
        console.warn('HighLevel configuration not found, using fallback');
        this.openPopup('https://your-highlevel-calendar.com', 'Schedule Appointment');
    }
    
    openPopup(url, title = 'Calendar') {
        const popup = window.open(
            url,
            title.replace(/\s+/g, '-').toLowerCase(),
            'width=800,height=700,scrollbars=yes,resizable=yes,centerscreen=yes'
        );
        
        if (popup) {
            popup.focus();
            // Close widget after opening popup
            this.close();
        } else {
            // Popup blocked, try redirect
            console.warn('Popup blocked, redirecting...');
            window.location.href = url;
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
        if (this.isOpen) return;
        
        this.isOpen = true;
        this.widget.classList.add('open');
        this.floatingButton.classList.add('open');
        
        // Change icon to chevron down
        this.floatingButton.innerHTML = `
            <svg class="chevron-icon" viewBox="0 0 24 24">
                <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
            </svg>
        `;
        
        // Start timer
        this.startTimer();
        
        console.log('Super Calendar: Widget opened');
    }
    
    close() {
        if (!this.isOpen) return;
        
        this.isOpen = false;
        this.widget.classList.remove('open');
        this.floatingButton.classList.remove('open');
        
        // Change icon back to calendar
        this.floatingButton.innerHTML = `
            <svg class="calendar-icon" viewBox="0 0 24 24">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
            </svg>
        `;
        
        // Stop timer
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        console.log('Super Calendar: Widget closed');
    }
    
    startTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        this.currentTime = this.config.timerDuration;
        const timerDisplay = document.getElementById(`timer-display-${this.config.source}`);
        const progressFill = document.getElementById(`progress-fill-${this.config.source}`);
        
        if (!timerDisplay || !progressFill) return;
        
        this.timerInterval = setInterval(() => {
            this.currentTime--;
            
            const minutes = Math.floor(this.currentTime / 60);
            const seconds = this.currentTime % 60;
            
            timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            const percentage = (this.currentTime / this.config.timerDuration) * 100;
            progressFill.style.width = `${Math.max(0, percentage)}%`;
            
            if (this.currentTime <= 0) {
                // Hide timer section when countdown reaches zero
                const timerSection = document.querySelector(`#super-calendar-timer-${this.config.source}`);
                if (timerSection) {
                    timerSection.style.transition = 'opacity 0.5s ease, height 0.5s ease, margin 0.5s ease';
                    timerSection.style.opacity = '0';
                    timerSection.style.height = '0';
                    timerSection.style.marginBottom = '0';
                    timerSection.style.overflow = 'hidden';
                    
                    // Completely hide after animation
                    setTimeout(() => {
                        timerSection.style.display = 'none';
                    }, 500);
                }
                
                // Stop the timer
                clearInterval(this.timerInterval);
                this.timerInterval = null;
            }
        }, 1000);
    }
    
    destroy() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        if (this.container) {
            this.container.remove();
        }
        
        const styles = document.getElementById('super-calendar-floating-styles');
        if (styles) {
            styles.remove();
        }
        
        console.log('Super Calendar Floating: Widget destroyed');
    }
}

// Auto-initialization for data attributes
document.addEventListener('DOMContentLoaded', () => {
    const autoInitElements = document.querySelectorAll('[data-super-calendar-floating]');
    
    autoInitElements.forEach(element => {
        try {
            const config = JSON.parse(element.dataset.superCalendarFloating || '{}');
            
            const widget = new SuperCalendarFloating(config);
            widget.init();
            
            // Store instance for later access
            element.superCalendarFloatingInstance = widget;
        } catch (error) {
            console.error('Super Calendar Floating: Auto-initialization failed', error);
        }
    });
});

// Global access
if (typeof window !== 'undefined') {
    window.SuperCalendarFloating = SuperCalendarFloating;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SuperCalendarFloating;
}

console.log('Super Calendar Floating v4.0 script loaded successfully');

