// Global Variables
let gesamt = 0;
let monat = 31;
let aktuellVerdient = 0;
let intervalId = null;
let startDatum = null;
let earningsChart = null;
let comparisonChart = null;
let moneyRainInterval = null;

// Format number as currency
function formatCurrency(value, decimals = 2) {
    return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(value);
}

// Input validation with visual feedback
function checkType() {
    const gehaltInput = document.getElementById("gehaltInput");
    const valueAsNumber = parseFloat(gehaltInput.value);

    if (isNaN(valueAsNumber) || valueAsNumber <= 0) {
        gehaltInput.classList.remove("valid");
        gehaltInput.classList.add("invalid");
    } else {
        gehaltInput.classList.remove("invalid");
        gehaltInput.classList.add("valid");
    }
}

// Main configuration function
function config() {
    const gehaltInput = document.getElementById("gehaltInput");
    const dateInput = document.getElementById("dateInput");
    
    // Validate inputs
    const eingegebenesEinkommen = parseFloat(gehaltInput.value);
    const arbeitsbeginn = dateInput.value;

    if (isNaN(eingegebenesEinkommen) || eingegebenesEinkommen <= 0) {
        showNotification("Bitte geben Sie ein gültiges Einkommen ein.", "error");
        return;
    }

    if (!arbeitsbeginn) {
        showNotification("Bitte geben Sie ein Startdatum ein.", "error");
        return;
    }

    // Set global values
    gesamt = eingegebenesEinkommen;
    startDatum = new Date(arbeitsbeginn);

    // Check if date is valid
    if (isNaN(startDatum.getTime())) {
        showNotification("Bitte geben Sie ein gültiges Datum ein.", "error");
        startDatum = null;
        return;
    }

    // Check if date is in the future
    if (startDatum > new Date()) {
        showNotification("Das Startdatum darf nicht in der Zukunft liegen.", "error");
        startDatum = null;
        return;
    }

    // Update UI
    updateStatCards();
    showStatsGrid();
    startLiveCounter();
    showBreakdownCard();
    
    // Show premium features
    showWealthDashboard();
    showAffordSection();
    showMilestones();
    showComparison();
    showSavingsCard();
    showTimeValueCard();
    startMoneyRain();
    showCelebration("💰");
    
    showNotification("Berechnung erfolgreich gestartet!", "success");
}

// Update static stat cards
function updateStatCards() {
    const tag = gesamt / monat;
    const stunde = tag / 24;
    const minute = stunde / 60;

    document.getElementById("monthlyIncome").textContent = formatCurrency(gesamt);
    document.getElementById("dailyIncome").textContent = formatCurrency(tag);
    document.getElementById("hourlyIncome").textContent = formatCurrency(stunde);
    document.getElementById("minuteIncome").textContent = formatCurrency(minute, 4);
}

// Show stats grid with animation
function showStatsGrid() {
    const statsGrid = document.getElementById("statsGrid");
    statsGrid.style.display = "grid";
    
    // Trigger reflow for animation
    statsGrid.offsetHeight;
    
    // Add animation class to each card
    const cards = statsGrid.querySelectorAll(".stat-card");
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.style.animation = "fadeIn 0.5s ease-out forwards";
        }, index * 100);
    });
}

// Show breakdown card
function showBreakdownCard() {
    const breakdownCard = document.getElementById("breakdownCard");
    breakdownCard.style.display = "block";
}

// Toggle breakdown content
function toggleBreakdown() {
    const content = document.getElementById("breakdownContent");
    const chevron = document.querySelector(".breakdown-card .chevron");
    const grid = document.getElementById("breakdownGrid");

    if (content.style.display === "none" || content.style.display === "") {
        // Show breakdown
        updateBreakdownGrid();
        content.style.display = "block";
        chevron.classList.add("open");
    } else {
        // Hide breakdown
        content.style.display = "none";
        chevron.classList.remove("open");
    }
}

