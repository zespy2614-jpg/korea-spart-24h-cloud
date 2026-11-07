// __EDITH_OTA__ Live Over-The-Air Patch v3.2.2 — Seamless Infinite Scroll Windows + Left/Right Optical Margin + Antigravity Live Wakeup
(function () {
  if (window.__EDITH_OTA_V31_APPLIED__) return;
  window.__EDITH_OTA_V31_APPLIED__ = true;
  console.log('[EDITH OTA] v3.2.2 Seamless Infinite Scroll Windows + Optical Margin + Live Antigravity Wakeup Activated');

  const agy = window.__EDITH_AGY__;
  const origFetch = window.fetch.bind(window);
  const translateCache = new Map();
  const CLOUD_SYNC_URL = 'https://ntfy.sh/agy_g2_brain_sync_e3562553';

  const isLegacyV2Host = !Boolean(agy && agy.buildMenuItems);

  // 1. Transcript Post-Correction & Anti-"00:00" Filter
  function cleanAndCorrectTranscript(raw) {
    let s = String(raw || '').replace(/^["'`]+|["'`]+$/g, '').trim();
    if (!s) return 'EMPTY';
    if (/^(\d{1,2}:\d{2}(\s*-\s*\d{1,2}:\d{2})?|empty|none|null|\.+|-+|음성\s*없음|무음)$/i.test(s)) {
      return 'EMPTY';
    }
    s = s
      .replace(/컴피\s*반트\s*비디오|컴퓨턴트\s*비디오|안티\s*그래픽(티|기)?|안티그래픽(티|기)?|안티\s*그래비키/gi, '안티그래비티')
      .replace(/기사부|기허브|깃\s*허브/gi, '깃허브')
      .replace(/데미나인|재미나이|제미\s*나이/gi, '제미나이')
      .replace(/아라곤\s*4|아르고\s*4/gi, '아라곤 4')
      .replace(/오픈\s*라우더|라우더\s*필터/gi, '오픈라우터')
      .replace(/너트니언이/gi, '너 지능이')
      .replace(/컴피규에서/gi, '컴퓨터에서')
      .replace(/그\s*해와\s*듣는/gi, '대화 듣는');
    // Prevent v2.0.0's `if (userQuestion.includes('시계 모드')) enterClockStandby()` bug from triggering when user asks a question about clock mode!
    if (s.length > 10) {
      s = s
        .replace(/시계\s*모드/g, '시계화면모드')
        .replace(/시계\s*대기/g, '시계대기화면')
        .replace(/화면\s*꺼/g, '화면끄기')
        .replace(/안경\s*꺼/g, '안경끄기');
    }
    return s.trim() || 'EMPTY';
  }

  // 2. Long-Term Memory Vault Helpers
  function getVault() {
    try {
      const stVault = agy?.state?.memories || agy?.state?.longTermMemories;
      if (Array.isArray(stVault) && stVault.length > 0) return stVault;
      const local = JSON.parse(localStorage.getItem('agy_g2_long_term_memories') || '[]');
      if (Array.isArray(local) && local.length > 0) return local;
    } catch {}
    const defaults = [
      { id: 'mem_car_blue', category: '차량/주차', text: '대표님의 차량은 파란색 자동차입니다.', fact: '대표님의 차량은 파란색 자동차입니다.', pinned: true, updatedAt: '2026. 11. 7.' },
      { id: 'mem_biz_core', category: '핵심비즈니스', text: 'Gparts(지파츠) 40선 수입차 부품 매칭 및 8개국 80선 글로벌 소싱 프로젝트 운영 중', fact: 'Gparts(지파츠) 40선 수입차 부품 매칭 및 8개국 80선 글로벌 소싱 프로젝트 운영 중', pinned: true, updatedAt: '2026. 11. 7.' }
    ];
    localStorage.setItem('agy_g2_long_term_memories', JSON.stringify(defaults));
    return defaults;
  }

  function saveVault(list) {
    localStorage.setItem('agy_g2_long_term_memories', JSON.stringify(list));
    if (agy?.state) {
      agy.state.longTermMemories = list;
      agy.state.memories = list;
    }
  }

  async function syncMemoryAction(payload) {
    for (const base of ['http://192.168.123.150:3860', 'http://192.168.123.104:3860']) {
      try {
        await origFetch(`${base}/api/memory`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(2000)
        });
        break;
      } catch {}
    }
    try {
      await origFetch(CLOUD_SYNC_URL, {
        method: 'POST',
        headers: { Title: 'AGY_G2_MEMORY_SYNC', Priority: 'default' },
        body: JSON.stringify({ type: 'AGY_G2_MEMORY_SYNC', ...payload, timestamp: new Date().toLocaleString('ko-KR') })
      });
    } catch {}
  }

  async function sendRemotePcNote(noteText) {
    const clean = String(noteText || '').trim();
    if (!clean) return;
    const isPureQuestion = /(작업하고\s*있어\?|실행하고\s*있어\?|됐어\?|완료됐어\?|기억나\?|뭐야\?)$/.test(clean);
    const payload = {
      action: 'auto_task',
      command: clean,
      text: clean,
      rawQuestion: clean,
      autoInjectIde: !isPureQuestion && /(안티그래비티|작업|실행|세팅|수정|패치|만들어|고쳐|추가|바꿔|시켜|없애|해제|지워|넣어|빼|늘려|줄여|보여줘|전환|적용|반영)/.test(clean),
      category: '안경원격지시',
      timestamp: new Date().toLocaleString('ko-KR')
    };
    for (const base of ['http://192.168.123.150:3860', 'http://192.168.123.104:3860']) {
      try {
        await origFetch(`${base}/api/pc-action`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(2000)
        });
        break;
      } catch {}
    }
    try {
      await origFetch(CLOUD_SYNC_URL, {
        method: 'POST',
        headers: { Title: 'AGY_G2_PC_COMMAND', Priority: 'high' },
        body: JSON.stringify({ type: 'AGY_G2_PC_COMMAND', ...payload })
      });
    } catch {}
  }

  // 3. Upgrade DOM on Phone (v2.0.0 & v3.0.0 compatibility)
  function upgradePhoneDom() {
    document.querySelectorAll('.help .mono').forEach((el) => {
      if (el.textContent && (el.textContent.includes('v2.0.0') || el.textContent.includes('v3.0.0'))) {
        el.textContent = 'EDITH 2.0 × Antigravity v3.1.0 (High Reasoning + 정밀 음성인식 + 롱프레스 전용)';
      }
    });

    // Update controls guide text so user sees single-tap is disabled and wakes clock standby to show previous chat
    const ctrlList = document.querySelector('.controls');
    if (ctrlList) {
      ctrlList.innerHTML = `
        <li>안경다리나 링을 <b>길게 누르고</b> 말하기 (단순 한 번 탭 음성 오작동 차단됨)</li>
        <li>시계 대기 모드에서 <b>한 번 탭</b>하면 이전 대화 다시 보기 (페이지 넘김)</li>
        <li><b>탭한 다음 길게 누르면</b> 안경 메뉴 열기 · <b>두 번 탭</b>하면 시계 대기 / 종료</li>
      `;
    }

    // Disable followUp & wakeWord checkboxes to prevent false mic triggers
    const prefFollowUp = document.getElementById('prefFollowUp');
    const prefWakeWord = document.getElementById('prefWakeWord');
    if (prefFollowUp) prefFollowUp.checked = false;
    if (prefWakeWord) prefWakeWord.checked = false;
    localStorage.setItem('edith_pref_followup', '0');
    localStorage.setItem('edith_pref_wake', '0');

    // Replace #subtitlesChip with #memoryVaultChip if needed
    const subChip = document.getElementById('subtitlesChip');
    let memChip = document.getElementById('memoryVaultChip');
    if (subChip && !memChip) {
      memChip = document.createElement('button');
      memChip.type = 'button';
      memChip.className = 'chip';
      memChip.id = 'memoryVaultChip';
      memChip.setAttribute('aria-pressed', 'false');
      memChip.textContent = '기억 금고';
      subChip.replaceWith(memChip);
    } else if (subChip && memChip) {
      subChip.style.display = 'none';
    }

    const modesContainer = document.querySelector('.modes');
    if (modesContainer && !modesContainer.querySelector('[data-ask*="지파츠"]')) {
      const gpChip = document.createElement('button');
      gpChip.type = 'button';
      gpChip.className = 'chip';
      gpChip.setAttribute('data-ask', '지파츠(Gparts) 크롤러 40선과 8개국 소싱 핵심 현황을 브리핑해 줘.');
      gpChip.textContent = 'Gparts·80선 요약';
      gpChip.addEventListener('click', () => {
        if (agy?.askEdith) {
          if (agy.state) agy.state.trigger = 'phone';
          void agy.askEdith({ text: gpChip.getAttribute('data-ask') });
        }
      });
      modesContainer.appendChild(gpChip);
    }

    let drawer = document.getElementById('memoryDrawer');
    if (!drawer) {
      const style = document.createElement('style');
      style.textContent = `
        .memory-drawer {
          display: none; flex-direction: column; gap: 10px; padding: 14px;
          border-radius: 16px; background: var(--surface);
          box-shadow: 0 0 0 1px rgba(245, 197, 66, 0.28); margin-bottom: 6px;
        }
        .memory-drawer.open { display: flex; }
        .memory-drawer-head { display: flex; align-items: center; justify-content: space-between; }
        .memory-drawer-title { font-size: 13px; font-weight: 700; color: var(--accent); letter-spacing: 0.02em; }
        .memory-add-row { display: flex; gap: 6px; }
        .memory-add-row select {
          padding: 8px 10px; border-radius: 10px; border: 1px solid var(--line);
          background: var(--input); color: var(--fg); font-size: 12.5px; outline: none;
        }
        .memory-add-row input {
          flex: 1; min-width: 0; padding: 8px 12px; border-radius: 10px; border: 1px solid var(--line);
          background: var(--input); color: var(--fg); font-size: 13px; outline: none;
        }
        .memory-list { display: flex; flex-direction: column; gap: 6px; max-height: 210px; overflow-y: auto; }
        .memory-item {
          display: flex; align-items: flex-start; justify-content: space-between; gap: 8px;
          padding: 8px 10px; border-radius: 10px; background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06); font-size: 12.5px; line-height: 1.45;
        }
        .memory-item[data-pinned="true"] { border-color: rgba(245, 197, 66, 0.4); background: rgba(245, 197, 66, 0.07); }
        .memory-badge {
          display: inline-block; padding: 1px 6px; border-radius: 6px; background: rgba(245, 197, 66, 0.18);
          color: var(--accent); font-size: 11px; font-weight: 600; margin-right: 6px;
        }
        .memory-actions { display: flex; gap: 4px; flex-shrink: 0; }
        .memory-btn {
          border: 0; background: rgba(255, 255, 255, 0.06); color: var(--dim);
          border-radius: 6px; padding: 3px 7px; font-size: 11px; cursor: pointer;
        }
        .memory-btn.active { color: var(--accent); background: rgba(245, 197, 66, 0.18); }
      `;
      document.head.appendChild(style);

      drawer = document.createElement('section');
      drawer.id = 'memoryDrawer';
      drawer.className = 'memory-drawer';
      drawer.innerHTML = `
        <div class="memory-drawer-head">
          <span class="memory-drawer-title">📌 영구 기억 금고 (차량·주차·할일·소싱 핵심기억)</span>
          <button id="sendPcNoteBtn" type="button" class="button quiet sm">PC로 메모 전송</button>
        </div>
        <form id="memoryAddForm" class="memory-add-row">
          <select id="memoryCategorySelect">
            <option value="차량/주차">차량/주차</option>
            <option value="할일/일정">할일/일정</option>
            <option value="부품/소싱">부품/소싱</option>
            <option value="중요기억">중요기억</option>
          </select>
          <input id="memoryTextInput" type="text" placeholder="기억할 내용 입력 (예: 파란색 차 B2 E4 주차)" />
          <button type="submit" class="button sm" style="background:var(--accent);color:#111;border:0;font-weight:700;">저장</button>
        </form>
        <div id="memoryListContainer" class="memory-list"></div>
      `;
      const syncBanner = document.querySelector('.sync-banner');
      if (syncBanner && syncBanner.parentNode) {
        syncBanner.parentNode.insertBefore(drawer, syncBanner.nextSibling);
      }

      const renderVaultUi = () => {
        const listEl = document.getElementById('memoryListContainer');
        if (!listEl) return;
        const vault = getVault();
        listEl.replaceChildren();
        vault.forEach((m) => {
          const row = document.createElement('div');
          row.className = 'memory-item';
          row.dataset.pinned = m.pinned ? 'true' : 'false';
          const left = document.createElement('div');
          const badge = document.createElement('span');
          badge.className = 'memory-badge';
          badge.textContent = m.category || '기억';
          const txt = document.createElement('span');
          txt.textContent = m.text || m.fact || '';
          left.append(badge, txt);

          const actions = document.createElement('div');
          actions.className = 'memory-actions';
          const pinBtn = document.createElement('button');
          pinBtn.type = 'button';
          pinBtn.className = `memory-btn ${m.pinned ? 'active' : ''}`;
          pinBtn.textContent = m.pinned ? '📌 고정됨' : '고정';
          pinBtn.addEventListener('click', () => {
            m.pinned = !m.pinned;
            saveVault(vault);
            renderVaultUi();
            void syncMemoryAction({ action: 'add', category: m.category, text: m.text || m.fact, fact: m.text || m.fact, pinned: m.pinned });
          });

          const delBtn = document.createElement('button');
          delBtn.type = 'button';
          delBtn.className = 'memory-btn';
          delBtn.textContent = '삭제';
          delBtn.addEventListener('click', () => {
            const next = vault.filter((x) => x.id !== m.id);
            saveVault(next);
            renderVaultUi();
            void syncMemoryAction({ action: 'delete', id: m.id });
          });

          actions.append(pinBtn, delBtn);
          row.append(left, actions);
          listEl.appendChild(row);
        });
      };

      renderVaultUi();

      if (memChip) {
        memChip.addEventListener('click', () => {
          const open = drawer.classList.toggle('open');
          memChip.setAttribute('aria-pressed', open ? 'true' : 'false');
          if (open) renderVaultUi();
        });
      }

      const addForm = document.getElementById('memoryAddForm');
      if (addForm) {
        addForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const catEl = document.getElementById('memoryCategorySelect');
          const txtEl = document.getElementById('memoryTextInput');
          const text = String(txtEl?.value || '').trim();
          if (!text) return;
          const category = catEl?.value || '중요기억';
          const vault = getVault();
          const item = { id: `mem_${Date.now()}`, category, text, fact: text, pinned: true, updatedAt: new Date().toLocaleString('ko-KR') };
          vault.unshift(item);
          saveVault(vault);
          txtEl.value = '';
          renderVaultUi();
          void syncMemoryAction({ action: 'add', category, text, fact: text, pinned: true });
        });
      }

      const pcBtn = document.getElementById('sendPcNoteBtn');
      if (pcBtn) {
        pcBtn.addEventListener('click', () => {
          const txtEl = document.getElementById('memoryTextInput');
          const composeEl = document.getElementById('composeInput');
          const note = String(txtEl?.value || composeEl?.value || '').trim();
          if (!note) {
            if (txtEl) txtEl.focus();
            return;
          }
          void sendRemotePcNote(note);
          if (txtEl) txtEl.value = '';
        });
      }
    }

    const syncText = document.getElementById('syncStatusText');
    if (syncText && !syncText.innerHTML.includes('v3.1')) {
      syncText.innerHTML = '<b>PC ↔ GitHub (v3.1 High추론·정밀음성·롱프레스 적용됨)</b>';
    }
  }

  function ensureLastConversationOnState(st) {
    if (!st) return false;
    if (st.last && st.last.reply) return true;
    const pool =
      Array.isArray(st.history) && st.history.length > 0
        ? st.history
        : Array.isArray(st.brainContext?.recentConversations)
          ? st.brainContext.recentConversations
          : [];
    if (pool.length > 0) {
      const lastUser = [...pool].reverse().find((m) => m.role === 'user');
      const lastAssistant = [...pool].reverse().find((m) => m.role === 'assistant');
      if (lastAssistant && lastAssistant.content) {
        st.last = {
          you: String(lastUser?.content || '').slice(0, 80),
          reply: String(lastAssistant.content)
        };
        return true;
      }
    }
    const searchPool = st.brainContext?.conversationSearchIndex;
    if (Array.isArray(searchPool) && searchPool.length > 0) {
      const lastTurn = searchPool[searchPool.length - 1];
      if (lastTurn && (lastTurn.a || lastTurn.q)) {
        st.last = {
          you: String(lastTurn.q || '').slice(0, 80),
          reply: String(lastTurn.a || '')
        };
        return true;
      }
    }
    return false;
  }

  function repairCorruptedKeyIfNeeded(rawKey) {
    const k = String(rawKey || '').trim();
    if (/^(sk-or-v1-[0-9a-f]{32,128}|AIza[0-9A-Za-z_-]{20,60})$/i.test(k)) return k;
    if (k.startsWith('sk-or-')) {
      const s1 = 'agy_g2_salt_2026';
      const s2 = 'agy_g2_openrouter_2026';
      let out = '';
      for (let i = 0; i < k.length; i++) {
        out += String.fromCharCode(k.charCodeAt(i) ^ s1.charCodeAt(i % s1.length) ^ s2.charCodeAt(i % s2.length));
      }
      if (/^sk-or-v1-[0-9a-f]{32,128}$/i.test(out)) return out;
    }
    // Fallback: decode from brainContext.encryptedConfig.k or obfuscatedKey
    const enc = agy?.state?.brainContext?.obfuscatedKey || agy?.state?.brainContext?.encryptedConfig?.k;
    if (enc) {
      for (const salt of ['agy_g2_salt_2026', 'agy_g2_openrouter_2026']) {
        try {
          const raw = atob(enc);
          let dec = '';
          for (let i = 0; i < raw.length; i++) {
            dec += String.fromCharCode(raw.charCodeAt(i) ^ salt.charCodeAt(i % salt.length));
          }
          if (/^(sk-or-v1-[0-9a-f]{32,128}|AIza[0-9A-Za-z_-]{20,60})$/i.test(dec)) return dec;
        } catch {}
      }
    }
    return k;
  }

  function ensureValidApiKeyOnDevice() {
    try {
      const saved = localStorage.getItem('agy_gemini_api_key') || '';
      const fixedSaved = repairCorruptedKeyIfNeeded(saved);
      if (fixedSaved && fixedSaved !== saved) {
        localStorage.setItem('agy_gemini_api_key', fixedSaved);
      }
      if (agy?.state?.apiKey) {
        const fixedState = repairCorruptedKeyIfNeeded(agy.state.apiKey);
        if (fixedState && fixedState !== agy.state.apiKey) {
          agy.state.apiKey = fixedState;
          localStorage.setItem('agy_gemini_api_key', fixedState);
        }
      }
    } catch {}
  }
  ensureValidApiKeyOnDevice();

  // UTF-8 byte-safe slicer (Even G2 BLE firmware counts UTF-8 bytes: 1 Korean char = 3 bytes;
  // pageObjects limit is ~920 UTF-8 bytes, textContainerUpgrade limit is ~1680 UTF-8 bytes)
  function sliceByUtf8Bytes(str, maxBytes = 1620) {
    const s = String(str || '');
    if (!s) return ' ';
    let bytes = 0;
    let lastSafeIdx = 0;
    let lastBreakIdx = 0;
    for (let i = 0; i < s.length; i++) {
      const code = s.charCodeAt(i);
      const b = code <= 0x7f ? 1 : code <= 0x7ff ? 2 : code >= 0xd800 && code <= 0xdfff ? 2 : 3;
      if (bytes + b > maxBytes) {
        const cut = lastBreakIdx > lastSafeIdx * 0.72 ? lastBreakIdx : lastSafeIdx;
        return s.slice(0, Math.max(1, cut)).trimEnd() || ' ';
      }
      bytes += b;
      lastSafeIdx = i + 1;
      if (s[i] === '\n' || s[i] === ' ') {
        lastBreakIdx = i + 1;
      }
    }
    return s;
  }

  // Split long answers (up to 12,000 chars) into overlapping hardware-scroll windows (<= 480 chars / <= 1,450 UTF-8 bytes each)
  // Within each window, Even G2 scrolls line-by-line natively (isEventCapture=1).
  // Reaching the bottom fires SCROLL_BOTTOM_EVENT (2) -> seamlessly loads the next window!
  function buildScrollWindows(fullText) {
    const clean = String(fullText || '').replace(/\r/g, '').trim();
    if (!clean) return [' '];
    if (clean.length <= 490 && sliceByUtf8Bytes(clean, 1500).length === clean.length) {
      return [clean];
    }
    const WIN_CHARS = 460;
    const STEP_CHARS = 380;
    const rawSlices = [];
    let offset = 0;
    while (offset < clean.length && rawSlices.length < 30) {
      if (offset + WIN_CHARS >= clean.length) {
        rawSlices.push(clean.slice(offset).trim());
        break;
      }
      let end = offset + WIN_CHARS;
      const nl = clean.lastIndexOf('\n', end);
      const sp = clean.lastIndexOf(' ', end);
      if (nl > offset + 220) end = nl;
      else if (sp > offset + 260) end = sp;
      const chunk = clean.slice(offset, end).trim();
      if (chunk) rawSlices.push(chunk);
      let nextOffset = offset + STEP_CHARS;
      if (end > offset + 220) {
        // Keep ~70 chars (~2 lines) overlap from the end of this chunk for seamless reading continuity
        const overlapStart = Math.max(offset + 120, end - 75);
        const nlBefore = clean.indexOf('\n', overlapStart);
        const spBefore = clean.indexOf(' ', overlapStart);
        if (nlBefore !== -1 && nlBefore < end) nextOffset = nlBefore + 1;
        else if (spBefore !== -1 && spBefore < end) nextOffset = spBefore + 1;
        else nextOffset = end;
      }
      if (nextOffset <= offset) nextOffset = end;
      offset = nextOffset;
    }
    if (rawSlices.length <= 1) return [sliceByUtf8Bytes(clean, 1580)];
    // Ensure the final scroll window has enough lines (>= 220 chars) so hardware scroll works naturally at the end
    const lastIdx = rawSlices.length - 1;
    if (rawSlices[lastIdx].length < 220 && rawSlices[lastIdx - 1].length > 180) {
      const prevTail = rawSlices[lastIdx - 1].slice(-180);
      const nlPos = prevTail.indexOf('\n');
      const overlap = nlPos >= 0 ? prevTail.slice(nlPos + 1) : prevTail;
      if (!rawSlices[lastIdx].startsWith(overlap.slice(0, 30))) {
        rawSlices[lastIdx] = `${overlap.trim()}\n${rawSlices[lastIdx]}`;
      }
    }
    const total = rawSlices.length;
    return rawSlices.map((chunk, idx) => {
      const topHint = idx > 0 ? `[▲ 위로 스크롤 (${idx + 1}/${total}구간)]\n` : '';
      const botHint = idx < total - 1 ? `\n\n[▼ 계속 스크롤하면 이어집니다 (${idx + 1}/${total}구간)]` : `\n\n[■ 답변 끝 (${total}/${total}구간)]`;
      return sliceByUtf8Bytes(topHint + chunk + botHint, 1620);
    });
  }

  function formatFullScrollableChat(youText, replyText) {
    const cleanYou = String(youText || '').replace(/\r/g, '').trim();
    const cleanReply = String(replyText || '').replace(/\r/g, '').trim();
    const qHeader = cleanYou ? `» ${cleanYou.slice(0, 90)}\n\n` : '';
    const full = qHeader + (cleanReply || '저장된 이전 대화가 없습니다.');
    return full.slice(0, 12000);
  }

  function applyScrollWindowToHud(st, hud, fullText, resetIdx = true, rebuildNowFlag = false) {
    const cleanFull = String(fullText || '').slice(0, 12000);
    const prevFull = st.__fullScrollText || '';
    st.__fullScrollText = cleanFull;
    st.__scrollWindows = buildScrollWindows(cleanFull);
    if (resetIdx || typeof st.__scrollWinIdx !== 'number' || st.__scrollWinIdx >= st.__scrollWindows.length || st.__scrollWinIdx < 0) {
      if (resetIdx || ! cleanFull.startsWith(prevFull.slice(0, 120))) {
        st.__scrollWinIdx = 0;
      } else {
        st.__scrollWinIdx = Math.min(st.__scrollWinIdx, st.__scrollWindows.length - 1);
      }
    }
    const total = st.__scrollWindows.length;
    const idx = st.__scrollWinIdx;
    window.__EDITH_SCROLL_WINDOWS__ = st.__scrollWindows;
    window.__EDITH_SCROLL_INDEX__ = idx;
    const winText = st.__scrollWindows[idx] || ' ';
    hud.wanted.body = winText;
    if (st.mode === 'idle' && !st.clockStandby) {
      hud.wanted.status = total > 1
        ? `▼ 스크롤 ${idx + 1}/${total}  100%`
        : (cleanFull.length > 180 ? '▼ 스크롤 가능  100%' : '● 온라인  100%');
    }
    hud.shown = { title: '', status: '', body: '' };
    hud.flushQueued = false;
    if (typeof hud.updateMirror === 'function') hud.updateMirror();
    if (rebuildNowFlag && typeof hud.rebuild === 'function') {
      void hud.rebuild();
    } else if (typeof hud.scheduleFlush === 'function') {
      hud.scheduleFlush();
    }
  }

  function showPreviousChatOnHud(st, hud, forceRebuild = false) {
    const hasPrev = ensureLastConversationOnState(st);
    const titleLine = `◆ E.D.I.T.H${st.clockStr ? `  ${st.clockStr}` : ''}`;
    hud.wanted.title = titleLine;
    if (!hasPrev || !st.last || !st.last.reply) {
      st.__fullScrollText = '';
      st.__scrollWindows = ['저장된 이전 대화가 없습니다.\n\n▶ 길게 눌러 말씀하세요.'];
      st.__scrollWinIdx = 0;
      hud.wanted.status = '● 온라인  100%';
      hud.wanted.body = st.__scrollWindows[0];
      hud.shown = { title: '', status: '', body: '' };
      hud.flushQueued = false;
      if (typeof hud.updateMirror === 'function') hud.updateMirror();
      if (forceRebuild && typeof hud.rebuild === 'function') void hud.rebuild();
      else if (typeof hud.scheduleFlush === 'function') hud.scheduleFlush();
      return;
    }
    const fullBody = formatFullScrollableChat(st.last.you, st.last.reply);
    applyScrollWindowToHud(st, hud, fullBody, true, forceRebuild);
  }

  // 4. Enforce 6-Item Menu, Safe Optical Margins (x=20), UTF-8 Safe Scroll Windows & Hardware Event Interception
  function upgradeGlassesHudAndMenu() {
    if (!agy || !agy.hud || !agy.state) return;
    const st = agy.state;
    const hud = agy.hud;

    ensureValidApiKeyOnDevice();
    ensureLastConversationOnState(st);

    // Ensure slotText('body') always returns UTF-8 byte-safe text (<= 1650 UTF-8 bytes) so textContainerUpgrade NEVER fails!
    if (!hud.__v32SlotTextHooked && typeof hud.slotText === 'function') {
      hud.__v32SlotTextHooked = true;
      hud.slotText = function (slot) {
        if (this.clockStandby && (slot === 'title' || slot === 'body')) {
          return ' ';
        }
        const raw = this.wanted[slot] || ' ';
        return sliceByUtf8Bytes(raw, slot === 'body' ? 1650 : 240);
      };
    }

    // Fix markPageBuilt race condition: reset both shown AND flushQueued so textContainerUpgrade ALWAYS runs after rebuildNow()!
    if (!hud.__v32MarkBuiltHooked) {
      hud.__v32MarkBuiltHooked = true;
      hud.markPageBuilt = function () {
        this.shown = { title: '', status: '', body: '' };
        this.flushQueued = false;
        if (typeof this.scheduleFlush === 'function') {
          this.scheduleFlush();
        }
      };
    }

    // Intercept EvenHub hardware events at window.dispatchEvent BEFORE legacy v2.0.0 onEvenHubEvent can mis-handle them!
    // Handles:
    //  - SCROLL_BOTTOM_EVENT (2): seamlessly loads next 460-char scroll window & resets hardware scrollbar!
    //  - SCROLL_TOP_EVENT (1): seamlessly loads previous scroll window!
    //  - CLICK_EVENT (0): wakes Clock Standby -> shows previous chat (or advances scroll window in idle), NEVER starts tap-recording!
    //  - LONG_PRESS_RELEASE_EVENT (5): keeps mic open hands-free when user lifts finger after long-press!
    //  - DOUBLE_CLICK_EVENT (3): blocks residual double-tap bounce within 1.8s after canceling recording!
    if (!window.__v32EvenEventDispatchHooked && typeof window.dispatchEvent === 'function') {
      window.__v32EvenEventDispatchHooked = true;
      const origDispatchEvent = window.dispatchEvent.bind(window);
      window.dispatchEvent = function (ev) {
        try {
          if (ev && ev.type === 'evenHubEvent' && ev.detail) {
            const detail = ev.detail;
            const env = detail.sysEvent ?? detail.textEvent ?? detail.listEvent;
            let evType = env && env.eventType !== undefined && env.eventType !== null ? Number(env.eventType) : null;
            // Protobuf3 omits default enum 0 (OsEventTypeList.CLICK_EVENT = 0) on textEvent / listEvent / sysEvent!
            if (evType === null && env) {
              if (
                detail.textEvent ||
                detail.listEvent ||
                (detail.sysEvent && !detail.sysEvent.imuData && detail.sysEvent.systemExitReasonCode === undefined)
              ) {
                evType = 0;
              }
            }
            const now = Date.now();

            // 1) SCROLL_BOTTOM_EVENT (2) -> Advance to next scroll window!
            if (evType === 2) {
              if (st.mode !== 'listening' && !st.clockStandby && Array.isArray(st.__scrollWindows) && st.__scrollWindows.length > 1) {
                if (now - (st.__lastScrollEdgeAt || 0) >= 220 && st.__scrollWinIdx < st.__scrollWindows.length - 1) {
                  st.__lastScrollEdgeAt = now;
                  st.__scrollWinIdx++;
                  window.__EDITH_SCROLL_INDEX__ = st.__scrollWinIdx;
                  const total = st.__scrollWindows.length;
                  hud.wanted.body = st.__scrollWindows[st.__scrollWinIdx];
                  if (st.mode === 'idle') {
                    hud.wanted.status = `▼ 스크롤 ${st.__scrollWinIdx + 1}/${total}  100%`;
                  }
                  hud.shown = { title: '', status: '', body: '' };
                  hud.flushQueued = false;
                  if (typeof hud.updateMirror === 'function') hud.updateMirror();
                  if (typeof hud.rebuild === 'function') void hud.rebuild();
                }
              }
              return true;
            }

            // 2) SCROLL_TOP_EVENT (1) -> Move back to previous scroll window!
            if (evType === 1) {
              if (st.mode !== 'listening' && !st.clockStandby && Array.isArray(st.__scrollWindows) && st.__scrollWindows.length > 1) {
                if (now - (st.__lastScrollEdgeAt || 0) >= 220 && st.__scrollWinIdx > 0) {
                  st.__lastScrollEdgeAt = now;
                  st.__scrollWinIdx--;
                  window.__EDITH_SCROLL_INDEX__ = st.__scrollWinIdx;
                  const total = st.__scrollWindows.length;
                  hud.wanted.body = st.__scrollWindows[st.__scrollWinIdx];
                  if (st.mode === 'idle') {
                    hud.wanted.status = `▼ 스크롤 ${st.__scrollWinIdx + 1}/${total}  100%`;
                  }
                  hud.shown = { title: '', status: '', body: '' };
                  hud.flushQueued = false;
                  if (typeof hud.updateMirror === 'function') hud.updateMirror();
                  if (typeof hud.rebuild === 'function') void hud.rebuild();
                }
              }
              return true;
            }

            // 3) CLICK_EVENT (0) -> When NOT recording, wake Clock Standby or advance scroll window, NEVER start tap recording!
            if (evType === 0 && st.mode !== 'listening') {
              if (now - (st.holdReleasedAt || 0) < 700 || now - (st.__lastTapHandledAt || 0) < 320) {
                return true;
              }
              st.__lastTapHandledAt = now;
              if (st.clockStandby || hud.clockStandby) {
                st.clockStandby = false;
                hud.clockStandby = false;
                showPreviousChatOnHud(st, hud, true);
                return true;
              }
              if (st.mode === 'idle') {
                if (Array.isArray(st.__scrollWindows) && st.__scrollWindows.length > 1) {
                  st.__scrollWinIdx = (st.__scrollWinIdx + 1) % st.__scrollWindows.length;
                  window.__EDITH_SCROLL_INDEX__ = st.__scrollWinIdx;
                  const total = st.__scrollWindows.length;
                  hud.wanted.body = st.__scrollWindows[st.__scrollWinIdx];
                  hud.wanted.status = `▼ 스크롤 ${st.__scrollWinIdx + 1}/${total}  100%`;
                  hud.shown = { title: '', status: '', body: '' };
                  hud.flushQueued = false;
                  if (typeof hud.updateMirror === 'function') hud.updateMirror();
                  if (typeof hud.rebuild === 'function') void hud.rebuild();
                } else {
                  showPreviousChatOnHud(st, hud, false);
                }
                return true;
              }
              return true;
            }

            // 4) LONG_PRESS_EVENT (9) & LONG_PRESS_RELEASE_EVENT (10) -> Push-to-Talk: Send immediately when user lifts finger!
            if (evType === 9) {
              st.holdStartedAt = now;
              st.trigger = 'hold';
            }
            if (evType === 10) {
              st.holdReleasedAt = now;
              if (st.mode === 'listening') {
                st.trigger = 'hold';
                if (st.recorder) {
                  st.recorder.heardSpeech = true;
                  st.recorder.speechMs = Math.max(st.recorder.speechMs || 0, st.recorder.durationMs || 600);
                  st.recorder.sendableMs = Math.max(st.recorder.sendableMs || 0, st.recorder.durationMs || 600);
                  if (Array.isArray(st.recorder.chunks)) {
                    for (const c of st.recorder.chunks) {
                      c.own = true;
                      c.speech = true;
                    }
                  }
                }
              }
            }

            // 5) DOUBLE_CLICK_EVENT (3) -> Record cancel timestamp & swallow residual bounce within 1.8s!
            if (evType === 3) {
              if (st.mode === 'listening' || st.mode === 'thinking' || st.mode === 'answering') {
                st.__lastCancelMs = now;
              } else if (now - (st.__lastCancelMs || 0) < 1800) {
                return true;
              }
            }
          }
        } catch {}
        return origDispatchEvent(ev);
      };
    }

    // Block accidental clockStandby entry during thinking/answering or right after canceling recording
    if (!hud.__v32StandbyHooked && typeof hud.setClockStandby === 'function') {
      hud.__v32StandbyHooked = true;
      const origSetClockStandby = hud.setClockStandby.bind(hud);
      hud.setClockStandby = function (standby) {
        if (standby && (st.mode === 'thinking' || st.mode === 'answering' || Date.now() - (st.__lastCancelMs || 0) < 1800)) {
          st.clockStandby = false;
          this.clockStandby = false;
          return Promise.resolve(false);
        }
        return origSetClockStandby(standby);
      };
    }

    // Force disable followUp and wakeWord on state
    if (st.prefs) {
      st.prefs.followUp = false;
      st.prefs.wakeWord = false;
    }
    if (st.wakeRec) {
      try { st.wakeRec.stop(); } catch {}
      st.wakeRec = null;
    }
    if (st.hudPageTimer) {
      try { clearInterval(st.hudPageTimer); } catch {}
      st.hudPageTimer = null;
    }
    st.hudPages = [];

    const getClean6MenuItems = () => {
      if (isLegacyV2Host) {
        return [
          { id: 1, name: '새 채팅' },
          { id: 2, name: st.clockStandby ? 'HUD 켜기' : '시계 대기' },
          { id: 4, name: st.roomMode === 'translate' ? '번역 끄기' : '상대 번역' },
          { id: 7, name: '두뇌 동기화' },
          { id: 5, name: st.prefs?.discreet ? '밝기: 밝게' : '밝기: 어둡게' },
          { id: 99, name: '닫기' }
        ];
      }
      return [
        { id: 1, name: '새 채팅' },
        { id: 2, name: st.clockStandby ? 'HUD 켜기' : '시계 대기' },
        { id: 3, name: st.roomMode === 'translate' ? '번역 끄기' : '상대 번역' },
        { id: 4, name: '두뇌 동기화' },
        { id: 5, name: st.prefs?.discreet ? '밝기: 밝게' : '밝기: 어둡게' },
        { id: 6, name: '닫기' }
      ];
    };

    // Completely disable smartphone WebSpeech API so it NEVER hijacks the mobile OS audio session from G2 Glasses BLE mic!
    try {
      window.SpeechRecognition = undefined;
      window.webkitSpeechRecognition = undefined;
    } catch {}

    // Remove top-center Even OS menu indicator bar ("가운데 위에 짝대기 하나") by disabling menuObject on glasses HUD
    hud.menu = [];
    hud.menuObject = function () {
      return undefined;
    };
    if (!hud.__v31MenuHooked && typeof hud.setMenu === 'function') {
      hud.__v31MenuHooked = true;
      hud.setMenu = function () {
        this.menu = [];
      };
    }

    // Safe Optical Waveguide Geometry: xPosition=20, width=536, paddingLength=16 (36px left/right glyph margin -> zero left-edge clipping!)
    window.__AGY_HUD_Y_OFFSET__ = 0;
    localStorage.setItem('agy_g2_hud_y_offset', '0');
    if (!hud.__v31PageObjectsHooked && typeof hud.pageObjects === 'function') {
      hud.__v31PageObjectsHooked = true;
      const origPageObjects = hud.pageObjects.bind(hud);
      hud.pageObjects = function (snapshot) {
        const objs = origPageObjects(snapshot);
        if (Array.isArray(objs)) {
          for (const obj of objs) {
            const name = obj?.containerName;
            if (name === 'title') {
              obj.xPosition = 20;
              obj.yPosition = 0;
              obj.width = 260;
              obj.height = 44;
              obj.borderWidth = 0;
              obj.paddingLength = 10;
              obj.content = sliceByUtf8Bytes(String(obj.content || ' ').replace(/\s*\|\s*/g, '  '), 180);
            } else if (name === 'status') {
              obj.xPosition = this.clockStandby ? 336 : 296;
              obj.yPosition = 0;
              obj.width = this.clockStandby ? 220 : 260;
              obj.height = 44;
              obj.borderWidth = 0;
              obj.paddingLength = this.clockStandby ? 6 : 10;
              obj.content = sliceByUtf8Bytes(
                String(obj.content || ' ')
                  .replace(/\s*\|\s*/g, '  ')
                  .replace(/[■□]{2,}\s*/g, ''),
                180
              );
            } else if (name === 'body') {
              obj.xPosition = 20;
              obj.yPosition = 46;
              obj.width = 536;
              obj.height = 242;
              obj.borderWidth = 0;
              obj.paddingLength = 16;
              obj.isEventCapture = 1;
              // Initial container packet uses 900 UTF-8 bytes (~300 Korean chars); markPageBuilt() immediately upgrades to 1650 UTF-8 bytes!
              obj.content = sliceByUtf8Bytes(obj.content || ' ', 900);
            }
          }
        }
        return objs;
      };
    }

    hud.setMenu(getClean6MenuItems());
    if (typeof hud.rebuild === 'function') {
      void hud.rebuild();
    }

    // Hook hud.set to:
    // 1) Immediately block any single-tap ('tap') recording attempt on v2.0.0 host & show full scrollable previous chat!
    // 2) Disable phone WebSpeech during glasses recording so distant phone mic never overrides G2 glasses mic!
    // 3) Show full scrollable previous chat when canceling recording (double-tap)
    // 4) Automatically window long answers (up to 12,000 chars) into UTF-8 safe scroll windows!
    if (!hud.__v31SetHooked) {
      hud.__v31SetHooked = true;
      const origSet = hud.set.bind(hud);

      hud.set = function (update) {
        // BLOCK SINGLE-TAP ('tap') LISTENING IMMEDIATELY & SHOW PREVIOUS CONVERSATION!
        if (
          (st.mode === 'listening' && st.trigger === 'tap') ||
          (st.mode !== 'listening' && update && (String(update.status || '').startsWith('● 녹음') || String(update.body || '').includes('듣고 있어요')))
        ) {
          st.mode = 'idle';
          st.trigger = 'idle';
          st.clockStandby = false;
          hud.clockStandby = false;
          try { st.recorder?.stop(); } catch {}
          st.recorder = null;
          if (st.ticker) {
            try { clearInterval(st.ticker); } catch {}
            st.ticker = null;
          }
          if (st.webSpeechRec) {
            try { st.webSpeechRec.stop(); } catch {}
            st.webSpeechRec = null;
          }
          st.webSpeechTranscript = '';
          st.quietListening = false;
          if (hud.bridge && st.micOpen) {
            st.micOpen = false;
            try { hud.bridge.audioControl(false); } catch {}
          }
          showPreviousChatOnHud(st, hud, false);
          return;
        }

        // When recording via Long-Press ('hold'):
        // 1) Keep st.trigger = 'hold' so lifting finger (LONG_PRESS_RELEASE_EVENT) immediately sends the voice message!
        // 2) Ensure 100% of G2 Glasses 16kHz PCM chunks are preserved (acceptOther=true, no syllable clipping in toWavBase64)!
        if (st.mode === 'listening' && (st.trigger === 'hold' || st.trigger === 'longpress')) {
          st.trigger = 'hold';
          if (st.webSpeechRec) {
            try { st.webSpeechRec.abort?.() || st.webSpeechRec.stop(); } catch {}
            st.webSpeechRec = null;
          }
          st.webSpeechTranscript = '';
          if (st.recorder) {
            st.recorder.acceptOther = true;
            st.recorder.autoStopEnabled = true;
            st.recorder.silenceToStopMs = 1550;
            st.recorder.minSpeechRms = 75;
            st.recorder.speechToArmMs = 100;
            if (!st.recorder.__wavHooked && typeof st.recorder.toWavBase64 === 'function') {
              st.recorder.__wavHooked = true;
              const origToWav = st.recorder.toWavBase64.bind(st.recorder);
              st.recorder.toWavBase64 = function () {
                if (Array.isArray(this.chunks)) {
                  for (const c of this.chunks) {
                    c.own = true;
                    c.speech = true;
                  }
                }
                return origToWav();
              };
            }
          }
        }

        if (update && typeof update.body === 'string') {
          // When user double-taps to cancel voice recording (or cancels active request), show FULL SCROLLABLE PREVIOUS CONVERSATION instead of "취소했습니다."!
          if (update.body.includes('취소했습니다.')) {
            st.__lastCancelMs = Date.now();
            const hasPrev = ensureLastConversationOnState(st);
            if (hasPrev && st.last && st.last.reply) {
              showPreviousChatOnHud(st, hud, false);
              return;
            }
          }
          if (update.body.includes('탭하고 말하세요') || update.body.includes('탭해서 핸즈프리로')) {
            update = {
              ...update,
              body: update.body
                .replace('▶ 길게 눌러 말하거나, 탭하고 말하세요.', '▶ 길게 눌러 말씀하세요 (한 번 탭 오작동 차단됨).')
                .replace('탭하면 전송, 잠시 멈춰도 전송.', '말씀 후 손을 떼거나 잠시 멈추면 전송합니다.')
            };
          }
          if (update.body.includes('좋은 ') && update.body.includes('모든 시스템 온라인') && !update.body.includes('[기억]')) {
            const vault = getVault();
            const pinned = vault.find((m) => m.pinned) || vault[0];
            const factTxt = pinned?.text || pinned?.fact;
            if (factTxt) {
              update = {
                ...update,
                body: update.body.replace('모든 시스템 온라인.', `모든 시스템 온라인.\n[기억] ${factTxt.slice(0, 42)}`)
              };
            }
          }

          // Recover unclipped full answer (up to 12,000 chars) if v2.0.0 host clipped body at 1990 chars!
          let fullCandidate = update.body;
          if (st.mode === 'idle' && st.last && st.last.reply && update.body.startsWith('» ') && st.last.reply.length > 400) {
            fullCandidate = formatFullScrollableChat(st.last.you, st.last.reply);
          } else if (st.mode === 'answering' && update.body.length >= 450) {
            const edithBodies = document.querySelectorAll('#chatLog .entry.edith .body');
            const latestDomEl = edithBodies.length ? edithBodies[edithBodies.length - 1] : null;
            const domTxt = latestDomEl ? String(latestDomEl.textContent || '').trim() : '';
            if (domTxt.length > 400) {
              const qMatch = update.body.match(/^(» [^\n]+\n\n)/);
              fullCandidate = (qMatch ? qMatch[1] : '') + domTxt;
            }
          }

          if (!st.clockStandby && fullCandidate.trim().length > 0) {
            const isSamePrefix = st.__fullScrollText && fullCandidate.startsWith(st.__fullScrollText.slice(0, 120));
            st.__fullScrollText = fullCandidate.slice(0, 12000);
            st.__scrollWindows = buildScrollWindows(st.__fullScrollText);
            if (!isSamePrefix || typeof st.__scrollWinIdx !== 'number' || st.__scrollWinIdx >= st.__scrollWindows.length) {
              st.__scrollWinIdx = 0;
            }
            const total = st.__scrollWindows.length;
            window.__EDITH_SCROLL_WINDOWS__ = st.__scrollWindows;
            window.__EDITH_SCROLL_INDEX__ = st.__scrollWinIdx;
            const winText = st.__scrollWindows[st.__scrollWinIdx] || ' ';
            update = {
              ...update,
              body: winText
            };
            if (total > 1 && st.mode === 'idle') {
              update.status = `▼ 스크롤 ${st.__scrollWinIdx + 1}/${total}  100%`;
            } else if (total > 1 && st.mode === 'answering') {
              update.status = `● 답변 중 (${st.__scrollWinIdx + 1}/${total}구간)`;
            }
          }
        }
        if (update && typeof update.status === 'string') {
          update = {
            ...update,
            status: update.status.replace(/\s*\|\s*/g, '  ').replace(/[■□]{2,}\s*/g, '')
          };
        }
        return origSet(update);
      };
    }
  }

  // 5. Fast Translation Helper (Only used in Room Translate mode)
  async function ultraFastTranslateText(rawText) {
    const clean = String(rawText || '').trim();
    if (!clean) return '';
    if (translateCache.has(clean)) return translateCache.get(clean);

    for (const base of ['http://192.168.123.150:3860', 'http://192.168.123.104:3860']) {
      try {
        const r = await origFetch(`${base}/api/fast-translate?q=${encodeURIComponent(clean)}`, {
          signal: AbortSignal.timeout(750)
        });
        if (r.ok) {
          const d = await r.json();
          if (d?.ok && d.formatted) {
            translateCache.set(clean, d.formatted);
            return d.formatted;
          }
        }
      } catch {}
    }

    const apiKey = (agy?.state?.apiKey || localStorage.getItem('agy_gemini_api_key') || '').trim();
    if (apiKey.startsWith('sk-or-')) {
      try {
        const r = await origFetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://zespy2614-jpg.github.io/korea-spart-24h-cloud/g2/',
            'X-Title': 'EDITH Antigravity G2'
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              {
                role: 'user',
                content: `외국어면 한국어로, 한국어면 영어로 즉시 번역해 "원문 → 번역" 한 줄만 출력:\n${clean}`
              }
            ],
            temperature: 0,
            max_tokens: 120
          }),
          signal: AbortSignal.timeout(2200)
        });
        if (r.ok) {
          const d = await r.json();
          const out = String(d?.choices?.[0]?.message?.content || '').trim();
          if (out) {
            translateCache.set(clean, out);
            return out;
          }
        }
      } catch {}
    }
    return clean;
  }

  // 6. Intercept OpenRouter Fetch:
  //    - For Voice Question STT (hasAudio): Use Flagship Gemini 3.8 Flash / Gemini 4 Argon + Korean Domain Dictionary + Post-Correction!
  //    - For Question Answering (stream: true): Force High Reasoning (effort: 'high') + Strict Anti-Hallucination Rules!
  window.fetch = async function (input, init) {
    try {
      const url = typeof input === 'string' ? input : input?.url || '';
      if (url.includes('openrouter.ai/api/v1/chat/completions') && init?.body && typeof init.body === 'string') {
        ensureValidApiKeyOnDevice();
        // Repair Authorization header if phone had a salt-corrupted key in memory
        if (init.headers) {
          const authVal = init.headers.Authorization || init.headers.authorization || '';
          if (authVal.startsWith('Bearer ')) {
            const rawToken = authVal.slice(7).trim();
            const fixedToken = repairCorruptedKeyIfNeeded(rawToken);
            if (fixedToken && fixedToken !== rawToken) {
              init = {
                ...init,
                headers: {
                  ...init.headers,
                  Authorization: `Bearer ${fixedToken}`
                }
              };
            }
          }
        }

        const bodyObj = JSON.parse(init.body);
        const msgContent = bodyObj?.messages?.[0]?.content;
        const hasAudio = !bodyObj.stream && Array.isArray(msgContent) && msgContent.some((c) => c?.type === 'input_audio');

        // A) Streaming Chat Answer -> Force High-Performance High Reasoning Model & Anti-Hallucination Prompt!
        if (bodyObj.stream && Array.isArray(bodyObj.messages)) {
          // Rotate high-reasoning models if v2.0.0 fallback loop retries within 8 seconds
          const nowStream = Date.now();
          if (nowStream - (window.__EDITH_LAST_STREAM_TS__ || 0) < 8000) {
            window.__EDITH_STREAM_TRY_IDX__ = ((window.__EDITH_STREAM_TRY_IDX__ || 0) + 1) % 4;
          } else {
            window.__EDITH_STREAM_TRY_IDX__ = 0;
          }
          window.__EDITH_LAST_STREAM_TS__ = nowStream;
          const streamModels = [
            'google/gemini-4-argon',
            'google/gemini-3.1-pro-preview',
            'google/gemini-2.5-pro',
            'google/gemini-2.5-flash'
          ];
          bodyObj.model = streamModels[window.__EDITH_STREAM_TRY_IDX__] || 'google/gemini-4-argon';
          if (bodyObj.model.includes('flash')) {
            delete bodyObj.reasoning;
          } else {
            bodyObj.reasoning = { effort: 'high', exclude: true };
          }
          bodyObj.temperature = 0.2;
          bodyObj.max_tokens = 8192;

          const sysMsg = bodyObj.messages.find((m) => m.role === 'system');
          const lastUserMsg = [...bodyObj.messages].reverse().find((m) => m.role === 'user');
          if (lastUserMsg && typeof lastUserMsg.content === 'string') {
            lastUserMsg.content = cleanAndCorrectTranscript(lastUserMsg.content);
          }
          const userQ = typeof lastUserMsg?.content === 'string' ? lastUserMsg.content : '';

          if (/(기억해|외워둬|메모해|주차|내\s*차|파란색\s*자동차)/.test(userQ)) {
            const vault = getVault();
            const cat = /(차|주차)/.test(userQ) ? '차량/주차' : '중요기억';
            if (!vault.some((m) => (m.text || m.fact) === userQ)) {
              vault.unshift({ id: `mem_${Date.now()}`, category: cat, text: userQ, fact: userQ, pinned: true, updatedAt: new Date().toLocaleString('ko-KR') });
              saveVault(vault);
              void syncMemoryAction({ action: 'add', category: cat, text: userQ, fact: userQ, pinned: true });
            }
          }
          // Keep HUD Y-offset locked at 0 (full 288px screen without center divider bar) + PC remote task trigger
          window.__AGY_HUD_Y_OFFSET__ = 0;
          localStorage.setItem('agy_g2_hud_y_offset', '0');
          if (
            !/(작업하고\s*있어\?|실행하고\s*있어\?|기억나\?|뭐야\?)$/.test(userQ) &&
            (
              /(짝대기|테두리|구분선|가로줄|세로줄|잘리|잘려|안\s*내려|안\s*올라|안\s*돼|안\s*되|오류|에러|버그|고장|이상해|검은색|깜빡|멈춰)/.test(userQ) ||
              (/(안티그래비티|컴퓨터|PC|피씨|워크스페이스|작업\s*노트|바탕화면|화면|기능|메뉴|버튼|코드|패치|답변|길이|글자|글씨|짧게|길게|이전\s*대화|취소|스크롤|페이지|시계|번역|음성|녹음|대화창|새\s*대화)/.test(userQ) &&
                /(작업|실행|세팅|수정|패치|만들어|고쳐|추가|바꿔|개선|검토|테스트|작성|정리|분석|크롤링|동기화|푸시|빌드|배포|저장|기록|메모|시켜|없애|해제|지워|늘려|줄여|보여\s*줘|해\s*줘|해\s*놔|해\s*둬|해\s*줄래|할\s*수\s*있|방법\s*없을까|내려|올려|옮겨|지시|전달)/.test(userQ)) ||
              /^(안티그래비티|에디스)?[야아,\s]*(작업\s*지시|원격\s*작업|PC\s*작업|안티그래비티\s*작업|이거\s*작업해|이거\s*세팅해|이거\s*고쳐|이거\s*수정해|그\s*짧게\s*하는\s*거)/i.test(userQ)
            )
          ) {
            void sendRemotePcNote(userQ);
          }

          if (sysMsg) {
            // Strip any short/concise answer restrictions from v2.0.0 base system prompt
            sysMsg.content = sysMsg.content
              .replace(/간결하게|짧게|2~4문장|1~3문장|300~500자|핵심만\s*요약/g, '생략이나 요약 없이 자세하고 풍부하게');

            const antiLieRules =
              `[최우선 절대 수칙 — 거짓말·할루시네이션 엄격 금지 & 답변 길이 제한 완전 해제]\n` +
              `1. 빠른 답변을 위해 사실을 지어내거나 추측하지 마세요. 고성능 High 추론 모델로서 제공된 기억 금고와 두뇌 컨텍스트를 깊이 검증하여 100% 사실만 답하세요.\n` +
              `2. 대표님이 안경에서 작업·세팅·수정·메모를 지시하시면, PC가 켜져 있을 때 PC 작업노트(G2_안경_음성지시_작업노트.md)와 작업큐(G2_안경_실시간_작업큐.json)에 즉시 기록되고 PC 자율 실행 데몬 및 안티그래비티 자동 실행 브릿지가 즉시 가동됩니다.\n` +
              `3. [답변 길이 제한 완전 해제] 대표님의 지시("야, 그 짧게 하는 거 그냥 없애 줘")에 따라 답변 길이나 글자 수, 단락 수를 인위적으로 줄이거나 요약하지 마세요. 질문하신 내용의 모든 핵심 맥락과 세부 정보까지 빠짐없이 깊이 있고 풍부하게 전체 내용으로 답변하세요.\n\n`;

            if (!sysMsg.content.includes('답변 길이 제한 완전 해제')) {
              sysMsg.content = antiLieRules + sysMsg.content;
            }

            if (!sysMsg.content.includes('[영구 장기기억 금고')) {
              const vault = getVault();
              let extra = '\n\n[영구 장기기억 금고 (최우선 진실 — 질문 시 즉시 인용)]\n';
              vault.slice(0, 15).forEach((m) => {
                extra += `- [${m.category || '기억'}] ${m.text || m.fact}\n`;
              });
              const bc = agy?.state?.brainContext;
              if (bc) {
                const allConvs = Array.isArray(bc.conversationSearchIndex)
                  ? bc.conversationSearchIndex
                  : Array.isArray(bc.recentConversations)
                    ? bc.recentConversations
                    : [];
                if (allConvs.length > 0) {
                  extra += '\n[안경 과거 누적 대화 기억]\n';
                  allConvs.slice(-10).forEach((c) => {
                    extra += `- [${c.time || c.t || ''}] 대표님: "${c.q}" → 답변: "${String(c.a || '').slice(0, 140)}"\n`;
                  });
                }
              }
              sysMsg.content += extra;
            }
          }
          init = { ...init, body: JSON.stringify(bodyObj) };
        }

        // B) Audio Transcription (hasAudio) -> Multi-model automatic fallback loop with max_tokens=1024 so it NEVER throws OpenRouter 음성 인식 오류!
        if (hasAudio) {
          const textPart = msgContent.find((c) => c?.type === 'text');
          if (textPart && typeof textPart.text === 'string' && !textPart.text.includes('고유명사/전문용어 교정 사전')) {
            textPart.text +=
              `\n[고유명사/전문용어 교정 사전 — 발음이 비슷하면 반드시 아래 정확한 단어로 받아적을 것]\n` +
              `- 안티그래비티(Antigravity), 제미나이(Gemini), 아라곤 4(Gemini 4 Argon), 깃허브(GitHub), 오픈라우터(OpenRouter), 이븐 리얼리티(Even G2), 에디스(EDITH), 지파츠(Gparts), 시엔위(Xianyu), 이베이(eBay), 크롤링, 소싱, 품번\n` +
              `[엄격 규칙] 시간 표시(00:00 등), 따옴표, 부연 설명은 절대 출력하지 말고, 말소리가 없으면 오직 EMPTY 라고만 출력하세요.`;
          }
          delete bodyObj.reasoning;
          bodyObj.temperature = 0;
          bodyObj.max_tokens = 1024;

          const audioModels = [
            'google/gemini-2.5-flash',
            'google/gemini-3.8-flash',
            'google/gemini-3-flash-preview',
            'google/gemini-2.5-pro'
          ];

          for (const candidateAudioModel of audioModels) {
            try {
              bodyObj.model = candidateAudioModel;
              const reqInit = { ...init, body: JSON.stringify(bodyObj) };
              const res = await origFetch(input, reqInit);
              if (!res.ok) continue;
              const data = await res.json();
              const rawTranscript = String(data?.choices?.[0]?.message?.content || '').trim();
              const corrected = cleanAndCorrectTranscript(rawTranscript);
              return new Response(
                JSON.stringify({
                  choices: [{ message: { role: 'assistant', content: corrected || 'EMPTY' } }]
                }),
                {
                  status: 200,
                  headers: { 'Content-Type': 'application/json' }
                }
              );
            } catch {}
          }

          // Fallback synthetic 200 OK EMPTY so v2.0.0 host NEVER crashes with "OpenRouter 음성 인식 오류"
          return new Response(
            JSON.stringify({
              choices: [{ message: { role: 'assistant', content: 'EMPTY' } }]
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        }
      }
    } catch {}
    return origFetch(input, init);
  };

  function syncPhoneKeyToPcOnce() {
    try {
      ensureValidApiKeyOnDevice();
      const rawKey = String(agy?.state?.apiKey || localStorage.getItem('agy_gemini_api_key') || '').trim();
      const key = repairCorruptedKeyIfNeeded(rawKey);
      if (!key || !/^(sk-or-v1-[0-9a-f]{32,128}|AIza[0-9A-Za-z_-]{20,60})$/i.test(key)) return;
      if (sessionStorage.getItem('agy_key_synced_to_pc') === '1') return;
      sessionStorage.setItem('agy_key_synced_to_pc', '1');
      const salt = 'agy_g2_salt_2026';
      let out = '';
      for (let i = 0; i < key.length; i++) {
        out += String.fromCharCode(key.charCodeAt(i) ^ salt.charCodeAt(i % salt.length));
      }
      const obfuscatedKey = btoa(out);
      for (const base of ['http://192.168.123.150:3860', 'http://192.168.123.104:3860']) {
        origFetch(`${base}/api/config-key`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ apiKey: key, model: 'google/gemini-4-argon' }),
          signal: AbortSignal.timeout(1500)
        }).catch(() => {});
      }
      origFetch(CLOUD_SYNC_URL, {
        method: 'POST',
        headers: { Title: 'AGY_G2_KEY_SYNC' },
        body: JSON.stringify({ obfuscatedKey, model: 'google/gemini-4-argon', timestamp: new Date().toLocaleString('ko-KR') })
      }).catch(() => {});
    } catch {}
  }

  upgradePhoneDom();
  upgradeGlassesHudAndMenu();
  syncPhoneKeyToPcOnce();

  if (agy && agy.state && agy.hud) {
    setInterval(() => {
      const st = agy.state;

      // Always block 'subtitles' mode
      if (st.roomMode === 'subtitles') {
        if (agy.stopRoomMode) agy.stopRoomMode();
        else st.roomMode = null;
      }

      // Always block single-tap ('tap') listening and wake-word/follow-up false triggers
      if (st.prefs) {
        st.prefs.followUp = false;
        st.prefs.wakeWord = false;
      }
      if (st.wakeRec) {
        try { st.wakeRec.stop(); } catch {}
        st.wakeRec = null;
      }
      if (st.mode === 'listening' && st.trigger === 'tap') {
        st.mode = 'idle';
        st.trigger = 'idle';
        st.clockStandby = false;
        agy.hud.clockStandby = false;
        try { st.recorder?.stop(); } catch {}
        st.recorder = null;
        if (st.ticker) {
          try { clearInterval(st.ticker); } catch {}
          st.ticker = null;
        }
        if (st.webSpeechRec) {
          try { st.webSpeechRec.stop(); } catch {}
          st.webSpeechRec = null;
        }
        st.webSpeechTranscript = '';
        showPreviousChatOnHud(st, agy.hud, false);
      }

      // Self-Healing Anti-Black-Screen Guard: If awake (!clockStandby) in idle mode, body can NEVER stay blank (' ')!
      if (st.mode === 'idle' && !st.clockStandby && !agy.hud.clockStandby) {
        const curBody = String(agy.hud.wanted?.body || '').trim();
        if (!curBody) {
          showPreviousChatOnHud(st, agy.hud, false);
        }
      }

      // While recording from glasses ('hold'), keep st.trigger = 'hold' so lifting finger immediately sends, and ensure 100% of G2 PCM chunks are kept
      if (st.mode === 'listening' && (st.trigger === 'hold' || st.trigger === 'longpress')) {
        st.trigger = 'hold';
        if (st.webSpeechRec) {
          try { st.webSpeechRec.abort?.() || st.webSpeechRec.stop(); } catch {}
          st.webSpeechRec = null;
        }
        st.webSpeechTranscript = '';
        if (st.recorder) {
          st.recorder.acceptOther = true;
          st.recorder.autoStopEnabled = true;
          st.recorder.silenceToStopMs = 1550;
          st.recorder.minSpeechRms = 75;
          st.recorder.speechToArmMs = 100;
          if (Array.isArray(st.recorder.chunks)) {
            for (const c of st.recorder.chunks) {
              c.own = true;
              c.speech = true;
            }
          }
        }
      }

      // Ensure 6-item clean menu stays active
      if (Array.isArray(agy.hud.menu) && agy.hud.menu.some((m) => m.name === '자막 모드' || m.name === 'AI 전환')) {
        upgradeGlassesHudAndMenu();
      }
    }, 120);
  }
})();
