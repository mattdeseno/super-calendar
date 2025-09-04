/**
 * Super Calendar Widget v3.0
 * A professional scheduling widget with configurable buttons
 * Designed to match the original iClosed widget styling
 */

class SuperCalendar {
    constructor(config = {}) {
        this.config = {
            // Container
            container: config.container || '#super-calendar',
            
            // Profile settings
            profileName: config.profileName || 'Demo User',
            profileTitle: config.profileTitle || 'Demo Title',
            profileAvatar: config.profileAvatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
            showOnlineIndicator: config.showOnlineIndicator !== false,
            
            // Content settings
            mainHeading: config.mainHeading || 'Your Funnel\'s Fine — Until the Calendar Kills It',
            mainDescription: config.mainDescription || 'Fix your funnel with iClosed Scheduler. Saves leads drop-offs and filters out unqualified bookings 🔥',
            
            // Timer settings
            timerDuration: config.timerDuration || 180,
            timerText: config.timerText || 'Only few slots are left.',
            autoResetTimer: config.autoResetTimer !== false,
            
            // Button configuration
            buttons: config.buttons || [
                {
                    text: 'Schedule a demo',
                    style: 'primary',
                    action: 'popup',
                    url: 'https://your-landing-page.com/popup'
                },
                {
                    text: 'Start Free Trial',
                    style: 'secondary',
                    action: 'redirect',
                    url: 'https://your-landing-page.com/trial'
                }
            ],
            
            // Styling
            primaryColor: config.primaryColor || '#1e3a8a',
            progressBarColor: config.progressBarColor || '#3b82f6',
            backgroundColor: config.backgroundColor || '#ffffff',
            textColor: config.textColor || '#374151',
            
            // Behavior
            dateRange: config.dateRange || 5,
            showCloseButton: config.showCloseButton !== false,
            showFooter: config.showFooter !== false,
            poweredByText: config.poweredByText || 'Powered by iClosed',
            
            // Callbacks
            onDateSelect: config.onDateSelect || null,
            onButtonClick: config.onButtonClick || null,
            onClose: config.onClose || null,
            
            // Source tracking
            source: config.source || 'super-calendar'
        };
        
        this.timerInterval = null;
        this.currentTime = this.config.timerDuration;
        this.selectedDate = null;
    }
    
    init() {
        this.injectStyles();
        this.render();
        this.bindEvents();
        this.startTimer();
        
        console.log('Super Calendar v3.0 initialized');
    }
    