// Update breakdown grid with detailed calculations
function updateBreakdownGrid() {
    if (gesamt === 0 || isNaN(gesamt)) return;

    const tag = gesamt / monat;
    const stunde = tag / 24;
    const minute = stunde / 60;
    const sekunde = minute / 60;

    const breakdownData = [
        { label: "Pro Monat (31 Tage)", value: gesamt },
        { label: "Pro Tag (24 Stunden)", value: tag },
        { label: "Pro Stunde (60 Minuten)", value: stunde },
        { label: "Pro Minute (60 Sekunden)", value: minute },
        { label: "Pro Sekunde", value: sekunde }
    ];

    const grid = document.getElementById("breakdownGrid");
    grid.innerHTML = breakdownData.map(item => `
        <div class="breakdown-item">
            <span>${item.label}</span>
            <span>${formatCurrency(item.value, 6)}</span>
        </div>
    `).join('');
}

// Start live counter
function startLiveCounter() {
    if (gesamt === 0 || isNaN(gesamt)) {
        showNotification("Sie müssen erst ein gültiges Einkommen festlegen!", "error");
        return;
    }
    if (!startDatum) {
        showNotification("Sie müssen erst ein Startdatum eingeben!", "error");
        return;
    }

    // Show live counter card
    const liveCard = document.getElementById("liveCounterCard");
    liveCard.style.display = "block";

    const sekunde = gesamt / (monat * 24 * 60 * 60);

    if (intervalId !== null) {
        clearInterval(intervalId);
    }

    aktuellVerdient = 0;

    // Update immediately
    updateLiveCounter(sekunde);

    // Then update every second
    intervalId = setInterval(() => {
        updateLiveCounter(sekunde);
    }, 1000);
}

// Update live counter display
function updateLiveCounter(sekundenRate) {
    aktuellVerdient += sekundenRate;

    const jetzt = new Date();
    const differenzInSekunden = Math.floor((jetzt - startDatum) / 1000);
    const gesamtVerdient = differenzInSekunden * sekundenRate;

    const mitternacht = new Date(jetzt.getFullYear(), jetzt.getMonth(), jetzt.getDate(), 0, 0, 0);
    const seitMitternachtSekunden = Math.floor((jetzt - mitternacht) / 1000);
    const heuteVerdient = seitMitternachtSekunden * sekundenRate;

    // Update display with smooth animation
    updateElementWithAnimation("currentEarned", formatCurrency(aktuellVerdient, 6));
    updateElementWithAnimation("todayEarned", formatCurrency(heuteVerdient, 6));
    updateElementWithAnimation("totalEarned", formatCurrency(gesamtVerdient, 2));
}

// Update element with fade animation
function updateElementWithAnimation(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = value;
    }
}

// Stop live counter
function stopLiveCounter() {
    if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
        
        const liveCard = document.getElementById("liveCounterCard");
        liveCard.style.display = "none";
        
        showNotification("Live-Counter gestoppt.", "info");
    }
}

// Show notification (toast message)
function showNotification(message, type = "info") {
    // Remove existing notifications
    const existing = document.querySelector(".notification");
    if (existing) {
        existing.remove();
    }

    // Create notification element
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    // Style notification
    Object.assign(notification.style, {
        position: "fixed",
        top: "20px",
        right: "20px",
        padding: "1rem 1.5rem",
        borderRadius: "12px",
        color: "white",
        fontWeight: "600",
        fontSize: "0.95rem",
        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
        zIndex: "10000",
        animation: "slideIn 0.3s ease-out",
        maxWidth: "400px"
    });

    // Set background color based on type
    const colors = {
        success: "linear-gradient(135deg, #ffa726, #fb8c00)",
        error: "linear-gradient(135deg, #ff6b35, #e85d2c)",
        info: "linear-gradient(135deg, #ff6b35, #ffa726)",
        warning: "linear-gradient(135deg, #ffb74d, #f57c00)"
    };
    notification.style.background = colors[type] || colors.info;

    // Add to document
    document.body.appendChild(notification);

    // Add slide-in animation
    const style = document.createElement("style");
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = "slideOut 0.3s ease-out forwards";
        setTimeout(() => {
            notification.remove();
            style.remove();
        }, 300);
    }, 3000);
}

// Auto-save to localStorage (optional feature)
function saveToLocalStorage() {
    if (gesamt > 0 && startDatum) {
        const data = {
            gehalt: gesamt,
            startDatum: startDatum.toISOString()
        };
        localStorage.setItem("einkommensrechner", JSON.stringify(data));
    }
}

