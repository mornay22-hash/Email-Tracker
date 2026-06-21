/**
 * DailyLog.gs — this is what turns the radar into an actual
 * dashboard: every morning's snapshot gets appended here, so the
 * Dashboard tab has real history to chart instead of a single
 * point-in-time view.
 */

function logDailySnapshot_(stats) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.LOG_SHEET_NAME);
  if (!sheet) return;

  var row = CONFIG.LOG_COLUMNS.map(function (col) {
    return stats[col] !== undefined ? stats[col] : '';
  });
  sheet.appendRow(row);
}
