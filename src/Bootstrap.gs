/**
 * Bootstrap.gs — run setupSheets() ONCE from the Apps Script editor
 * (alongside installDailyTrigger()). Idempotent: safe to re-run any
 * time, it only creates what's missing and never overwrites data
 * you've already entered.
 */

function setupSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // Rename the original default tab to "Radar" the first time round.
  var legacy = ss.getSheetByName('Sheet1');
  if (legacy && !ss.getSheetByName(CONFIG.SHEET_NAME)) {
    legacy.setName(CONFIG.SHEET_NAME);
  }

  getRadarSheet_(); // ensures Radar tab + headers + Building column

  setupTab_(CONFIG.LOG_SHEET_NAME, CONFIG.LOG_COLUMNS, []);

  setupTab_(CONFIG.LEARNING_SHEET_NAME, CONFIG.LEARNING_COLUMNS, [
    ['Effective rent vs gross rent — why the distinction matters in lease negotiation', '', 'Queued', ''],
    ['Reading a tenant Certificate of Acceptability', '', 'Queued', ''],
    ['Section 14 lease vs verbal/periodic tenancy under SA law — key risk differences', '', 'Queued', ''],
    ['How municipal effluent discharge limits are set and enforced', '', 'Queued', ''],
    ['Turnover rent clauses — common disputes and how to draft around them', '', 'Queued', '']
  ]);

  setupTab_(CONFIG.CHECKLIST_SHEET_NAME, CONFIG.CHECKLIST_COLUMNS, [
    ['Review arrears report', 'Daily', '', ''],
    ['Check security / incident log', 'Daily', '', ''],
    ['Review vacancy schedule', 'Weekly', '', ''],
    ['Review leasing pipeline', 'Weekly', '', ''],
    ['Compliance walk-through', 'Weekly', 'Rotate buildings', ''],
    ['Review contractor performance', 'Monthly', '', '']
  ]);

  setupTab_(CONFIG.RULES_SHEET_NAME, CONFIG.RULES_COLUMNS, [
    // Building rules
    ['Building', 'Stelmark', 'Stelmark Centre'],
    ['Building', 'Cape Gate Corner', 'Cape Gate Corner'],
    ['Building', 'Cape Gate', 'Cape Gate Lifestyle Centre'],
    ['Building', 'Paarl East', 'Paarl East Shopping Centre'],
    ['Building', 'Laguna', 'Laguna Mall'],
    ['Building', 'FPG House', 'FPG House (HQ)'],
    // Risk category rules — life safety / compliance ranks highest, so
    // these are listed first (first match wins per type).
    ['Category', 'fire', 'High - Fire / Life Safety Compliance'],
    ['Category', 'contravention', 'High - Municipal Compliance'],
    ['Category', 'lift', 'High - Facilities Safety'],
    ['Category', 'kone', 'High - Facilities Safety'],
    ['Category', 'letter of demand', 'High - Financial'],
    ['Category', 'demand', 'Medium - Financial'],
    ['Category', 'arrears', 'Medium - Financial'],
    ['Category', 'outstanding invoice', 'Medium - Financial (Contractor)'],
    ['Category', 'water usage', 'Medium - Utilities / Cost Recovery'],
    ['Category', 'sewage', 'Medium - Utilities / Cost Recovery'],
    ['Category', 'turnover', 'Medium - Leasing'],
    ['Category', 'renewal', 'Medium - Leasing'],
    ['Category', 'offer to lease', 'Medium - Leasing'],
    ['Category', 'lease agreement', 'Medium - Leasing'],
    ['Category', 'available units', 'Low - Leasing Pipeline'],
    ['Category', 'prospective tenant', 'Low - Leasing Pipeline'],
    ['Category', 'signage', 'Low - Operational Approval'],
    ['Category', 'deposit', 'Low - Financial Admin'],
    ['Category', 'compliance', 'Medium - Operational Compliance'],
    ['Category', 'urgent', 'High - Operational'],
    // Owner rules — known colleagues (extend as new names appear)
    ['Owner', 'Masood', 'Mornay Walters / Masood Allie'],
    ['Owner', 'Helena', 'Mornay Walters / Helena Conradie'],
    ['Owner', 'Sakeena', 'Mornay Walters / Sakeena Lagkar'],
    ['Owner', 'Kelly', 'Mornay Walters / Kelly Hendricks'],
    ['Owner', 'Lisa', 'Mornay Walters / Lisa Hyman'],
    ['Owner', 'Kerry Ann', 'Mornay Walters / Kerry Ann Whittingham'],
    ['Owner', 'Ashline', 'Mornay Walters / Ashline Augustus'],
    ['Owner', 'Tracey', 'Mornay Walters / Tracey Naiker'],
    ['Owner', 'Carmelita', 'Mornay Walters / Carmelita Abrahams'],
    ['Owner', 'Audrey', 'Mornay Walters / Audrey Isaacs'],
    ['Owner', 'Jean Rossouw', 'Mornay Walters / Jean Rossouw'],
    ['Owner', 'Farouk', 'Mornay Walters / Farouk Davids'],
    ['Owner', 'Suzanne', 'Mornay Walters / Suzanne Fredericks'],
    ['Owner', 'Kevin Nel', 'Mornay Walters / Kevin Nel']
  ]);

  setupDashboard_();

  Logger.log('Sheets bootstrap complete.');
}

