/**
 * Firebase Realtime Database と通信するためのヘルパー
 */
function callFirebase(path, method = 'get', data = null) {
  const baseUrl = PropertiesService.getScriptProperties().getProperty('FIREBASE_URL');
  const url = `${baseUrl}${path}.json`;
  
  const options = {
    method: method,
    contentType: 'application/json',
    muteHttpExceptions: true
  };
  
  if (data) {
    options.payload = JSON.stringify(data);
  }
  
  const response = UrlFetchApp.fetch(url, options);
  if (response.getResponseCode() !== 200) {
    Logger.log(`[callFirebase Error] Status Code: ${response.getResponseCode()}`);
    return null
  }
  return JSON.parse(response.getContentText());
}
