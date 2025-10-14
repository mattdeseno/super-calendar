/**
 * Super Calendar Widget - Simplified Version v5.2
 * A floating calendar widget with simple iframe modal
 */
class SuperCalendar {
    constructor(config) {
        this.config = {
            profileName: 'Matt Deseno',
            profileTitle: 'CEO @ HLPT',
            profileAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
            showOnlineIndicator: true,
            mainHeading: 'HighLevel is Awesome — Until You Feel Lost In the Weeds',
            mainDescription: 'Make HighLevel easy with HLPT. Save 10+ hours each week with a 24/7 team supporting you & your customers 🔥',
            enableTimer: true,
            timerDuration: 180,
            timerText: 'Only few slots are left.',
            startingPosition: 'closed',
            delayTime: 3000,
            buttons: [
                { text: 'Schedule a Demo', style: 'primary', action: 'popup', calendarUrl: 'https://lclink.co/widget/bookings/uwhgwhhdc4unhhxhgczh' },
                { text: 'Start Free Trial', style: 'secondary', action: 'redirect', url: 'https://your-website.com/trial' }
            ],
            primaryColor: '#3B82F6',
            progressBarColor: '#10B981',
            ...config
        };
        
        this.isOpen = false;
        this.timer = null;
        this.timeLeft = this.config.timerDuration;
        this.modal = null;
    }

    init() {
        this.injectStyles();
        this.createWidget();
        this.createModal();
        this.handleStartingPosition();
    }

