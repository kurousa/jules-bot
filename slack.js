// Slackとの通信を処理するモジュール

let SLACK_BOT_TOKEN;
let SLACK_CHANNEL_ID;

if (typeof PropertiesService !== 'undefined') {
  SLACK_BOT_TOKEN = PropertiesService.getScriptProperties().getProperty('SLACK_BOT_TOKEN');
  SLACK_CHANNEL_ID = PropertiesService.getScriptProperties().getProperty('SLACK_CHANNEL_ID');
}

/**
 * 使い方の案内メッセージを出力する
 */
function usage() {
  return createTextResponse_("💡 使いかた:\n・開始: `/jules [repo] [prompt]`\n・一覧: `/jules list`");
}

/**
 * 進行中ジョブリストを取得
 * @input
 *  /jules list
 */
function getJulesJobList() {
  let sessions = [];
  let isFromCache = false;  
  try {
      // 1. まずはAPIから取得を試みる
      sessions = fetchJulesSessions();
      // 取得に成功したらキャッシュを更新しておく
      if (sessions && sessions.length > 0) {
        updateCache(sessions);
      }
  } catch (err) {
      // 2. APIがタイムアウトやエラーならキャッシュに切り替え
      console.warn("API Fetch failed, switching to cache: " + err.toString());
      sessions = getActiveSessionsCache();
      isFromCache = true;
  }

  if (!sessions || sessions.length === 0) {
      return createTextResponse_("現在実行中のタスクはありません。"); 
  }

  let listMessage = isFromCache
    ? "⚠️ *APIタイムアウトのためキャッシュを表示中:*\n"
    : "📂 *Jules API セッション一覧:*\n";

  sessions.slice(0, 5).forEach((s, i) => {
    const sessionId = s.name.split('/').pop();
    const repo = s.sourceContext?.source?.replace('sources/github/', '') || s.repo || 'Unknown Repo';
    const statusEmoji = getStatusEmoji(s.state); // ステータスに応じた絵文字
    const title = s.title || s.prompt || 'No Title';
    const sessionUrl = `https://jules.google.com/session/${sessionId}`;
    listMessage += `${i + 1}. *${repo}*\n   ${statusEmoji} ${title}\n   🔗 ${sessionUrl}\n`;
  });
  return createTextResponse_(listMessage);
}

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
 * Julesへタスク開始の指示を行う
 * 
 * @input
 *  /jules [repo] [promt] 形式
 */
function startTask(text) {
  const firstSpaceIndex = text.indexOf(' ');
  const repo = text.substring(0, firstSpaceIndex);
  const prompt = text.substring(firstSpaceIndex + 1);

  try {
    const julesResponse = createJulesSession(repo, prompt);
    saveActiveSession(julesResponse, repo);
    
    return createTextResponse_(`🚀 Julesがタスクを開始しました！\n📦 Repo: ${repo}\n\n進行状況は \`/jules list\` で確認できます。`);

  } catch (err) {
    console.error(err);
    return createTextResponse_("Jules API連携中にエラーが発生しました。しばらくしてから再度お試しください。");
  }
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
