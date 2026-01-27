import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const privacyHtml = `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Datenschutz - MedBattle</title>
    <style>
      :root {
        color-scheme: light;
      }
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        margin: 0;
        padding: 24px;
        line-height: 1.6;
        color: #0f172a;
        background: #f8fafc;
      }
      header {
        margin-bottom: 16px;
      }
      h1 {
        margin: 0 0 8px 0;
        font-size: 28px;
      }
      h2 {
        margin: 24px 0 8px 0;
        font-size: 18px;
      }
      p, li {
        font-size: 14px;
      }
      a {
        color: #2563eb;
      }
      .card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 16px;
      }
    </style>
  </head>
  <body>
    <header>
      <h1>Datenschutz</h1>
      <p>MedBattle ist eine Quiz-App für Medizinwissen. Diese Hinweise erklären, welche Daten wir verarbeiten und warum.</p>
      <p>Stand: 2026-01-12</p>
    </header>

    <div class="card">
      <h2>Verantwortlicher</h2>
      <p>Verantwortlich für die Datenverarbeitung ist das MedBattle Team.</p>
      <p>Kontakt: <a href="mailto:babyjeje24@gmail.com">babyjeje24@gmail.com</a></p>

      <h2>Welche Daten wir verarbeiten</h2>
      <ul>
        <li>Accountdaten: E-Mail, Nutzername, Provider-IDs (z.B. Google, Discord).</li>
        <li>Profil- und Spielwerte: Scores, Streaks, Achievements, Lobby-Status.</li>
        <li>Geräte- und Nutzungsdaten: App-Version, OS, Crash-Logs, Diagnose-Infos.</li>
        <li>Werbe- und Kaufdaten: Werbe-IDs und Kaufbelege, falls genutzt.</li>
        <li>Gastmodus: lokale Gast-ID und Einstellungen auf dem Gerät.</li>
        <li>Kommunikation: Inhalte deiner Support-Anfragen.</li>
      </ul>

      <h2>Zwecke der Verarbeitung</h2>
      <ul>
        <li>Login, Account-Schutz und Sicherheit.</li>
        <li>Gameplay, Matchmaking, Ranglisten und Fortschritt.</li>
        <li>Fehleranalyse und Stabilität.</li>
        <li>Abrechnung von Premium/Käufen und Auslieferung von Werbung.</li>
        <li>Support und Beantwortung deiner Anfragen.</li>
      </ul>

      <h2>Rechtsgrundlagen (DSGVO)</h2>
      <ul>
        <li>Vertrag/Leistungserbringung (Art. 6 Abs. 1 lit. b DSGVO).</li>
        <li>Einwilligung, z.B. für Werbung/Tracking (Art. 6 Abs. 1 lit. a DSGVO).</li>
        <li>Berechtigtes Interesse, z.B. Sicherheits- und Fehleranalyse (Art. 6 Abs. 1 lit. f DSGVO).</li>
        <li>Rechtliche Pflichten, z.B. Abrechnung (Art. 6 Abs. 1 lit. c DSGVO).</li>
      </ul>

      <h2>Empfänger und Dienstleister</h2>
      <ul>
        <li>Supabase (Auth, Datenbank, Storage).</li>
        <li>Google/Discord (OAuth-Login).</li>
        <li>Sentry oder vergleichbare Telemetrie für Crash-Reports.</li>
        <li>Google AdMob für Werbung.</li>
        <li>App-Store Provider für In-App-Käufe (Apple/Google).</li>
      </ul>

      <h2>Datenübermittlung in Drittländer</h2>
      <p>Einige Dienstleister können Daten außerhalb der EU verarbeiten (z.B. USA). Dabei nutzen wir Standardvertragsklauseln oder vergleichbare Schutzmaßnahmen.</p>

      <h2>Speicherdauer und Löschung</h2>
      <p>Wir speichern Daten nur so lange, wie es für den Betrieb der App, rechtliche Pflichten oder Sicherheitszwecke erforderlich ist. Auf Wunsch löschen wir deinen Account und zugehörige Daten, sofern keine Aufbewahrungspflichten entgegenstehen.</p>

      <h2>Deine Rechte</h2>
      <ul>
        <li>Auskunft, Berichtigung, Löschung, Einschränkung.</li>
        <li>Datenübertragbarkeit.</li>
        <li>Widerspruch gegen Verarbeitung und Widerruf von Einwilligungen.</li>
        <li>Beschwerde bei einer Aufsichtsbehörde.</li>
      </ul>
      <p>Schreibe uns dazu an die Kontaktadresse oben.</p>

      <h2>Hinweis zur Nutzung</h2>
      <p>MedBattle ist ein Lernspiel und ersetzt keine medizinische Beratung.</p>

      <h2>Jugendschutz</h2>
      <p>Die App richtet sich nicht an Kinder unter 13 Jahren. Sollten wir Daten von Kindern erhalten, löschen wir diese.</p>

      <h2>Änderungen</h2>
      <p>Wir aktualisieren diese Hinweise bei Bedarf. Die aktuelle Version ist unter dem Link in der App verfügbar.</p>
    </div>
  </body>
</html>`;

