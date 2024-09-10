import time  # Modul zum Einfügen eines Timers

gesamt = 0
monat = 31
aktuellVerdient = 0

def Übersicht():
    if gesamt != 0:  # Überprüfen, ob gesamt gesetzt wurde
        tag = gesamt / monat
        stunde = tag / 24
        minute = stunde / 60
        sekunde = minute / 60
        print("Einkommen pro Monat: "+str(gesamt)+"€")
        print("Einkommen pro Tag: "+str(tag)+"€")
        print("Einkommen pro Stunde: "+str(stunde)+"€")
        print("Einkommen pro Minute: "+str(minute)+"€")
        print("Einkommen pro Sekunde: "+str(sekunde)+"€")
        print("")
        menu()
    else:
        print("Sie müssen erst ein Einkommen festlegen!")
        config()

def config():
    global gesamt  # Damit die globale Variable geändert wird
    newGesamt = input("Geben Sie Ihr monatliches Einkommen ein: ")
    gesamt = float(newGesamt)
    print("Gesamt: "+str(gesamt))
    print("")
    menu()  # Rück zur Menüübersicht

def earnedNow():
    global aktuellVerdient, gesamt  # Zugriff auf globale Variablen

    if gesamt == 0:
        print("Sie müssen erst ein Einkommen festlegen!")
        config()
        return

    sekunde = gesamt / (monat * 24 * 60 * 60)  # Einkommen pro Sekunde

    print("Live Einkommen (zum Stoppen: Strg+C drücken)")
    try:
        while True:
            aktuellVerdient += sekunde  # Füge Einkommen pro Sekunde hinzu
            print(f"Aktuell verdient: {aktuellVerdient:.6f} €", end="\r")
            time.sleep(1)  # Warte eine Sekunde
    except KeyboardInterrupt:
        print("\nLive-Counter gestoppt.")
        menu()

def menu():
    print("Was wollen Sie tun?")
    choice = input("A: Aufschlüsselung der Zeiten\nB: Konfiguration\nC: Live-Counter\n")
    if choice == "A" or choice == "a":
        Übersicht()
    elif choice == "B" or choice == "b":
        config()
    elif choice == "C" or choice == "c":
        earnedNow()
    else:
        print("Eingabe nicht erkannt!")
        print("")

        menu()

# START
menu()
