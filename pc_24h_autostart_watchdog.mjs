import { spawn, execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const GPARTS_DAEMON = 'e:\\안티그래비티\\지파츠_이베이_자동리스팅\\gparts_24h_stock_watcher.mjs';
const WORLDWIDE_DAEMON = 'e:\\안티그래비티\\시엔위_비즈니스_연구소\\scripts\\worldwide_v2_nonstop_daemon.mjs';
const CLOUD_DIR = 'e:\\안티그래비티\\클라우드_24시간_무중단_관제센터';

async function isPortOpen(port) {
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(`http://127.0.0.1:${port}`, { signal: controller.signal });
    clearTimeout(t);
    return res.ok || res.status < 500;
  } catch {
    return false;
  }
}

function startDetachedNode(scriptPath) {
  try {
    const child = spawn(process.execPath, [scriptPath], {
      cwd: path.dirname(scriptPath),
      detached: true,
      stdio: 'ignore',
      windowsHide: true
    });
    child.unref();
    console.log(`[Watchdog] Started background daemon: ${scriptPath} (PID: ${child.pid})`);
  } catch (e) {
    console.error(`[Watchdog] Failed to start ${scriptPath}:`, e.message);
  }
}

async function checkAndKeepAlive() {
  // 1) Port 3847 (gparts_24h_stock_watcher.mjs + ebay_order_sms_notifier.mjs)
  const ok3847 = await isPortOpen(3847);
  if (!ok3847 && fs.existsSync(GPARTS_DAEMON)) {
    startDetachedNode(GPARTS_DAEMON);
  } else if (ok3847) {
    // 로컬 3847 상태를 클라우드 docs/gparts_state.json에도 미러링
    try {
      const st = await (await fetch('http://127.0.0.1:3847/api/state')).json();
      fs.writeFileSync(path.join(CLOUD_DIR, 'docs', 'gparts_state.json'), JSON.stringify(st, null, 2), 'utf8');
    } catch {}
  }

  // 2) Port 3848 (worldwide_v2_nonstop_daemon.mjs)
  const ok3848 = await isPortOpen(3848);
  if (!ok3848 && fs.existsSync(WORLDWIDE_DAEMON)) {
    startDetachedNode(WORLDWIDE_DAEMON);
  }
}

console.log('🛡️ [Antigravity 24H Watchdog] 무중단 감시 서비스 시작 (3847 & 3848 영구 보호)');
await checkAndKeepAlive();
setInterval(checkAndKeepAlive, 15000);