// Load from localStorage on page load (optional feature)
function loadFromLocalStorage() {
    const saved = localStorage.getItem("einkommensrechner");
    if (saved) {
        try {
            const data = JSON.parse(saved);
            document.getElementById("gehaltInput").value = data.gehalt;
            document.getElementById("dateInput").value = data.startDatum.split('T')[0];
            checkType();
        } catch (e) {
            console.error("Fehler beim Laden der gespeicherten Daten:", e);
        }
    }
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", function() {
    loadFromLocalStorage();
    
    // Add event listeners for auto-save
    document.getElementById("gehaltInput").addEventListener("change", saveToLocalStorage);
    document.getElementById("dateInput").addEventListener("change", saveToLocalStorage);
    
    // Add enter key support for form
    document.getElementById("gehaltInput").addEventListener("keypress", function(e) {
        if (e.key === "Enter") {
            config();
        }
    });
    
    document.getElementById("dateInput").addEventListener("keypress", function(e) {
        if (e.key === "Enter") {
            config();
        }
    });
});

// Stop counter when leaving page
window.addEventListener("beforeunload", function() {
    if (intervalId !== null) {
        clearInterval(intervalId);
    }
});

// Handle visibility change (pause/resume when tab is hidden/visible)
document.addEventListener("visibilitychange", function() {
    if (document.hidden) {
        // Page is hidden - you could pause the counter here if desired
    } else {
        // Page is visible again
        if (intervalId !== null && gesamt > 0 && startDatum) {
            // Recalculate to ensure accuracy after tab was hidden
            const sekunde = gesamt / (monat * 24 * 60 * 60);
            updateLiveCounter(sekunde);
        }
    }
});

// ============================================
// PREMIUM FEATURES
// ============================================

// Money Rain Animation
function startMoneyRain() {
    const moneyRain = document.getElementById('moneyRain');
    const symbols = ['💰', '💵', '💶', '💷', '💴', '💸', '💎', '🪙'];
    
    // Clear existing rain
    if (moneyRainInterval) {
        clearInterval(moneyRainInterval);
    }
    
    // Create money symbols
    moneyRainInterval = setInterval(() => {
        const symbol = document.createElement('div');
        symbol.className = 'money-symbol';
        symbol.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        symbol.style.left = Math.random() * 100 + '%';
        symbol.style.animationDuration = (Math.random() * 3 + 2) + 's';
        symbol.style.animationDelay = Math.random() * 2 + 's';
        
        moneyRain.appendChild(symbol);
        
        // Remove after animation
        setTimeout(() => {
            symbol.remove();
        }, 5000);
    }, 300);
    
    // Stop after 10 seconds
    setTimeout(() => {
        clearInterval(moneyRainInterval);
    }, 10000);
}

// Show Celebration
function showCelebration(emoji) {
    const celebration = document.createElement('div');
    celebration.className = 'celebration';
    celebration.textContent = emoji;
    document.body.appendChild(celebration);
    
    setTimeout(() => {
        celebration.remove();
    }, 1000);
}

// Show Wealth Dashboard with Chart
function showWealthDashboard() {
    const dashboard = document.getElementById('wealthDashboard');
    dashboard.style.display = 'block';
    
    // Update projections
    updateProjections();
    
    // Create earnings chart
    setTimeout(() => createEarningsChart(), 100);
}

// Update Projections
function updateProjections() {
    const dailyIncome = gesamt / monat;
    const hourlyIncome = dailyIncome / 24;
    
    // Calculate projections
    const weekIncome = dailyIncome * 7;
    const yearIncome = gesamt * 12;
    const fiveYearIncome = yearIncome * 5;
    
    document.getElementById('weekProjection').textContent = formatCurrency(weekIncome, 0);
    document.getElementById('monthProjection').textContent = formatCurrency(gesamt, 0);
    document.getElementById('yearProjection').textContent = formatCurrency(yearIncome, 0);
    document.getElementById('fiveYearProjection').textContent = formatCurrency(fiveYearIncome, 0);
}

