// Time zone data
const timeZones = {
    'New York': 'America/New_York',
    'London': 'Europe/London',
    'Tokyo': 'Asia/Tokyo',
    'Sydney': 'Australia/Sydney',
    'Dubai': 'Asia/Dubai',
    'Singapore': 'Asia/Singapore',
    'Los Angeles': 'America/Los_Angeles',
    'Mumbai': 'Asia/Kolkata'
};

// Update all clocks
function updateClocks() {
    const now = new Date();
    
    Object.entries(timeZones).forEach(([city, timezone]) => {
        const timeString = getTimeString(now, timezone);
        const elementId = `time-${city.toLowerCase().replace(/\s+/g, '-')}`;
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = timeString;
        }
    });
    
    // Update custom time zones
    updateCustomTimeZones(now);
}

// Get formatted time string for a timezone
function getTimeString(date, timezone) {
    try {
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
        return formatter.format(date);
    } catch (e) {
        return '--:--:-- --';
    }
}

// Update custom time zones
function updateCustomTimeZones(now) {
    const customContainer = document.getElementById('custom-timezones');
    const cards = customContainer.querySelectorAll('.custom-clock-card');
    
    cards.forEach(card => {
        const timezone = card.getAttribute('data-timezone');
        const timeElement = card.querySelector('.time');
        const timeString = getTimeString(now, timezone);
        timeElement.textContent = timeString;
    });
}

// Add custom time zone
document.getElementById('add-timezone-btn').addEventListener('click', function() {
    const allTimezones = Intl.supportedValuesOf('timeZone');
    const timezoneName = prompt(`Enter timezone name (e.g., ${allTimezones.slice(0, 5).join(', ')})`);
    
    if (!timezoneName) return;
    
    // Validate timezone
    if (!allTimezones.includes(timezoneName)) {
        alert('Invalid timezone! Please enter a valid timezone name.');
        return;
    }
    
    // Extract city name from timezone
    const cityName = timezoneName.split('/').pop().replace(/_/g, ' ');
    
    const customContainer = document.getElementById('custom-timezones');
    const card = document.createElement('div');
    card.className = 'custom-clock-card';
    card.setAttribute('data-timezone', timezoneName);
    card.innerHTML = `
        <button class="remove-btn" onclick="this.parentElement.remove()">×</button>
        <h3>${cityName}</h3>
        <div class="time">--:--:-- --</div>
        <p class="timezone">${timezoneName}</p>
    `;
    
    customContainer.appendChild(card);
    updateClocks();
});

// Initialize and start updating
updateClocks();
setInterval(updateClocks, 1000);

// Log available timezones for reference
console.log('Available timezones:', Intl.supportedValuesOf('timeZone').slice(0, 20));