function setupTab_(name, headers, seedRows) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  var isNew = false;

  if (!sheet) {
    sheet = ss.insertSheet(name);
    isNew = true;
  }

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  // Only seed starter rows into a brand-new, empty tab — never touch
  // a tab that already has data, so re-running this is always safe.
  if (isNew && seedRows.length && sheet.getLastRow() < 2) {
    sheet.getRange(2, 1, seedRows.length, seedRows[0].length).setValues(seedRows);
  }

  return sheet;
}

function setupDashboard_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (ss.getSheetByName(CONFIG.DASHBOARD_SHEET_NAME)) return; // don't clobber an existing one

  var sheet = ss.insertSheet(CONFIG.DASHBOARD_SHEET_NAME);
  var radarRange = "'" + CONFIG.SHEET_NAME + "'!I2:I";
  var logRange = "'" + CONFIG.LOG_SHEET_NAME + "'!";

  sheet.getRange('A1').setValue('Email Radar Dashboard').setFontSize(16).setFontWeight('bold');

  sheet.getRange('A3').setValue('Currently open items');
  sheet.getRange('B3').setFormula('=COUNTIF(' + radarRange + ',"Open")');

  sheet.getRange('A4').setValue('Currently overdue');
  sheet.getRange('B4').setFormula(
    '=SUMPRODUCT((\'' + CONFIG.SHEET_NAME + '\'!I2:I1000="Open")*(\'' + CONFIG.SHEET_NAME +
    '\'!H2:H1000<>"")*(IFERROR(DATEVALUE(\'' + CONFIG.SHEET_NAME + '\'!H2:H1000),9E9)<TODAY()))'
  );

  sheet.getRange('A6').setValue('Open items trend (last 30 days, from Daily Log — Overdue+DueSoon+Unattended+OtherOpen)');
  sheet.getRange('A7').setFormula(
    '=IFERROR(SPARKLINE(QUERY(' + logRange + 'A2:G,"select B+C+D+E",0)),"Add entries to Daily Log first")'
  );

  sheet.getRange('A9').setValue('Open items by building');
  sheet.getRange('A10').setFormula(
    '=IFERROR(QUERY(\'' + CONFIG.SHEET_NAME + '\'!A1:L,"select L, count(L) where I=\'Open\' group by L label count(L) \'Open Items\'",1),"No data yet")'
  );

  sheet.setColumnWidth(1, 260);
}
