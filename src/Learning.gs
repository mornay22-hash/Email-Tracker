/**
 * Learning.gs — one "thing to learn" per day, pulled from the
 * Learning Queue tab in row order. Add rows to that tab whenever you
 * come across a topic worth circling back to; the brief works
 * through them one a day and marks each Sent once it's gone out.
 */

function getTodaysLearningItem_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.LEARNING_SHEET_NAME);
  if (!sheet) return null;

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return null;

  var values = sheet.getRange(2, 1, lastRow - 1, CONFIG.LEARNING_COLUMNS.length).getValues();

  for (var i = 0; i < values.length; i++) {
    if (values[i][2] === 'Queued') {
      var rowNum = i + 2;
      sheet.getRange(rowNum, 3).setValue('Sent');
      sheet.getRange(rowNum, 4).setValue(formatDate_(new Date()));
      return { topic: values[i][0], detail: values[i][1] };
    }
  }

  return null; // queue empty — brief will note this so it gets refilled
}
