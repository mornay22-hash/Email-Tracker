/**
 * Classify.gs — turns a Classification Rules tab (Type / Keyword / Value)
 * into Building / Risk Category / Owner guesses for a new email.
 * Edit the Rules tab any time; no code changes needed to tune it.
 */

function getClassificationRules_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.RULES_SHEET_NAME);
  if (!sheet) return [];

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  return sheet.getRange(2, 1, lastRow - 1, 3).getValues()
    .filter(function (r) { return r[0] && r[1]; })
    .map(function (r) { return { type: r[0], keyword: String(r[1]).toLowerCase(), value: r[2] }; });
}

/**
 * text is searched case-insensitively (subject + snippet combined).
 * Returns { category, owner, building } — any field defaults if no rule matches.
 */
function classifyEmail_(text) {
  var rules = getClassificationRules_();
  var lower = String(text).toLowerCase();

  var result = {
    category: 'Uncategorised - needs triage',
    owner: 'Mornay Walters',
    building: ''
  };

  rules.forEach(function (rule) {
    if (lower.indexOf(rule.keyword) === -1) return;
    if (rule.type === 'Category' && result.category === 'Uncategorised - needs triage') {
      result.category = rule.value;
    } else if (rule.type === 'Owner' && result.owner === 'Mornay Walters') {
      result.owner = rule.value;
    } else if (rule.type === 'Building' && !result.building) {
      result.building = rule.value;
    }
  });

  return result;
}
