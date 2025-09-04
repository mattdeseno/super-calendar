/**
 * Super Calendar Widget
 * A powerful scheduling widget with countdown timer and pattern interrupt functionality
 */

class SuperCalendar {
    constructor(config = {}) {
        this.config = {
            // Container
            container: '#super-calendar',
            
            // Profile Settings
            profileName: 'Ismael',
            profileTitle: 'CEO iClosed',
            profileAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
            showOnlineIndicator: true,
            
            // Content
            mainHeading: "Your Funnel's Fine — Until the Calendar Kills It",
            mainDescription: "Fix your funnel with iClosed Scheduler. Saves leads drop-offs and filters out unqualified bookings 🔥",
            
            // Timer Settings
            timerDuration: 180, // 3 minutes in seconds
            timerText: "Only few slots are left.",
            autoReset: true,
            
            // Buttons
            primaryButtonText: "Schedule a demo",
            secondaryButtonText: "Start Free Trial",
            showSecondaryButton: true,
            
            // Theme Colors
            primaryColor: '#1e3a8a',
            progressBarColor: '#3b82f6',
            backgroundColor: '#ffffff',
            textColor: '#1f2937',
            
            // Pattern Interrupt Settings
            popupUrl: '', // URL to open in popup
            redirectUrl: '', // URL to redirect to
            openInNewTab: false, // Open in new tab instead of popup
            
            // Footer
            poweredByText: 'Powered by iClosed',
            poweredByLogo: '',
            showFooter: true,
            
            // Behavior
            showCloseButton: true,
            dateRange: 5, // Number of days to show
            
            // Callbacks
            onDateSelect: null,
            onPrimaryClick: null,
            onSecondaryClick: null,
            onClose: null,
            onTimerEnd: null,
            
            ...config
        };
        
        this.selectedDate = null;
        this.timerInterval = null;
        this.currentTime = this.config.timerDuration;
        this.isInitialized = false;
    }
    
    init() {
        if (this.isInitialized) return;
        
        // Inject CSS styles
        this.injectStyles();
        
        const container = document.querySelector(this.config.container);
        if (!container) {
            console.error('Pattern Interrupt Widget: Container not found');
            return;
        }
        
        this.container = container;
        this.render();
        this.bindEvents();
        this.startTimer();
        this.isInitialized = true;
        
        console.log('Super Calendar initialized');
    }
    
    injectStyles() {
        if (!document.getElementById('super-calendar-styles')) {
            const style = document.createElement('style');
            style.id = 'super-calendar-styles';
            style.textContent = this.getCSS();
            document.head.appendChild(style);
        }
    }
    
