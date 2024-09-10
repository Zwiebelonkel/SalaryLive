let gesamt = 0;
let monat = 31;
let aktuellVerdient = 0;
let intervalId = null;

function zeigeÜbersicht() {
    if (gesamt != 0 && !isNaN(gesamt)) {  // Überprüfen, ob gesamt eine Zahl ist
        let tag = gesamt / monat;
        let stunde = tag / 24;
        let minute = stunde / 60;
        let sekunde = minute / 60;

        document.getElementById("info").innerHTML = `
            <p>Einkommen pro Monat: ${gesamt} $</p>
            <p>Einkommen pro Tag: ${tag.toFixed(2)} $</p>
            <p>Einkommen pro Stunde: ${stunde.toFixed(2)} $</p>
            <p>Einkommen pro Minute: ${minute.toFixed(4)} $</p>
            <p>Einkommen pro Sekunde: ${sekunde.toFixed(6)} $</p>
        `;
    } else {
        document.getElementById("info").innerHTML = "<p>Sie müssen erst ein gültiges Einkommen festlegen!</p>";
    }
}

function config() {
    let newGesamt = prompt("Geben Sie Ihr monatliches Einkommen ein:");
    let eingegebenesEinkommen = parseFloat(newGesamt);

    if (!isNaN(eingegebenesEinkommen)) {
        gesamt = eingegebenesEinkommen;
        document.getElementById("info").innerHTML = `<p>Gesamt: ${gesamt} $</p>`;
    } else {
        document.getElementById("info").innerHTML = "<p>Ungültige Eingabe. Bitte geben Sie eine gültige Zahl ein.</p>";
    }
}

function startLiveCounter() {
    document.getElementById("info").innerHTML = ""
    if (gesamt === 0 || isNaN(gesamt)) {
        alert("Sie müssen erst ein gültiges Einkommen festlegen!");
        config();
        return;
    }

    let sekunde = gesamt / (monat * 24 * 60 * 60); // Einkommen pro Sekunde

    if (intervalId !== null) {
        clearInterval(intervalId); // Stoppe alten Counter, falls vorhanden
    }

    aktuellVerdient = 0; // Setze aktuellVerdient zurück
    intervalId = setInterval(() => {
        aktuellVerdient += sekunde;
        document.getElementById("liveCounter").innerHTML = `
            <p>Aktuell verdient: ${aktuellVerdient.toFixed(6)} $</p>
        `;
    }, 1000); // Jede Sekunde aktualisieren
}

function stopLiveCounter() {
    if (intervalId !== null) {
        clearInterval(intervalId); // Counter stoppen
        intervalId = null;
        document.getElementById("liveCounter").innerHTML = "<p>Live-Counter gestoppt.</p>";
    }
}

// Falls gewünscht, kannst du beim Verlassen des Fensters den Counter stoppen
window.onbeforeunload = stopLiveCounter;
