import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const APP_NAME = 'MedQuiz';
const PUBLISHER_NAME = 'CoppiCodes';
const PACKAGE_NAME = 'com.sjigalin.medbattle';
const LEGAL_CONTACT_EMAIL = 'medbattle1@gmail.com';
const LAST_UPDATED = '2026-04-13';
const PUBLIC_DOC_URLS = {
  privacy:
    'https://copilot-ss.github.io/medbattle-connect/legal-static/privacy.html',
  terms:
    'https://copilot-ss.github.io/medbattle-connect/legal-static/terms.html',
  support:
    'https://copilot-ss.github.io/medbattle-connect/legal-static/support.html',
  'delete-account':
    'https://copilot-ss.github.io/medbattle-connect/legal-static/delete-account.html',
} as const;

const baseStyles = `
      :root {
        color-scheme: light;
      }
      * {
        box-sizing: border-box;
      }
      body {
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Inter", "Helvetica Neue", Arial, sans-serif;
        color: #0f172a;
        background: #f8fafc;
      }
      .page {
        min-height: 100vh;
        padding: 32px 16px 48px;
        background:
          radial-gradient(1200px 600px at 10% -10%, rgba(14, 165, 233, 0.18), transparent 60%),
          radial-gradient(1000px 600px at 90% 0%, rgba(34, 197, 94, 0.12), transparent 55%),
          #f8fafc;
      }
      .container {
        max-width: 940px;
        margin: 0 auto;
      }
      header {
        margin-bottom: 20px;
      }
      .eyebrow {
        margin: 0 0 8px;
        text-transform: uppercase;
        letter-spacing: 0.18em;
        font-size: 11px;
        color: #64748b;
      }
      h1 {
        margin: 0 0 8px;
        font-size: 32px;
      }
      .lead {
        margin: 0 0 6px;
        font-size: 15px;
        color: #475569;
      }
      .meta {
        margin: 0;
        font-size: 12px;
        color: #64748b;
      }
      .identity {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 12px;
        margin-top: 18px;
      }
      .identity-card {
        background: rgba(255, 255, 255, 0.88);
        border: 1px solid #dbeafe;
        border-radius: 14px;
        padding: 14px 16px;
        box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
      }
      .identity-label {
        display: block;
        margin-bottom: 4px;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        color: #64748b;
      }
      .identity-value {
        font-size: 15px;
        font-weight: 700;
        word-break: break-word;
      }
      .doc-nav {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 18px;
      }
      .doc-link {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 40px;
        padding: 0 14px;
        border-radius: 999px;
        border: 1px solid #cbd5e1;
        background: rgba(255, 255, 255, 0.92);
        color: #0f172a;
        font-size: 14px;
        font-weight: 600;
        text-decoration: none;
      }
      .doc-link:hover {
        border-color: #93c5fd;
        text-decoration: none;
      }
      .card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 16px;
        padding: 22px;
        box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
      }
      .notice {
        margin: 0 0 18px;
        padding: 14px 16px;
        border-radius: 14px;
        background: #eff6ff;
        border: 1px solid #bfdbfe;
      }
      h2 {
        margin: 22px 0 8px;
        font-size: 18px;
      }
      p, li {
        font-size: 15px;
        line-height: 1.7;
      }
      ul {
        margin: 8px 0 0;
        padding-left: 18px;
      }
      a {
        color: #1d4ed8;
        text-decoration: none;
      }
      a:hover {
        text-decoration: underline;
      }
      code {
        font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
        font-size: 13px;
      }
      @media (max-width: 640px) {
        .page {
          padding: 24px 14px 36px;
        }
        h1 {
          font-size: 26px;
        }
        .card {
          padding: 18px;
        }
      }
`;

const identityHtml = `
        <div class="identity" aria-label="App identity">
          <div class="identity-card">
            <span class="identity-label">Google Play app</span>
            <span class="identity-value">${APP_NAME}</span>
          </div>
          <div class="identity-card">
            <span class="identity-label">Publisher / developer</span>
            <span class="identity-value">${PUBLISHER_NAME}</span>
          </div>
          <div class="identity-card">
            <span class="identity-label">Android package</span>
            <span class="identity-value"><code>${PACKAGE_NAME}</code></span>
          </div>
        </div>
        <nav class="doc-nav" aria-label="Legal pages">
          <a class="doc-link" href="/legal?doc=privacy">Privacy</a>
          <a class="doc-link" href="/legal?doc=terms">Terms</a>
          <a class="doc-link" href="/legal?doc=support">Support</a>
          <a class="doc-link" href="/legal?doc=delete-account">Delete account</a>
        </nav>
`;

