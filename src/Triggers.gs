/**
 * Triggers.gs — run installDailyTrigger() ONCE from the Apps Script
 * editor (select it in the function dropdown, click Run). It sets up
 * the 07:00 Africa/Johannesburg clock trigger and removes any
 * duplicates so re-running it is always safe.
 */

function installDailyTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'dailyBrief') {
      ScriptApp.deleteTrigger(t);
    }
  });

  ScriptApp.newTrigger('dailyBrief')
    .timeBased()
    .atHour(7)
    .everyDays(1)
    .inTimezone('Africa/Johannesburg')
    .create();

  Logger.log('Daily 07:00 trigger installed.');
}
