/**
 * Brief.gs — turns the current state of the sheet, inbox, weather,
 * news, and learning queue into the 07:00 brief, sends it, and logs
 * a snapshot row to Daily Log for trend tracking.
 */

function composeAndSendBrief_(newlyLogged, justClosed) {
  var today = new Date();
  var rows = getAllRows_();
  var windowStart = addDays_(today, -CONFIG.OPEN_EMAIL_WINDOW_DAYS);

  var overdue = [];
  var dueSoon = [];
  var unattendedEmails = [];
  var otherOpen = [];

  rows.forEach(function (row) {
    if (row['Status'] !== 'Open') return;

    var deadline = parseDate_(row['Deadline']);
    var logged = parseDate_(row['Date Logged']);

    if (deadline && deadline < stripTime_(today)) {
      overdue.push(row);
    } else if (deadline && deadline <= addDays_(today, 2)) {
      dueSoon.push(row);
    } else if (!deadline && logged && logged >= windowStart) {
      unattendedEmails.push(row); // freshly logged, no deadline set yet — needs your eyes
    } else {
      otherOpen.push(row); // sitting open with no deadline beyond the window — genuinely stale
    }
  });

  overdue.sort(byDeadline_);
  dueSoon.sort(byDeadline_);

  var weather = getWeatherSummary_();
  var news = getNewsSection_();
  var learning = getTodaysLearningItem_();
  var checklistDue = getChecklistDueToday_();

  var html = buildBriefHtml_({
    today: today, overdue: overdue, dueSoon: dueSoon,
    unattendedEmails: unattendedEmails, otherOpen: otherOpen,
    justClosed: justClosed, weather: weather, news: news,
    learning: learning, checklistDue: checklistDue
  });

  sendBrief_(html);

  logDailySnapshot_({
    'Date': formatDate_(today),
    'Overdue': overdue.length,
    'Due Soon': dueSoon.length,
    'Unattended Emails': unattendedEmails.length,
    'Other Open': otherOpen.length,
    'Newly Logged': newlyLogged.length,
    'Closed': justClosed.length,
    'Weather': weather ? weather.text : '',
    'Local Headline': news['Local (South Africa)'] ? news['Local (South Africa)'].title : '',
    'International Headline': news['International'] ? news['International'].title : '',
    'Finance Headline': news['Finance'] ? news['Finance'].title : '',
    'Learning Topic': learning ? learning.topic : '',
    'Checklist Items Due': checklistDue.length
  });
}

function buildBriefHtml_(d) {
  var html = '';
  html += '<h2>Daily Radar Brief — ' + formatDate_(d.today) + '</h2>';

  if (d.weather) {
    html += '<p><b>Weather (Cape Town):</b> ' + escapeHtml_(d.weather.text) + '</p>';
  }

  html += newsHtml_(d.news);

  if (d.learning) {
    html += '<p><b>Today\u2019s learning:</b> ' + escapeHtml_(d.learning.topic) +
      (d.learning.detail ? ' — ' + escapeHtml_(d.learning.detail) : '') + '</p>';
  }

  html += '<hr>';
  html += section_('🔴 Overdue', d.overdue, true);
  html += section_('🟠 Due in the next 2 days', d.dueSoon, true);
  html += section_('🟡 New / unattended emails (last ' + CONFIG.OPEN_EMAIL_WINDOW_DAYS + ' days)', d.unattendedEmails, false);
  html += section_('⚪ Other open — no deadline set, sitting longer than ' + CONFIG.OPEN_EMAIL_WINDOW_DAYS + ' days', d.otherOpen, false);

  if (d.checklistDue.length) {
    html += '<h3>✅ Checklist due today (' + d.checklistDue.length + ')</h3><ul>';
    d.checklistDue.forEach(function (c) {
      html += '<li>' + escapeHtml_(c.item) + ' <span style="color:#888">(' + escapeHtml_(c.frequency) +
        (c.building ? ', ' + escapeHtml_(c.building) : '') + ')</span></li>';
    });
    html += '</ul>';
  }

  if (d.justClosed && d.justClosed.length) {
    html += '<h3>Closed since yesterday (' + d.justClosed.length + ')</h3><ul>';
    d.justClosed.forEach(function (r) { html += '<li>' + escapeHtml_(r['Subject']) + '</li>'; });
    html += '</ul>';
  }

  html += '<p style="color:#888;font-size:12px">' +
    d.overdue.length + ' overdue · ' + d.dueSoon.length + ' due soon · ' +
    d.unattendedEmails.length + ' unattended emails · ' + d.otherOpen.length + ' other open · ' +
    'Sheet: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl() + '</p>';

  return html;
}

function newsHtml_(news) {
  var labels = Object.keys(news);
  var any = labels.some(function (l) { return news[l]; });
  if (!any) return '';

  var html = '<p><b>News:</b></p><ul>';
  labels.forEach(function (label) {
    var item = news[label];
    if (!item) return;
    html += '<li><b>' + escapeHtml_(label) + ':</b> <a href="' + item.link + '">' +
      escapeHtml_(item.title) + '</a></li>';
  });
  html += '</ul>';
  return html;
}

function section_(title, items, showDeadline) {
  if (!items.length) return '';
  var html = '<h3>' + title + ' (' + items.length + ')</h3><ul>';
  items.forEach(function (r) {
    html += '<li><b>' + escapeHtml_(r['Subject']) + '</b>';
    if (r['Building']) html += ' <span style="color:#888">[' + escapeHtml_(r['Building']) + ']</span>';
    if (r['Sender']) html += ' — ' + escapeHtml_(r['Sender']);
    if (showDeadline && r['Deadline']) html += ' — due ' + escapeHtml_(String(r['Deadline']));
    if (r['Action Items']) html += '<br><span style="color:#555">' + escapeHtml_(r['Action Items']) + '</span>';
    html += '</li>';
  });
  html += '</ul>';
  return html;
}

function sendBrief_(html) {
  GmailApp.sendEmail(CONFIG.RECIPIENT_EMAIL, 'Daily Radar Brief — ' + formatDate_(new Date()), '', {
    htmlBody: html
  });
}

// --- small date helpers, kept local to avoid pulling in a library ---

function parseDate_(val) {
  if (!val) return null;
  var d = (val instanceof Date) ? val : new Date(val);
  return isNaN(d.getTime()) ? null : stripTime_(d);
}

function stripTime_(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addDays_(d, n) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
}

function byDeadline_(a, b) {
  var da = parseDate_(a['Deadline']);
  var db = parseDate_(b['Deadline']);
  if (!da) return 1;
  if (!db) return -1;
  return da - db;
}

function escapeHtml_(str) {
  return String(str || '').replace(/[&<>"]/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
  });
}
