/**
 * Email Radar Tracker — Configuration
 * Edit these constants to match your setup. Nothing else in the
 * project should need hardcoded values.
 */

var CONFIG = {
  // Tab names. All are created automatically by setupSheets() if missing.
  SHEET_NAME: 'Radar',
  LOG_SHEET_NAME: 'Daily Log',
  LEARNING_SHEET_NAME: 'Learning Queue',
  CHECKLIST_SHEET_NAME: 'Daily Checklist',
  RULES_SHEET_NAME: 'Classification Rules',
  DASHBOARD_SHEET_NAME: 'Dashboard',

  // Where the 07:00 brief gets emailed.
  RECIPIENT_EMAIL: 'mornay22@gmail.com',

  // Gmail label applied to a thread once it has been logged as a row,
  // so the same email is never logged twice.
  LOGGED_LABEL: 'Radar/Logged',

  // How many days back to scan for "open" (unread, unactioned) inbox mail.
  OPEN_EMAIL_WINDOW_DAYS: 3,

  // Senders/domains that generate high-volume noise but are never real
  // risk items — excluded from the open-email scan so the brief isn't
  // flooded with routine system pings. Edit freely; matched against the
  // Gmail "from:" field, case-insensitive substring match.
  EXCLUDED_SENDER_PATTERNS: [
    'noreply@fraxion.biz',           // routine spend-approval workflow pings
    '@linkedin.com',                 // notifications, job alerts, digests
    '@mail.notion.so',
    '@skool.com', 'lifestylefounder.com',
    '@superbalist.com', '@edgars.co.za', '@clicks.co.za',
    'petworld.co.za', 'netflorist.co.za',
    'no-reply@accounts.google.com',  // Google account security/sign-in alerts
    '@mail.discovery.bank',
    '@ifttt.com'
    // Add more as patterns emerge — keep these specific (exact sender or
    // domain), not broad strings like "noreply@", which would also catch
    // senders you actually want (e.g. SARS, the Master of the High Court).
  ],

  TIMEZONE: 'Africa/Johannesburg',

  // Cape Town / Plattekloof, for the weather section. No API key needed
  // (Open-Meteo is free/public).
  WEATHER_LAT: -33.9249,
  WEATHER_LON: 18.4241,

  // News sections — Google News RSS, free, no key.
  NEWS_FEEDS: {
    'Local (South Africa)': 'https://news.google.com/rss/headlines/section/geo/South%20Africa?hl=en-ZA&gl=ZA&ceid=ZA:en',
    'International': 'https://news.google.com/rss/headlines/section/topic/WORLD?hl=en-US&gl=US&ceid=US:en',
    'Finance': 'https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=en-ZA&gl=ZA&ceid=ZA:en'
  },

  // Column order on the Radar tab — must match row 1 headers exactly.
  COLUMNS: [
    'Date Logged',      // A
    'Subject',          // B
    'Sender',           // C
    'Risk Category',    // D
    'Risk Description', // E
    'Action Items',     // F
    'Owner',            // G
    'Deadline',         // H
    'Status',           // I  -> Open / Closed
    'Date Closed',      // J
    'Thread Id',        // K  -> internal, used to match Gmail threads to rows
    'Building'           // L  -> filled by Classification Rules
  ],

  LOG_COLUMNS: [
    'Date', 'Overdue', 'Due Soon', 'Unattended Emails', 'Other Open',
    'Newly Logged', 'Closed', 'Weather', 'Local Headline',
    'International Headline', 'Finance Headline', 'Learning Topic',
    'Checklist Items Due'
  ],

  LEARNING_COLUMNS: ['Topic', 'Detail / Resource', 'Status', 'Date Sent'],

  CHECKLIST_COLUMNS: ['Item', 'Frequency', 'Building', 'Last Completed'],

  RULES_COLUMNS: ['Type', 'Keyword', 'Value']
};
