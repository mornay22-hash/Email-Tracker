/**
 * Gmail.gs — finds unattended inbox mail and keeps Gmail labels in sync
 * with the sheet, so nothing gets logged twice.
 */

/** Threads in the inbox, unread, within the configured window — these are "open". */
function getOpenThreads_() {
  var query = 'in:inbox is:unread newer_than:' + CONFIG.OPEN_EMAIL_WINDOW_DAYS + 'd';
  CONFIG.EXCLUDED_SENDER_PATTERNS.forEach(function (pattern) {
    query += ' -from:(' + pattern + ')';
  });
  return GmailApp.search(query);
}

function getOrCreateLabel_(name) {
  var label = GmailApp.getUserLabelByName(name);
  if (!label) label = GmailApp.createLabel(name);
  return label;
}

/**
 * Logs any open thread that doesn't already carry the "Radar/Logged" label.
 * Returns the list of newly logged items (for the brief).
 */
function logNewOpenEmails_() {
  var loggedLabel = getOrCreateLabel_(CONFIG.LOGGED_LABEL);
  var threads = getOpenThreads_();
  var newlyLogged = [];

  threads.forEach(function (thread) {
    var labels = thread.getLabels().map(function (l) { return l.getName(); });
    if (labels.indexOf(CONFIG.LOGGED_LABEL) !== -1) return; // already logged

    var msg = thread.getMessages()[0];
    var snippet = msg.getPlainBody().substring(0, 280).replace(/\s+/g, ' ');
    var classified = classifyEmail_(thread.getFirstMessageSubject() + ' ' + snippet);

    var item = {
      'Date Logged': formatDate_(new Date()),
      'Subject': thread.getFirstMessageSubject(),
      'Sender': msg.getFrom(),
      'Risk Category': classified.category,
      'Risk Description': snippet,
      'Action Items': classified.category === 'Uncategorised - needs triage'
        ? 'Triage and classify' : 'Review and confirm details',
      'Owner': classified.owner,
      'Deadline': '',
      'Status': 'Open',
      'Date Closed': '',
      'Thread Id': thread.getId(),
      'Building': classified.building
    };

    appendRadarRow_(item);
    thread.addLabel(loggedLabel);
    newlyLogged.push(item);
  });

  return newlyLogged;
}

/**
 * Any sheet row still marked Open whose Gmail thread is no longer unread
 * (i.e. Mornay read/replied/archived it) gets closed automatically.
 */
function closeResolvedEmails_() {
  var rows = getAllRows_();
  var openThreadIds = getOpenThreads_().map(function (t) { return t.getId(); });
  var closed = [];

  rows.forEach(function (row) {
    if (row['Status'] !== 'Open' || !row['Thread Id']) return;
    if (openThreadIds.indexOf(row['Thread Id']) === -1) {
      closeRadarRow_(row._row);
      closed.push(row);
    }
  });

  return closed;
}