    injectStyles() {
        if (!document.querySelector('link[href*="font-awesome"]')) {
            const fontAwesome = document.createElement('link');
            fontAwesome.rel = 'stylesheet';
            fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css';
            fontAwesome.integrity = 'sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==';
            fontAwesome.crossOrigin = 'anonymous';
            fontAwesome.referrerPolicy = 'no-referrer';
            document.head.appendChild(fontAwesome);
        }
        
        const style = document.createElement('style');
        style.textContent = `
            :root {
                --primary-color: ${this.config.primaryColor};
                --progress-color: ${this.config.progressBarColor};
            }
            
            .super-calendar-widget {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 9999;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .super-calendar-widget.closed .super-calendar-content {
                transform: translateY(100%);
                opacity: 0;
                pointer-events: none;
            }
            
            .super-calendar-toggle {
                position: absolute;
                bottom: 0;
                right: 0;
                width: 60px;
                height: 60px;
                background: var(--primary-color);
                border: none;
                border-radius: 50%;
                color: white;
                font-size: 24px;
                cursor: pointer;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
            }
            
            .super-calendar-toggle i {
                position: absolute;
                transition: opacity 0.3s ease, transform 0.3s ease;
            }
            
            /* When widget is closed - show calendar icon */
            .super-calendar-widget.closed .super-calendar-toggle .fa-calendar-alt {
                opacity: 1;
                transform: rotate(0deg);
            }
            
            .super-calendar-widget.closed .super-calendar-toggle .fa-chevron-down {
                opacity: 0;
                transform: rotate(0deg);
            }
            
            /* When widget is open - show chevron-down icon */
            .super-calendar-widget:not(.closed) .super-calendar-toggle .fa-calendar-alt {
                opacity: 0;
                transform: rotate(0deg);
            }
            
            .super-calendar-widget:not(.closed) .super-calendar-toggle .fa-chevron-down {
                opacity: 1;
                transform: rotate(0deg);
            }
            
            .super-calendar-toggle:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
            }
            
            .super-calendar-content {
                position: absolute;
                bottom: 80px;
                right: 0;
                width: 320px;
                background: white;
                border-radius: 16px;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                overflow: hidden;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                transform-origin: bottom right;
            }
            
            .super-calendar-header {
                padding: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                position: relative;
            }
            
            .super-calendar-close {
                position: absolute;
                top: 15px;
                right: 15px;
                background: rgba(255, 255, 255, 0.2);
                border: none;
                border-radius: 50%;
                width: 30px;
                height: 30px;
                color: white;
                cursor: pointer;
                font-size: 14px;
                display: flex;
                align-items: center;
                justify-content: center;
                line-height: 1;
            }
            
            .super-calendar-profile {
                display: flex;
                align-items: center;
                margin-bottom: 12px;
            }
            
            .super-calendar-avatar {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                margin-right: 12px;
                position: relative;
            }
            
            .super-calendar-online {
                position: absolute;
                bottom: 0;
                right: 0;
                width: 12px;
                height: 12px;
                background: #10B981;
                border: 2px solid white;
                border-radius: 50%;
            }
            
            .super-calendar-info h3 {
                margin: 0;
                font-size: 16px;
                font-weight: 600;
            }
            
            .super-calendar-info p {
                margin: 0;
                font-size: 14px;
                opacity: 0.9;
            }
            
            .super-calendar-body {
                padding: 20px;
            }
            
            .super-calendar-heading {
                font-size: 18px;
                font-weight: 700;
                margin: 0 0 8px 0;
                color: #1f2937;
                line-height: 1.3;
            }
            
            .super-calendar-description {
                font-size: 14px;
                color: #6b7280;
                margin: 0 0 16px 0;
                line-height: 1.5;
            }
            
            .super-calendar-timer {
                background: #fef3c7;
                border: 1px solid #f59e0b;
                border-radius: 8px;
                padding: 12px;
                margin-bottom: 16px;
                text-align: center;
            }
            
            .super-calendar-timer-text {
                font-size: 13px;
                color: #92400e;
                margin-bottom: 8px;
            }
            
            .super-calendar-timer-display {
                font-size: 20px;
                font-weight: 700;
                color: #92400e;
                margin-bottom: 8px;
            }
            
            .super-calendar-progress {
                width: 100%;
                height: 4px;
                background: #fde68a;
                border-radius: 2px;
                overflow: hidden;
            }
            
            .super-calendar-progress-bar {
                height: 100%;
                background: var(--progress-color);
                transition: width 1s ease;
            }
            
            .super-calendar-dates {
                display: flex;
                gap: 7px;
                margin-bottom: 16px;
                overflow-x: auto;
                padding-bottom: 4px;
            }
            
            .super-calendar-date {
                flex-shrink: 0;
                text-align: center;
                padding: 8px 12px;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s;
                min-width: 50px;
            }
            
            .super-calendar-date:hover {
                border-color: var(--primary-color);
                background: rgba(59, 130, 246, 0.05);
            }
            
            .super-calendar-date-day {
                font-size: 11px;
                color: #6b7280;
                font-weight: 500;
                margin-bottom: 2px;
            }
            
            .super-calendar-date-num {
                font-size: 16px;
                font-weight: 600;
                color: #1f2937;
            }
            
            .super-calendar-buttons {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .super-calendar-button {
                padding: 12px 16px;
                border: none;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
                text-decoration: none;
                text-align: center;
                display: block;
            }
            
            .super-calendar-button.primary {
                background: var(--primary-color);
                color: white;
            }
            
            .super-calendar-button.primary:hover {
                opacity: 0.9;
                transform: translateY(-1px);
            }
            
            .super-calendar-button.secondary {
                background: transparent;
                color: var(--primary-color);
                border: 1px solid var(--primary-color);
            }
            
            .super-calendar-button.secondary:hover {
                background: var(--primary-color);
                color: white;
            }
            
            /* Modal Styles */
            .super-calendar-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(4px);
                z-index: 10000;
                display: none;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .super-calendar-modal.show {
                display: flex;
                opacity: 1;
            }
            
            .super-calendar-modal-content {
                background: #ffffff;
                border-radius: 16px;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                width: 95%;
                max-width: 1200px;
                height: 95%;
                max-height: 800px;
                min-height: 600px;
                position: relative;
                overflow: hidden;
                animation: slideIn 0.3s ease;
            }
            
            .super-calendar-modal-close {
                position: absolute;
                top: 16px;
                right: 16px;
                background: rgba(0, 0, 0, 0.1);
                border: none;
                border-radius: 50%;
                width: 32px;
                height: 32px;
                font-size: 18px;
                cursor: pointer;
                z-index: 1001;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background-color 0.2s;
            }
            
            .super-calendar-modal-close:hover {
                background: rgba(0, 0, 0, 0.2);
            }
            
            .super-calendar-modal iframe {
                width: 100%;
                height: 100%;
                border: none;
                border-radius: 16px;
            }
            
            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: scale(0.9) translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: scale(1) translateY(0);
                }
            }
            
            @media (max-width: 768px) {
                .super-calendar-widget {
                    bottom: 15px;
                    right: 15px;
                }
                
                .super-calendar-content {
                    width: 300px;
                }
                
                .super-calendar-modal-content {
                    width: 98%;
                    height: 98%;
                    margin: 1%;
                }
            }
        `;
        document.head.appendChild(style);
    }

