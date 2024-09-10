let gesamt = 0;
let monat = 31;
let aktuellVerdient = 0;
let intervalId = null;
let isÜbersichtVisible = false;
let startDatum = null; // Variable zum Speichern des Startdatums

function zeigeÜbersicht() {
    const infoElement = document.getElementById("info");

    if (isÜbersichtVisible) {
        infoElement.innerHTML = "";
        isÜbersichtVisible = false;
    } else {
        if (gesamt != 0 && !isNaN(gesamt)) {
            let tag = gesamt / monat;
            let stunde = tag / 24;
            let minute = stunde / 60;
            let sekunde = minute / 60;

            infoElement.innerHTML = `
                <p>Einkommen pro Monat: ${gesamt} €</p>
                <p>Einkommen pro Tag: ${tag.toFixed(2)} €</p>
                <p>Einkommen pro Stunde: ${stunde.toFixed(2)} €</p>
                <p>Einkommen pro Minute: ${minute.toFixed(4)} €</p>
                <p>Einkommen pro Sekunde: ${sekunde.toFixed(6)} €</p>
            `;
        } else {
            infoElement.innerHTML = "<p>Sie müssen erst ein gültiges Einkommen festlegen!</p>";
        }
        isÜbersichtVisible = true;
    }
}

function config() {
    let newGesamt = prompt("Geben Sie Ihr monatliches Einkommen ein:");
    let eingegebenesEinkommen = parseFloat(newGesamt);

    if (!isNaN(eingegebenesEinkommen)) {
        gesamt = eingegebenesEinkommen;
        document.getElementById("gehalt").innerHTML = `<p>Monatliches Einkommen: ${gesamt} €</p>`;
        // Benutzer nach dem Startdatum fragen
        let eingegebenesDatum = prompt("Geben Sie das Datum ein, seit wann Sie bei Ihrem Unternehmen arbeiten (Format: YYYY-MM-DD):");
        startDatum = new Date(eingegebenesDatum);
        
        // Überprüfen, ob das Datum gültig ist
        if (isNaN(startDatum.getTime())) {
            alert("Ungültiges Datum. Bitte versuchen Sie es erneut.");
            startDatum = null;
        }
    } else {
        document.getElementById("info").innerHTML = "<p>Ungültige Eingabe. Bitte geben Sie eine gültige Zahl ein.</p>";
    }
}

function startLiveCounter() {
    if (gesamt === 0 || isNaN(gesamt) || startDatum === null) {
        alert("Sie müssen erst ein gültiges Einkommen und Startdatum festlegen!");
        config();
        return;
    }
    document.getElementById("liveCounter").style.display = "block";

    let sekunde = gesamt / (monat * 24 * 60 * 60); // Einkommen pro Sekunde

    if (intervalId !== null) {
        clearInterval(intervalId); // Stoppe alten Counter, falls vorhanden
    }

    aktuellVerdient = 0; // Setze aktuellVerdient zurück
    intervalId = setInterval(() => {
        // Einkommen für die Live-Anzeige
        aktuellVerdient += sekunde;

        // Berechne die aktuelle Uhrzeit seit Mitternacht in Sekunden
        const jetzt = new Date();
        const stunden = jetzt.getHours();
        const minuten = jetzt.getMinutes();
        const sekunden = jetzt.getSeconds();
        const sekundenSeitMitternacht = (stunden * 3600) + (minuten * 60) + sekunden;

        // Berechne das heute verdiente Einkommen
        const heuteVerdient = sekunde * sekundenSeitMitternacht;

        // Berechne den insgesamt verdienten Betrag
        const zeitSeitStart = Math.floor((jetzt - startDatum) / 1000); // Zeit in Sekunden seit Startdatum
        const insgesamtVerdient = sekunde * zeitSeitStart;

        // Aktualisiere die Anzeige
        document.getElementById("liveCounter").innerHTML = `
            <p>Aktuell verdient: ${aktuellVerdient.toFixed(6)} €</p>
            <p>Heute verdient: ${heuteVerdient.toFixed(6)} €</p>
            <p>Insgesamt verdient: ${insgesamtVerdient.toFixed(6)} € seit ${startDatum.toDateString()}</p>
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