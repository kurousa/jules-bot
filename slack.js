// Slackとの通信を処理するモジュール

let SLACK_BOT_TOKEN;
let SLACK_CHANNEL_ID;

if (typeof PropertiesService !== 'undefined') {
  SLACK_BOT_TOKEN = PropertiesService.getScriptProperties().getProperty('SLACK_BOT_TOKEN');
  SLACK_CHANNEL_ID = PropertiesService.getScriptProperties().getProperty('SLACK_CHANNEL_ID');
}

function sendSlackNotification(message) {
  if (!SLACK_BOT_TOKEN || !SLACK_CHANNEL_ID) {
    if (typeof Logger !== 'undefined') {
      Logger.log('SlackトークンまたはチャンネルIDが設定されていません。');
    }
    return;
  }
  
  if (typeof UrlFetchApp !== 'undefined') {
    UrlFetchApp.fetch('https://slack.com/api/chat.postMessage', {
      method: 'post',
      headers: { 'Authorization': `Bearer ${SLACK_BOT_TOKEN}`, 'Content-Type': 'application/json' },
      payload: JSON.stringify({ channel: SLACK_CHANNEL_ID, text: message })
    });
  }
}

function createTextResponse(message) {
  return ContentService.createTextOutput(message).setMimeType(ContentService.MimeType.TEXT);
}

if (typeof module !== 'undefined') {
  module.exports = { sendSlackNotification, createTextResponse };
}
