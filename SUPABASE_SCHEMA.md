# SUPABASE_SCHEMA.md

Stand: 2026-03-24

## Quelle der Wahrheit
- Primar gilt im Repo der Migrationsstand unter `supabase/migrations/`.
- Fuer Codex-/Review-Zwecke ist ein lokaler Schema-Dump optional nuetzlich, aber nicht die fuehrende Quelle.

## Aktuell relevante DB-Bereiche
- `questions` + `question_translations` fuer den Online-Fragenpool
- `users`, `profiles`, `scores` fuer Profil, Fortschritt und Rangliste
- `matches` + Match-RPCs fuer Multiplayer

## Wichtige aktuelle DB-Realitaet
- Die Rangliste ist seit `2026-03-24` kumulativ.
- Dafuer existiert `users.leaderboard_points`, das von `submit_score(...)` fortgeschrieben wird.
- `get_leaderboard(...)` und `fetch_public_profile(...)` ranken nicht mehr nach dem besten Einzelrun, sondern nach dieser persistierten Summe.
- Der Online-Fragenpool wird direkt aus `questions` und `question_translations` gespeist; reine Inhaltsaenderungen an diesen Tabellen sind ohne neuen App-Build live.
- Single-Session-Login wird ueber die RPCs `claim_active_session(...)`, `is_active_session(...)` und `release_active_session(...)` gestuetzt.

## Praktischer Workflow
```powershell
# 1) Projekt verknuepfen (einmalig)
supabase link --project-ref <DEIN_REF>

# 2) Remote-Migrationen einsehen
supabase migration list --linked

# 3) Optional: lokalen Schema-Dump ziehen
supabase db pull --local
```

## Hinweise
- `supabase db pull --local` ist optional und erzeugt einen Snapshot des aktuellen Remote-Schemas.
- Fuer App-Aenderungen an Datenlogik immer zuerst die existierenden Migrationen und RPCs lesen, bevor ein neuer Dump beurteilt wird.
- Keine Secrets oder Service-Role-Keys ins Repo schreiben.
