// Slackとの通信を処理するモジュール

let SLACK_BOT_TOKEN;
let SLACK_CHANNEL_ID;

if (typeof PropertiesService !== 'undefined') {
  SLACK_BOT_TOKEN = PropertiesService.getScriptProperties().getProperty('SLACK_BOT_TOKEN');
  SLACK_CHANNEL_ID = PropertiesService.getScriptProperties().getProperty('SLACK_CHANNEL_ID');
}

/**
 * Slack通知を送信する
 * @param {string} message 送信するメッセージ
 */
function sendSlackNotification(message) {
  if (!SLACK_BOT_TOKEN || !SLACK_CHANNEL_ID) {
    if (typeof Logger !== 'undefined') {
      Logger.log('SlackトークンまたはチャンネルIDが設定されていません。');
    }
    return;
  }
  
  UrlFetchApp.fetch('https://slack.com/api/chat.postMessage', {
    method: 'post',
    headers: { 'Authorization': `Bearer ${SLACK_BOT_TOKEN}`, 'Content-Type': 'application/json' },
    payload: JSON.stringify({ channel: SLACK_CHANNEL_ID, text: message })
  });
}

/**
 * テキストレスポンスを生成する共通関数
 * @param {string} message 返却するメッセージ
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function createTextResponse_(message) {
  return ContentService
    .createTextOutput(message)
    .setMimeType(ContentService.MimeType.TEXT);
}

if (typeof module !== 'undefined') {
  module.exports = { sendSlackNotification, createTextResponse_ };
}