    injectStyles() {
        if (document.getElementById('super-calendar-styles-v3')) return;
        
        const styles = `
            .super-calendar-v3 {
                max-width: 420px;
                margin: 0 auto;
                background: ${this.config.backgroundColor};
                border-radius: 20px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
                overflow: hidden;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                position: relative;
                border: 1px solid rgba(0, 0, 0, 0.08);
            }

            .super-calendar-v3 .close-button {
                position: absolute;
                top: 20px;
                right: 20px;
                background: rgba(0, 0, 0, 0.05);
                border: none;
                border-radius: 50%;
                width: 32px;
                height: 32px;
                cursor: pointer;
                font-size: 18px;
                color: #6b7280;
                z-index: 10;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background 0.2s;
            }

            .super-calendar-v3 .close-button:hover {
                background: rgba(0, 0, 0, 0.1);
            }

            .super-calendar-v3 .profile-section {
                padding: 30px 30px 25px;
                border-bottom: 1px solid #f3f4f6;
            }

            .super-calendar-v3 .profile-info {
                display: flex;
                align-items: center;
                gap: 15px;
                margin-bottom: 0;
            }

            .super-calendar-v3 .profile-avatar {
                width: 56px;
                height: 56px;
                border-radius: 50%;
                object-fit: cover;
                position: relative;
            }

            .super-calendar-v3 .online-indicator {
                position: absolute;
                bottom: 2px;
                right: 2px;
                width: 16px;
                height: 16px;
                background: #10b981;
                border: 3px solid white;
                border-radius: 50%;
            }

            .super-calendar-v3 .profile-details h3 {
                font-size: 18px;
                font-weight: 600;
                margin: 0 0 4px 0;
                color: #111827;
                line-height: 1.2;
            }

            .super-calendar-v3 .profile-details p {
                font-size: 15px;
                color: #6b7280;
                margin: 0;
                line-height: 1.3;
            }

            .super-calendar-v3 .main-content {
                padding: 25px 30px 30px;
            }

            .super-calendar-v3 .main-heading {
                font-size: 22px;
                font-weight: 700;
                margin-bottom: 12px;
                color: #111827;
                line-height: 1.3;
                letter-spacing: -0.025em;
            }

            .super-calendar-v3 .main-description {
                font-size: 16px;
                color: #6b7280;
                margin-bottom: 25px;
                line-height: 1.5;
            }

            .super-calendar-v3 .timer-section {
                background: #f3f4f6;
                color: #374151;
                padding: 18px 24px;
                border-radius: 12px;
                margin-bottom: 25px;
                position: relative;
                overflow: hidden;
                border: 1px solid #e5e7eb;
            }

            .super-calendar-v3 .timer-content {
                display: flex;
                justify-content: space-between;
                align-items: center;
                position: relative;
                z-index: 2;
            }

            .super-calendar-v3 .timer-text {
                font-size: 16px;
                font-weight: 600;
                color: #374151;
            }

            .super-calendar-v3 .timer-display {
                font-size: 20px;
                font-weight: 700;
                font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
                color: #111827;
            }

            .super-calendar-v3 .progress-bar {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 4px;
                background: #e5e7eb;
                overflow: hidden;
            }

            .super-calendar-v3 .progress-fill {
                height: 100%;
                background: linear-gradient(135deg, ${this.config.primaryColor} 0%, ${this.config.progressBarColor} 100%);
                transition: width 1s linear;
                border-radius: 0;
            }

            .super-calendar-v3 .dates-section {
                margin-bottom: 25px;
            }

            .super-calendar-v3 .dates-grid {
                display: grid;
                grid-template-columns: repeat(5, 1fr);
                gap: 10px;
            }

            .super-calendar-v3 .date-button {
                background: white;
                border: 2px solid #e5e7eb;
                border-radius: 12px;
                padding: 16px 8px;
                text-align: center;
                cursor: pointer;
                transition: all 0.2s ease;
                position: relative;
            }

            .super-calendar-v3 .date-button:hover {
                border-color: ${this.config.primaryColor};
                background: #f8faff;
                transform: translateY(-1px);
            }

            .super-calendar-v3 .date-button.selected {
                border-color: ${this.config.primaryColor};
                background: ${this.config.primaryColor};
                color: white;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(30, 58, 138, 0.3);
            }

            .super-calendar-v3 .date-button .day {
                font-size: 13px;
                font-weight: 600;
                text-transform: uppercase;
                margin-bottom: 6px;
                opacity: 0.8;
                letter-spacing: 0.5px;
            }

            .super-calendar-v3 .date-button .date {
                font-size: 18px;
                font-weight: 700;
                line-height: 1;
            }

            .super-calendar-v3 .buttons-section {
                display: flex;
                flex-direction: column;
                gap: 12px;
                margin-bottom: 25px;
            }

            .super-calendar-v3 .action-button {
                padding: 16px 24px;
                border-radius: 12px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                border: none;
                text-decoration: none;
                text-align: center;
                display: block;
                position: relative;
                overflow: hidden;
            }

            .super-calendar-v3 .action-button.primary {
                background: ${this.config.primaryColor};
                color: white;
                box-shadow: 0 4px 12px rgba(30, 58, 138, 0.3);
            }

            .super-calendar-v3 .action-button.primary:hover {
                background: #1e40af;
                transform: translateY(-1px);
                box-shadow: 0 6px 16px rgba(30, 58, 138, 0.4);
            }

            .super-calendar-v3 .action-button.secondary {
                background: white;
                color: ${this.config.primaryColor};
                border: 2px solid ${this.config.primaryColor};
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            }

            .super-calendar-v3 .action-button.secondary:hover {
                background: #f8faff;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(30, 58, 138, 0.15);
            }

            .super-calendar-v3 .action-button:active {
                transform: translateY(0);
            }

            .super-calendar-v3 .footer {
                padding: 20px 30px;
                border-top: 1px solid #f3f4f6;
                text-align: center;
                background: #fafafa;
            }

            .super-calendar-v3 .powered-by {
                font-size: 13px;
                color: #9ca3af;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
            }

            .super-calendar-v3 .powered-by svg {
                width: 16px;
                height: 16px;
                opacity: 0.6;
            }

            /* Mobile responsiveness */
            @media (max-width: 480px) {
                .super-calendar-v3 {
                    max-width: 100%;
                    margin: 0;
                    border-radius: 0;
                }
                
                .super-calendar-v3 .profile-section,
                .super-calendar-v3 .main-content,
                .super-calendar-v3 .footer {
                    padding-left: 20px;
                    padding-right: 20px;
                }
                
                .super-calendar-v3 .main-heading {
                    font-size: 20px;
                }
                
                .super-calendar-v3 .dates-grid {
                    gap: 8px;
                }
                
                .super-calendar-v3 .date-button {
                    padding: 12px 6px;
                }
            }

            /* Animation for initial load */
            .super-calendar-v3 {
                animation: superCalendarFadeIn 0.5s ease-out;
            }

            @keyframes superCalendarFadeIn {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.id = 'super-calendar-styles-v3';
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }
    
    render() {
        const container = typeof this.config.container === 'string' 
            ? document.querySelector(this.config.container)
            : this.config.container;
            
        if (!container) {
            console.error('Super Calendar: Container not found');
            return;
        }
        
        // Generate dates
        const dates = this.generateDates();
        
        // Generate buttons
        const buttonsHtml = this.config.buttons.map(button => 
            `<button class="action-button ${button.style}" 
                     data-action="${button.action}" 
                     data-url="${button.url}"
                     data-text="${button.text}">
                ${button.text}
            </button>`
        ).join('');
        
        // Generate dates HTML
        const datesHtml = dates.map((date, index) => 
            `<div class="date-button ${index === 0 ? 'selected' : ''}" 
                  data-date="${date.fullDate}"
                  data-index="${index}">
                <div class="day">${date.day}</div>
                <div class="date">${date.date}</div>
            </div>`
        ).join('');
        
        container.innerHTML = `
            <div class="super-calendar-v3" data-source="${this.config.source}">
                ${this.config.showCloseButton ? '<button class="close-button">×</button>' : ''}
                
                <div class="profile-section">
                    <div class="profile-info">
                        <div style="position: relative;">
                            <img src="${this.config.profileAvatar}" alt="Profile" class="profile-avatar">
                            ${this.config.showOnlineIndicator ? '<div class="online-indicator"></div>' : ''}
                        </div>
                        <div class="profile-details">
                            <h3>${this.config.profileName}</h3>
                            <p>${this.config.profileTitle}</p>
                        </div>
                    </div>
                </div>
                
                <div class="main-content">
                    <h2 class="main-heading">${this.config.mainHeading}</h2>
                    <p class="main-description">${this.config.mainDescription}</p>
                    
                    <div class="timer-section">
                        <div class="timer-content">
                            <span class="timer-text">${this.config.timerText}</span>
                            <span class="timer-display" id="timer-display-${this.config.source}">03:00</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" id="progress-fill-${this.config.source}"></div>
                        </div>
                    </div>
                    
                    <div class="dates-section">
                        <div class="dates-grid">
                            ${datesHtml}
                        </div>
                    </div>
                    
                    <div class="buttons-section">
                        ${buttonsHtml}
                    </div>
                </div>
                
                ${this.config.showFooter ? `
                <div class="footer">
                    <div class="powered-by">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
                        </svg>
                        ${this.config.poweredByText}
                    </div>
                </div>
                ` : ''}
            </div>
        `;
        
        this.selectedDate = dates[0]; // Select first date by default
    }
    
    generateDates() {
        const dates = [];
        const today = new Date();
        
        for (let i = 0; i < this.config.dateRange; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            
            dates.push({
                day: date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
                date: date.getDate().toString().padStart(2, '0'),
                fullDate: date.toISOString().split('T')[0],
                dateObj: date
            });
        }
        
        return dates;
    }
    
    bindEvents() {
        const container = document.querySelector(this.config.container);
        if (!container) return;
        
        // Date selection
        container.addEventListener('click', (e) => {
            if (e.target.closest('.date-button')) {
                const dateButton = e.target.closest('.date-button');
                const dateIndex = parseInt(dateButton.dataset.index);
                const dateValue = dateButton.dataset.date;
                
                // Update selection
                container.querySelectorAll('.date-button').forEach(btn => btn.classList.remove('selected'));
                dateButton.classList.add('selected');
                
                this.selectedDate = {
                    index: dateIndex,
                    date: dateValue,
                    element: dateButton
                };
                
                if (this.config.onDateSelect) {
                    this.config.onDateSelect(this.selectedDate);
                }
            }
        });
        
        // Button clicks
        container.addEventListener('click', (e) => {
            if (e.target.closest('.action-button')) {
                const button = e.target.closest('.action-button');
                const action = button.dataset.action;
                const url = button.dataset.url;
                const text = button.dataset.text;
                
                this.handleButtonClick(action, url, text, button);
            }
        });
        
        // Close button
        container.addEventListener('click', (e) => {
            if (e.target.closest('.close-button')) {
                this.close();
            }
        });
    }
    
    handleButtonClick(action, url, text, buttonElement) {
        console.log(`Super Calendar: Button clicked - ${action} - ${url}`);
        
        if (this.config.onButtonClick) {
            const result = this.config.onButtonClick({
                action,
                url,
                text,
                selectedDate: this.selectedDate,
                element: buttonElement
            });
            
            if (result === false) return; // Allow callback to prevent default action
        }
        
        switch (action) {
            case 'popup':
                if (url) {
                    const popup = window.open(url, 'super-calendar-popup', 
                        'width=600,height=700,scrollbars=yes,resizable=yes');
                    if (popup) popup.focus();
                }
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
                
            case 'highlevel':
                if (url) {
                    // HighLevel calendar integration
                    const popup = window.open(url, 'highlevel-calendar', 
                        'width=800,height=800,scrollbars=yes,resizable=yes');
                    if (popup) popup.focus();
                }
                break;
                
            default:
                console.warn(`Super Calendar: Unknown action type: ${action}`);
        }
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
    
    close() {
        const container = document.querySelector(this.config.container);
        if (container) {
            container.style.display = 'none';
        }
        
        if (this.config.onClose) {
            this.config.onClose();
        }
        
        console.log('Super Calendar: Widget closed');
    }
    
    destroy() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        const container = document.querySelector(this.config.container);
        if (container) {
            container.innerHTML = '';
        }
        
        const styles = document.getElementById('super-calendar-styles-v3');
        if (styles) {
            styles.remove();
        }
        
        console.log('Super Calendar: Widget destroyed');
    }
    
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.render();
        this.bindEvents();
        this.startTimer();
    }
}

// Auto-initialization for data attributes
document.addEventListener('DOMContentLoaded', () => {
    const autoInitElements = document.querySelectorAll('[data-super-calendar-v3]');
    
    autoInitElements.forEach(element => {
        try {
            const config = JSON.parse(element.dataset.superCalendarV3 || '{}');
            config.container = element;
            
            const widget = new SuperCalendar(config);
            widget.init();
            
            // Store instance for later access
            element.superCalendarInstance = widget;
        } catch (error) {
            console.error('Super Calendar: Auto-initialization failed', error);
        }
    });
});

// Global access
if (typeof window !== 'undefined') {
    window.SuperCalendar = SuperCalendar;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SuperCalendar;
}