    createWidget() {
        const widget = document.createElement('div');
        widget.className = 'super-calendar-widget closed';
        
        widget.innerHTML = `
            <div class="super-calendar-content">
                <div class="super-calendar-header">
                    <button class="super-calendar-close"><span class="fas fa-times"></span></button>
                    <div class="super-calendar-profile">
                        <div class="super-calendar-avatar">
                            <img src="${this.config.profileAvatar}" alt="${this.config.profileName}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">
                            ${this.config.showOnlineIndicator ? '<div class="super-calendar-online"></div>' : ''}
                        </div>
                        <div class="super-calendar-info">
                            <h3>${this.config.profileName}</h3>
                            <p>${this.config.profileTitle}</p>
                        </div>
                    </div>
                </div>
                <div class="super-calendar-body">
                    <h2 class="super-calendar-heading">${this.config.mainHeading}</h2>
                    <p class="super-calendar-description">${this.config.mainDescription}</p>
                    ${this.config.enableTimer ? this.createTimerHTML() : ''}
                    ${this.createDatesHTML()}
                    <div class="super-calendar-buttons">
                        ${this.config.buttons.map(button => this.createButtonHTML(button)).join('')}
                    </div>
                </div>
            </div>
            <button class="super-calendar-toggle">
                <i class="fas fa-calendar-alt"></i>
                <i class="fas fa-chevron-down"></i>
            </button>
        `;
        
        document.body.appendChild(widget);
        this.widget = widget;
        
        const toggle = widget.querySelector('.super-calendar-toggle');
        const close = widget.querySelector('.super-calendar-close');
        
        toggle.addEventListener('click', () => this.toggleWidget());
        close.addEventListener('click', () => this.closeWidget());
        
        const buttons = widget.querySelectorAll('.super-calendar-button');
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const action = button.getAttribute('data-action');
                const url = button.getAttribute('data-url');
                const calendarUrl = button.getAttribute('data-calendar-url');
                this.handleButtonClick(action, url, calendarUrl);
            });
        });
        
        const dateElements = widget.querySelectorAll('.super-calendar-date');
        dateElements.forEach(dateElement => {
            dateElement.addEventListener('click', () => {
                this.handleDateClick();
            });
        });
        
        if (this.config.enableTimer) {
            this.startTimer();
        }
    }

    createModal() {
        const modal = document.createElement('div');
        modal.className = 'super-calendar-modal';
        modal.innerHTML = `
            <div class="super-calendar-modal-content">
                <button class="super-calendar-modal-close">&times;</button>
                <iframe frameborder="0"></iframe>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.modal = modal;
        
        const closeBtn = modal.querySelector('.super-calendar-modal-close');
        closeBtn.addEventListener('click', () => this.closeModal());
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });
    }

    createTimerHTML() {
        return `
            <div class="super-calendar-timer">
                <div class="super-calendar-timer-text">${this.config.timerText}</div>
                <div class="super-calendar-timer-display">${this.formatTime(this.timeLeft)}</div>
                <div class="super-calendar-progress">
                    <div class="super-calendar-progress-bar" style="width: 100%"></div>
                </div>
            </div>
        `;
    }

    createDatesHTML() {
        const dates = [];
        const today = new Date();
        
        for (let i = 0; i < 5; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            
            const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
            const dayName = dayNames[date.getDay()];
            const dayNum = date.getDate().toString().padStart(2, '0');
            
            dates.push(`
                <div class="super-calendar-date">
                    <div class="super-calendar-date-day">${dayName}</div>
                    <div class="super-calendar-date-num">${dayNum}</div>
                </div>
            `);
        }
        
        return `<div class="super-calendar-dates">${dates.join('')}</div>`;
    }

    createButtonHTML(button) {
        return `
            <button class="super-calendar-button ${button.style}" 
                    data-action="${button.action}" 
                    data-url="${button.url || ''}"
                    data-calendar-url="${button.calendarUrl || ''}">
                ${button.text}
            </button>
        `;
    }

    toggleWidget() {
        this.isOpen = !this.isOpen;
        this.widget.classList.toggle('closed', !this.isOpen);
    }

    closeWidget() {
        this.isOpen = false;
        this.widget.classList.add('closed');
    }

    openWidget() {
        this.isOpen = true;
        this.widget.classList.remove('closed');
    }

    handleStartingPosition() {
        switch (this.config.startingPosition) {
            case 'open':
                this.openWidget();
                break;
            case 'delayed':
                setTimeout(() => this.openWidget(), this.config.delayTime);
                break;
            default:
                // closed - do nothing
                break;
        }
    }

    handleButtonClick(action, url, calendarUrl) {
        switch (action) {
            case 'popup':
                if (calendarUrl) {
                    this.openModal(calendarUrl);
                } else {
                    console.warn('No calendar URL provided for popup action');
                    alert('Please configure your calendar booking system.');
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

    handleDateClick() {
        const primaryButton = this.config.buttons[0];
        
        if (primaryButton) {
            this.handleButtonClick(
                primaryButton.action,
                primaryButton.url || '',
                primaryButton.calendarUrl || ''
            );
        } else {
            console.warn('No buttons configured for date click action');
        }
    }

    openModal(calendarUrl) {
        const iframe = this.modal.querySelector('iframe');
        iframe.src = calendarUrl;
        this.modal.classList.add('show');        
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        this.modal.classList.remove('show');
        document.body.style.overflow = '';
        
        const iframe = this.modal.querySelector('iframe');
        iframe.src = '';
    }

    startTimer() {
        this.timer = setInterval(() => {
            this.timeLeft--;
            
            const timerDisplay = this.widget.querySelector('.super-calendar-timer-display');
            const progressBar = this.widget.querySelector('.super-calendar-progress-bar');
            
            if (timerDisplay) {
                timerDisplay.textContent = this.formatTime(this.timeLeft);
            }
            
            if (progressBar) {
                const progress = (this.timeLeft / this.config.timerDuration) * 100;
                progressBar.style.width = Math.max(0, progress) + '%';
            }
            
            if (this.timeLeft <= 0) {
                clearInterval(this.timer);
            }
        }, 1000);
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    destroy() {
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        if (this.widget) {
            this.widget.remove();
        }
        
        if (this.modal) {
            this.modal.remove();
        }
        
        document.body.style.overflow = '';
    }
}

if (typeof window !== 'undefined') {
    window.SuperCalendar = SuperCalendar;
}

if (typeof window !== 'undefined' && window.superCalendarConfig) {
    const widget = new SuperCalendar(window.superCalendarConfig);
    widget.init();
}
// console.log('Super Calendar Widget loaded');
