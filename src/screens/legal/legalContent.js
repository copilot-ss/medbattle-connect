export const LEGAL_CONTACT_EMAIL = 'babyjeje24@gmail.com';

export const LEGAL_DOCS = {
  privacy: {
    id: 'privacy',
    title: 'Datenschutz',
    updatedAt: '2026-01-12',
    intro:
      'MedBattle ist eine Quiz-App fuer Medizinwissen. Diese Hinweise erklaeren, welche Daten wir verarbeiten und warum.',
    sections: [
      {
        heading: 'Verantwortlicher',
        paragraphs: [
          'Verantwortlich fuer die Datenverarbeitung ist das MedBattle Team.',
          `Kontakt: ${LEGAL_CONTACT_EMAIL}`,
        ],
      },
      {
        heading: 'Welche Daten wir verarbeiten',
        bullets: [
          'Accountdaten: E-Mail, Nutzername, Provider-IDs (z.B. Google, Discord).',
          'Profil- und Spielwerte: Scores, Streaks, Achievements, Lobby-Status.',
          'Geraete- und Nutzungsdaten: App-Version, OS, Crash-Logs, Diagnose-Infos.',
          'Werbe- und Kaufdaten: Werbe-IDs und Kaufbelege, falls genutzt.',
          'Gastmodus: lokale Gast-ID und Einstellungen auf dem Geraet.',
          'Kommunikation: Inhalte deiner Support-Anfragen.',
        ],
      },
      {
        heading: 'Zwecke der Verarbeitung',
        bullets: [
          'Login, Account-Schutz und Sicherheit.',
          'Gameplay, Matchmaking, Ranglisten und Fortschritt.',
          'Fehleranalyse und Stabilitaet.',
          'Abrechnung von Premium/Kaeufen und Auslieferung von Werbung.',
          'Support und Beantwortung deiner Anfragen.',
        ],
      },
      {
        heading: 'Rechtsgrundlagen (DSGVO)',
        bullets: [
          'Vertrag/Leistungserbringung (Art. 6 Abs. 1 lit. b DSGVO).',
          'Einwilligung, z.B. fuer Werbung/Tracking (Art. 6 Abs. 1 lit. a DSGVO).',
          'Berechtigtes Interesse, z.B. Sicherheits- und Fehleranalyse (Art. 6 Abs. 1 lit. f DSGVO).',
          'Rechtliche Pflichten, z.B. Abrechnung (Art. 6 Abs. 1 lit. c DSGVO).',
        ],
      },
      {
        heading: 'Empfaenger und Dienstleister',
        bullets: [
          'Supabase (Auth, Datenbank, Storage).',
          'Google/Discord (OAuth-Login).',
          'Sentry oder vergleichbare Telemetrie fuer Crash-Reports.',
          'Google AdMob fuer Werbung.',
          'App-Store Provider fuer In-App-Kaeufe (Apple/Google).',
        ],
      },
      {
        heading: 'Drittlaender, Speicherdauer, Rechte',
        paragraphs: [
          'Einige Dienstleister koennen Daten ausserhalb der EU verarbeiten (z.B. USA). Dabei nutzen wir Standardvertragsklauseln oder vergleichbare Schutzmassnahmen.',
          'Wir speichern Daten nur so lange, wie es fuer den Betrieb der App, rechtliche Pflichten oder Sicherheitszwecke erforderlich ist.',
        ],
        bullets: [
          'Auskunft, Berichtigung, Loeschung, Einschraenkung.',
          'Datenuebertragbarkeit.',
          'Widerspruch und Widerruf von Einwilligungen.',
          'Beschwerde bei einer Aufsichtsbehoerde.',
        ],
      },
      {
        heading: 'Hinweise',
        paragraphs: [
          'MedBattle ist ein Lernspiel und ersetzt keine medizinische Beratung.',
          'Die App richtet sich nicht an Kinder unter 13 Jahren.',
          'Wir aktualisieren diese Hinweise bei Bedarf.',
        ],
      },
    ],
  },
  terms: {
    id: 'terms',
    title: 'AGB',
    updatedAt: '2026-01-12',
    intro: 'Diese Bedingungen regeln die Nutzung der MedBattle App und der zugehoerigen Dienste.',
    sections: [
      {
        heading: 'Geltungsbereich und Leistungen',
        paragraphs: [
          'Mit der Nutzung der App akzeptierst du diese Bedingungen.',
          'MedBattle ist ein Lern- und Quizspiel und ersetzt keine medizinische Beratung.',
        ],
      },
      {
        heading: 'Accounts und Gastmodus',
        bullets: [
          'Login mit E-Mail/Passwort oder OAuth.',
          'Du bist fuer die Sicherheit deiner Zugangsdaten verantwortlich.',
          'Wir duerfen Accounts bei Verstoessen sperren.',
          'Im Gastmodus sind Funktionen eingeschraenkt und lokale Daten koennen verloren gehen.',
        ],
      },
      {
        heading: 'Pflichten und verbotene Nutzung',
        bullets: [
          'Keine Weitergabe von Zugangsdaten an Dritte.',
          'Keine Manipulation von Scores oder Ranglisten.',
          'Kein Missbrauch von Multiplayer- oder Kommunikationsfunktionen.',
          'Kein Reverse Engineering, keine Bots, keine Angriffe auf Infrastruktur oder Nutzer.',
        ],
      },
      {
        heading: 'Kaeufe, Werbung, Verfuegbarkeit, Haftung',
        paragraphs: [
          'Optionale Kaeufe und Premium-Funktionen sind in der App verfuegbar; Abrechnung erfolgt ueber den App-Store.',
          'Die kostenlose Version kann Werbung enthalten.',
          'Wir bemuehen uns um stabile Verfuegbarkeit, koennen diese aber nicht dauerhaft garantieren.',
          'Haftung nur im gesetzlich zulaessigen Rahmen.',
        ],
      },
      {
        heading: 'Datenschutz, Aenderungen, Kontakt',
        paragraphs: [
          'Informationen zur Datenverarbeitung findest du in der Datenschutzerklaerung.',
          'Wir koennen diese Bedingungen aktualisieren; die aktuelle Version ist in der App abrufbar.',
          `Kontakt: ${LEGAL_CONTACT_EMAIL}`,
        ],
      },
    ],
  },
  support: {
    id: 'support',
    title: 'Support',
    updatedAt: '2026-01-12',
    intro: 'Wir helfen dir gerne weiter.',
    sections: [
      {
        heading: 'Kontakt',
        paragraphs: [
          `Schreibe uns an ${LEGAL_CONTACT_EMAIL}.`,
          'Typische Antwortzeit: 1-3 Werktage.',
        ],
      },
      {
        heading: 'FAQ',
        bullets: [
          'Login-Probleme: Verbindung und Zugangsdaten pruefen.',
          'Kaeufe fehlen: App neu starten und Store-Konto pruefen.',
          'Multiplayer-Probleme: Lobby neu erstellen oder erneut beitreten.',
          'Werbeprobleme: Netzwerk und Tracking-Einstellungen pruefen.',
        ],
      },
      {
        heading: 'Bitte mitschicken',
        bullets: [
          'App-Version und Geraetemodell.',
          'Android/iOS-Version.',
          'Kurze Fehlerbeschreibung mit Zeitpunkt.',
          'Optional Screenshot oder Screen-Recording.',
        ],
      },
    ],
  },
};

export const LEGAL_EXTERNAL_URLS = {
  privacy: process.env.EXPO_PUBLIC_PRIVACY_URL,
  terms: process.env.EXPO_PUBLIC_TERMS_URL,
  support: process.env.EXPO_PUBLIC_SUPPORT_URL,
};

