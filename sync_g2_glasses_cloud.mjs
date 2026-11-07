import fs from 'node:fs';
import path from 'node:path';

const G2_DIR = path.join(process.cwd(), 'docs', 'g2');
const HISTORY_PATH = path.join(G2_DIR, 'g2_chat_history.json');
const CHAT_MD_PATH = path.join(G2_DIR, 'G2_안경_실시간대화록.md');
const BRAIN_JSON_PATH = path.join(G2_DIR, 'brain_context.json');
const MEMORY_JSON_PATH = path.join(G2_DIR, 'g2_long_term_memory.json');
const MEMORY_MD_PATH = path.join(G2_DIR, 'G2_영구기억_노트.md');

const CLOUD_SYNC_TOPIC = 'agy_g2_brain_sync_e3562553';
const CLOUD_POLL_URL = `https://ntfy.sh/${CLOUD_SYNC_TOPIC}/json?poll=1&since=all`;

function redactSecrets(text) {
  return String(text || '')
    .replace(/sk-or-v1-[A-Za-z0-9_-]+/g, '[OPENROUTER_KEY_REDACTED]')
    .replace(/AIzaSy[A-Za-z0-9_-]+/g, '[GEMINI_KEY_REDACTED]')
    .replace(/ghp_[A-Za-z0-9_-]+/g, '[GITHUB_TOKEN_REDACTED]');
}

