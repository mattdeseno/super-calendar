/**
 * Super Calendar Floating Widget v5.0
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
 * - Modal popup for calendar embeds
 * - HighLevel calendar integration
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
                    url: 'https://your-calendar-url.com',
                    calendarUrl: 'https://lclink.co/widget/bookings/uwhgwhhdc4unhhxhgczh'
                },
                {
                    text: 'Start Free Trial',
                    style: 'secondary',
                    action: 'redirect',
                    url: 'https://your-website.com/trial',
                    calendarUrl: ''
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
            
            /* Modal Styles - HighLevel Inspired Design */
            .super-calendar-modal {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.6);
                z-index: 10000;
                justify-content: center;
                align-items: center;
                animation: fadeIn 0.3s ease;
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            
            .super-calendar-modal.show {
                display: flex;
            }
            
            .super-calendar-modal-content {
                background: #ffffff;
                border-radius: 16px;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                width: 95%;
                max-width: 1400px;
                height: 95%;
                max-height: 900px;
                min-height: 800px;
                position: relative;
                overflow: hidden;
                animation: slideIn 0.3s ease;
                display: flex;
                flex-direction: column;
            }
            
            /* Progress indicator at top */
            .super-calendar-modal-content::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 60px;
                background: #ffffff;
                border-bottom: 1px solid #e5e7eb;
                z-index: 100;
            }
            
            .super-calendar-modal-content::after {
                content: '● Fill out the form    ○ Book your event';
                position: absolute;
                top: 20px;
                left: 24px;
                font-size: 14px;
                font-weight: 500;
                color: ${this.options.primaryColor};
                z-index: 101;
                font-family: 'Inter', sans-serif;
            }
            
            .super-calendar-modal-header {
                display: flex;
                justify-content: flex-end;
                align-items: center;
                padding: 0.75rem 1.5rem;
                background: transparent;
                border: none;
                position: absolute;
                top: 0;
                right: 0;
                z-index: 102;
            }
            
            .super-calendar-modal-close {
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                color: #6b7280;
                padding: 0.25rem;
                border-radius: 4px;
                transition: all 0.2s ease;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .super-calendar-modal-close:hover {
                background-color: #f3f4f6;
                color: #374151;
            }
            
            .super-calendar-modal-body {
                height: 100%;
                overflow: hidden;
                margin-top: 60px;
                position: relative;
            }
            
            .super-calendar-modal-inner {
                display: flex;
                height: 100%;
                min-height: 700px;
                padding: 16px;
            }
            
            /* Left column: HighLevel form */
            .super-calendar-form-column {
                flex: 1;
                background: #ffffff;
                border-radius: 12px;
                overflow: hidden;
                margin-right: 16px;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }
            
            .super-calendar-form-column iframe {
                width: 100%;
                height: 100%;
                border: none;
            }
            
            /* Right column: Calendar placeholder */
            .super-calendar-placeholder-column {
                flex: 1;
                background: #f9fafb;
                border-radius: 12px;
                padding: 24px;
                position: relative;
                transition: all 0.3s ease;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }
            
            .calendar-placeholder {
                position: relative;
            }
            
            .calendar-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
            }
            
            .calendar-month {
                font-size: 18px;
                font-weight: 600;
                color: #1f2937;
            }
            
            .calendar-nav {
                display: flex;
                gap: 6px;
            }
            
            .calendar-nav button {
                width: 28px;
                height: 28px;
                border: 1px solid #d1d5db;
                background: white;
                border-radius: 6px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #6b7280;
                font-size: 14px;
                transition: all 0.2s ease;
            }
            
            .calendar-nav button:hover {
                background: ${this.options.primaryColor};
                color: white;
                border-color: ${this.options.primaryColor};
            }
            
            .calendar-grid {
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                gap: 1px;
                background: #e5e7eb;
                border-radius: 8px;
                overflow: hidden;
                opacity: 0.4;
            }
            
            .calendar-day-header {
                background: #f9fafb;
                padding: 8px 6px;
                text-align: center;
                font-weight: 500;
                font-size: 11px;
                color: #6b7280;
                text-transform: uppercase;
            }
            
            .calendar-day {
                background: white;
                padding: 8px 6px;
                text-align: center;
                font-size: 13px;
                color: #9ca3af;
                min-height: 36px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .calendar-day.available {
                background: ${this.options.primaryColor}20;
                color: ${this.options.primaryColor};
                font-weight: 500;
            }
            
            .calendar-overlay {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                border: 2px solid #e5e7eb;
                border-radius: 12px;
                padding: 24px;
                text-align: center;
                color: #6b7280;
                font-size: 15px;
                line-height: 1.4;
                font-weight: 500;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                max-width: 260px;
                z-index: 10;
            }
            
            /* Form submitted state - hide calendar placeholder */
            .super-calendar-modal.form-submitted .super-calendar-placeholder-column {
                display: none;
            }
            
            .super-calendar-modal.form-submitted .super-calendar-form-column {
                margin-right: 0;
            }
            
            .super-calendar-modal.form-submitted .super-calendar-modal-content::after {
                content: '○ Fill out the form    ● Book your event';
            }
            
            /* Mobile responsiveness */
            @media (max-width: 768px) {
                .super-calendar-modal-content {
                    width: 98%;
                    height: 95%;
                    border-radius: 12px;
                }
                
                .super-calendar-modal-inner {
                    flex-direction: column;
                    padding: 12px;
                }
                
                .super-calendar-form-column {
                    margin-right: 0;
                    margin-bottom: 12px;
                    flex: 2;
                }
                
                .super-calendar-placeholder-column {
                    flex: 1;
                    padding: 16px;
                }
                
                .super-calendar-modal-content::after {
                    font-size: 12px;
                    left: 16px;
                    top: 22px;
                }
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: scale(0.95) translateY(-10px);
                }
                to {
                    opacity: 1;
                    transform: scale(1) translateY(0);
                }
            }
            
            @media (max-width: 480px) {
                .super-calendar-widget {
                    width: calc(100vw - 20px);
                    right: 10px;
                    left: 10px;
                }
                
                .super-calendar-modal-content {
                    width: 95%;
                    height: 90%;
                    max-height: none;
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
                                data-url="${button.url || ''}"
                                data-calendar-url="${button.calendarUrl || ''}">
                            ${button.text}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
        
        document.body.appendChild(button);
        document.body.appendChild(widget);
        
        // Create modal
        const modal = document.createElement('div');
        modal.id = this.widgetId + '-modal';
        modal.className = 'super-calendar-modal';
        modal.innerHTML = `
            <div class="super-calendar-modal-content">
                <div class="super-calendar-modal-header">
                    <button class="super-calendar-modal-close">&times;</button>
                </div>
                <div class="super-calendar-modal-body">
                    <div class="super-calendar-modal-inner">
                        <div class="super-calendar-form-column">
                            <iframe src="" frameborder="0"></iframe>
                        </div>
                        <div class="super-calendar-placeholder-column">
                            <div class="calendar-placeholder">
                                <div class="calendar-header">
                                    <div class="calendar-month">September 2025</div>
                                    <div class="calendar-nav">
                                        <button type="button">‹</button>
                                        <button type="button">›</button>
                                    </div>
                                </div>
                                
                                <div class="calendar-grid">
                                    <div class="calendar-day-header">SUN</div>
                                    <div class="calendar-day-header">MON</div>
                                    <div class="calendar-day-header">TUE</div>
                                    <div class="calendar-day-header">WED</div>
                                    <div class="calendar-day-header">THU</div>
                                    <div class="calendar-day-header">FRI</div>
                                    <div class="calendar-day-header">SAT</div>
                                    
                                    <div class="calendar-day">1</div>
                                    <div class="calendar-day">2</div>
                                    <div class="calendar-day">3</div>
                                    <div class="calendar-day available">4</div>
                                    <div class="calendar-day available">5</div>
                                    <div class="calendar-day available">6</div>
                                    <div class="calendar-day available">7</div>
                                    <div class="calendar-day available">8</div>
                                    <div class="calendar-day available">9</div>
                                    <div class="calendar-day available">10</div>
                                    <div class="calendar-day available">11</div>
                                    <div class="calendar-day">12</div>
                                    <div class="calendar-day">13</div>
                                    <div class="calendar-day">14</div>
                                    <div class="calendar-day">15</div>
                                    <div class="calendar-day">16</div>
                                    <div class="calendar-day">17</div>
                                    <div class="calendar-day">18</div>
                                    <div class="calendar-day">19</div>
                                    <div class="calendar-day">20</div>
                                    <div class="calendar-day">21</div>
                                    <div class="calendar-day">22</div>
                                    <div class="calendar-day">23</div>
                                    <div class="calendar-day">24</div>
                                    <div class="calendar-day">25</div>
                                    <div class="calendar-day">26</div>
                                    <div class="calendar-day">27</div>
                                    <div class="calendar-day">28</div>
                                    <div class="calendar-day">29</div>
                                    <div class="calendar-day">30</div>
                                </div>
                                
                                <div class="calendar-overlay">
                                    Please fill out the form before choosing your time slot.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        this.button = button;
        this.widget = widget;
        this.modal = modal;
    }
    
    bindEvents() {
        // Floating button click
        this.button.addEventListener('click', () => this.toggle());
        
        // Close button click
        this.widget.querySelector('.super-calendar-close').addEventListener('click', () => this.close());
        
        // Modal close events
        this.modal.querySelector('.super-calendar-modal-close').addEventListener('click', () => this.closeModal());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
        
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
                const calendarUrl = e.target.dataset.calendarUrl;
                this.handleButtonClick(action, url, calendarUrl);
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
    
    handleButtonClick(action, url, calendarUrl) {
        console.log('Button clicked:', action, url, calendarUrl);
        
        switch (action) {
            case 'popup':
                if (calendarUrl) {
                    this.openModal(calendarUrl);
                } else {
                    console.warn('No calendar URL provided for popup action');
                    alert('Calendar URL not configured. Please contact support.');
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
            default:
                console.log('Unknown action:', action);
        }
    }
    
    openModal(calendarUrl) {
        const iframe = this.modal.querySelector('iframe');
        iframe.src = calendarUrl;
        this.modal.classList.add('show');
        
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
        
        // Add form submission detection
        this.setupFormSubmissionDetection(iframe);
    }
    
    setupFormSubmissionDetection(iframe) {
        // Inject CSS to reduce form spacing and prevent scrolling
        iframe.onload = () => {
            setTimeout(() => {
                try {
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                    if (iframeDoc) {
                        const style = iframeDoc.createElement('style');
                        style.textContent = `
                            /* Reduce form spacing and margins */
                            .form-group, .mb-3, .mb-4 {
                                margin-bottom: 0.75rem !important;
                            }
                            
                            .form-control {
                                margin-bottom: 0.5rem !important;
                                padding: 0.5rem 0.75rem !important;
                            }
                            
                            /* Reduce padding around form container */
                            .appointment_widgets--revamp--inner,
                            .appointment_widgets-sm--revamp .appointment_widgets--revamp--inner {
                                padding: 1rem !important;
                            }
                            
                            /* Reduce spacing around form sections */
                            .form-section, .appointment-form {
                                padding: 0.5rem 0 !important;
                                margin: 0.5rem 0 !important;
                            }
                            
                            /* Reduce title and description spacing */
                            h1, h2, h3, h4, h5, h6 {
                                margin-bottom: 0.5rem !important;
                                margin-top: 0.5rem !important;
                            }
                            
                            p {
                                margin-bottom: 0.5rem !important;
                            }
                            
                            /* Bring Continue button higher */
                            .btn, button[type="submit"] {
                                margin-top: 0.75rem !important;
                                margin-bottom: 0.5rem !important;
                            }
                            
                            /* Remove excessive padding from widget container */
                            .appointment_widgets-sm--revamp,
                            .appointment_widgets--revamp {
                                padding: 0 !important;
                            }
                            
                            /* Ensure no scrolling in iframe */
                            body {
                                overflow: hidden !important;
                                margin: 0 !important;
                                padding: 0 !important;
                            }
                        `;
                        iframeDoc.head.appendChild(style);
                        console.log('Form spacing CSS injected successfully');
                    }
                } catch (error) {
                    console.log('Could not inject form spacing CSS (CORS restriction):', error.message);
                }
            }, 1000);
        };
        
        // Monitor for form submission by checking URL changes or specific events
        let checkCount = 0;
        const maxChecks = 60; // Check for 30 seconds
        
        const checkFormSubmission = () => {
            checkCount++;
            
            try {
                // Try to access iframe content (will fail due to CORS, but we can still monitor)
                const currentSrc = iframe.src;
                
                // Check if URL has changed (indicating form submission)
                if (currentSrc !== iframe.getAttribute('data-original-src')) {
                    this.handleFormSubmission();
                    return;
                }
            } catch (error) {
                // Expected due to CORS
            }
            
            // Continue checking if we haven't reached max checks
            if (checkCount < maxChecks) {
                setTimeout(checkFormSubmission, 500);
            }
        };
        
        // Store original URL for comparison
        iframe.setAttribute('data-original-src', iframe.src);
        
        // Start monitoring after iframe loads
        setTimeout(() => {
            checkFormSubmission();
        }, 2000);
        
        // Also listen for postMessage events from the iframe
        window.addEventListener('message', (event) => {
            // Check if message is from HighLevel indicating form submission
            if (event.data && typeof event.data === 'string') {
                if (event.data.includes('continue') || event.data.includes('submit') || event.data.includes('next')) {
                    this.handleFormSubmission();
                }
            }
        });
    }
    
    handleFormSubmission() {
        console.log('Form submission detected - hiding calendar placeholder');
        this.modal.classList.add('form-submitted');
        
        // Hide the calendar placeholder column
        const placeholderColumn = this.modal.querySelector('.super-calendar-placeholder-column');
        if (placeholderColumn) {
            placeholderColumn.style.display = 'none';
        }
        
        // Expand the form column to full width
        const formColumn = this.modal.querySelector('.super-calendar-form-column');
        if (formColumn) {
            formColumn.style.marginRight = '0';
        }
    }
    
    transformHighLevelWidget(iframe) {
        try {
            // Wait a moment for the iframe content to fully load
            setTimeout(() => {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                
                if (!iframeDoc) {
                    console.log('Cannot access iframe content due to CORS restrictions');
                    return;
                }
                
                // Inject the transformation CSS
                const transformCSS = this.getHighLevelTransformCSS();
                const style = iframeDoc.createElement('style');
                style.textContent = transformCSS;
                iframeDoc.head.appendChild(style);
                
                // Inject the transformation JavaScript
                const script = iframeDoc.createElement('script');
                script.textContent = this.getHighLevelTransformJS();
                iframeDoc.body.appendChild(script);
                
                console.log('HighLevel widget transformation applied');
            }, 1000);
        } catch (error) {
            console.log('Could not transform HighLevel widget (likely due to CORS):', error.message);
        }
    }
    
    getHighLevelTransformCSS() {
        const primaryColor = this.options.primaryColor;
        
        return `
            /* HighLevel Widget - Complete Transformation Styling */
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            
            /* Hide specific h4 elements */
            h4.text-info {
                display: none !important;
            }
            
            h4.text-info.custom-form-title {
                display: none !important;
            }
            
            /* Remove borders from HighLevel widget container */
            .appointment_widgets-sm--revamp .appointment_widgets--revamp--inner {
                border: none !important;
            }
            
            /* Base font family override */
            * {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
            }
            
            /* Main widget container styling with reduced padding */
            .appointment_widgets-sm--revamp,
            .appointment_widgets--revamp,
            [class*="appointment_widget"] {
                background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%) !important;
                border-radius: 16px !important;
                box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08) !important;
                overflow: hidden !important;
                max-width: 1200px !important;
                margin: 0 auto !important;
                position: relative !important;
                min-height: 600px !important;
                padding: 0 !important;
            }
            
            /* Reduce padding in inner container */
            .appointment_widgets--revamp--inner {
                display: flex !important;
                min-height: 600px !important;
                padding: 16px !important;
                border: none !important;
                margin: 0 !important;
            }
            
            /* Progress indicator at top */
            .appointment_widgets-sm--revamp::before,
            .appointment_widgets--revamp::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 60px;
                background: #ffffff;
                border-bottom: 1px solid #e5e7eb;
                z-index: 100;
            }
            
            .appointment_widgets-sm--revamp::after,
            .appointment_widgets--revamp::after {
                content: '● Fill out the form    ○ Book your event';
                position: absolute;
                top: 20px;
                left: 24px;
                font-size: 14px;
                font-weight: 500;
                color: ${primaryColor};
                z-index: 101;
                font-family: 'Inter', sans-serif !important;
            }
            
            /* Left column: Title, description, form with reduced spacing */
            .appointment_widgets--revamp--inner > div:first-child {
                flex: 1 !important;
                padding: 20px !important;
                background: #ffffff !important;
                display: flex !important;
                flex-direction: column !important;
                max-width: 50% !important;
                margin: 0 !important;
            }
            
            /* Submit button styling with primary color */
            button[type="submit"],
            .btn-primary,
            .continue-button,
            .submit-button {
                background: ${primaryColor} !important;
                color: #ffffff !important;
                border: none !important;
                border-radius: 8px !important;
                padding: 12px 20px !important;
                font-weight: 600 !important;
                font-size: 14px !important;
                cursor: pointer !important;
                transition: all 0.2s ease !important;
                width: 100% !important;
                margin-top: 16px !important;
                margin-bottom: 0 !important;
                font-family: 'Inter', sans-serif !important;
            }
            
            button[type="submit"]:hover,
            .btn-primary:hover,
            .continue-button:hover {
                background: ${primaryColor}dd !important;
                transform: translateY(-1px) !important;
                box-shadow: 0 4px 12px ${primaryColor}50 !important;
            }
            
            /* Form field focus with primary color */
            input:focus,
            textarea:focus,
            .form-control:focus {
                border-color: ${primaryColor} !important;
                box-shadow: 0 0 0 3px ${primaryColor}20 !important;
                outline: none !important;
            }
            
            /* Calendar placeholder column styling */
            .calendar-placeholder-column {
                flex: 1 !important;
                background: #f9fafb !important;
                border-left: 1px solid #e5e7eb !important;
                padding: 24px !important;
                position: relative !important;
                transition: all 0.3s ease !important;
            }
            
            .calendar-day.available {
                background: ${primaryColor}20 !important;
                color: ${primaryColor} !important;
                font-weight: 500;
            }
            
            /* Form-submitted state adjustments */
            .form-submitted .appointment_widgets--revamp--inner > div:first-child {
                max-width: 100% !important;
                padding: 16px !important;
            }
            
            .form-submitted .calendar-placeholder-column {
                display: none !important;
            }
            
            .form-submitted .appointment_widgets-sm--revamp::after,
            .form-submitted .appointment_widgets--revamp::after {
                content: '○ Fill out the form    ● Book your event' !important;
            }
        `;
    }
    
    getHighLevelTransformJS() {
        return `
            (function() {
                'use strict';
                
                console.log('🎯 HighLevel Widget Transformation Script Loaded');
                
                let formSubmitted = false;
                let buttonClickDetected = false;
                
                // Create calendar placeholder column
                function createCalendarPlaceholder() {
                    console.log('📅 Creating calendar placeholder...');
                    
                    const widgetContainer = document.querySelector('.appointment_widgets--revamp--inner') ||
                                           document.querySelector('[class*="appointment_widget"]');
                    
                    if (!widgetContainer || document.querySelector('.calendar-placeholder-column')) {
                        return;
                    }
                    
                    const calendarColumn = document.createElement('div');
                    calendarColumn.className = 'calendar-placeholder-column';
                    calendarColumn.innerHTML = \`
                        <div class="calendar-placeholder">
                            <div class="calendar-header">
                                <div class="calendar-month">September 2025</div>
                                <div class="calendar-nav">
                                    <button type="button">‹</button>
                                    <button type="button">›</button>
                                </div>
                            </div>
                            
                            <div class="calendar-grid" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 1px; background: #e5e7eb; border-radius: 8px; overflow: hidden; opacity: 0.4;">
                                <div style="background: #f9fafb; padding: 8px 6px; text-align: center; font-weight: 500; font-size: 11px; color: #6b7280; text-transform: uppercase;">SUN</div>
                                <div style="background: #f9fafb; padding: 8px 6px; text-align: center; font-weight: 500; font-size: 11px; color: #6b7280; text-transform: uppercase;">MON</div>
                                <div style="background: #f9fafb; padding: 8px 6px; text-align: center; font-weight: 500; font-size: 11px; color: #6b7280; text-transform: uppercase;">TUE</div>
                                <div style="background: #f9fafb; padding: 8px 6px; text-align: center; font-weight: 500; font-size: 11px; color: #6b7280; text-transform: uppercase;">WED</div>
                                <div style="background: #f9fafb; padding: 8px 6px; text-align: center; font-weight: 500; font-size: 11px; color: #6b7280; text-transform: uppercase;">THU</div>
                                <div style="background: #f9fafb; padding: 8px 6px; text-align: center; font-weight: 500; font-size: 11px; color: #6b7280; text-transform: uppercase;">FRI</div>
                                <div style="background: #f9fafb; padding: 8px 6px; text-align: center; font-weight: 500; font-size: 11px; color: #6b7280; text-transform: uppercase;">SAT</div>
                                
                                <div class="calendar-day" style="background: white; padding: 8px 6px; text-align: center; font-size: 13px; color: #9ca3af; min-height: 36px; display: flex; align-items: center; justify-content: center;">1</div>
                                <div class="calendar-day" style="background: white; padding: 8px 6px; text-align: center; font-size: 13px; color: #9ca3af; min-height: 36px; display: flex; align-items: center; justify-content: center;">2</div>
                                <div class="calendar-day" style="background: white; padding: 8px 6px; text-align: center; font-size: 13px; color: #9ca3af; min-height: 36px; display: flex; align-items: center; justify-content: center;">3</div>
                                <div class="calendar-day available" style="min-height: 36px; display: flex; align-items: center; justify-content: center;">4</div>
                                <div class="calendar-day available" style="min-height: 36px; display: flex; align-items: center; justify-content: center;">5</div>
                                <div class="calendar-day available" style="min-height: 36px; display: flex; align-items: center; justify-content: center;">6</div>
                                <div class="calendar-day available" style="min-height: 36px; display: flex; align-items: center; justify-content: center;">7</div>
                            </div>
                            
                            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; border: 2px solid #e5e7eb; border-radius: 12px; padding: 24px; text-align: center; color: #6b7280; font-size: 15px; line-height: 1.4; font-weight: 500; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); max-width: 260px; z-index: 10;">
                                Please fill out the form before choosing your time slot.
                            </div>
                        </div>
                    \`;
                    
                    widgetContainer.appendChild(calendarColumn);
                    console.log('✅ Calendar placeholder created');
                }
                
                // Monitor for Continue button clicks
                function startButtonMonitoring() {
                    document.addEventListener('click', function(e) {
                        if (formSubmitted) return;
                        
                        const clickedElement = e.target;
                        const button = clickedElement.closest('button');
                        
                        if (button) {
                            const buttonText = button.textContent.toLowerCase().trim();
                            
                            if (buttonText.includes('continue')) {
                                console.log('✅ CONTINUE BUTTON CLICKED');
                                buttonClickDetected = true;
                                
                                setTimeout(() => {
                                    if (buttonClickDetected && !formSubmitted) {
                                        handleContinueButtonClick();
                                    }
                                }, 1500);
                            }
                        }
                    }, true);
                }
                
                function handleContinueButtonClick() {
                    if (formSubmitted) return;
                    
                    formSubmitted = true;
                    console.log('🎉 CONTINUE BUTTON CLICKED - Transforming layout');
                    
                    document.body.classList.add('form-submitted');
                    
                    const calendarPlaceholder = document.querySelector('.calendar-placeholder-column');
                    if (calendarPlaceholder) {
                        calendarPlaceholder.style.display = 'none';
                    }
                }
                
                // Initialize
                setTimeout(() => {
                    createCalendarPlaceholder();
                    startButtonMonitoring();
                }, 1000);
                
            })();
        `;
    }
    
    closeModal() {
        this.modal.classList.remove('show');
        const iframe = this.modal.querySelector('iframe');
        iframe.src = ''; // Clear iframe to stop any ongoing processes
        
        // Restore body scroll
        document.body.style.overflow = '';
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
        
        if (this.modal) {
            this.modal.remove();
        }
        
        // Restore body scroll in case modal was open
        document.body.style.overflow = '';
        
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

