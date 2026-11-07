// __EDITH_OTA__ Live Over-The-Air Patch v3.0.0 — Full DOM & Glasses Menu Upgrade (No Reinstall Required)
(function () {
  if (window.__EDITH_OTA_V30_APPLIED__) return;
  window.__EDITH_OTA_V30_APPLIED__ = true;
  console.log('[EDITH OTA] v3.0.0 Full Live Upgrade Activated');

  const agy = window.__EDITH_AGY__;
  const origFetch = window.fetch.bind(window);
  const translateCache = new Map();
  const CLOUD_SYNC_URL = 'https://ntfy.sh/agy_g2_brain_sync_e3562553';

  // Detect whether the host HTML is v2.0.0 (legacy closure IDs) or v3.0.0+
  const isLegacyV2Host = !Boolean(agy && agy.buildMenuItems);

  // 1. Load & Persist Long-Term Memory Vault
  function getVault() {
    try {
      const stVault = agy?.state?.longTermMemories;
      if (Array.isArray(stVault) && stVault.length > 0) return stVault;
      const local = JSON.parse(localStorage.getItem('agy_g2_long_term_memories') || '[]');
      if (Array.isArray(local) && local.length > 0) return local;
    } catch {}
    const defaults = [
      { id: 'mem_car_blue', category: '차량/주차', text: '대표님의 차량은 파란색 자동차입니다.', pinned: true, updatedAt: '2026. 11. 7.' },
      { id: 'mem_biz_core', category: '핵심비즈니스', text: 'Gparts(지파츠) 40선 수입차 부품 매칭 및 8개국 80선 글로벌 소싱 프로젝트 운영 중', pinned: true, updatedAt: '2026. 11. 7.' }
    ];
    localStorage.setItem('agy_g2_long_term_memories', JSON.stringify(defaults));
    return defaults;
  }

  function saveVault(list) {
    localStorage.setItem('agy_g2_long_term_memories', JSON.stringify(list));
    if (agy?.state) agy.state.longTermMemories = list;
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
          body: JSON.stringify({ command: clean, category: '안경원격지시' }),
          signal: AbortSignal.timeout(2000)
        });
        break;
      } catch {}
    }
    try {
      await origFetch(CLOUD_SYNC_URL, {
        method: 'POST',
        headers: { Title: 'AGY_G2_PC_COMMAND', Priority: 'high' },
        body: JSON.stringify({ type: 'AGY_G2_PC_COMMAND', command: clean, timestamp: new Date().toLocaleString('ko-KR') })
      });
    } catch {}
  }

  // 2. Upgrade DOM on v2.0.0 Host (Replace '실시간 자막' with '기억 금고' + Inject #memoryDrawer + v3.0.0 Badge)
  function upgradePhoneDom() {
    // Update version string in settings
    document.querySelectorAll('.help .mono').forEach((el) => {
      if (el.textContent && el.textContent.includes('v2.0.0')) {
        el.textContent = 'EDITH 2.0 × Antigravity v3.0.0 (6-Menu + Memory Vault OTA)';
      }
    });

    // Replace #subtitlesChip with #memoryVaultChip if #memoryVaultChip doesn't exist
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

    // Add Gparts 40선 quick chip if missing
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

    // Inject #memoryDrawer if missing (for v2.0.0 installed package)
    let drawer = document.getElementById('memoryDrawer');
    if (!drawer) {
      const style = document.createElement('style');
      style.textContent = `
        .memory-drawer {
          display: none;
          flex-direction: column;
          gap: 10px;
          padding: 14px;
          border-radius: 16px;
          background: var(--surface);
          box-shadow: 0 0 0 1px rgba(245, 197, 66, 0.28);
          margin-bottom: 6px;
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
          txt.textContent = m.text;
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
            void syncMemoryAction({ action: 'add', category: m.category, text: m.text, pinned: m.pinned });
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
          const item = { id: `mem_${Date.now()}`, category, text, pinned: true, updatedAt: new Date().toLocaleString('ko-KR') };
          vault.unshift(item);
          saveVault(vault);
          txtEl.value = '';
          renderVaultUi();
          void syncMemoryAction({ action: 'add', category, text, pinned: true });
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

    // Show v3.0.0 live status in sync banner
    const syncText = document.getElementById('syncStatusText');
    if (syncText && !syncText.innerHTML.includes('v3.0')) {
      syncText.innerHTML = '<b>PC 안티그래비티 ↔ GitHub (v3.0 기억금고·6메뉴 적용됨)</b>';
    }
  }

  // 3. Enforce 6-Item Menu & HUD Auto-Paging on Glasses
  function upgradeGlassesHudAndMenu() {
    if (!agy || !agy.hud || !agy.state) return;
    const st = agy.state;
    const hud = agy.hud;

    // Build exact 6-item menu requested by user:
    // 새 채팅, 시계 대기, 상대 번역, 두뇌 동기화, 밝기, 닫기
    // Note: On legacy v2.0.0 host, internal onMenuItemClick(id) maps:
    // 1=newChat, 2=clockStandby, 4=translate, 7=syncBrain, 5=discreet, 99=close
    // On v3.0.0 host, internal onMenuItemClick(id) maps:
    // 1=newChat, 2=clockStandby, 3=translate, 4=syncBrain, 5=discreet, 6=close
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

    // Permanently intercept hud.setMenu so v2.0.0's internal goIdle() can NEVER restore '자막 모드'
    const origSetMenu = hud.setMenu.bind(hud);
    hud.setMenu = function () {
      const clean = getClean6MenuItems();
      return origSetMenu(clean);
    };

    // Apply immediately
    hud.setMenu(getClean6MenuItems());

    // Add HUD Auto-Paging & Pinned Memory Reminder on Greeting for v2.0.0 host
    if (isLegacyV2Host && !hud.__v30SetHooked) {
      hud.__v30SetHooked = true;
      const origSet = hud.set.bind(hud);
      let pagingTimer = null;

      hud.set = function (update) {
        if (update && typeof update.body === 'string') {
          // If greeting screen, append pinned memory reminder
          if (update.body.includes('반갑습니다, 대표님') && !update.body.includes('📌')) {
            const vault = getVault();
            const pinned = vault.find((m) => m.pinned) || vault[0];
            if (pinned?.text) {
              update = {
                ...update,
                body: `반갑습니다, 대표님.\n📌 ${pinned.text.slice(0, 38)}\n\n길게 누르거나 탭해서 말씀하세요.`
              };
            }
          }
        }
        return origSet(update);
      };
    }
  }

  // 4. Ultra-Fast Simultaneous Translation & Smart Memory RAG Injection on OpenRouter Fetch
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
            model: 'google/gemini-omni-1.2-flash',
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

  window.fetch = async function (input, init) {
    try {
      const url = typeof input === 'string' ? input : input?.url || '';
      if (url.includes('openrouter.ai/api/v1/chat/completions') && init?.body && typeof init.body === 'string') {
        const bodyObj = JSON.parse(init.body);
        const isShortTask = !bodyObj.stream && typeof bodyObj.max_tokens === 'number' && bodyObj.max_tokens <= 260;

        // Inject Long-Term Memory Vault & Smart Past Conversation RAG into streaming chat requests
        if (bodyObj.stream && Array.isArray(bodyObj.messages)) {
          const sysMsg = bodyObj.messages.find((m) => m.role === 'system');
          const lastUserMsg = [...bodyObj.messages].reverse().find((m) => m.role === 'user');
          const userQ = typeof lastUserMsg?.content === 'string' ? lastUserMsg.content : '';

          // Auto-extract memory or remote PC command if user asks in voice/chat
          if (/(기억해|외워둬|메모해|주차|내\s*차|파란색\s*자동차)/.test(userQ)) {
            const vault = getVault();
            const cat = /(차|주차)/.test(userQ) ? '차량/주차' : '중요기억';
            if (!vault.some((m) => m.text === userQ)) {
              vault.unshift({ id: `mem_${Date.now()}`, category: cat, text: userQ, pinned: true, updatedAt: new Date().toLocaleString('ko-KR') });
              saveVault(vault);
              void syncMemoryAction({ action: 'add', category: cat, text: userQ, pinned: true });
            }
          }
          if (/(PC에\s*메모|컴퓨터에\s*메모|작업\s*지시|안티그래비티에\s*전달)/.test(userQ)) {
            void sendRemotePcNote(userQ);
          }

          if (sysMsg && !sysMsg.content.includes('[영구 장기기억 금고')) {
            const vault = getVault();
            let extra = '\n\n[영구 장기기억 금고 (최우선 진실 — 질문 시 즉시 인용)]\n';
            vault.slice(0, 15).forEach((m) => {
              extra += `- [${m.category || '기억'}] ${m.text}\n`;
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
                  extra += `- [${c.time || ''}] 대표님: "${c.q}" → 답변: "${String(c.a || '').slice(0, 140)}"\n`;
                });
              }
              if (bc.gpartsAndSourcing?.gpartsTopSummary) {
                extra += `\n[Gparts 40선 & 80선 스카우터]\n${bc.gpartsAndSourcing.gpartsTopSummary.slice(0, 500)}\n`;
              }
            }
            sysMsg.content += extra;
            init = { ...init, body: JSON.stringify(bodyObj) };
          }
        }

        if (isShortTask) {
          const msgContent = bodyObj?.messages?.[0]?.content;
          const hasAudio = Array.isArray(msgContent) && msgContent.some((c) => c?.type === 'input_audio');

          if (hasAudio) {
            if (bodyObj.model === 'google/gemini-4-argon' || bodyObj.model === 'google/gemini-3.1-pro-preview') {
              bodyObj.model = 'google/gemini-2.5-flash-lite';
            }
            bodyObj.reasoning = { effort: 'none', exclude: true };
            bodyObj.temperature = 0;
            bodyObj.max_tokens = 120;
            init = { ...init, body: JSON.stringify(bodyObj) };
          } else if (typeof msgContent === 'string' && msgContent.includes('번역')) {
            const srcLine = msgContent.split(':\n').slice(1).join(':\n').trim();
            if (srcLine) {
              for (const base of ['http://192.168.123.150:3860', 'http://192.168.123.104:3860']) {
                try {
                  const fastRes = await origFetch(`${base}/api/fast-translate?q=${encodeURIComponent(srcLine)}`, {
                    signal: AbortSignal.timeout(650)
                  });
                  if (fastRes.ok) {
                    const fd = await fastRes.json();
                    if (fd?.ok && fd.formatted) {
                      return new Response(
                        JSON.stringify({ choices: [{ message: { content: fd.formatted } }] }),
                        { status: 200, headers: { 'Content-Type': 'application/json' } }
                      );
                    }
                  }
                } catch {}
              }
            }
            bodyObj.model = 'google/gemini-omni-1.2-flash';
            bodyObj.reasoning = { effort: 'none', exclude: true };
            bodyObj.temperature = 0;
            bodyObj.max_tokens = 100;
            init = { ...init, body: JSON.stringify(bodyObj) };
          }
        }
      }
    } catch {}
    return origFetch(input, init);
  };

  // Run upgrades immediately and keep watching
  upgradePhoneDom();
  upgradeGlassesHudAndMenu();

  if (agy && agy.state && agy.hud) {
    let lastInterimText = '';
    let interimTranslating = false;
    let patchedWebRec = null;

    setInterval(() => {
      const st = agy.state;
      // Never allow 'subtitles' mode
      if (st.roomMode === 'subtitles') {
        if (agy.stopRoomMode) agy.stopRoomMode();
        else st.roomMode = null;
      }

      // Ensure menu always stays 6 items (without subtitles)
      if (Array.isArray(agy.hud.menu) && agy.hud.menu.some((m) => m.name === '자막 모드' || m.name === 'AI 전환')) {
        upgradeGlassesHudAndMenu();
      }

      if (st.roomMode && st.recorder) {
        st.recorder.maxDurationMs = 1550;
        st.recorder.silenceToStopMs = 280;
        st.recorder.minSpeechRms = 95;
        st.recorder.speechToArmMs = 110;
      }

      if (st.mode === 'listening' && st.recorder && st.trigger !== 'hold') {
        st.recorder.silenceToStopMs = 650;
      }

      if (st.roomMode === 'translate' && st.webSpeechRec && st.webSpeechRec !== patchedWebRec) {
        patchedWebRec = st.webSpeechRec;
        const origOnResult = patchedWebRec.onresult;
        patchedWebRec.onresult = function (ev) {
          if (origOnResult) origOnResult.call(this, ev);
          try {
            let interim = '';
            for (let i = ev.resultIndex; i < ev.results.length; i++) {
              if (!ev.results[i].isFinal) {
                interim += ev.results[i][0].transcript + ' ';
              }
            }
            interim = interim.trim();
            if (interim && interim.length >= 3 && interim !== lastInterimText && !interimTranslating) {
              lastInterimText = interim;
              interimTranslating = true;
              ultraFastTranslateText(interim)
                .then((tr) => {
                  if (st.roomMode === 'translate' && tr) {
                    const curBody = agy.hud.wanted?.body || '';
                    const lines = curBody.split('\n').filter((l) => !l.startsWith('› '));
                    lines.push(`› ${tr}`);
                    agy.hud.set({ body: lines.slice(-4).join('\n') });
                  }
                })
                .finally(() => {
                  setTimeout(() => { interimTranslating = false; }, 220);
                });
            }
          } catch {}
        };
      }
    }, 200);
  }
})();
