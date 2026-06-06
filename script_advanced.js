const defaultTimeZones = {
    'New York': { timezone: 'America/New_York', color: '#667eea' },
    'London': { timezone: 'Europe/London', color: '#764ba2' },
    'Tokyo': { timezone: 'Asia/Tokyo', color: '#f093fb' },
    'Sydney': { timezone: 'Australia/Sydney', color: '#48bb78' },
    'Dubai': { timezone: 'Asia/Dubai', color: '#ed8936' },
    'Singapore': { timezone: 'Asia/Singapore', color: '#f56565' },
    'Los Angeles': { timezone: 'America/Los_Angeles', color: '#3182ce' },
    'Mumbai': { timezone: 'Asia/Kolkata', color: '#d69e2e' }
};

let state = {
    timeZones: { ...defaultTimeZones },
    customTimeZones: {},
    mainScreen: 'analog',
    gridCols: 3,
    theme: 'modern',
    daylightEnabled: false,
    darkMode: false
};

document.addEventListener('DOMContentLoaded', () => {
    loadState();
    applyTheme();
    renderClocks();
    setupEventListeners();
    startClockUpdates();
});

function setupEventListeners() {
    document.getElementById('main-screen-select').addEventListener('change', (e) => {
        state.mainScreen = e.target.value;
        switchDisplay();
        saveState();
    });

    document.querySelectorAll('.grid-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.grid-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            state.gridCols = parseInt(e.target.dataset.cols);
            updateGridLayout();
            saveState();
        });
    });

    document.getElementById('theme-select').addEventListener('change', (e) => {
        state.theme = e.target.value;
        applyTheme();
        saveState();
    });

    document.getElementById('daylight-toggle').addEventListener('change', (e) => {
        state.daylightEnabled = e.target.checked;
        applyDaylight();
        saveState();
    });

    document.getElementById('add-timezone-btn').addEventListener('click', () => {
        openModal('timezone-modal');
    });

    document.getElementById('theme-toggle').addEventListener('click', () => {
        state.darkMode = !state.darkMode;
        applyDarkMode();
        saveState();
    });

    document.getElementById('modal-overlay').addEventListener('click', closeAllModals);
}