const renderPage = ({
  title,
  heading,
  lead,
  updatedAt,
  body,
}: {
  title: string;
  heading: string;
  lead: string;
  updatedAt: string;
  body: string;
}) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light" />
    <meta
      name="description"
      content="${APP_NAME} by ${PUBLISHER_NAME}. Official legal and account deletion page for the Google Play app ${APP_NAME}."
    />
    <title>${title}</title>
    <style>
${baseStyles}
    </style>
  </head>
  <body>
    <main class="page">
      <div class="container">
        <header>
          <p class="eyebrow">Official Google Play legal page</p>
          <h1>${heading}</h1>
          <p class="lead">${lead}</p>
          <p class="meta">Updated: ${updatedAt}</p>
${identityHtml}
        </header>

        <div class="card">
${body}
        </div>
      </div>
    </main>
  </body>
</html>`;

const privacyHtml = renderPage({
  title: `Privacy - ${APP_NAME} by ${PUBLISHER_NAME}`,
  heading: 'Privacy',
  lead: `Official privacy information for the Google Play app ${APP_NAME} by ${PUBLISHER_NAME}.`,
  updatedAt: LAST_UPDATED,
  body: `          <p class="notice">
            This page belongs to the Google Play app <strong>${APP_NAME}</strong>,
            published by <strong>${PUBLISHER_NAME}</strong>.
          </p>

          <h2>Responsible party</h2>
          <p>${PUBLISHER_NAME} is the publisher of ${APP_NAME} and responsible for the data processing described here.</p>
          <p>Contact: <a href="mailto:${LEGAL_CONTACT_EMAIL}">${LEGAL_CONTACT_EMAIL}</a></p>

          <h2>Data we process</h2>
          <ul>
            <li>Account data such as email address, username, and login provider identifiers.</li>
            <li>Profile and gameplay data such as scores, streaks, achievements, and lobby state.</li>
            <li>Optional avatar photos if you choose to upload a profile image.</li>
            <li>Device and diagnostics data such as app version, operating system, and redacted crash logs.</li>
            <li>Purchase and advertising related metadata where relevant.</li>
            <li>Local block-list entries and social safety preferences stored on your device when you block users.</li>
            <li>Support messages that you send to us.</li>
            <li>Abuse report details such as reported usernames, screenshots, and moderation context when you contact support.</li>
          </ul>

          <h2>Why we process data</h2>
          <ul>
            <li>Account login, security, and fraud prevention.</li>
            <li>Gameplay, matchmaking, leaderboards, and progress sync.</li>
            <li>Stability analysis and bug fixing.</li>
            <li>Processing abuse reports, local block actions, and social safety controls.</li>
            <li>Purchase fulfilment, premium features, and ad delivery.</li>
            <li>Support and legal compliance.</li>
          </ul>

          <h2>Security and data handling</h2>
          <ul>
            <li>We transmit personal data over encrypted connections such as HTTPS/TLS.</li>
            <li>Access to account data is limited to the systems and service providers needed to operate ${APP_NAME}.</li>
            <li>Client error and crash information is redacted before it is stored for diagnostics.</li>
            <li>You are responsible for keeping your login credentials secure on your devices.</li>
          </ul>

          <h2>Retention and deletion</h2>
          <ul>
            <li>Account, profile, gameplay, leaderboard, and avatar data: while your account is active. After account deletion, we usually delete these data immediately and no later than within 30 days unless legal or security reasons require temporary retention.</li>
            <li>Guest mode data, local block-list entries, and app settings stored only on your device: until you clear app data, unblock users, or uninstall the app.</li>
            <li>Redacted diagnostics and crash logs: usually up to 90 days.</li>
            <li>Support requests and abuse reports: until the request is resolved and then up to 24 months for follow-up, moderation, or policy enforcement documentation.</li>
            <li>Billing, tax, anti-fraud, or security records that we must keep by law: up to 10 years where required.</li>
          </ul>

          <h2>Your rights</h2>
          <ul>
            <li>Access, correction, deletion, restriction, and portability.</li>
            <li>Objection to processing and withdrawal of consent where applicable.</li>
            <li>Complaint to a competent supervisory authority.</li>
          </ul>

          <h2>Account deletion</h2>
          <p>
            The public account deletion page for ${APP_NAME} is available here:
            <a href="/legal?doc=delete-account">Delete account</a>.
          </p>`,
});

const termsHtml = renderPage({
  title: `Terms - ${APP_NAME} by ${PUBLISHER_NAME}`,
  heading: 'Terms',
  lead: `Official terms for the Google Play app ${APP_NAME} by ${PUBLISHER_NAME}.`,
  updatedAt: LAST_UPDATED,
  body: `          <p class="notice">
            These terms apply to the Google Play app <strong>${APP_NAME}</strong>,
            published by <strong>${PUBLISHER_NAME}</strong>.
          </p>

          <h2>Scope</h2>
          <p>By using ${APP_NAME}, you agree to these terms for the app and related services.</p>

          <h2>Service description</h2>
          <p>
            ${APP_NAME} is an educational medical quiz app. It is not a medical device,
            does not diagnose or treat, and does not replace professional medical advice.
          </p>
          <p>
            If you need diagnosis, treatment, or individual medical advice,
            consult a qualified healthcare professional.
          </p>

          <h2>Accounts</h2>
          <ul>
            <li>You may use guest mode or create an account with email or supported sign-in providers.</li>
            <li>You are responsible for the security of your login credentials.</li>
            <li>You must confirm the current terms and privacy information before you create visible profile content such as usernames or profile photos.</li>
            <li>We may limit, suspend, or remove accounts, content, scores, or social features in case of abuse, fraud, or violations of these terms.</li>
          </ul>

          <h2>Prohibited conduct</h2>
          <ul>
            <li>No abusive, hateful, sexual, violent, illegal, spammy, or impersonating usernames, profile photos, invites, or multiplayer behavior.</li>
            <li>No cheating, bots, score manipulation, or attacks against the app, infrastructure, or other users.</li>
          </ul>

          <h2>Reporting, blocking, and moderation</h2>
          <ul>
            <li>In supported profile views, you can report abusive usernames, profile photos, invites, or player behavior and block other users locally on your device.</li>
            <li>Blocked users may be hidden from friend requests, friend lists, and related social interactions on that device.</li>
            <li>Reports may be reviewed manually. We may remove content, limit social features, or suspend accounts if needed for user safety or policy compliance.</li>
          </ul>

          <h2>Purchases and advertising</h2>
          <ul>
            <li>${APP_NAME} may offer optional in-app purchases and premium features.</li>
            <li>Store billing is handled by the relevant app store provider.</li>
            <li>The free version may contain advertising.</li>
          </ul>

          <h2>Contact</h2>
          <p>
            Questions about these terms can be sent to
            <a href="mailto:${LEGAL_CONTACT_EMAIL}">${LEGAL_CONTACT_EMAIL}</a>.
          </p>`,
});

const supportHtml = renderPage({
  title: `Support - ${APP_NAME} by ${PUBLISHER_NAME}`,
  heading: 'Support',
  lead: `Official support page for the Google Play app ${APP_NAME} by ${PUBLISHER_NAME}.`,
  updatedAt: LAST_UPDATED,
  body: `          <p class="notice">
            Support for the Google Play app <strong>${APP_NAME}</strong> by
            <strong>${PUBLISHER_NAME}</strong>.
          </p>

          <h2>Contact</h2>
          <p>
            Email:
            <a href="mailto:${LEGAL_CONTACT_EMAIL}">${LEGAL_CONTACT_EMAIL}</a>
          </p>
          <p>Typical response time: 1 to 3 business days.</p>

          <h2>Please include</h2>
          <ul>
            <li>App name: ${APP_NAME}</li>
            <li>Device model and Android/iOS version</li>
            <li>Short issue description and rough time of the issue</li>
            <li>Optional screenshot or screen recording</li>
          </ul>

          <h2>Abuse reports</h2>
          <p>
            In supported in-app profile views, you can use the report action and
            local block action directly in the app.
          </p>
          <p>
            To report abusive usernames, profile photos, invites, or multiplayer
            behavior, email <a href="mailto:${LEGAL_CONTACT_EMAIL}">${LEGAL_CONTACT_EMAIL}</a>.
          </p>
          <p>
            Please include the reported username and, if possible, a short
            description and screenshot.
          </p>`,
});

const deleteAccountHtml = renderPage({
  title: `Delete Account - ${APP_NAME} by ${PUBLISHER_NAME}`,
  heading: 'Delete account',
  lead: `Official account deletion page for the Google Play app ${APP_NAME}, published by ${PUBLISHER_NAME}.`,
  updatedAt: LAST_UPDATED,
  body: `          <p class="notice">
            This is the official public account deletion page for the Google Play app
            <strong>${APP_NAME}</strong> by <strong>${PUBLISHER_NAME}</strong>.
          </p>

          <h2>App and publisher reference</h2>
          <ul>
            <li>App name on Google Play: <strong>${APP_NAME}</strong></li>
            <li>Publisher / developer: <strong>${PUBLISHER_NAME}</strong></li>
            <li>Android package: <code>${PACKAGE_NAME}</code></li>
            <li>Support email: <a href="mailto:${LEGAL_CONTACT_EMAIL}">${LEGAL_CONTACT_EMAIL}</a></li>
          </ul>

          <h2>Delete directly in the app</h2>
          <p>
            If you are signed in, open ${APP_NAME} and go to
            <strong>Settings &gt; Delete account</strong>.
          </p>
          <p>
            Tap <strong>Delete account permanently</strong> and confirm once. Your
            account can then be deleted directly by you in the app.
          </p>

          <h2>Only if you cannot access the app</h2>
          <p>
            If you cannot access ${APP_NAME} anymore, send your deletion request to
            <a href="mailto:${LEGAL_CONTACT_EMAIL}?subject=${encodeURIComponent(`${APP_NAME} account deletion request`)}">${LEGAL_CONTACT_EMAIL}</a>.
          </p>
          <p>
            This email option is only the fallback path for cases where you cannot
            log in anymore. Please use the email address of your ${APP_NAME}
            account whenever possible and include your username if available.
          </p>

          <h2>What we delete</h2>
          <ul>
            <li>Your account, profile information, and login access.</li>
            <li>Gameplay and progress data unless limited retention is required by law or security obligations.</li>
            <li>Optional uploaded avatar photos stored for your account.</li>
          </ul>

          <h2>Important notes</h2>
          <ul>
            <li>Store purchases may remain visible in your Google Play or App Store purchase history.</li>
            <li>Account, profile, gameplay, and avatar data are usually deleted immediately and no later than within 30 days after your deletion request is completed.</li>
            <li>Some billing or security records may need to be retained temporarily where legally required.</li>
            <li>Account deletion is usually irreversible once completed.</li>
          </ul>

          <h2>Response time</h2>
          <p>
            We usually confirm incoming deletion requests within 72 hours and
            complete them as fast as possible.
          </p>`,
});

const documents = {
  privacy: privacyHtml,
  terms: termsHtml,
  support: supportHtml,
  'delete-account': deleteAccountHtml,
  deleteaccount: deleteAccountHtml,
};

serve((request) => {
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/').filter(Boolean);
  const legalIndex = pathParts.lastIndexOf('legal');
  const docFromPath =
    legalIndex >= 0 && pathParts.length > legalIndex + 1
      ? pathParts[legalIndex + 1]
      : null;
  const doc = (docFromPath || url.searchParams.get('doc') || 'privacy').toLowerCase();
  const redirectUrl = PUBLIC_DOC_URLS[doc as keyof typeof PUBLIC_DOC_URLS];

  if (!redirectUrl) {
    return new Response('Not found', {
      status: 404,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    });
  }

  return new Response(null, {
    status: 302,
    headers: {
      location: redirectUrl,
      'cache-control': 'max-age=300',
    },
  });
});
