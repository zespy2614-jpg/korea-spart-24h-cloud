// __EDITH_OTA__ Live Over-The-Air Patch v3.0.0 — Long-Term Memory Vault + Smart RAG + Gparts Scouter + 6-Item Menu + Ultra-Fast Translation
(function () {
  if (window.__EDITH_OTA_V30_APPLIED__) return;
  window.__EDITH_OTA_V30_APPLIED__ = true;
  console.log('[EDITH OTA] v3.0.0 Memory Vault & Smart RAG & 6-Item Menu Engine Activated');

  const agy = window.__EDITH_AGY__;
  const origFetch = window.fetch.bind(window);
  const translateCache = new Map();
  const CLOUD_SYNC_URL = 'https://ntfy.sh/agy_g2_brain_sync_e3562553';

  // 1. Remove Subtitles Chip if present in older cached HTML & ensure new chips
  const oldSubChip = document.getElementById('subtitlesChip');
  if (oldSubChip) {
    oldSubChip.remove();
  }

  // 2. Enforce exact 6-item Glasses Menu requested by Representative:
  // [새 채팅, 시계 대기, 상대 번역, 두뇌 동기화, 밝기, 닫기]
  function getTargetMenuItems(st) {
    return [
      { id: 1, name: '새 채팅' },
      { id: 2, name: st?.clockStandby ? 'HUD 켜기' : '시계 대기' },
      { id: 3, name: st?.roomMode === 'translate' ? '번역 끄기' : '상대 번역' },
      { id: 4, name: '두뇌 동기화' },
      { id: 5, name: st?.prefs?.discreet ? '밝기: 밝게' : '밝기: 어둡게' },
      { id: 6, name: '닫기' }
    ];
  }

  if (agy && agy.hud && agy.state) {
    try {
      agy.hud.setMenu(getTargetMenuItems(agy.state));
    } catch {}
  }

  // Helper: Fast instant translation via local PC Google GTX proxy or zero-reasoning Gemini Omni 1.2 Flash
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

  // Helper: Build enriched Memory Vault + Smart RAG + Gparts Scouter context for any outgoing AI request
  function buildOtaMemoryAddendum(userQuestion = '') {
    const st = agy?.state;
    const ctx = st?.brainContext;
    if (!ctx && !st?.memories) return '';

    const qLower = String(userQuestion || '').toLowerCase();
    const qTokens = qLower.split(/[\s,?.!]+/).filter((t) => t.length >= 2);

    const memories = st?.memories || ctx?.longTermMemories || [
      { category: '차량/주차', fact: '대표님의 차량은 파란색 자동차입니다.', pinned: true }
    ];
    const memLines = memories
      .slice(0, 30)
      .map((m) => `- [${m.category || '기억'}]${m.pinned ? '(고정)' : ''}: ${m.fact}`)
      .join('\n');

    let extra = `\n\n[필수 참조 1순위: 대표님의 영구 장기기억 금고]\n${memLines}`;

    if (ctx) {
      const searchPool = ctx.conversationSearchIndex || [];
      const matchedTurns = searchPool
        .filter((item) => {
          if (!qTokens.length) return false;
          const hay = `${item.q || ''} ${item.a || ''}`.toLowerCase();
          return qTokens.some((tk) => hay.includes(tk));
        })
        .slice(-6)
        .map((item) => `- [${item.t}] 질문: ${item.q} -> 답변: ${item.a}`)
        .join('\n');

      const gpartsPool = ctx.gpartsQuickIndex || [];
      const sourcingPool = ctx.sourcingQuickIndex || [];
      const isSourcingQuery = /(지파츠|이베이|품번|재고|품절|시엔위|소싱|마진|부품|크롤링|가격|시세)/.test(qLower);

      let matchedGparts = gpartsPool.filter((g) => {
        const hay = `${g.partNo} ${g.title} ${g.korTitle}`.toLowerCase();
        return qTokens.some((tk) => hay.includes(tk));
      });
      if (!matchedGparts.length && isSourcingQuery) matchedGparts = gpartsPool.slice(0, 8);
      const gpartsText = matchedGparts
        .slice(0, 8)
        .map((g) => `- 품번 ${g.partNo} (${g.korTitle || g.title}): 재고 ${g.stock}개 | 국내매입 ${g.krwCost.toLocaleString()}원 | 이베이 $${g.usdPrice}`)
        .join('\n');

      let matchedSourcing = sourcingPool.filter((s) => {
        const hay = `${s.id} ${s.group} ${s.title} ${s.partNo}`.toLowerCase();
        return qTokens.some((tk) => hay.includes(tk));
      });
      if (!matchedSourcing.length && isSourcingQuery) matchedSourcing = sourcingPool.slice(0, 6);
      const sourcingText = matchedSourcing
        .slice(0, 6)
        .map((s) => `- [${s.id}] ${s.title} (품번 ${s.partNo}): 총원가 ${s.totalCostKrw.toLocaleString()}원 -> 시세 $${s.marketUsd} (순마진 ${s.netMarginPct}%)`)
        .join('\n');

      if (matchedTurns) extra += `\n\n[질문 관련 과거 대화 기억]\n${matchedTurns}`;
      if (gpartsText) extra += `\n\n[지파츠 40선 실시간 재고 스카우터]\n${gpartsText}`;
      if (sourcingText) extra += `\n\n[8개국 크로스보더 80선 마진 스카우터]\n${sourcingText}`;
    }
    return extra;
  }

  // Intercept OpenRouter fetch calls for zero-reasoning audio/translation & Memory Vault injection
  window.fetch = async function (input, init) {
    try {
      const url = typeof input === 'string' ? input : input?.url || '';
      if (url.includes('openrouter.ai/api/v1/chat/completions') && init?.body && typeof init.body === 'string') {
        const bodyObj = JSON.parse(init.body);
        const isShortTask = !bodyObj.stream && typeof bodyObj.max_tokens === 'number' && bodyObj.max_tokens <= 260;

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
        } else if (bodyObj.stream && Array.isArray(bodyObj.messages)) {
          // Ensure Long-Term Memory Vault & Smart RAG are injected even if running older cached HTML
          const sysMsg = bodyObj.messages.find((m) => m.role === 'system');
          const lastUserMsg = [...bodyObj.messages].reverse().find((m) => m.role === 'user');
          const userQ = typeof lastUserMsg?.content === 'string' ? lastUserMsg.content : '';
          if (sysMsg && typeof sysMsg.content === 'string' && !sysMsg.content.includes('영구 장기기억 금고')) {
            sysMsg.content += buildOtaMemoryAddendum(userQ);
            init = { ...init, body: JSON.stringify(bodyObj) };
          }
        }
      }
    } catch {}
    return origFetch(input, init);
  };

  // Real-time watcher: speed up translation recorder & hook interim translation
  if (agy && agy.state && agy.hud) {
    let lastInterimText = '';
    let interimTranslating = false;
    let patchedWebRec = null;

    setInterval(() => {
      const st = agy.state;
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
    }, 150);
  }
})();
