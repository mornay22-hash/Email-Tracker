/**
 * Weather.gs — Cape Town conditions for the brief. Open-Meteo is free
 * and needs no API key. Fails gracefully so a weather outage never
 * breaks the whole brief.
 */

var WEATHER_CODES_ = {
  0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Fog', 48: 'Depositing rime fog',
  51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
  61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
  71: 'Slight snow', 80: 'Slight rain showers', 81: 'Moderate rain showers',
  82: 'Violent rain showers', 95: 'Thunderstorm'
};

function getWeatherSummary_() {
  try {
    var url = 'https://api.open-meteo.com/v1/forecast' +
      '?latitude=' + CONFIG.WEATHER_LAT + '&longitude=' + CONFIG.WEATHER_LON +
      '&current=temperature_2m,weather_code,wind_speed_10m' +
      '&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max' +
      '&timezone=' + encodeURIComponent(CONFIG.TIMEZONE) + '&forecast_days=1';

    var resp = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    if (resp.getResponseCode() !== 200) return null;

    var data = JSON.parse(resp.getContentText());
    var code = data.current.weather_code;
    var desc = WEATHER_CODES_[code] || 'Conditions code ' + code;

    return {
      text: desc + ', currently ' + Math.round(data.current.temperature_2m) + '°C, ' +
        'high ' + Math.round(data.daily.temperature_2m_max[0]) + '°C / low ' +
        Math.round(data.daily.temperature_2m_min[0]) + '°C, ' +
        'rain chance ' + data.daily.precipitation_probability_max[0] + '%, ' +
        'wind ' + Math.round(data.current.wind_speed_10m) + ' km/h'
    };
  } catch (e) {
    Logger.log('Weather fetch failed: ' + e);
    return null;
  }
}
