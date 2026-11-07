// __EDITH_OTA__ Live Over-The-Air Patch v3.1.0 — High Reasoning + Precision Glasses STT + Long-Press Only (Zero False Tap)
(function () {
  if (window.__EDITH_OTA_V31_APPLIED__) return;
  window.__EDITH_OTA_V31_APPLIED__ = true;
  console.log('[EDITH OTA] v3.1.0 High Reasoning + Precision Glasses STT + Long-Press Only Activated');

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
    for (const base of ['http://192.168.123.150:3860', 'http://192.168.123.104:3860']) {
      try {
        await origFetch(`${base}/api/pc-action`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ command: clean, text: clean, category: '안경원격지시' }),
          signal: AbortSignal.timeout(2000)
        });
        break;
      } catch {}
    }
    try {
      await origFetch(CLOUD_SYNC_URL, {
        method: 'POST',
        headers: { Title: 'AGY_G2_PC_COMMAND', Priority: 'high' },
        body: JSON.stringify({ type: 'AGY_G2_PC_COMMAND', command: clean, text: clean, timestamp: new Date().toLocaleString('ko-KR') })
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

    // Update controls guide text so user sees single-tap is disabled
    const ctrlList = document.querySelector('.controls');
    if (ctrlList) {
      ctrlList.innerHTML = `
        <li>안경다리나 링을 <b>길게 누르고</b> 말하기 (한 번 탭 오작동 완전 차단됨)</li>
        <li><b>탭한 다음 길게 누르면</b> 안경 메뉴 열기</li>
        <li><b>두 번 탭</b>해서 시계 대기 모드 전환 또는 종료</li>
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

  // 4. Enforce 6-Item Menu & Block Single-Tap False Triggers on Glasses
  function upgradeGlassesHudAndMenu() {
    if (!agy || !agy.hud || !agy.state) return;
    const st = agy.state;
    const hud = agy.hud;

    // Force disable followUp and wakeWord on state
    if (st.prefs) {
      st.prefs.followUp = false;
      st.prefs.wakeWord = false;
    }
    if (st.wakeRec) {
      try { st.wakeRec.stop(); } catch {}
      st.wakeRec = null;
    }

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

    if (!hud.__v31MenuHooked) {
      hud.__v31MenuHooked = true;
      const origSetMenu = hud.setMenu.bind(hud);
      hud.setMenu = function () {
        return origSetMenu(getClean6MenuItems());
      };
    }
    hud.setMenu(getClean6MenuItems());

    // Hook hud.set to:
    // 1) Immediately block any single-tap ('tap') recording attempt on v2.0.0 host!
    // 2) Disable phone WebSpeech during glasses recording so distant phone mic never overrides G2 glasses mic!
    // 3) Show pinned reminder on greeting screen
    if (!hud.__v31SetHooked) {
      hud.__v31SetHooked = true;
      const origSet = hud.set.bind(hud);

      hud.set = function (update) {
        // BLOCK SINGLE-TAP ('tap') LISTENING IMMEDIATELY!
        if (st.mode === 'listening' && st.trigger === 'tap') {
          try { st.recorder?.stop(); } catch {}
          st.recorder = null;
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
          if (agy.goIdle) setTimeout(() => agy.goIdle(), 0);
          return;
        }

        // When recording via Long-Press ('hold'), kill phone WebSpeech so ONLY G2 Glasses 16kHz PCM mic is used!
        if (st.mode === 'listening' && st.trigger === 'hold') {
          if (st.webSpeechRec) {
            try { st.webSpeechRec.abort?.() || st.webSpeechRec.stop(); } catch {}
            st.webSpeechRec = null;
          }
          st.webSpeechTranscript = '';
          if (st.recorder) {
            st.recorder.autoStopEnabled = true;
            st.recorder.silenceToStopMs = 1650;
            st.recorder.minSpeechRms = 90;
            st.recorder.speechToArmMs = 130;
          }
        }

        if (update && typeof update.body === 'string') {
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
            model: 'google/gemini-3.8-flash',
            reasoning: { effort: 'none', exclude: true },
            messages: [
              {
                role: 'user',
                content: `외국어면 한국어로, 한국어면 영어로 즉시 번역해 "원문 → 번역" 한 줄만 출력:\n${clean}`
              }
            ],
            temperature: 0,
            max_tokens: 90
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
        const bodyObj = JSON.parse(init.body);
        const isShortTask = !bodyObj.stream && typeof bodyObj.max_tokens === 'number' && bodyObj.max_tokens <= 300;

        // A) Streaming Chat Answer -> Force High-Performance High Reasoning Model & Anti-Hallucination Prompt!
        if (bodyObj.stream && Array.isArray(bodyObj.messages)) {
          // Upgrade any fast/flash fallback model to flagship High Reasoning model
          if (
            !bodyObj.model ||
            bodyObj.model.includes('flash') ||
            bodyObj.model.includes('omni')
          ) {
            bodyObj.model = 'google/gemini-4-argon';
          }
          bodyObj.reasoning = { effort: 'high', exclude: true };
          bodyObj.temperature = 0.2;
          bodyObj.max_tokens = 4096;

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
          if (/(PC에\s*메모|컴퓨터에\s*메모|작업\s*지시|안티그래비티에\s*전달|패치해|수정해|바꿔\s*줘)/.test(userQ)) {
            void sendRemotePcNote(userQ);
          }

          if (sysMsg) {
            const antiLieRules =
              `[최우선 절대 수칙 — 거짓말·할루시네이션 엄격 금지]\n` +
              `1. 빠른 답변을 위해 사실을 지어내거나 추측하지 마세요. 고성능 High 추론 모델로서 제공된 기억 금고와 두뇌 컨텍스트를 깊이 검증하여 100% 사실만 답하세요.\n` +
              `2. 안경 AI인 당신은 직접 PC의 소스 코드 파일을 수정·컴파일·재배포할 권한이 없습니다. 따라서 대표님이 기능 변경이나 패치를 요청하실 때 "제가 지금 바로 코드를 수정했습니다", "10초 뒤 앱을 껐다 켜면 적용됩니다" 같은 거짓말을 절대 하지 마세요.\n` +
              `3. 코드 수정 요청을 받으면 "대표님, 요청하신 사항을 PC 작업노트(G2_안경_음성지시_작업노트.md)에 기록해 두었습니다. 실제 코드 반영은 PC 안티그래비티 창에서 실행해 주세요"라고 정직하게만 답하세요.\n\n`;

            if (!sysMsg.content.includes('거짓말·할루시네이션 엄격 금지')) {
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

        // B) Audio Transcription (hasAudio) -> Upgrade from Flash-Lite to High-Accuracy Gemini 3.8 Flash / Gemini 4 Argon!
        if (isShortTask) {
          const msgContent = bodyObj?.messages?.[0]?.content;
          const hasAudio = Array.isArray(msgContent) && msgContent.some((c) => c?.type === 'input_audio');

          if (hasAudio) {
            // Never use gemini-2.5-flash-lite! Use high-accuracy multimodal audio model
            if (bodyObj.model === 'google/gemini-2.5-flash-lite' || bodyObj.model === 'google/gemini-3.5-flash-lite') {
              bodyObj.model = 'google/gemini-3.8-flash';
            }
            const textPart = msgContent.find((c) => c?.type === 'text');
            if (textPart && typeof textPart.text === 'string' && !textPart.text.includes('고유명사/전문용어 교정 사전')) {
              textPart.text +=
                `\n[고유명사/전문용어 교정 사전 — 발음이 비슷하면 반드시 아래 정확한 단어로 받아적을 것]\n` +
                `- 안티그래비티(Antigravity), 제미나이(Gemini), 아라곤 4(Gemini 4 Argon), 깃허브(GitHub), 오픈라우터(OpenRouter), 이븐 리얼리티(Even G2), 에디스(EDITH), 지파츠(Gparts), 시엔위(Xianyu), 이베이(eBay), 크롤링, 소싱, 품번\n` +
                `[엄격 규칙] 시간 표시(00:00 등), 따옴표, 부연 설명은 절대 출력하지 말고, 말소리가 없으면 오직 EMPTY 라고만 출력하세요.`;
            }
            delete bodyObj.reasoning;
            bodyObj.temperature = 0;
            bodyObj.max_tokens = 250;
            init = { ...init, body: JSON.stringify(bodyObj) };

            const res = await origFetch(input, init);
            if (res.ok) {
              const clone = res.clone();
              try {
                const data = await clone.json();
                const rawTranscript = String(data?.choices?.[0]?.message?.content || '').trim();
                const corrected = cleanAndCorrectTranscript(rawTranscript);
                if (data?.choices?.[0]?.message) {
                  data.choices[0].message.content = corrected;
                  return new Response(JSON.stringify(data), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                  });
                }
              } catch {}
            }
            return res;
          }
        }
      }
    } catch {}
    return origFetch(input, init);
  };

  upgradePhoneDom();
  upgradeGlassesHudAndMenu();

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
        try { st.recorder?.stop(); } catch {}
        st.recorder = null;
        if (st.webSpeechRec) {
          try { st.webSpeechRec.stop(); } catch {}
          st.webSpeechRec = null;
        }
        st.webSpeechTranscript = '';
        if (agy.goIdle) agy.goIdle();
      }

      // While recording from glasses ('hold'), prevent phone WebSpeech from overriding glasses WAV
      if (st.mode === 'listening' && st.trigger === 'hold') {
        if (st.webSpeechRec) {
          try { st.webSpeechRec.abort?.() || st.webSpeechRec.stop(); } catch {}
          st.webSpeechRec = null;
        }
        st.webSpeechTranscript = '';
      }

      // Ensure 6-item clean menu stays active
      if (Array.isArray(agy.hud.menu) && agy.hud.menu.some((m) => m.name === '자막 모드' || m.name === 'AI 전환')) {
        upgradeGlassesHudAndMenu();
      }
    }, 120);
  }
})();
