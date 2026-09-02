# Zero-Tap Sign-In Roadmap

Stand: `2026-09-02`

## Entscheidung

- MedQuiz bleibt in Google Play korrekt als `Quiz und Denkspiele > Quiz` eingestuft.
- Spiele sind von der ab April 2027 geplanten Zero-Tap-Pflicht derzeit ausgenommen. Deshalb wird Restore Credentials nicht in `1.0.4` eingebaut.
- Die Entscheidung wird erneut geprüft, sobald Google eine verbindliche Spiele-Guidance veröffentlicht, die Spiele-Ausnahme endet oder MedQuiz in eine App-Kategorie wechselt.

Quellen:

- [Play Console technical quality requirements](https://support.google.com/googleplay/android-developer/answer/17492799?hl=en)
- [Restore Credentials implementation](https://developer.android.com/identity/sign-in/restore-credentials-implementation)

## Sicherheitsgrenzen

- `android:allowBackup="false"` bleibt aktiv. Restore Credentials funktioniert unabhängig von diesem Manifest-Wert.
- Supabase-Access-/Refresh-Tokens, aktive Session-Tokens und vollständige AsyncStorage-Inhalte werden nicht über Android Backup übertragen.
- Gäste und Nutzer mit deaktiviertem „Angemeldet bleiben“ erhalten keinen Restore Key.
- Logout, Kontolöschung und lokales Zurücksetzen löschen den Restore Key ausdrücklich über Credential Manager.
- Eine wiederhergestellte Anmeldung durchläuft dieselbe serverseitige Nutzer-, Sperr- und Single-Session-Prüfung wie eine normale Anmeldung.

## Vorgesehene Architektur

1. Ein lokales Expo/Kotlin-Modul kapselt Credential Manager ab Android 9 mit den Operationen `create`, `get` und `clear` für Restore Credentials.
2. Supabase Edge Functions erzeugen und verifizieren WebAuthn-kompatible Registrierungs- und Anmelde-Challenges. Restore Keys werden serverseitig getrennt von späteren nutzerverwalteten Passkeys gespeichert.
3. Nach erfolgreichem dauerhaftem Login oder beim Start mit bestehender dauerhafter Session wird einmalig ein Restore Key erzeugt und der lokale Synchronisationszeitpunkt gespeichert.
4. Beim ersten Start auf einem neuen Gerät wird vor dem manuellen Login ein Restore Key abgefragt und serverseitig gegen eine kurzlebige Supabase-Session getauscht.
5. Nach erfolgreicher Wiederherstellung beansprucht das neue Gerät über `claim_active_session` die aktive Session; das alte Gerät verliert entsprechend der bestehenden Ein-Gerät-Regel seine Session.
6. Fehler, nicht unterstützte Android-Versionen, fehlende Google-Play-Dienste oder nicht verfügbare Ende-zu-Ende-Sicherung fallen ohne Blockade auf den heutigen Login zurück.

## Spätere Abnahmekriterien

- Geräteübertragung und Cloud-Restore melden ein dauerhaft angemeldetes Einzelkonto ohne Tap wieder an.
- Ausgeloggte Nutzer und Gäste bleiben ausgeloggt beziehungsweise im Gastzustand.
- Logout und Kontolöschung verhindern eine spätere Wiederherstellung zuverlässig.
- Google-, Discord- und E-Mail-Konten funktionieren unabhängig vom ursprünglichen Login-Verfahren.
- Wiederherstellung, Offline-Start, Push-Token-Neuregistrierung und Single-Session-Übernahme werden auf mindestens zwei Android-9+-Geräten geprüft.
