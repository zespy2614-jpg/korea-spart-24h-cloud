// __EDITH_OTA__ Live Over-The-Air Patch v2.1.0 — Ultra-Fast Simultaneous Translation & Zero-Reasoning Audio Engine
(function () {
  if (window.__EDITH_OTA_V21_APPLIED__) return;
  window.__EDITH_OTA_V21_APPLIED__ = true;
  console.log('[EDITH OTA] v2.1.0 Ultra-Fast Simultaneous Translation Engine Activated');

  const agy = window.__EDITH_AGY__;
  const origFetch = window.fetch.bind(window);
  const translateCache = new Map();

  // Helper: Fast instant translation via local PC Google GTX proxy or zero-reasoning Gemini Omni 1.2 Flash
  async function ultraFastTranslateText(rawText) {
    const clean = String(rawText || '').trim();
    if (!clean) return '';
    if (translateCache.has(clean)) return translateCache.get(clean);

    // 1. Try local PC server instant GTX neural translation (~120ms) if on same Wi-Fi
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

    // 2. Fallback: Zero-reasoning OpenRouter google/gemini-omni-1.2-flash (~250ms, no internal thinking!)
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

  // Intercept OpenRouter fetch calls to eliminate internal_reasoning delay on audio & translation requests!
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
            // Audio transcription / translation: use fastest zero-thinking Flash-Lite model instead of slow thinking Gemini 4 Argon!
            if (bodyObj.model === 'google/gemini-4-argon' || bodyObj.model === 'google/gemini-3.1-pro-preview') {
              bodyObj.model = 'google/gemini-2.5-flash-lite';
            }
            bodyObj.reasoning = { effort: 'none', exclude: true };
            bodyObj.temperature = 0;
            bodyObj.max_tokens = 120;
            init = { ...init, body: JSON.stringify(bodyObj) };
          } else if (typeof msgContent === 'string' && msgContent.includes('번역')) {
            // Pure text translation: try local 120ms neural translator first, otherwise use zero-reasoning Gemini Omni 1.2 Flash
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

  // Real-time watcher: speed up Room Mode recorder (1.5s chunks + 280ms silence) & add simultaneous interim translation!
  if (agy && agy.state && agy.hud) {
    let lastInterimText = '';
    let lastInterimTranslated = '';
    let interimTranslating = false;
    let patchedWebRec = null;

    setInterval(() => {
      const st = agy.state;
      // 1) In Room Mode (subtitles / translate), tune G2 PCM recorder for ultra-fast 1.5s / 280ms response
      if (st.roomMode && st.recorder) {
        st.recorder.maxDurationMs = 1550;
        st.recorder.silenceToStopMs = 280;
        st.recorder.minSpeechRms = 95;
        st.recorder.speechToArmMs = 110;
      }

      // 2) In normal voice question mode, also make silence auto-stop snappier (650ms instead of 950ms)
      if (st.mode === 'listening' && st.recorder && st.trigger !== 'hold') {
        st.recorder.silenceToStopMs = 650;
      }

      // 3) Hook WebSpeech in 'translate' mode for simultaneous interim translation while the speaker is still talking!
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
                  lastInterimTranslated = tr;
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
