export const LEGAL_CONTACT_EMAIL = 'medbattle1@gmail.com';

const LEGAL_DOCS_DE = {
  privacy: {
    id: 'privacy',
    title: 'Datenschutz',
    updatedAt: '2026-03-10',
    intro:
      'MedBattle ist eine Quiz-App für Medizinwissen. Diese Hinweise erklären, welche Daten wir verarbeiten und warum.',
    sections: [
      {
        heading: 'Verantwortlicher',
        paragraphs: [
          'Verantwortlich für die Datenverarbeitung ist das MedBattle Team.',
          `Kontakt: ${LEGAL_CONTACT_EMAIL}`,
        ],
      },
      {
        heading: 'Welche Daten wir verarbeiten',
        bullets: [
          'Accountdaten: E-Mail, Nutzername, Provider-IDs, zum Beispiel Google oder Discord.',
          'Profil- und Spieldaten: Scores, Streaks, Achievements und Lobby-Status.',
          'Optionale Profilfotos: nur wenn du Kamera oder Galerie für deinen Avatar nutzt.',
          'Geräte- und Nutzungsdaten: App-Version, Betriebssystem, Crash-Logs und Diagnosedaten.',
          'Werbe- und Kaufdaten: Werbe-IDs und Kaufbelege, soweit relevant.',
          'Gastmodus-Daten: lokale Gast-ID und Einstellungen auf deinem Gerät.',
          'Kommunikationsdaten: Inhalte von Support-Anfragen, die du an uns sendest.',
        ],
      },
      {
        heading: 'Zwecke der Verarbeitung',
        bullets: [
          'Login, Account-Schutz und Sicherheit.',
          'Gameplay, Matchmaking, Ranglisten und Fortschritt.',
          'Fehleranalyse und App-Stabilität.',
          'Abrechnung von Premium/Käufen und Auslieferung von Werbung.',
          'Support und Bearbeitung deiner Anfragen.',
        ],
      },
      {
        heading: 'Rechtsgrundlagen (DSGVO)',
        bullets: [
          'Vertrag bzw. Leistungserbringung (Art. 6 Abs. 1 lit. b DSGVO).',
          'Einwilligung, zum Beispiel für Werbung oder Tracking (Art. 6 Abs. 1 lit. a DSGVO).',
          'Berechtigte Interessen, zum Beispiel Sicherheit und Fehleranalyse (Art. 6 Abs. 1 lit. f DSGVO).',
          'Rechtliche Pflichten, zum Beispiel Abrechnung (Art. 6 Abs. 1 lit. c DSGVO).',
        ],
      },
      {
        heading: 'Empfänger und Dienstleister',
        bullets: [
          'Supabase für Auth, Datenbank und Storage.',
          'Google oder Discord für OAuth-Login.',
          'Interne redigierte Client-Logs für Crash-Diagnosen ohne externen Telemetry-Provider.',
          'Google AdMob für Werbung.',
          'App-Store-Anbieter für In-App-Käufe, also Apple oder Google.',
        ],
      },
      {
        heading: 'Drittländer, Speicherdauer und Rechte',
        paragraphs: [
          'Einige Dienstleister können Daten außerhalb der EU verarbeiten, zum Beispiel in den USA. Wir nutzen dafür Standardvertragsklauseln oder vergleichbare Schutzmaßnahmen.',
          'Wir speichern Daten nur so lange, wie es für den Betrieb der App, rechtliche Pflichten oder Sicherheitszwecke erforderlich ist.',
        ],
        bullets: [
          'Auskunft, Berichtigung, Löschung und Einschränkung.',
          'Datenübertragbarkeit.',
          'Widerspruch und Widerruf erteilter Einwilligungen.',
          'Beschwerde bei einer Aufsichtsbehörde.',
        ],
      },
      {
        heading: 'Werbung und Einwilligung im EWR',
        paragraphs: [
          'Rewarded Ads werden derzeit als nicht personalisierte Werbung angefragt (`requestNonPersonalizedAdsOnly: true`).',
          'Falls wir personalisierte Werbung oder zusätzliche Tracking-Dienste einführen, aktualisieren wir diese Hinweise und den Consent-Flow vor dem Rollout.',
        ],
      },
      {
        heading: 'DSAR-Prozess und SLA',
        paragraphs: [
          `Für Auskunfts-, Berichtigungs- oder Löschanfragen kontaktiere uns unter ${LEGAL_CONTACT_EMAIL}.`,
          'Wir bestätigen den Eingang innerhalb von 72 Stunden und bearbeiten Anfragen in der Regel innerhalb von 30 Tagen (Art. 12 Abs. 3 DSGVO). Wenn rechtlich zulässig und erforderlich, kann diese Frist um bis zu 60 Tage verlängert werden.',
          'Vor der Bearbeitung können wir eine Identitätsprüfung verlangen, um Kontodaten zu schützen.',
        ],
      },
      {
        heading: 'Hinweise',
        paragraphs: [
          'MedBattle ist ein Lernspiel und kein Medizinprodukt. Die App diagnostiziert, behandelt, heilt oder verhindert keine Erkrankungen und ersetzt keine medizinische Beratung.',
          'Wir aktualisieren diese Hinweise bei Bedarf.',
        ],
      },
    ],
  },
  terms: {
    id: 'terms',
    title: 'AGB',
    updatedAt: '2026-03-10',
    intro:
      'Diese Bedingungen regeln die Nutzung der MedBattle App und der zugehörigen Dienste.',
    sections: [
      {
        heading: 'Geltungsbereich und Leistungen',
        paragraphs: [
          'Mit der Nutzung der App akzeptierst du diese Bedingungen.',
          'MedBattle ist ein Lern- und Quizspiel und kein Medizinprodukt. Die App diagnostiziert, behandelt, heilt oder verhindert keine Erkrankungen und ersetzt keine medizinische Beratung.',
        ],
      },
      {
        heading: 'Accounts und Gastmodus',
        bullets: [
          'Die Anmeldung ist per E-Mail/Passwort oder OAuth möglich.',
          'Du bist für die Sicherheit deiner Zugangsdaten verantwortlich.',
          'Wir dürfen Accounts bei Verstößen sperren.',
          'Der Gastmodus hat eingeschränkte Funktionen und lokale Daten können verloren gehen.',
        ],
      },
      {
        heading: 'Pflichten und verbotene Nutzung',
        bullets: [
          'Keine Weitergabe von Zugangsdaten an Dritte.',
          'Keine Manipulation von Scores oder Ranglisten.',
          'Kein Missbrauch von Multiplayer- oder Kommunikationsfunktionen.',
          'Kein Reverse Engineering, keine Bots und keine Angriffe auf Infrastruktur oder andere Nutzer.',
        ],
      },
      {
        heading: 'Käufe, Werbung, Verfügbarkeit und Haftung',
        paragraphs: [
          'Optionale Käufe und Premium-Funktionen sind in der App verfügbar; die Abrechnung läuft über den jeweiligen App-Store.',
          'Die kostenlose Version kann Werbung enthalten.',
          'Wir bemühen uns um eine stabile Verfügbarkeit, können aber keinen unterbrechungsfreien Betrieb garantieren.',
          'Die Haftung ist auf den gesetzlich zulässigen Umfang beschränkt.',
        ],
      },
      {
        heading: 'Datenschutz, Änderungen und Kontakt',
        paragraphs: [
          'Informationen zur Datenverarbeitung findest du in der Datenschutzerklärung.',
          'Wir können diese Bedingungen aktualisieren; die jeweils aktuelle Version ist in der App verfügbar.',
          `Kontakt: ${LEGAL_CONTACT_EMAIL}`,
        ],
      },
    ],
  },
  support: {
    id: 'support',
    title: 'Support',
    updatedAt: '2026-03-10',
    intro: 'Wir helfen dir gerne weiter.',
    sections: [
      {
        heading: 'Kontakt',
        paragraphs: [
          `Schreibe uns an ${LEGAL_CONTACT_EMAIL}.`,
          'Typische Antwortzeit: 1 bis 3 Werktage.',
        ],
      },
      {
        heading: 'FAQ',
        bullets: [
          'Login-Probleme: prüfe Verbindung und Zugangsdaten.',
          'Fehlende Käufe: starte die App neu und prüfe dein Store-Konto.',
          'Multiplayer-Probleme: erstelle eine neue Lobby oder tritt erneut bei.',
          'Werbe-Probleme: prüfe Netzwerk und Tracking-Einstellungen.',
        ],
      },
      {
        heading: 'Bitte mitschicken',
        bullets: [
          'App-Version und Gerätemodell.',
          'Android- oder iOS-Version.',
          'Kurze Problembeschreibung mit Uhrzeit.',
          'Optional einen Screenshot oder eine Bildschirmaufnahme.',
        ],
      },
    ],
  },
  deleteAccount: {
    id: 'deleteAccount',
    title: 'Konto löschen',
    updatedAt: '2026-03-11',
    intro:
      'Hier kannst du dein MedBattle-Konto direkt löschen oder alternativ eine Löschanfrage senden.',
    sections: [
      {
        heading: 'Direkt in der App',
        paragraphs: [
          'Wenn du angemeldet bist, tippe unten auf "Konto dauerhaft löschen".',
          'Zur Sicherheit bestätigst du die Löschung noch einmal, bevor sie ausgeführt wird.',
        ],
      },
      {
        heading: 'Alternative ohne App',
        paragraphs: [
          `Falls du keinen Zugriff auf die App hast, nutze unsere öffentliche Löschseite oder schreibe an ${LEGAL_CONTACT_EMAIL}.`,
          'Bitte verwende möglichst die E-Mail-Adresse deines Kontos, damit wir die Anfrage zuordnen können.',
        ],
      },
      {
        heading: 'Was gelöscht wird',
        bullets: [
          'Dein Konto und Profilangaben.',
          'Spiel- und Fortschrittsdaten, soweit keine gesetzlichen Pflichten entgegenstehen.',
          'Optional hochgeladene Avatar-Fotos in unserem Storage.',
        ],
      },
      {
        heading: 'Wichtige Hinweise',
        bullets: [
          'Käufe im App-Store bleiben gegebenenfalls in deiner Store-Historie sichtbar.',
          'Abrechnungs- oder sicherheitsrelevante Daten können wir ggf. vorübergehend länger speichern, wenn wir rechtlich dazu verpflichtet sind.',
          'Nach Abschluss ist die Löschung in der Regel nicht rückgängig zu machen.',
        ],
      },
    ],
  },
};

