// --- キャッシュ操作の関数群 ---
function updateCache(sessions) {
  const props = PropertiesService.getScriptProperties();
  props.setProperty('SESSIONS_CACHE', JSON.stringify(sessions));
}

function saveActiveSession(newSession, repo) {
  const props = PropertiesService.getScriptProperties();
  let sessions = getActiveSessionsCache();
  // 簡易的にrepo情報を付与して先頭に追加
  if (typeof newSession === 'object') {
    newSession.repo = repo; 
    sessions.unshift(newSession);
  } else {
    // もし文字列（name）だけ渡された場合
    sessions.unshift({ name: newSession, repo: repo, state: 'RUNNING' });
  }
  updateCache(sessions.slice(0, 10)); // 直近10件に絞って保存
}

function getActiveSessionsCache() {
  const data = PropertiesService.getScriptProperties().getProperty('SESSIONS_CACHE');
  return data ? JSON.parse(data) : [];
}