/**
 * Code.gs — entrypoint. dailyBrief() is the function the 07:00
 * trigger calls. You can also run it manually from the Apps Script
 * editor any time to test.
 */

function dailyBrief() {
  var newlyLogged = logNewOpenEmails_();   // pulls unread inbox mail into the sheet, auto-classified
  var justClosed = closeResolvedEmails_(); // marks rows Closed if the email was read/replied
  composeAndSendBrief_(newlyLogged, justClosed); // sends the brief + logs today's snapshot
}
