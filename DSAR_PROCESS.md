# DSAR_PROCESS.md - MedBattle

Stand: 2026-03-08

## Ziel
Operativer Ablauf fuer DSGVO-Betroffenenrechte (Auskunft, Berichtigung, Loeschung) inklusive SLA, Identitaetspruefung und Nachweisfuehrung.

## Kontaktweg
- Primar: `babyjeje24@gmail.com`
- Betreff-Empfehlung: `DSAR - <Auskunft|Berichtigung|Loeschung> - <Account-E-Mail>`

## SLA
- Eingangsbestaetigung: innerhalb von 72 Stunden.
- Abschluss: in der Regel innerhalb von 30 Tagen (Art. 12 Abs. 3 DSGVO).
- Verlaengerung: falls notwendig und rechtlich zulaessig um bis zu weitere 60 Tage, mit Begruendung.

## Identitaetspruefung
Vor Bearbeitung muss die Anfrage der betroffenen Person zugeordnet werden:
- Anfrage von der im Account hinterlegten E-Mail ODER
- Rueckfrage mit einmaligem Verifizierungsmerkmal (z. B. bestaetigter Login/Code).
- Wenn Identitaet nicht sicher: keine Datenausgabe, stattdessen Rueckfrage.

## Dateninventar (relevant)
- `auth.users` (Supabase Auth)
- `public.users`
- `public.scores`
- `public.friendships`
- `public.matches` (host/guest Referenzen)
- `public.lobby_invites`
- `public.client_logs` (redigierte Fehlerlogs)
- Optional je nach Stand: `public.profiles`, `public.friends`

## Ablauf: Auskunft
1. Ticket anlegen (`open`), Fristdatum setzen.
2. Identitaet pruefen.
3. Datenauszug erstellen (SQL unten).
4. Ausgabe intern gegenpruefen (fremde IDs/PII nicht mitschicken).
5. Bereitstellung an anfragende Person, Ticket mit Zeitstempel dokumentieren.

### SQL-Template Auskunft
```sql
-- <USER_ID> ersetzen
select * from public.users where id = '<USER_ID>';
select * from public.scores where user_id = '<USER_ID>' order by created_at desc;
select * from public.friendships where user_id = '<USER_ID>' or friend_id = '<USER_ID>';
select * from public.matches where host_id = '<USER_ID>' or guest_id = '<USER_ID>' order by created_at desc;
select * from public.lobby_invites where sender_id = '<USER_ID>' or recipient_id = '<USER_ID>' order by created_at desc;
select * from public.client_logs where user_id = '<USER_ID>' order by created_at desc;
```

## Ablauf: Berichtigung
1. Ticket anlegen, Identitaet pruefen.
2. Gewuenschte Korrektur verifizieren (z. B. Username/Profilfeld).
3. Aenderung in DB/Auth ausfuehren.
4. Aenderung bestaetigen, Ticket abschliessen.

## Ablauf: Loeschung
1. Ticket anlegen, Identitaet pruefen.
2. Account in Supabase Auth loeschen (`auth.users`).
3. Kaskaden/Folgen pruefen:
   - `public.users`, `public.scores`, `public.friendships`, `public.lobby_invites`, `public.client_logs` sollten fuer den Nutzer entfernt sein.
   - `public.matches` kann je nach FK-Strategie auf `null` gesetzt werden (historische Spielobjekte ohne Personenbezug).
4. Abschluss anfragen und Ticket als `closed` dokumentieren.

## Nachweis / Audit Trail
Pro Fall dokumentieren:
- Ticket-ID
- Anfrage-Typ
- Eingang, Bestaetigung, Abschluss (Zeitstempel)
- Identitaetspruefung (Methode)
- Durchgefuehrte SQL/Actions
- Antwort an betroffene Person

## Dry-Run vor Release
- Ein interner Testfall fuer jede Kategorie: Auskunft, Berichtigung, Loeschung.
- Ergebnis in `RELEASE_TESTS.md` dokumentieren und Checkboxen abhaken.
