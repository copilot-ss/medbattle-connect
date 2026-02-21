export const LEGAL_CONTACT_EMAIL = 'babyjeje24@gmail.com';

export const LEGAL_DOCS = {
  privacy: {
    id: 'privacy',
    title: 'Privacy Policy',
    updatedAt: '2026-01-12',
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
          'Account data: email, username, provider IDs (for example Google, Discord).',
          'Profile and gameplay data: scores, streaks, achievements, lobby status.',
          'Device and usage data: app version, OS, crash logs, diagnostics.',
          'Advertising and purchase data: ad IDs and purchase receipts where applicable.',
          'Guest mode data: local guest ID and settings on your device.',
          'Communication data: content of support requests you send us.',
        ],
      },
      {
        heading: 'Purposes of Processing',
        bullets: [
          'Login, account protection, and security.',
          'Gameplay, matchmaking, leaderboards, and progress.',
          'Error analysis and app stability.',
          'Billing for premium/purchases and delivery of ads.',
          'Support and response to your requests.',
        ],
      },
      {
        heading: 'Legal Bases (GDPR)',
        bullets: [
          'Contract/performance of services (Art. 6(1)(b) GDPR).',
          'Consent, for example for ads/tracking (Art. 6(1)(a) GDPR).',
          'Legitimate interests, for example security and error analysis (Art. 6(1)(f) GDPR).',
          'Legal obligations, for example billing (Art. 6(1)(c) GDPR).',
        ],
      },
      {
        heading: 'Recipients and Service Providers',
        bullets: [
          'Supabase (auth, database, storage).',
          'Google/Discord (OAuth login).',
          'Sentry or comparable telemetry for crash reports.',
          'Google AdMob for advertising.',
          'App store providers for in-app purchases (Apple/Google).',
        ],
      },
      {
        heading: 'Third Countries, Retention, Rights',
        paragraphs: [
          'Some providers may process data outside the EU (for example in the USA). We use standard contractual clauses or comparable safeguards.',
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
        heading: 'Notes',
        paragraphs: [
          'MedBattle is a learning game and does not replace medical advice.',
          'The app is not intended for children under 13.',
          'We update this notice when needed.',
        ],
      },
    ],
  },
  terms: {
    id: 'terms',
    title: 'Terms of Service',
    updatedAt: '2026-01-12',
    intro: 'These terms govern the use of the MedBattle app and related services.',
    sections: [
      {
        heading: 'Scope and Services',
        paragraphs: [
          'By using the app, you accept these terms.',
          'MedBattle is a learning and quiz game and does not replace medical advice.',
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
        heading: 'Purchases, Ads, Availability, Liability',
        paragraphs: [
          'Optional purchases and premium features are available in-app; billing is handled by the app store.',
          'The free version may include advertisements.',
          'We aim for stable availability but cannot guarantee uninterrupted service.',
          'Liability is limited to the extent permitted by law.',
        ],
      },
      {
        heading: 'Privacy, Changes, Contact',
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
    updatedAt: '2026-01-12',
    intro: 'We are happy to help.',
    sections: [
      {
        heading: 'Contact',
        paragraphs: [
          `Write to us at ${LEGAL_CONTACT_EMAIL}.`,
          'Typical response time: 1-3 business days.',
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
          'Android/iOS version.',
          'Short issue description with time.',
          'Optional screenshot or screen recording.',
        ],
      },
    ],
  },
};
