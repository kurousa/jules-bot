// コマンド処理
// スラッシュコマンド指示のハンドリングを定義

COMMANDS = {
    "usage": "/jules",
    "list": "/jules list",
    "task start": "/jules task start [repo] [prompt]"
}
/**
 * 使い方の案内メッセージを出力する
 * @input /jules
 */
function usage() {
  const message = [
    "💡 使いかた:",
    `・開始: \`${COMMANDS["task start"]}\``,
    `・一覧: \`${COMMANDS["list"]}\``
  ].join("\n");

  return createTextResponse(message);
}

/**
 * 進行中ジョブリストを取得
 * @input /jules list
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
      return createTextResponse("現在実行中のタスクはありません。");
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
  if (typeof Logger !== 'undefined') {
    Logger.log(`listMessage: \n ${listMessage}`);
  }
  return createTextResponse(listMessage);
}

/**
 * Julesへタスク開始の指示を行う
 * 
 * @input /jules task start [repo] [promt]
 */
function startTask(text) {
  const firstSpaceIndex = text.indexOf(' ');
  const repo = text.substring(0, firstSpaceIndex);
  const prompt = text.substring(firstSpaceIndex + 1);

  try {
    const julesResponse = createJulesSession(repo, prompt);
    saveActiveSession(julesResponse, repo);
    
    return createTextResponse(`🚀 Julesがタスクを開始しました！\n📦 Repo: ${repo}\n\n進行状況は \`/jules list\` で確認できます。`);

  } catch (err) {
      return createTextResponse("Jules API連携エラー: " + err.toString());
  }
}

/**
 * Julesのステータスを確認し、Slackに通知する
 * @input GASトリガー
 */
function checkJulesStatusAndNotify() {
  const sessions = fetchJulesSessions(); // APIから全セッション取得
  
  sessions.forEach(session => {
    const sessionId = session.name.split('/').pop();

    // Firebaseから前回のステータスを取得
    const lastNotifiedState = callFirebase(`status_history/${sessionId}/last_state`, 'get');

    // ステータスが変化した、または「承認待ち」の場合に通知
    if (session.state === 'AWAITING_USER_FEEDBACK' && lastNotifiedState !== 'AWAITING_USER_FEEDBACK') {
      const activity = fetchLatestActivity(sessionId);
      const log = activity ? `\n> *最新ログ:* ${activity.message}` : "";
      const repo = session.sourceContext.source.replace('sources/github/', '');
      
      sendSlackNotification(
        `⚠️ *Julesが確認を待っています！*\nRepo: ${repo}${log}\n🔗 <https://jules.google.com/session/${sessionId.split('/').pop()}|回答する>`
      );
      // 通知済み状態をFirebaseに記録（PropertiesServiceを汚さない！）
      callFirebase(`status_history/${sessionId}`, 'patch', {
        last_state: session.state,
        notified_at: new Date().getTime()
      });
    }
  });
}

if (typeof module !== 'undefined') {
  module.exports = { usage, getJulesJobList, startTask, checkJulesStatusAndNotify };
}