function switchDisplay() {
    document.querySelectorAll('.display-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`${state.mainScreen}-display`).classList.add('active');
}

function updateGridLayout() {
    const grids = document.querySelectorAll('.analog-grid, .digital-grid, .hybrid-grid');
    grids.forEach(grid => {
        grid.classList.remove('grid-cols-3', 'grid-cols-4', 'grid-cols-6');
        grid.classList.add(`grid-cols-${state.gridCols}`);
    });
}

function renderClocks() {
    const allTimeZones = { ...state.timeZones, ...state.customTimeZones };
    
    const analogGrid = document.getElementById('analog-grid');
    const digitalGrid = document.getElementById('digital-grid');
    const hybridGrid = document.getElementById('hybrid-grid');
    
    analogGrid.innerHTML = '';
    digitalGrid.innerHTML = '';
    hybridGrid.innerHTML = '';
    
    Object.entries(allTimeZones).forEach(([city, data]) => {
        const timezone = typeof data === 'string' ? data : data.timezone;
        const color = typeof data === 'string' ? '#667eea' : data.color;
        
        analogGrid.appendChild(createClockCard(city, timezone, color, 'analog'));
        digitalGrid.appendChild(createClockCard(city, timezone, color, 'digital'));
        hybridGrid.appendChild(createClockCard(city, timezone, color, 'hybrid'));
    });
    
    updateGridLayout();
    makeClocksDraggable();
}

function createClockCard(city, timezone, color, type) {
    const card = document.createElement('div');
    card.className = 'clock-card';
    card.draggable = true;
    card.dataset.city = city;
    card.dataset.timezone = timezone;
    card.style.borderColor = color;
    
    const header = document.createElement('div');
    header.className = 'clock-card-header';
    
    const title = document.createElement('div');
    title.innerHTML = `<div class="clock-title" style="color: ${color}">${city}</div><div class="timezone-label">${timezone}</div>`;
    
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.innerHTML = '×';
    removeBtn.onclick = (e) => {
        e.stopPropagation();
        removeTimeZone(city);
    };
    
    header.appendChild(title);
    if (city in state.customTimeZones) {
        header.appendChild(removeBtn);
    }
    card.appendChild(header);
    
    if (type === 'analog') {
        card.appendChild(createAnalogClock(timezone, color));
    } else if (type === 'digital') {
        const digitalDisplay = document.createElement('div');
        digitalDisplay.className = 'digital-time';
        digitalDisplay.dataset.timezone = timezone;
        card.appendChild(digitalDisplay);
        
        const dateDisplay = document.createElement('div');
        dateDisplay.className = 'digital-date';
        dateDisplay.dataset.timezone = timezone;
        card.appendChild(dateDisplay);
    } else if (type === 'hybrid') {
        const hybridContainer = document.createElement('div');
        hybridContainer.className = 'hybrid-container';
        
        const analogClock = createAnalogClock(timezone, color);
        analogClock.classList.add('hybrid-analog');
        
        const info = document.createElement('div');
        const timeDisplay = document.createElement('div');
        timeDisplay.style.fontSize = '1.4rem';
        timeDisplay.style.fontWeight = 'bold';
        timeDisplay.style.color = color;
        timeDisplay.dataset.timezone = timezone;
        
        const dateDisplay = document.createElement('div');
        dateDisplay.style.fontSize = '0.85rem';
        dateDisplay.style.color = 'var(--text-secondary)';
        dateDisplay.dataset.timezone = timezone;
        
        info.appendChild(timeDisplay);
        info.appendChild(dateDisplay);
        
        hybridContainer.appendChild(analogClock);
        hybridContainer.appendChild(info);
        card.appendChild(hybridContainer);
    }
    
    return card;
}

function createAnalogClock(timezone, color) {
    const clockContainer = document.createElement('div');
    clockContainer.className = 'analog-clock';
    
    const face = document.createElement('div');
    face.className = 'clock-face';
    
    for (let i = 1; i <= 12; i++) {
        const numberDiv = document.createElement('div');
        numberDiv.style.position = 'absolute';
        numberDiv.style.width = '100%';
        numberDiv.style.height = '100%';
        numberDiv.style.display = 'flex';
        numberDiv.style.alignItems = 'center';
        numberDiv.style.justifyContent = 'center';
        numberDiv.style.transform = `rotate(${(i - 3) * 30}deg)`;
        numberDiv.innerHTML = `<span style=\"transform: rotate(${-((i - 3) * 30)}deg)\">${i}</span>`;
        face.appendChild(numberDiv);
    }
    
    const hourHand = document.createElement('div');
    hourHand.className = 'hand hour-hand';
    hourHand.style.background = color;
    hourHand.dataset.timezone = timezone;
    face.appendChild(hourHand);
    
    const minuteHand = document.createElement('div');
    minuteHand.className = 'hand minute-hand';
    minuteHand.style.background = color;
    minuteHand.dataset.timezone = timezone;
    face.appendChild(minuteHand);
    
    const secondHand = document.createElement('div');
    secondHand.className = 'hand second-hand';
    secondHand.dataset.timezone = timezone;
    face.appendChild(secondHand);
    
    const centerDot = document.createElement('div');
    centerDot.className = 'center-dot';
    centerDot.style.background = color;
    face.appendChild(centerDot);
    
    clockContainer.appendChild(face);
    return clockContainer;
}

function makeClocksDraggable() {
    const cards = document.querySelectorAll('.clock-card');
    
    cards.forEach(card => {
        card.addEventListener('dragstart', (e) => {
            card.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });
        
        card.addEventListener('dragend', () => {
            card.classList.remove('dragging');
        });
        
        card.addEventListener('dragover', (e) => {
            e.preventDefault();
            const dragging = document.querySelector('.clock-card.dragging');
            if (dragging && dragging !== card) {
                card.parentNode.insertBefore(dragging, card);
            }
        });
    });
}

function updateClockHands() {
    const now = new Date();
    
    document.querySelectorAll('.hand').forEach(hand => {
        const timezone = hand.dataset.timezone;
        const time = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
        
        if (hand.classList.contains('hour-hand')) {
            const hours = time.getHours() % 12;
            const minutes = time.getMinutes();
            const angle = (hours + minutes / 60) * 30;
            hand.style.transform = `rotate(${angle}deg)`;
        } else if (hand.classList.contains('minute-hand')) {
            const minutes = time.getMinutes();
            const seconds = time.getSeconds();
            const angle = (minutes + seconds / 60) * 6;
            hand.style.transform = `rotate(${angle}deg)`;
        } else if (hand.classList.contains('second-hand')) {
            const seconds = time.getSeconds();
            const milliseconds = time.getMilliseconds();
            const angle = (seconds + milliseconds / 1000) * 6;
            hand.style.transform = `rotate(${angle}deg)`;
        }
    });
    
    document.querySelectorAll('.digital-time').forEach(display => {
        const timezone = display.dataset.timezone;
        const time = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
        display.textContent = formatter.format(time);
    });
    
    document.querySelectorAll('.digital-date').forEach(display => {
        const timezone = display.dataset.timezone;
        const time = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
        display.textContent = formatter.format(time);
    });
}

function startClockUpdates() {
    updateClockHands();
    setInterval(updateClockHands, 1000);
}

function addCustomTimezone() {
    const cityName = document.getElementById('city-name').value.trim();
    const timezone = document.getElementById('timezone-input').value.trim();
    const color = document.getElementById('timezone-color').value;
    
    if (!cityName || !timezone) {
        alert('Please fill in all fields');
        return;
    }
    
    try {
        new Intl.DateTimeFormat('en-US', { timeZone: timezone });
    } catch (e) {
        alert('Invalid timezone!');
        return;
    }
    
    state.customTimeZones[cityName] = { timezone, color };
    saveState();
    renderClocks();
    closeModal('timezone-modal');
    
    document.getElementById('city-name').value = '';
    document.getElementById('timezone-input').value = '';
    document.getElementById('timezone-color').value = '#667eea';
}

function removeTimeZone(city) {
    if (city in state.customTimeZones) {
        delete state.customTimeZones[city];
        saveState();
        renderClocks();
    }
}

function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
    document.getElementById('modal-overlay').classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    if (!document.querySelector('.modal.active')) {
        document.getElementById('modal-overlay').classList.remove('active');
    }
}

