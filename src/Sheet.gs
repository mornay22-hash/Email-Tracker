/**
 * Sheet.gs — all reads/writes to the Email Radar Tracker sheet live here.
 */

function getRadarSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) {
    sheet = ss.getSheets()[0]; // fall back to first tab
  }
  ensureHeaders_(sheet);
  return sheet;
}

/** Makes sure the header row matches CONFIG.COLUMNS, adding any missing columns. */
function ensureHeaders_(sheet) {
  var lastCol = Math.max(sheet.getLastColumn(), 1);
  var existing = sheet.getRange(1, 1, 1, lastCol).getValues()[0];

  CONFIG.COLUMNS.forEach(function (name, i) {
    if (existing[i] !== name) {
      sheet.getRange(1, i + 1).setValue(name);
    }
  });
}

/** Returns all data rows as objects keyed by column name, with their sheet row number. */
function getAllRows_() {
  var sheet = getRadarSheet_();
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  var values = sheet.getRange(2, 1, lastRow - 1, CONFIG.COLUMNS.length).getValues();
  return values.map(function (row, idx) {
    var obj = { _row: idx + 2 };
    CONFIG.COLUMNS.forEach(function (name, i) {
      obj[name] = row[i];
    });
    return obj;
  });
}

/** Appends one new radar item. data keys should match CONFIG.COLUMNS. */
function appendRadarRow_(data) {
  var sheet = getRadarSheet_();
  var row = CONFIG.COLUMNS.map(function (name) {
    return data[name] !== undefined ? data[name] : '';
  });
  sheet.appendRow(row);
}

/** Marks a row Closed and stamps today's date. rowNumber is the actual sheet row. */
function closeRadarRow_(rowNumber) {
  var sheet = getRadarSheet_();
  var statusCol = CONFIG.COLUMNS.indexOf('Status') + 1;
  var closedCol = CONFIG.COLUMNS.indexOf('Date Closed') + 1;
  sheet.getRange(rowNumber, statusCol).setValue('Closed');
  sheet.getRange(rowNumber, closedCol).setValue(formatDate_(new Date()));
}

function formatDate_(date) {
  return Utilities.formatDate(date, CONFIG.TIMEZONE, 'yyyy-MM-dd');
}