const LEGAL_DOCS_EN = {
  privacy: {
    id: 'privacy',
    title: 'Privacy Policy',
    updatedAt: '2026-03-10',
    intro:
      'MedBattle is a quiz app for medical knowledge. This notice explains what data we process and why.',
    sections: [
      {
        heading: 'Responsible Party',
        paragraphs: [
          'The MedBattle team is responsible for data processing.',
          `Contact: ${LEGAL_CONTACT_EMAIL}`,
        ],
      },
      {
        heading: 'Data We Process',
        bullets: [
          'Account data: email, username, provider IDs such as Google or Discord.',
          'Profile and gameplay data: scores, streaks, achievements, and lobby status.',
          'Optional profile photos: only if you choose camera or gallery for your avatar.',
          'Device and usage data: app version, OS, crash logs, and diagnostics.',
          'Advertising and purchase data: ad IDs and purchase receipts where applicable.',
          'Guest mode data: local guest ID and settings on your device.',
          'Communication data: the content of support requests you send us.',
        ],
      },
      {
        heading: 'Purposes of Processing',
        bullets: [
          'Login, account protection, and security.',
          'Gameplay, matchmaking, leaderboards, and progress.',
          'Error analysis and app stability.',
          'Billing for premium features or purchases and ad delivery.',
          'Support and handling of your requests.',
        ],
      },
      {
        heading: 'Legal Bases (GDPR)',
        bullets: [
          'Contract or service performance (Art. 6(1)(b) GDPR).',
          'Consent, for example for ads or tracking (Art. 6(1)(a) GDPR).',
          'Legitimate interests, for example security and error analysis (Art. 6(1)(f) GDPR).',
          'Legal obligations, for example billing (Art. 6(1)(c) GDPR).',
        ],
      },
      {
        heading: 'Recipients and Service Providers',
        bullets: [
          'Supabase for auth, database, and storage.',
          'Google or Discord for OAuth login.',
          'Internal redacted client logs for crash diagnostics without an external telemetry provider.',
          'Google AdMob for advertising.',
          'App store providers for in-app purchases, such as Apple or Google.',
        ],
      },
      {
        heading: 'Third Countries, Retention, and Rights',
        paragraphs: [
          'Some providers may process data outside the EU, for example in the USA. We use standard contractual clauses or comparable safeguards.',
          'We keep data only as long as needed for app operation, legal obligations, or security purposes.',
        ],
        bullets: [
          'Access, rectification, deletion, and restriction.',
          'Data portability.',
          'Objection and withdrawal of consent.',
          'Complaint to a supervisory authority.',
        ],
      },
      {
        heading: 'Ads and EEA Consent',
        paragraphs: [
          'Rewarded ads are currently requested as non-personalized (`requestNonPersonalizedAdsOnly: true`).',
          'If we introduce personalized ads or additional tracking, we will update this notice and the consent flow before rollout.',
        ],
      },
      {
        heading: 'DSAR Process and SLA',
        paragraphs: [
          `For access, rectification, or deletion requests, contact us at ${LEGAL_CONTACT_EMAIL}.`,
          'We confirm receipt within 72 hours and usually complete requests within 30 days (GDPR Art. 12(3)). If legally allowed and required, this can be extended by up to 60 more days.',
          'Before processing, we may request identity verification to protect account data.',
        ],
      },
      {
        heading: 'Notes',
        paragraphs: [
          'MedBattle is a learning game and not a medical device. It does not diagnose, treat, cure, or prevent any disease and does not replace medical advice.',
          'We update this notice when needed.',
        ],
      },
    ],
  },
  terms: {
    id: 'terms',
    title: 'Terms of Service',
    updatedAt: '2026-03-10',
    intro: 'These terms govern the use of the MedBattle app and related services.',
    sections: [
      {
        heading: 'Scope and Services',
        paragraphs: [
          'By using the app, you accept these terms.',
          'MedBattle is a learning and quiz game and not a medical device. It does not diagnose, treat, cure, or prevent any disease and does not replace medical advice.',
        ],
      },
      {
        heading: 'Accounts and Guest Mode',
        bullets: [
          'Login is available with email/password or OAuth.',
          'You are responsible for keeping your credentials secure.',
          'We may suspend accounts for violations.',
          'Guest mode has limited features and local data can be lost.',
        ],
      },
      {
        heading: 'User Obligations and Prohibited Use',
        bullets: [
          'Do not share account credentials with third parties.',
          'Do not manipulate scores or leaderboards.',
          'Do not abuse multiplayer or communication features.',
          'No reverse engineering, bots, or attacks against infrastructure or users.',
        ],
      },
      {
        heading: 'Purchases, Ads, Availability, and Liability',
        paragraphs: [
          'Optional purchases and premium features are available in the app; billing is handled by the app store.',
          'The free version may include advertisements.',
          'We aim for stable availability but cannot guarantee uninterrupted service.',
          'Liability is limited to the extent permitted by law.',
        ],
      },
      {
        heading: 'Privacy, Changes, and Contact',
        paragraphs: [
          'Information about data processing is available in the privacy policy.',
          'We may update these terms; the latest version is available in the app.',
          `Contact: ${LEGAL_CONTACT_EMAIL}`,
        ],
      },
    ],
  },
  support: {
    id: 'support',
    title: 'Support',
    updatedAt: '2026-03-10',
    intro: 'We are happy to help.',
    sections: [
      {
        heading: 'Contact',
        paragraphs: [
          `Write to us at ${LEGAL_CONTACT_EMAIL}.`,
          'Typical response time: 1 to 3 business days.',
        ],
      },
      {
        heading: 'FAQ',
        bullets: [
          'Login issues: check your connection and credentials.',
          'Missing purchases: restart the app and verify your store account.',
          'Multiplayer issues: create a new lobby or rejoin.',
          'Ad issues: check your network and tracking settings.',
        ],
      },
      {
        heading: 'Please Include',
        bullets: [
          'App version and device model.',
          'Android or iOS version.',
          'Short issue description with time.',
          'Optional screenshot or screen recording.',
        ],
      },
    ],
  },
  deleteAccount: {
    id: 'deleteAccount',
    title: 'Delete Account',
    updatedAt: '2026-03-11',
    intro:
      'Here you can delete your MedBattle account directly or use a deletion request as a fallback.',
    sections: [
      {
        heading: 'Directly in the app',
        paragraphs: [
          'If you are signed in, tap "Delete account permanently" below.',
          'For safety, you will be asked to confirm the deletion once before it runs.',
        ],
      },
      {
        heading: 'Alternative without the app',
        paragraphs: [
          `If you cannot access the app, use our public deletion page or email ${LEGAL_CONTACT_EMAIL}.`,
          'Please send the request from your account email address whenever possible so we can match it correctly.',
        ],
      },
      {
        heading: 'What will be deleted',
        bullets: [
          'Your account and profile details.',
          'Gameplay and progress data unless legal obligations require temporary retention.',
          'Optional avatar photos uploaded to our storage.',
        ],
      },
      {
        heading: 'Important notes',
        bullets: [
          'App store purchases may still remain visible in your store history.',
          'Billing or security-related records may need to be retained temporarily where legally required.',
          'Deletion is usually not reversible once completed.',
        ],
      },
    ],
  },
};

export function getLegalDocs(locale = 'de') {
  const normalizedLocale =
    typeof locale === 'string' ? locale.toLowerCase() : 'de';
  return normalizedLocale.startsWith('de') ? LEGAL_DOCS_DE : LEGAL_DOCS_EN;
}

export const LEGAL_DOCS = LEGAL_DOCS_DE;
