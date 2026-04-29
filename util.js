// --- キャッシュ操作の関数群 ---
function updateCache(sessions) {
  // 配列としてまるごと保存
  callFirebase('sessions', 'put', sessions);
}

function saveActiveSession(newSession, repo) {
  let sessions = getActiveSessionsCache();
  let sessionData;
  if (newSession && typeof newSession === 'object') {
    sessionData = newSession;
    sessionData.repo = repo; 
  } else {
    sessionData = { 
      name: String(newSession), 
      repo: repo, 
      state: 'RUNNING',
      title: 'New Task' 
    };
  }
  
  sessions.unshift(sessionData);
  updateCache(sessions.slice(0, 20));
}

function getActiveSessionsCache() {
  const data = callFirebase('sessions', 'get');
  return Array.isArray(data) ? data : [];
}