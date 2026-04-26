// Slackとの通信を処理するモジュール

const SLACK_BOT_TOKEN = PropertiesService.getScriptProperties().getProperty('SLACK_BOT_TOKEN');
const SLACK_CHANNEL_ID = PropertiesService.getScriptProperties().getProperty('SLACK_CHANNEL_ID');

function sendSlackNotification(message) {
  if (!SLACK_BOT_TOKEN || !SLACK_CHANNEL_ID) {
    Logger.log('SlackトークンまたはチャンネルIDが設定されていません。');
    return;
  }
  
  UrlFetchApp.fetch('https://slack.com/api/chat.postMessage', {
    method: 'post',
    headers: { 'Authorization': `Bearer ${SLACK_BOT_TOKEN}`, 'Content-Type': 'application/json' },
    payload: JSON.stringify({ channel: SLACK_CHANNEL_ID, text: message })
  });
}