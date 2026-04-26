// API通信窓口

/**
 * Postリクエストを処理する
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
 * Getリクエストを処理する
 */
function doGet(e) {
  return usage();
}