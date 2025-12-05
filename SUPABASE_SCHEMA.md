## Supabase-Schema exportieren (für Codex sichtbar machen)

Ziel: Schema-Dump ins Repo legen, damit Änderungen an Tabellen/Views (z. B. `friends.friend_code`) nachvollziehbar und anpassbar sind.

### Voraussetzungen
- Supabase CLI installiert (`npm i -g supabase` oder Binary von supabase.com).
- Dein Projekt-Ref (z. B. `uxlwbzgohgxbnhcjiimh`).
- Auth-Token in der Shell (`supabase login`).

### Schritte (PowerShell/CMD)
```powershell
# 1) Projekt verknüpfen (einmalig)
supabase link --project-ref <DEIN_REF> --use-mock

# 2) Schema ziehen
supabase db pull --local

# Ergebnis: supabase/schema.sql (und ggf. migrations/) wird erzeugt
```

### Einchecken
- `supabase/schema.sql` ins Repo committen (keine Secrets enthalten).
- Falls `supabase` als Datei mit falschen Rechten existiert: umbenennen oder löschen und den Ordner neu anlegen, damit `supabase db pull` schreiben kann.

### Danach
- Ich kann fehlende Spalten/Views (z. B. `friend_code` in `friends`) im Schema sehen und die nötigen SQL-Änderungen vorbereiten.
