export const LEGAL_CONTACT_EMAIL = 'medbattle1@gmail.com';

const LEGAL_DOCS_DE = {
  privacy: {
    id: 'privacy',
    title: 'Datenschutz',
    updatedAt: '2026-04-13',
    intro:
      'MedQuiz ist eine Quiz-App fuer Medizinwissen. Diese Hinweise erklaeren, welche Daten wir verarbeiten und warum.',
    sections: [
      {
        heading: 'Verantwortlicher',
        paragraphs: [
          'Verantwortlich fuer die Datenverarbeitung ist CoppiCodes als Publisher von MedQuiz.',
          `Kontakt: ${LEGAL_CONTACT_EMAIL}`,
        ],
      },
      {
        heading: 'Welche Daten wir verarbeiten',
        bullets: [
          'Accountdaten: E-Mail, Nutzername, Provider-IDs, zum Beispiel Google oder Discord.',
          'Profil- und Spieldaten: Scores, Streaks, Achievements, Ranglisten und Lobby-Status.',
          'Optionale Profilfotos: nur wenn du Kamera oder Galerie fuer deinen Avatar nutzt.',
          'Geraete- und Nutzungsdaten: App-Version, Betriebssystem, redigierte Crash-Logs und Diagnosedaten.',
          'Werbe- und Kaufdaten: Werbe-IDs und Kauf- oder Entitlement-Metadaten, soweit relevant.',
          'Gastmodus-Daten: lokale Gast-ID und Einstellungen auf deinem Geraet.',
          'Lokale Blocklisten- und Safety-Einstellungen auf deinem Geraet, wenn du andere Nutzer blockierst.',
          'Kommunikationsdaten: Inhalte von Support-Anfragen, die du an uns sendest.',
          'Missbrauchsmeldungen, zum Beispiel gemeldete Nutzernamen, Screenshots und Moderationskontext.',
        ],
      },
      {
        heading: 'Zwecke der Verarbeitung',
        bullets: [
          'Login, Account-Schutz und Sicherheit.',
          'Gameplay, Matchmaking, Ranglisten und Fortschritt.',
          'Fehleranalyse und App-Stabilitaet.',
          'Bearbeitung von Missbrauchsmeldungen, lokalen Blockierungen und Social-Safety-Funktionen.',
          'Abrechnung von Premium/Kaeufen und Auslieferung von Werbung.',
          'Support und Bearbeitung deiner Anfragen.',
        ],
      },
      {
        heading: 'Rechtsgrundlagen (DSGVO)',
        bullets: [
          'Vertrag bzw. Leistungserbringung (Art. 6 Abs. 1 lit. b DSGVO).',
          'Einwilligung, zum Beispiel fuer Werbung oder Tracking (Art. 6 Abs. 1 lit. a DSGVO).',
          'Berechtigte Interessen, zum Beispiel Sicherheit und Fehleranalyse (Art. 6 Abs. 1 lit. f DSGVO).',
          'Rechtliche Pflichten, zum Beispiel Abrechnung (Art. 6 Abs. 1 lit. c DSGVO).',
        ],
      },
      {
        heading: 'Empfaenger und Dienstleister',
        bullets: [
          'Supabase fuer Auth, Datenbank und Storage.',
          'Google oder Discord fuer OAuth-Login.',
          'Interne redigierte Client-Logs fuer Crash-Diagnosen ohne externen Telemetry-Provider.',
          'Google AdMob fuer Werbung.',
          'App-Store-Anbieter fuer In-App-Kaeufe, also Apple oder Google.',
        ],
      },
      {
        heading: 'Sichere Datenverarbeitung',
        bullets: [
          'Wir uebertragen personenbezogene Daten ueber verschluesselte Verbindungen wie HTTPS/TLS.',
          'Auf Kontodaten greifen nur die Systeme und Dienstleister zu, die fuer den Betrieb von MedQuiz erforderlich sind.',
          'Client-Fehler- und Diagnosedaten werden vor der Speicherung redigiert.',
          'Du bist selbst dafuer verantwortlich, deine Zugangsdaten auf deinen Geraeten sicher aufzubewahren.',
        ],
      },
      {
        heading: 'Drittlaender und Speicherdauer',
        paragraphs: [
          'Einige Dienstleister koennen Daten ausserhalb der EU verarbeiten, zum Beispiel in den USA. Wir nutzen dafuer Standardvertragsklauseln oder vergleichbare Schutzmassnahmen.',
        ],
        bullets: [
          'Account-, Profil-, Spiel-, Ranglisten- und Avatar-Daten: solange dein Konto aktiv ist. Nach einer Kontoloeschung loeschen wir diese Daten in der Regel sofort, spaetestens innerhalb von 30 Tagen, sofern keine gesetzlichen oder sicherheitsrelevanten Gruende entgegenstehen.',
          'Gastmodus-, lokale Blocklisten- und Einstellungsdaten, die nur lokal auf deinem Geraet liegen: bis du App-Daten loeschst, Nutzer entsperrst oder die App deinstallierst.',
          'Redigierte Crash- und Diagnosedaten: in der Regel bis zu 90 Tage.',
          'Support-Anfragen und Missbrauchsmeldungen: bis zur Bearbeitung und danach bis zu 24 Monate fuer Rueckfragen, Moderation oder Richtliniennachweise.',
          'Abrechnungs-, Steuer-, Betrugs- oder Sicherheitsnachweise, die wir rechtlich aufbewahren muessen: bis zu 10 Jahre.',
        ],
      },
      {
        heading: 'Deine Rechte',
        bullets: [
          'Auskunft, Berichtigung, Loeschung und Einschraenkung.',
          'Datenuebertragbarkeit.',
          'Widerspruch und Widerruf erteilter Einwilligungen.',
          'Beschwerde bei einer Aufsichtsbehoerde.',
        ],
      },
      {
        heading: 'Werbung und Einwilligung im EWR',
        paragraphs: [
          'Rewarded Ads werden derzeit als nicht personalisierte Werbung angefragt (`requestNonPersonalizedAdsOnly: true`).',
          'Falls wir personalisierte Werbung oder zusaetzliche Tracking-Dienste einfuehren, aktualisieren wir diese Hinweise und den Consent-Flow vor dem Rollout.',
        ],
      },
      {
        heading: 'DSAR-Prozess und SLA',
        paragraphs: [
          `Fuer Auskunfts-, Berichtigungs- oder Loeschanfragen kontaktiere uns unter ${LEGAL_CONTACT_EMAIL}.`,
          'Wir bestaetigen den Eingang innerhalb von 72 Stunden und bearbeiten Anfragen in der Regel innerhalb von 30 Tagen (Art. 12 Abs. 3 DSGVO). Wenn rechtlich zulaessig und erforderlich, kann diese Frist um bis zu 60 Tage verlaengert werden.',
          'Vor der Bearbeitung koennen wir eine Identitaetspruefung verlangen, um Kontodaten zu schuetzen.',
        ],
      },
      {
        heading: 'Hinweise',
        paragraphs: [
          'MedQuiz ist ein Lernspiel und kein Medizinprodukt. Die App diagnostiziert, behandelt, heilt oder verhindert keine Erkrankungen und ersetzt keine medizinische Beratung.',
          'Wenn du eine Diagnose, Behandlung oder individuellen medizinischen Rat brauchst, konsultiere qualifiziertes medizinisches Fachpersonal.',
          'Wir aktualisieren diese Hinweise bei Bedarf.',
        ],
      },
    ],
  },
  terms: {
    id: 'terms',
    title: 'AGB',
    updatedAt: '2026-04-13',
    intro:
      'Diese Bedingungen regeln die Nutzung der MedQuiz App und der zugehoerigen Dienste.',
    sections: [
      {
        heading: 'Geltungsbereich und Leistungen',
        paragraphs: [
          'Mit der Nutzung der App akzeptierst du diese Bedingungen.',
          'MedQuiz ist ein Lern- und Quizspiel und kein Medizinprodukt. Die App diagnostiziert, behandelt, heilt oder verhindert keine Erkrankungen und ersetzt keine medizinische Beratung.',
          'Wenn du eine Diagnose, Behandlung oder individuellen medizinischen Rat brauchst, konsultiere qualifiziertes medizinisches Fachpersonal.',
        ],
      },
      {
        heading: 'Accounts und Gastmodus',
        bullets: [
          'Die Anmeldung ist per E-Mail/Passwort oder OAuth moeglich.',
          'Du bist fuer die Sicherheit deiner Zugangsdaten verantwortlich.',
          'Vor sichtbaren Profilinhalten wie Nutzername oder Profilfoto musst du die aktuellen AGB und Datenschutzhinweise bestaetigen.',
          'Wir duerfen Accounts, Inhalte, Scores oder soziale Funktionen bei Verstoessen sperren, einschraenken oder entfernen.',
          'Der Gastmodus hat eingeschraenkte Funktionen und lokale Daten koennen verloren gehen.',
        ],
      },
      {
        heading: 'Pflichten und verbotene Nutzung',
        bullets: [
          'Keine Weitergabe von Zugangsdaten an Dritte.',
          'Keine Manipulation von Scores oder Ranglisten.',
          'Kein Missbrauch von Multiplayer- oder Kommunikationsfunktionen.',
          'Keine beleidigenden, hasserfuellten, sexuellen, gewaltbezogenen, rechtswidrigen, spamartigen oder identitaetstaeuschenden Nutzernamen, Profilfotos, Einladungen oder Multiplayer-Inhalte.',
          'Kein Reverse Engineering, keine Bots und keine Angriffe auf Infrastruktur oder andere Nutzer.',
        ],
      },
      {
        heading: 'Melden, Blockieren und Moderation',
        bullets: [
          'In unterstuetzten Profilansichten kannst du missbraeuchliche Nutzernamen, Profilfotos, Einladungen oder Spielerinteraktionen direkt in der App melden und andere Nutzer lokal auf deinem Geraet blockieren.',
          'Blockierte Nutzer koennen auf diesem Geraet in Freundeslisten, Freundesanfragen oder verwandten sozialen Interaktionen ausgeblendet werden.',
          'Wir duerfen Meldungen manuell pruefen und Inhalte entfernen oder Accounts und Social-Features einschraenken, wenn dies fuer Nutzersicherheit oder Richtlinien-Compliance erforderlich ist.',
        ],
      },
      {
        heading: 'Kaeufe, Werbung, Verfuegbarkeit und Haftung',
        paragraphs: [
          'Optionale Kaeufe und Premium-Funktionen sind in der App verfuegbar; die Abrechnung laeuft ueber den jeweiligen App-Store.',
          'Die kostenlose Version kann Werbung enthalten.',
          'Wir bemuehen uns um eine stabile Verfuegbarkeit, koennen aber keinen unterbrechungsfreien Betrieb garantieren.',
          'Die Haftung ist auf den gesetzlich zulaessigen Umfang beschraenkt.',
        ],
      },
      {
        heading: 'Datenschutz, Aenderungen und Kontakt',
        paragraphs: [
          'Informationen zur Datenverarbeitung findest du in der Datenschutzerklaerung.',
          'Wir koennen diese Bedingungen aktualisieren; die jeweils aktuelle Version ist in der App verfuegbar.',
          `Kontakt: ${LEGAL_CONTACT_EMAIL}`,
        ],
      },
    ],
  },
  support: {
    id: 'support',
    title: 'Support',
    updatedAt: '2026-04-13',
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
          'Login-Probleme: pruefe Verbindung und Zugangsdaten.',
          'Fehlende Kaeufe: starte die App neu und pruefe dein Store-Konto.',
          'Multiplayer-Probleme: erstelle eine neue Lobby oder tritt erneut bei.',
          'Werbe-Probleme: pruefe Netzwerk und Tracking-Einstellungen.',
          'Missbraeuchliche Nutzernamen, Profilfotos, Einladungen oder Spielerinteraktionen melden.',
        ],
      },
      {
        heading: 'Missbrauch melden',
        paragraphs: [
          'In unterstuetzten Profilansichten innerhalb der App kannst du direkt die Melden- und Blockieren-Funktionen nutzen.',
          `Wenn du einen missbraeuchlichen Nutzernamen, ein Profilfoto, eine Einladung oder problematisches Multiplayer-Verhalten melden moechtest, schreibe uns an ${LEGAL_CONTACT_EMAIL}.`,
          'Bitte nenne den betroffenen Nutzernamen und fuege nach Moeglichkeit eine kurze Beschreibung sowie einen Screenshot bei.',
        ],
      },
      {
        heading: 'Bitte mitschicken',
        bullets: [
          'App-Version und Geraetemodell.',
          'Android- oder iOS-Version.',
          'Kurze Problembeschreibung mit Uhrzeit.',
          'Optional einen Screenshot oder eine Bildschirmaufnahme.',
        ],
      },
    ],
  },
  deleteAccount: {
    id: 'deleteAccount',
    title: 'Konto loeschen',
    updatedAt: '2026-04-13',
    intro:
      'Offizielle Loeschseite fuer die Google-Play-App MedQuiz von CoppiCodes.',
    sections: [
      {
        heading: 'Direkt in der App',
        paragraphs: [
          'Der normale Weg ist direkt in der App.',
          'Wenn du angemeldet bist, tippe unten auf "Konto dauerhaft loeschen".',
          'Zur Sicherheit bestaetigst du die Loeschung noch einmal, bevor sie ausgefuehrt wird.',
        ],
      },
      {
        heading: 'Nur wenn du nicht mehr in die App kommst',
        paragraphs: [
          `Falls du keinen Zugriff auf die App mehr hast, nutze die offizielle oeffentliche Loeschseite fuer MedQuiz oder schreibe an ${LEGAL_CONTACT_EMAIL}.`,
          'Die oeffentliche Seite nennt MedQuiz, CoppiCodes und das Android-Paket com.sjigalin.medbattle eindeutig.',
          'Die E-Mail ist nur der Fallback-Weg, wenn du dein Konto nicht mehr selbst in der App loeschen kannst.',
          'Bitte verwende moeglichst die E-Mail-Adresse deines Kontos, damit wir die Anfrage zuordnen koennen.',
        ],
      },
      {
        heading: 'Was geloescht wird',
        bullets: [
          'Dein Konto und Profilangaben.',
          'Spiel- und Fortschrittsdaten, soweit keine gesetzlichen Pflichten entgegenstehen.',
          'Optional hochgeladene Avatar-Fotos in unserem Storage.',
        ],
      },
      {
        heading: 'Wichtige Hinweise',
        bullets: [
          'Kaeufe im App-Store bleiben gegebenenfalls in deiner Store-Historie sichtbar.',
          'Konto-, Profil-, Spiel- und Avatar-Daten werden nach deiner Loeschanfrage in der Regel sofort, spaetestens innerhalb von 30 Tagen entfernt.',
          'Abrechnungs-, Steuer-, Betrugs- oder sicherheitsrelevante Daten koennen wir, soweit rechtlich erforderlich, bis zu 10 Jahre aufbewahren.',
          'Nach Abschluss ist die Loeschung in der Regel nicht rueckgaengig zu machen.',
        ],
      },
    ],
  },
};