// Create Earnings Chart
function createEarningsChart() {
    const ctx = document.getElementById('earningsChart');
    if (!ctx) return;
    
    // Destroy existing chart
    if (earningsChart) {
        earningsChart.destroy();
    }
    
    const dailyIncome = gesamt / monat;
    const labels = [];
    const data = [];
    
    // Generate 12 months of data
    for (let i = 0; i < 12; i++) {
        labels.push(['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'][i]);
        // Simulate slight variations
        data.push(gesamt + (Math.random() - 0.5) * (gesamt * 0.1));
    }
    
    earningsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Monatliches Einkommen',
                data: data,
                borderColor: '#ff6b35',
                backgroundColor: 'rgba(255, 107, 53, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#ffa726',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: '#ffffff',
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(31, 31, 31, 0.9)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffa726',
                    borderColor: '#ff6b35',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return formatCurrency(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        color: '#999999',
                        callback: function(value) {
                            return formatCurrency(value, 0);
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    }
                },
                x: {
                    ticks: {
                        color: '#999999'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    }
                }
            }
        }
    });
}

// Show What You Can Afford
function showAffordSection() {
    const affordCard = document.getElementById('affordCard');
    affordCard.style.display = 'block';
    
    const dailyIncome = gesamt / monat;
    const hourlyIncome = dailyIncome / 24;
    const minuteIncome = hourlyIncome / 60;
    
    const items = [
        { icon: '☕', name: 'Starbucks Kaffee', price: 4.50, desc: 'Venti Latte' },
        { icon: '🍕', name: 'Pizza Lieferung', price: 15, desc: 'Dominos Medium' },
        { icon: '🎬', name: 'Netflix Abo', price: 12.99, desc: 'Standard Plan' },
        { icon: '🎮', name: 'PlayStation 5', price: 549, desc: 'Konsole' },
        { icon: '📱', name: 'iPhone 15 Pro', price: 1199, desc: '128GB' },
        { icon: '💻', name: 'MacBook Pro', price: 2499, desc: '14 Zoll' },
        { icon: '✈️', name: 'Flug nach Mallorca', price: 150, desc: 'Hin- und Rückflug' },
        { icon: '🚗', name: 'Tesla Model 3', price: 42990, desc: 'Basismodell' }
    ];
    
    const grid = document.getElementById('affordGrid');
    grid.innerHTML = items.map(item => {
        const timeInMinutes = item.price / minuteIncome;
        const hours = Math.floor(timeInMinutes / 60);
        const minutes = Math.floor(timeInMinutes % 60);
        const days = Math.floor(hours / 24);
        
        let timeString;
        if (days > 0) {
            timeString = `${days} ${days === 1 ? 'Tag' : 'Tage'}`;
        } else if (hours > 0) {
            timeString = `${hours}h ${minutes}m`;
        } else {
            timeString = `${minutes} Min`;
        }
        
        return `
            <div class="afford-item">
                <div class="afford-item-content">
                    <div class="afford-item-icon">${item.icon}</div>
                    <div class="afford-item-details">
                        <h5>${item.name}</h5>
                        <p>${item.desc} - ${formatCurrency(item.price)}</p>
                    </div>
                </div>
                <div class="afford-time">
                    <span class="afford-time-label">Verdienzeit</span>
                    <span class="afford-time-value">${timeString}</span>
                </div>
            </div>
        `;
    }).join('');
}

