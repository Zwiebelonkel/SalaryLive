// Global Variables
let gesamt = 0;
let monat = 31;
let aktuellVerdient = 0;
let intervalId = null;
let startDatum = null;

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
        success: "linear-gradient(135deg, #10b981, #059669)",
        error: "linear-gradient(135deg, #ef4444, #dc2626)",
        info: "linear-gradient(135deg, #3b82f6, #2563eb)",
        warning: "linear-gradient(135deg, #f59e0b, #d97706)"
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