    getCSS() {
        return `
            .super-calendar {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: ${this.config.backgroundColor};
                border-radius: 12px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                max-width: 400px;
                margin: 0 auto;
                overflow: hidden;
                position: relative;
                color: ${this.config.textColor};
            }
            
            .widget-header {
                padding: 20px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                border-bottom: 1px solid #e5e7eb;
            }
            
            .profile-section {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .profile-avatar {
                position: relative;
                width: 48px;
                height: 48px;
            }
            
            .avatar-image {
                width: 100%;
                height: 100%;
                border-radius: 50%;
                object-fit: cover;
            }
            
            .online-indicator {
                position: absolute;
                bottom: 2px;
                right: 2px;
                width: 12px;
                height: 12px;
                background: #10b981;
                border: 2px solid white;
                border-radius: 50%;
            }
            
            .profile-info h3 {
                margin: 0;
                font-size: 16px;
                font-weight: 600;
                color: ${this.config.textColor};
            }
            
            .profile-info p {
                margin: 2px 0 0 0;
                font-size: 14px;
                color: #6b7280;
            }
            
            .close-button {
                background: none;
                border: none;
                font-size: 20px;
                color: #9ca3af;
                cursor: pointer;
                padding: 4px;
                line-height: 1;
            }
            
            .close-button:hover {
                color: #6b7280;
            }
            
            .widget-content {
                padding: 24px 20px;
            }
            
            .main-heading {
                font-size: 20px;
                font-weight: 700;
                color: ${this.config.textColor};
                line-height: 1.3;
                margin: 0 0 12px 0;
            }
            
            .main-description {
                font-size: 14px;
                color: #6b7280;
                line-height: 1.5;
                margin: 0 0 24px 0;
            }
            
            .timer-section {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 16px;
                margin-bottom: 24px;
                position: relative;
                overflow: hidden;
            }
            
            .timer-progress-bar {
                position: absolute;
                top: 0;
                left: 0;
                height: 4px;
                background: ${this.config.progressBarColor};
                width: 100%;
                transition: width 1s linear;
            }
            
            .timer-content {
                display: flex;
                justify-content: space-between;
                align-items: center;
                position: relative;
                z-index: 1;
            }
            
            .timer-text {
                font-size: 16px;
                font-weight: 600;
                color: ${this.config.textColor};
            }
            
            .timer-display {
                font-size: 18px;
                font-weight: 700;
                color: ${this.config.textColor};
                font-family: 'Courier New', monospace;
            }
            
            .date-selection {
                display: flex;
                gap: 8px;
                margin-bottom: 24px;
                justify-content: space-between;
            }
            
            .date-button {
                flex: 1;
                background: white;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                padding: 12px 8px;
                text-align: center;
                cursor: pointer;
                transition: all 0.2s ease;
                min-height: 60px;
                display: flex;
                flex-direction: column;
                justify-content: center;
                color: ${this.config.textColor};
            }
            
            .date-button:hover {
                border-color: #d1d5db;
                background: #f9fafb;
            }
            
            .date-button.selected {
                background: ${this.config.primaryColor};
                border-color: ${this.config.primaryColor};
                color: white;
            }
            
            .date-day {
                font-size: 12px;
                font-weight: 600;
                margin-bottom: 2px;
                text-transform: uppercase;
            }
            
            .date-number {
                font-size: 16px;
                font-weight: 700;
            }
            
            .action-buttons {
                display: flex;
                flex-direction: column;
                gap: 12px;
                margin-bottom: 20px;
            }
            
            .btn-primary {
                background: ${this.config.primaryColor};
                color: white;
                border: none;
                border-radius: 8px;
                padding: 14px 20px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: background 0.2s ease;
                width: 100%;
            }
            
            .btn-primary:hover {
                opacity: 0.9;
            }
            
            .btn-secondary {
                background: white;
                color: ${this.config.textColor};
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                padding: 14px 20px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            }
            
            .btn-secondary:hover {
                border-color: #d1d5db;
                background: #f9fafb;
            }
            
            .widget-footer {
                padding: 16px 20px;
                text-align: center;
                border-top: 1px solid #e5e7eb;
                background: #f9fafb;
            }
            
            .powered-by {
                font-size: 12px;
                color: #9ca3af;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
            }
            
            .powered-by-logo {
                height: 16px;
                opacity: 0.7;
            }
            
            @media (max-width: 480px) {
                .super-calendar {
                    max-width: 100%;
                    margin: 0;
                    border-radius: 0;
                }
                
                .date-selection {
                    gap: 4px;
                }
                
                .date-button {
                    padding: 10px 4px;
                    min-height: 55px;
                }
                
                .date-day {
                    font-size: 11px;
                }
                
                .date-number {
                    font-size: 14px;
                }
            }
            
            .fade-in {
                animation: fadeIn 0.3s ease-in;
            }
            
            @keyframes fadeIn {
                from {
                    opacity: 0;
                    transform: translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
    }
    
    render() {
        const dates = this.generateDates();
        
        this.container.innerHTML = `
            <div class="super-calendar fade-in">
                ${this.renderHeader()}
                <div class="widget-content">
                    ${this.renderMainContent()}
                    ${this.renderTimerSection()}
                    ${this.renderDateSelection(dates)}
                    ${this.renderActionButtons()}
                </div>
                ${this.config.showFooter ? this.renderFooter() : ''}
            </div>
        `;
    }
    
    renderHeader() {
        return `
            <div class="widget-header">
                <div class="profile-section">
                    <div class="profile-avatar">
                        <img src="${this.config.profileAvatar}" alt="${this.config.profileName}" class="avatar-image">
                        ${this.config.showOnlineIndicator ? '<div class="online-indicator"></div>' : ''}
                    </div>
                    <div class="profile-info">
                        <h3>${this.config.profileName}</h3>
                        <p>${this.config.profileTitle}</p>
                    </div>
                </div>
                ${this.config.showCloseButton ? '<button class="close-button" data-action="close">&times;</button>' : ''}
            </div>
        `;
    }
    
    renderMainContent() {
        return `
            <h2 class="main-heading">${this.config.mainHeading}</h2>
            <p class="main-description">${this.config.mainDescription}</p>
        `;
    }
    
    renderTimerSection() {
        return `
            <div class="timer-section">
                <div class="timer-progress-bar" id="timer-progress"></div>
                <div class="timer-content">
                    <span class="timer-text">${this.config.timerText}</span>
                    <span class="timer-display" id="timer-display">${this.formatTime(this.currentTime)}</span>
                </div>
            </div>
        `;
    }
    
    renderDateSelection(dates) {
        const dateButtons = dates.map((date, index) => `
            <button class="date-button" data-date="${date.value}" data-index="${index}">
                <div class="date-day">${date.day}</div>
                <div class="date-number">${date.date}</div>
            </button>
        `).join('');
        
        return `
            <div class="date-selection">
                ${dateButtons}
            </div>
        `;
    }
    
    renderActionButtons() {
        return `
            <div class="action-buttons">
                <button class="btn-primary" data-action="primary">${this.config.primaryButtonText}</button>
                ${this.config.showSecondaryButton ? `
                    <button class="btn-secondary" data-action="secondary">
                        <span>${this.config.secondaryButtonText}</span>
                        <span>→</span>
                    </button>
                ` : ''}
            </div>
        `;
    }
    
    renderFooter() {
        return `
            <div class="widget-footer">
                <div class="powered-by">
                    <span>${this.config.poweredByText}</span>
                    ${this.config.poweredByLogo ? `<img src="${this.config.poweredByLogo}" alt="Logo" class="powered-by-logo">` : ''}
                </div>
            </div>
        `;
    }
    
    generateDates() {
        const dates = [];
        const today = new Date();
        
        for (let i = 0; i < this.config.dateRange; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const day = dayNames[date.getDay()];
            const dateNum = date.getDate().toString().padStart(2, '0');
            
            dates.push({
                day: day,
                date: dateNum,
                value: date.toISOString().split('T')[0],
                fullDate: date
            });
        }
        
        return dates;
    }
    
    bindEvents() {
        this.container.addEventListener('click', (e) => {
            if (e.target.closest('.date-button')) {
                this.handleDateSelect(e.target.closest('.date-button'));
            }
            
            if (e.target.dataset.action === 'close') {
                this.handleClose();
            }
            
            if (e.target.dataset.action === 'primary') {
                this.handlePrimaryClick();
            }
            
            if (e.target.dataset.action === 'secondary') {
                this.handleSecondaryClick();
            }
        });
    }
    
    handleDateSelect(button) {
        this.container.querySelectorAll('.date-button').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        button.classList.add('selected');
        this.selectedDate = button.dataset.date;
        
        if (this.config.onDateSelect) {
            this.config.onDateSelect(this.selectedDate);
        }
        
        this.triggerPatternInterrupt();
    }
    
    triggerPatternInterrupt() {
        if (!this.selectedDate) return;
        
        console.log('Pattern interrupt triggered for date:', this.selectedDate);
        
        if (this.config.popupUrl) {
            this.openPopup();
        } else if (this.config.redirectUrl) {
            this.redirect();
        } else {
            // Default behavior - show alert
            alert(`Date selected: ${this.selectedDate}. Configure popupUrl or redirectUrl for custom behavior.`);
        }
    }
    
    openPopup() {
        const url = this.buildUrl(this.config.popupUrl);
        
        if (this.config.openInNewTab) {
            window.open(url, '_blank');
        } else {
            // Open in popup window
            const popup = window.open(
                url,
                'scheduling-popup',
                'width=800,height=600,scrollbars=yes,resizable=yes,centerscreen=yes'
            );
            
            if (popup) {
                popup.focus();
            }
        }
    }
    
    redirect() {
        const url = this.buildUrl(this.config.redirectUrl);
        window.location.href = url;
    }
    
    buildUrl(baseUrl) {
        if (!baseUrl) return '';
        
        const url = new URL(baseUrl);
        
        // Add selected date as parameter
        if (this.selectedDate) {
            url.searchParams.set('date', this.selectedDate);
        }
        
        // Add any additional tracking parameters
        url.searchParams.set('source', 'super-calendar');
        url.searchParams.set('timestamp', Date.now());
        
        return url.toString();
    }
    
    startTimer() {
        this.timerInterval = setInterval(() => {
            this.currentTime--;
            
            if (this.currentTime <= 0) {
                this.currentTime = 0;
                this.handleTimerEnd();
            }
            
            this.updateTimerDisplay();
            this.updateProgressBar();
        }, 1000);
    }
    
    updateTimerDisplay() {
        const display = this.container.querySelector('#timer-display');
        if (display) {
            display.textContent = this.formatTime(this.currentTime);
        }
    }
    
    updateProgressBar() {
        const progressBar = this.container.querySelector('#timer-progress');
        if (progressBar) {
            const percentage = (this.currentTime / this.config.timerDuration) * 100;
            progressBar.style.width = `${percentage}%`;
        }
    }
    
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    handleTimerEnd() {
        clearInterval(this.timerInterval);
        
        if (this.config.onTimerEnd) {
            this.config.onTimerEnd();
        }
        
        if (this.config.autoReset) {
            setTimeout(() => {
                this.resetTimer();
            }, 2000);
        }
    }
    
    resetTimer() {
        this.currentTime = this.config.timerDuration;
        this.startTimer();
    }
    
    handlePrimaryClick() {
        if (this.config.onPrimaryClick) {
            this.config.onPrimaryClick();
        } else {
            this.triggerPatternInterrupt();
        }
    }
    
    handleSecondaryClick() {
        if (this.config.onSecondaryClick) {
            this.config.onSecondaryClick();
        } else if (this.config.redirectUrl) {
            this.redirect();
        }
    }
    
    handleClose() {
        if (this.config.onClose) {
            this.config.onClose();
        } else {
            this.destroy();
        }
    }
    
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        if (this.isInitialized) {
            this.render();
            this.bindEvents();
        }
    }
    
    destroy() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        if (this.container) {
            this.container.innerHTML = '';
        }
        
        this.isInitialized = false;
    }
}

// Make widget available globally
window.SuperCalendar = SuperCalendar;

// Auto-initialize if data attributes are found
document.addEventListener('DOMContentLoaded', function() {
    const autoInit = document.querySelector('[data-super-calendar]');
    if (autoInit) {
        const config = {};
        
        // Parse data attributes
        Array.from(autoInit.attributes).forEach(attr => {
            if (attr.name.startsWith('data-')) {
                const key = attr.name.replace('data-', '').replace(/-([a-z])/g, (g) => g[1].toUpperCase());
                config[key] = attr.value;
            }
        });
        
        const widget = new SuperCalendar({
            container: autoInit,
            ...config
        });
        widget.init();
    }
});

