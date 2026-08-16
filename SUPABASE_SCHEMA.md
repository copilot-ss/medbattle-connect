# Supabase schema

Stand: 2026-08-15
Migrationen bis: `20260507110000_keep_match_active_when_player_abandons.sql`

## Quelle der Wahrheit

Die versionierten Dateien unter `supabase/migrations/` sind die einzige
verbindliche Schemaquelle. Ein lokaler oder Remote-Dump ist nur ein Prüfstand
und darf Migrationen nicht ersetzen.

## Aktuelle Bereiche

- `questions` und `question_translations`: Online-Fragen, Erklärungen und
  optionale Public-Domain-Bild-URLs.
- `users`, `profiles` und `scores`: Profil, XP, Coins, Energie,
  `leaderboard_points`, Einstellungen und Accountzustand.
- `matches`: Lobby- und Quizstatus. Bis zu fünf Teilnehmer liegen im JSONB-Feld
  `state`; `host_id` und `guest_id` bilden deshalb nicht mehr alle Teilnehmer ab.
- Friend-, Invite-, Report- und Moderationsfunktionen: soziale Flows und
  Realtime-Lobby-Einladungen.

## Wichtige Laufzeitregeln

- Die Rangliste verwendet kumulative `users.leaderboard_points`.
- Single-Session-Login läuft über `claim_active_session(...)`,
  `is_active_session(...)` und `release_active_session(...)`.
- Fünf-Spieler-Lobbys werden ausschließlich über die Match-RPCs und die
  Hilfsfunktionen `match_participant_rows(...)` / `match_state_has_player(...)`
  ausgewertet. DSAR- und Cleanup-Abfragen müssen das JSONB-`state` einbeziehen.
- Achievement-Belohnungen werden mit `claim_user_achievement(...)` nur einmal
  als beansprucht markiert.
- Reine Änderungen am Fragenbestand werden nach einer Datenmigration ohne neue
  App-Binary wirksam.

## Offene Härtung vor Produktions-Rollout

Einige RPCs akzeptieren weiterhin vom Client berechnete Score-, XP-, Coin- oder
Fortschrittswerte. Dazu gehören insbesondere Score-/Progress-/Achievement- und
Match-Progress-Flows. Diese Werte müssen serverseitig aus vertrauenswürdigen
Fragen- und Kaufdaten berechnet oder streng begrenzt werden; bis dahin ist die
Spielökonomie manipulierbar. Der aktuelle Stand ist in `TASKS.md` und
`docs/release/RELEASE_STATUS.md` als Produktionsblocker geführt.

## Prüfworkflow

```powershell
supabase link --project-ref <PROJECT_REF>
supabase migration list --linked
supabase db lint --linked
```

- Vor jeder neuen Migration zuerst spätere Definitionen derselben Funktion
  suchen; bei `create or replace function` gilt die letzte Migration.
- Keine Anon-, Service-Role- oder Datenbank-Schlüssel in Git, VS-Code-Settings
  oder Dokumentation speichern.