const termsHtml = `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>AGB - MedBattle</title>
    <style>
      :root {
        color-scheme: light;
      }
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        margin: 0;
        padding: 24px;
        line-height: 1.6;
        color: #0f172a;
        background: #f8fafc;
      }
      header {
        margin-bottom: 16px;
      }
      h1 {
        margin: 0 0 8px 0;
        font-size: 28px;
      }
      h2 {
        margin: 24px 0 8px 0;
        font-size: 18px;
      }
      p, li {
        font-size: 14px;
      }
      a {
        color: #2563eb;
      }
      .card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 16px;
      }
    </style>
  </head>
  <body>
    <header>
      <h1>Allgemeine Geschäftsbedingungen (AGB)</h1>
      <p>Diese Bedingungen regeln die Nutzung der MedBattle App und der zugehörigen Dienste.</p>
      <p>Stand: 2026-01-12</p>
    </header>

    <div class="card">
      <h2>Geltungsbereich</h2>
      <p>Mit der Nutzung der App akzeptierst du diese Bedingungen. Sie gelten für alle Funktionen der App.</p>

      <h2>Leistungen</h2>
      <p>MedBattle ist ein Lern- und Quizspiel. Inhalte dienen der Wissensübung und ersetzen keine medizinische Beratung.</p>

      <h2>Accounts</h2>
      <ul>
        <li>Du kannst dich mit E-Mail/Passwort oder OAuth anmelden.</li>
        <li>Du bist für die Sicherheit deiner Zugangsdaten verantwortlich.</li>
        <li>Wir dürfen Accounts sperren, wenn gegen diese Bedingungen verstoßen wird.</li>
      </ul>

      <h2>Gastmodus</h2>
      <ul>
        <li>Im Gastmodus sind einige Funktionen eingeschränkt.</li>
        <li>Gastdaten werden lokal auf dem Gerät gespeichert und können verloren gehen.</li>
      </ul>

      <h2>Pflichten der Nutzer</h2>
      <ul>
        <li>Keine Weitergabe von Zugangsdaten an Dritte.</li>
        <li>Keine Manipulation von Scores oder Ranglisten.</li>
        <li>Kein Missbrauch von Multiplayer- oder Kommunikationsfunktionen.</li>
      </ul>

      <h2>Nutzungsrechte</h2>
      <p>Wir räumen dir ein einfaches, nicht übertragbares Recht ein, die App für private Zwecke zu nutzen. Inhalte bleiben urheberrechtlich geschützt.</p>

      <h2>Verbotene Nutzung</h2>
      <ul>
        <li>Kein Reverse Engineering, keine Umgehung von Schutzmaßnahmen.</li>
        <li>Keine automatisierten Zugriffe oder Bots.</li>
        <li>Keine Angriffe auf Server oder andere Nutzer.</li>
      </ul>

      <h2>Inhalte und Fortschritt</h2>
      <p>Fortschritt und Ranglisten können bei Regelverstößen angepasst oder entfernt werden.</p>

      <h2>Premium, Käufe und Werbung</h2>
      <ul>
        <li>Optionale Käufe und Premium-Funktionen sind innerhalb der App verfügbar.</li>
        <li>Abrechnung erfolgt über den jeweiligen App-Store.</li>
        <li>Die kostenlose Version kann Werbung enthalten.</li>
      </ul>

      <h2>Verfügbarkeit</h2>
      <p>Wir bemühen uns um eine stabile App, können jedoch keine dauerhafte Verfügbarkeit garantieren.</p>

      <h2>Haftung</h2>
      <p>Wir haften nur für Schäden, die durch Vorsatz oder grobe Fahrlässigkeit verursacht wurden, soweit gesetzlich zulässig.</p>

      <h2>Datenschutz</h2>
      <p>Informationen zur Datenverarbeitung findest du in der Datenschutzerklärung der App.</p>

      <h2>Änderungen</h2>
      <p>Wir können diese Bedingungen aktualisieren. Die aktuelle Version ist unter dem Link in der App erreichbar.</p>

      <h2>Kontakt</h2>
      <p>
        Fragen zu den AGB kannst du an
        <a href="mailto:babyjeje24@gmail.com">babyjeje24@gmail.com</a>
        senden.
      </p>
    </div>
  </body>
</html>`;