function closeAllModals() {
    document.querySelectorAll('.modal.active').forEach(modal => {
        modal.classList.remove('active');
    });
    document.getElementById('modal-overlay').classList.remove('active');
}

function applyTheme() {
    document.body.classList.remove('theme-modern', 'theme-minimal', 'theme-dark', 'theme-glassmorphism', 'theme-retro', 'theme-vibrant');
    document.body.classList.add(`theme-${state.theme}`);
}

function applyDaylight() {
    document.body.classList.toggle('daylight-enabled', state.daylightEnabled);
}

function applyDarkMode() {
    document.body.classList.toggle('dark-mode', state.darkMode);
    document.getElementById('theme-toggle').textContent = state.darkMode ? '☀️' : '🌙';
}

function saveState() {
    localStorage.setItem('advancedClockState', JSON.stringify(state));
}

function loadState() {
    const saved = localStorage.getItem('advancedClockState');
    if (saved) {
        state = { ...state, ...JSON.parse(saved) };
    }
    
    document.getElementById('main-screen-select').value = state.mainScreen;
    document.getElementById('theme-select').value = state.theme;
    document.getElementById('daylight-toggle').checked = state.daylightEnabled;
    
    const gridBtn = document.querySelector(`[data-cols="${state.gridCols}"]`);
    if (gridBtn) gridBtn.classList.add('active');
    
    applyTheme();
    applyDaylight();
    applyDarkMode();
    switchDisplay();
}