async function runCloudG2Sync() {
  if (!fs.existsSync(G2_DIR)) {
    fs.mkdirSync(G2_DIR, { recursive: true });
  }

  let history = { processedIds: [], entries: [] };
  if (fs.existsSync(HISTORY_PATH)) {
    try {
      history = JSON.parse(fs.readFileSync(HISTORY_PATH, 'utf8'));
    } catch (e) {}
  }

  let memoryVault = {
    updatedAt: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
    pinnedReminder: '파란색 자동차 (내 차량)',
    items: [
      {
        id: 'mem_car_blue_01',
        category: '차량/주차',
        fact: '대표님의 차량은 파란색 자동차입니다.',
        sourceQuestion: '저기 있는 파란색 자동차가 제 차예요',
        createdAt: '2026. 11. 7. 오후 9:21:49',
        pinned: true
      }
    ]
  };
  if (fs.existsSync(MEMORY_JSON_PATH)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(MEMORY_JSON_PATH, 'utf8'));
      if (parsed && Array.isArray(parsed.items)) memoryVault = parsed;
    } catch (e) {}
  }

  let added = 0;
  let memChanged = false;
  try {
    const res = await fetch(CLOUD_POLL_URL, { headers: { 'Cache-Control': 'no-cache' } });
    if (res.ok) {
      const text = await res.text();
      const lines = text.split('\n').filter(Boolean);
      for (const line of lines) {
        try {
          const evt = JSON.parse(line);
          if (evt.event !== 'message' || !evt.message) continue;

          if (evt.title === 'AGY_G2_MEMORY_SYNC') {
            const mp = JSON.parse(evt.message);
            if (mp && mp.action === 'delete' && mp.id) {
              const before = memoryVault.items.length;
              memoryVault.items = memoryVault.items.filter(it => it.id !== mp.id);
              if (memoryVault.items.length !== before) memChanged = true;
            } else if (mp && mp.fact) {
              const cleanFact = redactSecrets(mp.fact);
              const existIdx = memoryVault.items.findIndex(it => it.id === mp.id || it.fact === cleanFact);
              if (mp.pinned) {
                memoryVault.items.forEach(it => { it.pinned = false; });
                memoryVault.pinnedReminder = cleanFact.slice(0, 65);
              }
              if (existIdx >= 0) {
                memoryVault.items[existIdx] = { ...memoryVault.items[existIdx], ...mp, fact: cleanFact };
              } else {
                memoryVault.items.unshift({
                  id: mp.id || `mem_${Date.now()}`,
                  category: mp.category || '개인기억',
                  fact: cleanFact,
                  createdAt: mp.createdAt || new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
                  pinned: Boolean(mp.pinned)
                });
              }
              memChanged = true;
            }
            continue;
          }

          if (evt.title === 'AGY_G2_CONV_SYNC' || evt.title === 'Antigravity-G2-Sync' || !evt.title) {
            const payload = JSON.parse(evt.message);
            if (!payload || !payload.question) continue;
            const id = payload.id || `g2_${payload.timestamp}_${payload.question.slice(0, 10)}`;
            if (history.processedIds.includes(id)) continue;

            history.processedIds.push(id);
            history.entries.push({
              id,
              timestamp: payload.timestamp || new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
              question: redactSecrets(payload.question),
              answer: redactSecrets(payload.answer || ''),
              model: payload.model || 'OpenRouter-AI'
            });
            added++;
          }
        } catch (e) {}
      }
    }
  } catch (e) {
    console.warn('[G2 Cloud Poll Warning]:', e.message);
  }

  if (history.entries.length > 300) {
    history.entries = history.entries.slice(-300);
  }

  fs.writeFileSync(HISTORY_PATH, JSON.stringify(history, null, 2), 'utf8');

  if (memChanged || !fs.existsSync(MEMORY_JSON_PATH)) {
    memoryVault.updatedAt = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
    fs.writeFileSync(MEMORY_JSON_PATH, JSON.stringify(memoryVault, null, 2), 'utf8');
    const memMd = [
      '# 🧠 안티그래비티 × Even G2 스마트 안경 영구 장기기억 노트 (GitHub Cloud)',
      '',
      `> **최종 클라우드 동기화**: ${memoryVault.updatedAt}`,
      `> **현재 고정 리마인더**: \`${memoryVault.pinnedReminder || '없음'}\``,
      '',
      '---',
      '',
      ...memoryVault.items.map(it => `- **[${it.category || '기억'}]${it.pinned ? ' (★고정)' : ''}** ${it.fact} _(${it.createdAt || ''})_`),
      ''
    ].join('\n');
    fs.writeFileSync(MEMORY_MD_PATH, memMd, 'utf8');
  }

  const mdLines = [
    '# 👓 안티그래비티 × Even G2 스마트 안경 실시간 누적 대화록 (GitHub Cloud)',
    '',
    `> **최종 클라우드 동기화**: ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}`,
    `> **연동 경로**: Even G2 안경 ↔ GitHub (\`docs/g2/G2_안경_실시간대화록.md\`) ↔ PC (\`e:\\안티그래비티\\G2_안경_실시간대화록.md\`) ↔ 구글 드라이브`,
    '',
    '---',
    ''
  ];

  for (const item of history.entries) {
    mdLines.push(`## [${item.timestamp}] 질문: ${item.question}`);
    mdLines.push(`- **사용 모델**: \`${item.model || 'OpenRouter'}\``);
    mdLines.push(`- **안티그래비티 답변**:`);
    mdLines.push('');
    mdLines.push(item.answer);
    mdLines.push('');
    mdLines.push('---');
    mdLines.push('');
  }

  fs.writeFileSync(CHAT_MD_PATH, mdLines.join('\n'), 'utf8');

  if (fs.existsSync(BRAIN_JSON_PATH) && (added > 0 || memChanged)) {
    try {
      const brain = JSON.parse(fs.readFileSync(BRAIN_JSON_PATH, 'utf8'));
      const recentMessages = [];
      for (const e of history.entries.slice(-30)) {
        recentMessages.push({ role: 'user', content: e.question, timestamp: e.timestamp });
        recentMessages.push({ role: 'assistant', content: e.answer, timestamp: e.timestamp, model: e.model });
      }
      brain.recentConversations = recentMessages;
      brain.longTermMemories = memoryVault.items;
      brain.pinnedReminder = memoryVault.pinnedReminder;
      brain.updatedAt = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
      fs.writeFileSync(BRAIN_JSON_PATH, JSON.stringify(brain, null, 2), 'utf8');
    } catch (e) {}
  }

  console.log(`[G2 GitHub Cloud Sync] 신규 안경 대화 ${added}건 반영 완료 (총 ${history.entries.length}건, 영구기억 ${memoryVault.items.length}건)`);
}

runCloudG2Sync();