const supportHtml = `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Support - MedBattle</title>
    <style>
      :root {
        color-scheme: light;
      }
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        margin: 0;
        padding: 24px;
        line-height: 1.6;
        color: #0f172a;
        background: #f8fafc;
      }
      header {
        margin-bottom: 16px;
      }
      h1 {
        margin: 0 0 8px 0;
        font-size: 28px;
      }
      h2 {
        margin: 24px 0 8px 0;
        font-size: 18px;
      }
      p, li {
        font-size: 14px;
      }
      a {
        color: #2563eb;
      }
      .card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 16px;
      }
    </style>
  </head>
  <body>
    <header>
      <h1>Support</h1>
      <p>Wir helfen dir gerne weiter.</p>
      <p>Stand: 2026-01-12</p>
    </header>

    <div class="card">
      <h2>Kontakt</h2>
      <p>
        Schreibe uns an
        <a href="mailto:babyjeje24@gmail.com">babyjeje24@gmail.com</a>.
      </p>
      <p>Typische Antwortzeit: 1-3 Werktage.</p>

      <h2>FAQ</h2>
      <ul>
        <li>Login-Probleme: prüfe deine Verbindung und Passwort/Provider.</li>
        <li>Käufe nicht freigeschaltet: App neu starten und im Store prüfen.</li>
        <li>Multiplayer-Fehler: Lobby neu erstellen oder erneut beitreten.</li>
        <li>Werbung: prüfe deine Netzwerkverbindung und ob Tracking erlaubt ist.</li>
      </ul>

      <h2>Was wir brauchen</h2>
      <ul>
        <li>App-Version und Gerätemodell.</li>
        <li>Android/iOS Version.</li>
        <li>Kurze Beschreibung des Problems und wann es auftritt.</li>
        <li>Optional: Screenshot oder Bildschirmaufnahme.</li>
      </ul>

      <h2>Fehler melden</h2>
      <p>
        Bitte sende uns eine kurze Beschreibung, dein Gerät, die App-Version
        und den Zeitpunkt des Fehlers.
      </p>
    </div>
  </body>
</html>`;

const documents = {
  privacy: privacyHtml,
  terms: termsHtml,
  support: supportHtml,
};

serve((request) => {
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/').filter(Boolean);
  const docFromPath = pathParts.length > 1 ? pathParts[1] : null;
  const doc = (docFromPath || url.searchParams.get('doc') || '').toLowerCase();
  const html = documents[doc as keyof typeof documents];

  if (!html) {
    return new Response('Not found', {
      status: 404,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    });
  }

  return new Response(html, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'max-age=300',
    },
  });
});
