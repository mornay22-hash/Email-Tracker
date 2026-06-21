/**
 * News.gs — one headline each from local (SA), international, and
 * finance feeds. Google News RSS, free, no key. Each feed fails
 * independently so one bad fetch doesn't drop the whole section.
 */

function getNewsSection_() {
  var results = {};
  Object.keys(CONFIG.NEWS_FEEDS).forEach(function (label) {
    results[label] = getTopHeadline_(CONFIG.NEWS_FEEDS[label]);
  });
  return results; // { 'Local (South Africa)': {title, link} | null, ... }
}

function getTopHeadline_(feedUrl) {
  try {
    var resp = UrlFetchApp.fetch(feedUrl, { muteHttpExceptions: true });
    if (resp.getResponseCode() !== 200) return null;

    var doc = XmlService.parse(resp.getContentText());
    var items = doc.getRootElement().getChild('channel').getChildren('item');
    if (!items.length) return null;

    var first = items[0];
    return {
      title: first.getChildText('title'),
      link: first.getChildText('link')
    };
  } catch (e) {
    Logger.log('News fetch failed for ' + feedUrl + ': ' + e);
    return null;
  }
}
