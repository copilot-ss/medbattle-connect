# MedQuiz DSAR-Prozess

Stand: `2026-08-15`

## Zweck

Operativer Ablauf für DSGVO-Betroffenenrechte: Auskunft, Berichtigung und Löschung einschließlich Identitätsprüfung, Fristen und Nachweisführung.

## Kontakt

- Primär: `medbattle1@gmail.com`
- Empfohlener Betreff: `DSAR - <Auskunft|Berichtigung|Löschung> - <Account-E-Mail>`
- Öffentliche Support-Seite: `https://copilot-ss.github.io/medbattle-connect/legal-static/support.html`
- Öffentliche Löschseite: `https://copilot-ss.github.io/medbattle-connect/legal-static/delete-account.html`

## Fristen

- Eingang innerhalb von 72 Stunden bestätigen.
- Anfrage in der Regel innerhalb von 30 Tagen abschließen.
- Eine rechtlich zulässige Verlängerung um bis zu 60 weitere Tage begründen und rechtzeitig mitteilen.

## Identitätsprüfung

- Anfrage von der im Konto bestätigten E-Mail-Adresse oder
- einmaliges Verifizierungsmerkmal über einen bestätigten Login/Code.
- Bei unklarer Identität keine Daten herausgeben; gezielt nachverifizieren.
- Keine Ausweiskopie verlangen, wenn eine weniger invasive Prüfung ausreicht.

## Relevante Datenbereiche

- Supabase Auth: `auth.users`
- Profil und Fortschritt: `public.users`, `public.profiles`, `public.scores`
- Soziale Beziehungen: `public.friendships`, `public.lobby_invites`
- Multiplayer: `public.matches`; bis zu fünf Teilnehmer liegen zusätzlich in `matches.state`
- Diagnostik: `public.client_logs`
- Optionales Profilfoto: Storage-Bucket `avatars`
- Lokale Gastdaten auf dem Gerät, soweit die anfragende Person Zugriff auf das Gerät hat

Vor jedem echten Fall den aktuellen Migrationsstand unter `supabase/migrations/` prüfen.

## Auskunft

1. Ticket mit Eingang und Frist anlegen.
2. Identität prüfen.
3. Supabase-Auth-Daten administrativ exportieren.
4. Datenbankauszug mit einer sicheren, serverseitigen Admin-Verbindung erstellen.
5. Avatar-Objekte und relevante lokale Daten berücksichtigen.
6. Auszug auf fremde IDs oder personenbezogene Daten anderer Nutzer prüfen.
7. Ergebnis sicher bereitstellen und Abschluss dokumentieren.

SQL-Arbeitsvorlage:

```sql
-- <USER_ID> vor Ausführung sicher ersetzen.
select * from public.users where id = '<USER_ID>';
select * from public.profiles where id = '<USER_ID>';
select * from public.scores where user_id = '<USER_ID>' order by created_at desc;
select * from public.friendships
where user_id = '<USER_ID>' or friend_id = '<USER_ID>';
select * from public.lobby_invites
where sender_id = '<USER_ID>' or recipient_id = '<USER_ID>'
order by created_at desc;
select m.*
from public.matches m
where m.host_id = '<USER_ID>'
   or m.guest_id = '<USER_ID>'
   or exists (
     select 1
     from public.match_participant_rows(m.state) p
     where p.player_state->>'userId' = '<USER_ID>'
   )
order by m.created_at desc;
select * from public.client_logs
where user_id = '<USER_ID>'
order by created_at desc;
```

Die Vorlage niemals über einen Client-Key ausführen und vor Verwendung gegen das aktuelle Schema prüfen.

## Berichtigung

1. Ticket und Identitätsprüfung dokumentieren.
2. Gewünschte Korrektur und zulässige Zielfelder prüfen.
3. Änderung in Auth, Datenbank oder Storage durchführen.
4. Relevante Caches/Synchronisation berücksichtigen.
5. Änderung bestätigen und Ticket schließen.

## Löschung

1. Ticket und Identitätsprüfung dokumentieren.
2. Vor Löschung den Umfang und gesetzliche Aufbewahrungspflichten prüfen.
3. Den vorgesehenen Account-Deletion-Service oder einen gleichwertigen administrativen Ablauf verwenden.
4. `auth.users`, Profil, Fortschritt, Freundschaften, Einladungen, redigierte Logs und Avatar-Dateien prüfen.
5. Bei Matches auch Teilnehmerreferenzen in `matches.state` berücksichtigen; verbleibende historische Daten dürfen keine unnötige Personenbeziehbarkeit behalten.
6. Abschluss bestätigen und Ticket schließen.

## Audit Trail

Pro Fall dokumentieren:

- Ticket-ID und Anfrageart
- Eingang, Bestätigung, Frist und Abschluss
- Methode der Identitätsprüfung
- ausgeführte Admin-Aktionen und Abfragen
- bereitgestellte Antwort
- begründete Ausnahmen oder Aufbewahrungspflichten

Keine vollständigen Datenauszüge, Tokens oder Secrets im Ticketprotokoll ablegen.

## Dry-Run

- Auskunft, Berichtigung und Löschung jeweils mit einem internen Testkonto durchspielen.
- Fünf-Spieler-Matchdaten und Avatar-Storage mindestens einmal einbeziehen.
- Ergebnis in `../release/RELEASE_TESTS.md` dokumentieren.
