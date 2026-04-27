// Slackとの通信を処理するモジュール
/**
 * SlackからのPostリクエストを処理する
 */
function doPost(e) {
  // Slackからのスラッシュコマンドは 'parameter' に入ってきます
  const params = e.parameter;
  // スラッシュコマンドのテキスト部分を取得 (例: "owner/repo bug fix")
  const text = params.text.trim();
  
  // --- 引数が "list" の場合：一覧を表示 ---
  if (text.toLowerCase() === 'list') {
    return getJulesJobList();
  }
  // --- 引数が [repo] [prompt] の場合：タスク開始 ---
  const firstSpaceIndex = text.indexOf(' '); 
  if (firstSpaceIndex === -1) {
    return usage();
  } 
  return startTask(text);
}

/**
 * 使い方の案内メッセージを出力する
 */
function usage() {
  return ContentService
    .createTextOutput("💡 使いかた:\n・開始: `/jules [repo] [prompt]`\n・一覧: `/jules list`")
    .setMimeType(ContentService.MimeType.TEXT);
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
      return ContentService
        .createTextOutput("現在実行中のタスクはありません。")
        .setMimeType(ContentService.MimeType.TEXT);
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
  return ContentService
    .createTextOutput(listMessage)
    .setMimeType(ContentService.MimeType.TEXT);      
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
    
    return ContentService
      .createTextOutput(`🚀 Julesがタスクを開始しました！\n📦 Repo: ${repo}\n\n進行状況は \`/jules list\` で確認できます。`)
      .setMimeType(ContentService.MimeType.TEXT);

  } catch (err) {
      return ContentService
        .createTextOutput("Jules API連携エラー: " + err.toString())
        .setMimeType(ContentService.MimeType.TEXT);
  }
}