const LEGAL_DOCS_EN = {
  privacy: {
    id: 'privacy',
    title: 'Privacy Policy',
    updatedAt: '2026-04-13',
    intro:
      'MedQuiz is a quiz app for medical knowledge. This notice explains what data we process and why.',
    sections: [
      {
        heading: 'Responsible Party',
        paragraphs: [
          'CoppiCodes, as the publisher of MedQuiz, is responsible for data processing.',
          `Contact: ${LEGAL_CONTACT_EMAIL}`,
        ],
      },
      {
        heading: 'Data We Process',
        bullets: [
          'Account data: email, username, provider IDs such as Google or Discord.',
          'Profile and gameplay data: scores, streaks, achievements, leaderboards, and lobby status.',
          'Optional profile photos: only if you choose camera or gallery for your avatar.',
          'Device and usage data: app version, OS, redacted crash logs, and diagnostics.',
          'Advertising and purchase data: ad IDs and purchase or entitlement metadata where applicable.',
          'Guest mode data: local guest ID and settings on your device.',
          'Local block-list and safety preferences on your device when you block other users.',
          'Communication data: the content of support requests you send us.',
          'Abuse reports such as reported usernames, screenshots, and moderation context.',
        ],
      },
      {
        heading: 'Purposes of Processing',
        bullets: [
          'Login, account protection, and security.',
          'Gameplay, matchmaking, leaderboards, and progress.',
          'Error analysis and app stability.',
          'Handling abuse reports, local block actions, and social safety controls.',
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
        heading: 'Secure Data Handling',
        bullets: [
          'We transmit personal data over encrypted connections such as HTTPS/TLS.',
          'Access to account data is limited to the systems and service providers needed to operate MedQuiz.',
          'Client error and diagnostics data are redacted before storage.',
          'You are responsible for keeping your login credentials secure on your devices.',
        ],
      },
      {
        heading: 'Third Countries and Retention',
        paragraphs: [
          'Some providers may process data outside the EU, for example in the USA. We use standard contractual clauses or comparable safeguards.',
        ],
        bullets: [
          'Account, profile, gameplay, leaderboard, and avatar data: while your account is active. After account deletion, we usually delete these data immediately and no later than within 30 days unless legal or security reasons require temporary retention.',
          'Guest mode data, local block-list entries, and app settings stored only on your device: until you clear app data, unblock users, or uninstall the app.',
          'Redacted crash and diagnostics data: usually up to 90 days.',
          'Support requests and abuse reports: until the request is resolved and then up to 24 months for follow-up, moderation, or policy enforcement documentation.',
          'Billing, tax, anti-fraud, or security records that we must keep by law: up to 10 years where required.',
        ],
      },
      {
        heading: 'Your Rights',
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
          'MedQuiz is a learning game and not a medical device. It does not diagnose, treat, cure, or prevent any disease and does not replace medical advice.',
          'If you need diagnosis, treatment, or individual medical advice, consult a qualified healthcare professional.',
          'We update this notice when needed.',
        ],
      },
    ],
  },
  terms: {
    id: 'terms',
    title: 'Terms of Service',
    updatedAt: '2026-04-13',
    intro: 'These terms govern the use of the MedQuiz app and related services.',
    sections: [
      {
        heading: 'Scope and Services',
        paragraphs: [
          'By using the app, you accept these terms.',
          'MedQuiz is a learning and quiz game and not a medical device. It does not diagnose, treat, cure, or prevent any disease and does not replace medical advice.',
          'If you need diagnosis, treatment, or individual medical advice, consult a qualified healthcare professional.',
        ],
      },
      {
        heading: 'Accounts and Guest Mode',
        bullets: [
          'Login is available with email/password or OAuth.',
          'You are responsible for keeping your credentials secure.',
          'You must confirm the current terms and privacy information before you create visible profile content such as usernames or profile photos.',
          'We may suspend, restrict, or remove accounts, content, scores, or social features for violations.',
          'Guest mode has limited features and local data can be lost.',
        ],
      },
      {
        heading: 'User Obligations and Prohibited Use',
        bullets: [
          'Do not share account credentials with third parties.',
          'Do not manipulate scores or leaderboards.',
          'Do not abuse multiplayer or communication features.',
          'Do not use abusive, hateful, sexual, violent, illegal, spammy, or impersonating usernames, profile photos, invites, or multiplayer content.',
          'No reverse engineering, bots, or attacks against infrastructure or users.',
        ],
      },
      {
        heading: 'Reporting, Blocking, and Moderation',
        bullets: [
          'In supported profile views, you can report abusive usernames, profile photos, invites, or player interactions directly in the app and block other users locally on your device.',
          'Blocked users may be hidden from friend lists, friend requests, or related social interactions on that device.',
          'We may review reports manually and remove content or limit accounts and social features if needed for user safety or policy compliance.',
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
    updatedAt: '2026-04-13',
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
          'Report abusive usernames, profile photos, invites, or player behavior.',
        ],
      },
      {
        heading: 'Report Abuse',
        paragraphs: [
          'In supported profile views inside the app, you can use the report and local block actions directly.',
          `If you need to report an abusive username, profile photo, invite, or problematic multiplayer behavior, email ${LEGAL_CONTACT_EMAIL}.`,
          'Please include the reported username and, if possible, a short description and screenshot.',
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
    updatedAt: '2026-04-13',
    intro:
      'Official deletion page for the Google Play app MedQuiz by CoppiCodes.',
    sections: [
      {
        heading: 'Directly in the app',
        paragraphs: [
          'The normal way is directly inside the app.',
          'If you are signed in, tap "Delete account permanently" below.',
          'For safety, you will be asked to confirm the deletion once before it runs.',
        ],
      },
      {
        heading: 'Only if you cannot access the app',
        paragraphs: [
          `If you cannot access the app, use the official public deletion page for MedQuiz or email ${LEGAL_CONTACT_EMAIL}.`,
          'The public page clearly references MedQuiz, CoppiCodes, and the Android package com.sjigalin.medbattle.',
          'Email is only the fallback path if you can no longer delete the account yourself inside the app.',
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
          'Account, profile, gameplay, and avatar data are usually removed immediately and no later than within 30 days after your deletion request is completed.',
          'Billing, tax, anti-fraud, or security-related records may need to be retained for up to 10 years where legally required.',
          'Deletion is usually not reversible once completed.',
        ],
      },
    ],
  },
};

export function getLegalDocs(locale = 'en') {
  return LEGAL_DOCS_EN;
}

export const LEGAL_DOCS = LEGAL_DOCS_EN;