// Show Milestones
function showMilestones() {
    const milestonesCard = document.getElementById('milestonesCard');
    milestonesCard.style.display = 'block';
    
    const yearlyIncome = gesamt * 12;
    const milestones = [
        { icon: '🎯', amount: 10000, title: '10.000 € Meilenstein' },
        { icon: '🏅', amount: 25000, title: '25.000 € Meilenstein' },
        { icon: '💎', amount: 50000, title: '50.000 € Meilenstein' },
        { icon: '👑', amount: 100000, title: '100.000 € Meilenstein' },
        { icon: '🚀', amount: 250000, title: '250.000 € Meilenstein' }
    ];
    
    const list = document.getElementById('milestonesList');
    list.innerHTML = milestones.map(milestone => {
        const progress = Math.min((yearlyIncome / milestone.amount) * 100, 100);
        const isCompleted = yearlyIncome >= milestone.amount;
        const timeToReach = isCompleted ? 'Erreicht! 🎉' : 
            `In ${Math.ceil((milestone.amount - yearlyIncome) / yearlyIncome * 12)} Monaten`;
        
        return `
            <div class="milestone-item ${isCompleted ? 'completed' : progress > 0 ? 'in-progress' : ''}">
                <div class="milestone-content">
                    <div class="milestone-info">
                        <div class="milestone-icon">${milestone.icon}</div>
                        <div class="milestone-details">
                            <h5>${milestone.title}</h5>
                            <div class="milestone-progress-bar">
                                <div class="milestone-progress-fill" style="width: ${progress}%"></div>
                            </div>
                        </div>
                    </div>
                    <div class="milestone-stats">
                        <span class="milestone-amount">${formatCurrency(milestone.amount, 0)}</span>
                        <span class="milestone-time">${timeToReach}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Show Comparison Chart
function showComparison() {
    const comparisonCard = document.getElementById('comparisonCard');
    comparisonCard.style.display = 'block';
    
    setTimeout(() => createComparisonChart(), 100);
}

function createComparisonChart() {
    const ctx = document.getElementById('comparisonChart');
    if (!ctx) return;
    
    // Destroy existing chart
    if (comparisonChart) {
        comparisonChart.destroy();
    }
    
    const yearlyIncome = gesamt * 12;
    
    // German income comparison data (approximations)
    const comparisonData = {
        'Mindestlohn': 22000,
        'Durchschnitt': 49200,
        'Sie': yearlyIncome,
        'Gutverdiener': 70000,
        'Top 10%': 100000
    };
    
    comparisonChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(comparisonData),
            datasets: [{
                label: 'Jahreseinkommen',
                data: Object.values(comparisonData),
                backgroundColor: [
                    'rgba(255, 107, 53, 0.4)',
                    'rgba(255, 167, 38, 0.4)',
                    'rgba(255, 183, 77, 0.8)',
                    'rgba(255, 167, 38, 0.4)',
                    'rgba(255, 107, 53, 0.4)'
                ],
                borderColor: [
                    '#ff6b35',
                    '#ffa726',
                    '#ffb74d',
                    '#ffa726',
                    '#ff6b35'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(31, 31, 31, 0.9)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffa726',
                    borderColor: '#ff6b35',
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            return formatCurrency(context.parsed.y, 0);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#999999',
                        callback: function(value) {
                            return formatCurrency(value, 0);
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    }
                },
                x: {
                    ticks: {
                        color: '#999999'
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// ============================================
// NEW FEATURES
// ============================================

// Show Savings Card
function showSavingsCard() {
    const savingsCard = document.getElementById('savingsCard');
    savingsCard.style.display = 'block';
}

// Calculate Savings Goal
function calculateSavingsGoal() {
    const goalInput = document.getElementById('savingsGoalInput');
    const rateInput = document.getElementById('savingsRateInput');
    
    const goal = parseFloat(goalInput.value);
    const rate = parseFloat(rateInput.value);
    
    if (isNaN(goal) || goal <= 0) {
        showNotification("Bitte geben Sie ein gültiges Sparziel ein.", "error");
        return;
    }
    
    if (isNaN(rate) || rate <= 0 || rate > 100) {
        showNotification("Bitte geben Sie eine gültige Sparrate ein (1-100%).", "error");
        return;
    }
    
    const monthlySavings = gesamt * (rate / 100);
    const monthsNeeded = Math.ceil(goal / monthlySavings);
    const yearsNeeded = Math.floor(monthsNeeded / 12);
    const remainingMonths = monthsNeeded % 12;
    
    const resultDiv = document.getElementById('savingsResult');
    resultDiv.style.display = 'block';
    
    let timeString = '';
    if (yearsNeeded > 0) {
        timeString = `${yearsNeeded} ${yearsNeeded === 1 ? 'Jahr' : 'Jahre'}`;
        if (remainingMonths > 0) {
            timeString += ` und ${remainingMonths} ${remainingMonths === 1 ? 'Monat' : 'Monate'}`;
        }
    } else {
        timeString = `${monthsNeeded} ${monthsNeeded === 1 ? 'Monat' : 'Monate'}`;
    }
    
    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() + monthsNeeded);
    
    resultDiv.innerHTML = `
        <div class="savings-result-content">
            <div class="savings-result-header">
                <h4>🎯 Ihr Sparziel-Plan</h4>
            </div>
            <div class="savings-result-grid">
                <div class="savings-result-item">
                    <span class="savings-result-label">Sparziel</span>
                    <span class="savings-result-value primary">${formatCurrency(goal, 0)}</span>
                </div>
                <div class="savings-result-item">
                    <span class="savings-result-label">Monatliche Sparrate (${rate}%)</span>
                    <span class="savings-result-value secondary">${formatCurrency(monthlySavings, 2)}</span>
                </div>
                <div class="savings-result-item">
                    <span class="savings-result-label">Benötigte Zeit</span>
                    <span class="savings-result-value tertiary">${timeString}</span>
                </div>
                <div class="savings-result-item">
                    <span class="savings-result-label">Zieldatum</span>
                    <span class="savings-result-value quaternary">${targetDate.toLocaleDateString('de-DE', { year: 'numeric', month: 'long' })}</span>
                </div>
            </div>
            <div class="savings-progress-bar">
                <div class="savings-progress-fill" style="width: 0%; animation: fillProgress 1.5s ease-out forwards;"></div>
            </div>
            <div class="savings-tips">
                <h5>💡 Spar-Tipps:</h5>
                <ul>
                    <li>Richten Sie einen Dauerauftrag ein, um automatisch zu sparen</li>
                    <li>Legen Sie das Geld auf ein separates Sparkonto</li>
                    <li>Vermeiden Sie Impulskäufe und setzen Sie Prioritäten</li>
                    <li>Überlegen Sie, ob Sie die Sparrate erhöhen können</li>
                </ul>
            </div>
        </div>
    `;
    
    showNotification("Sparziel erfolgreich berechnet!", "success");
}

// Show Time Value Card
function showTimeValueCard() {
    const timeValueCard = document.getElementById('timeValueCard');
    timeValueCard.style.display = 'block';
    updateTimeValueGrid();
}

function updateTimeValueGrid() {
    const dailyIncome = gesamt / monat;
    const hourlyIncome = dailyIncome / 24;
    const minuteIncome = hourlyIncome / 60;
    
    const activities = [
        { name: 'Pendeln (30 Min)', time: 30, icon: '🚗' },
        { name: 'Mittagspause (60 Min)', time: 60, icon: '🍽️' },
        { name: 'Netflix (1 Folge)', time: 45, icon: '📺' },
        { name: 'Workout (45 Min)', time: 45, icon: '💪' },
        { name: 'Social Media (30 Min)', time: 30, icon: '📱' },
        { name: 'Kochen (60 Min)', time: 60, icon: '👨‍🍳' },
        { name: 'Schlaf (8 Stunden)', time: 480, icon: '😴' },
        { name: 'Gaming (2 Stunden)', time: 120, icon: '🎮' }
    ];
    
    const grid = document.getElementById('timeValueGrid');
    grid.innerHTML = activities.map(activity => {
        const cost = minuteIncome * activity.time;
        const hours = Math.floor(activity.time / 60);
        const mins = activity.time % 60;
        let timeString = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
        
        return `
            <div class="time-value-item">
                <div class="time-value-icon">${activity.icon}</div>
                <div class="time-value-info">
                    <h5>${activity.name}</h5>
                    <p class="time-value-duration">${timeString}</p>
                </div>
                <div class="time-value-cost">
                    <span class="time-value-label">Zeitwert</span>
                    <span class="time-value-amount">${formatCurrency(cost, 2)}</span>
                </div>
            </div>
        `;
    }).join('');
}

// Toggle Tutorial
function toggleTutorial() {
    const content = document.getElementById("tutorialContent");
    const chevron = document.querySelector(".tutorial-card .chevron");

    if (content.style.display === "none" || content.style.display === "") {
        content.style.display = "block";
        chevron.classList.add("open");
    } else {
        content.style.display = "none";
        chevron.classList.remove("open");
    }
}

// Toggle FAQ Answer
function toggleFaqAnswer(questionElement) {
    const faqItem = questionElement.parentElement;
    const answer = faqItem.querySelector('.faq-answer');
    const chevron = questionElement.querySelector('.faq-chevron');
    
    const isOpen = answer.style.display === 'block';
    
    // Close all other FAQ items
    document.querySelectorAll('.faq-answer').forEach(a => a.style.display = 'none');
    document.querySelectorAll('.faq-chevron').forEach(c => c.classList.remove('open'));
    
    if (!isOpen) {
        answer.style.display = 'block';
        chevron.classList.add('open');
    }
}
