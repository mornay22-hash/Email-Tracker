/**
 * Checklist.gs — recurring operational reviews (Daily Checklist tab).
 * The brief surfaces what's due; YOU tick it off by updating "Last
 * Completed" in the sheet — the script never marks these complete on
 * its own, since "checked" has to be a real human action.
 */

function getChecklistDueToday_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.CHECKLIST_SHEET_NAME);
  if (!sheet) return [];

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  var values = sheet.getRange(2, 1, lastRow - 1, CONFIG.CHECKLIST_COLUMNS.length).getValues();
  var today = stripTime_(new Date());
  var due = [];

  values.forEach(function (row) {
    var item = row[0], freq = row[1], building = row[2], lastDone = row[3];
    if (!item) return;

    var thresholdDays = { Daily: 1, Weekly: 7, Monthly: 30 }[freq] || 1;
    var lastDate = lastDone ? parseDate_(lastDone) : null;
    var daysSince = lastDate ? (today - lastDate) / 86400000 : Infinity;

    if (daysSince >= thresholdDays) {
      due.push({ item: item, frequency: freq, building: building });
    }
  });

  return due;
}
