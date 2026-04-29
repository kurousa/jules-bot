// Jules API処理モジュール
// Docs: https://developers.google.com/jules/api
const API_KEY = typeof PropertiesService !== 'undefined'
  ? PropertiesService.getScriptProperties()?.getProperty('JULES_API_KEY')
  : 'MOCK_KEY';
const API_BASE = 'https://jules.googleapis.com/';
const API_VERSION = 'v1alpha';

/** 
 * Jules API に新たなセッションを作成する
 */
function createJulesSession(repoPath, prompt) {
  const url = `${API_BASE}${API_VERSION}/sessions`;
  const payload = {
    prompt: prompt,
    sourceContext: {
      source: `sources/github/${repoPath}`,
      githubRepoContext: { startingBranch: 'main' }
    }
  };

  const response = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    headers: { 'X-Goog-Api-Key': API_KEY },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });
  
  return JSON.parse(response.getContentText());
}

/**
 * Jules API からセッション一覧を取得する
 */
function fetchJulesSessions() {
  const url = `${API_BASE}${API_VERSION}/sessions`;
  
  const response = UrlFetchApp.fetch(url, {
    method: 'get',
    headers: {
      'X-Goog-Api-Key': API_KEY
    },
    muteHttpExceptions: true
  });

  const data = JSON.parse(response.getContentText());
  // API仕様に基づき 'sessions' フィールドを返却
  return data.sessions || [];
}

/**
 * Julesのステータス名を絵文字に変換する
 */
function getStatusEmoji(state) {
  Logger.log(`state: ${state}`);
  if (!state) return "⚪"; // 不明
  
  switch (state.toUpperCase()) {
    case 'IDLE':
      return "😴"; 
    case 'RUNNING':
    case 'ANALYZING':
    case 'PLANNING':
      return "⚙️"; // 実行中（ほうき/ペン相当）
    case 'AWAITING_USER_FEEDBACK':
      return "❓[**ACTION NEEDED**]"; // ユーザー確認待ち（オレンジのアイコン相当）
    case 'COMPLETED':
      return "✅"; // 完了（紫のチェック相当）
    case 'FAILED':
      return "❌"; // 失敗
    default:
      return "🌀"; // その他実行中など
  }
}

if (typeof module !== 'undefined') {
  module.exports = {
    getStatusEmoji
  };
}