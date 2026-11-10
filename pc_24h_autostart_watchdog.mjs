import { spawn, execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const GPARTS_DAEMON = 'e:\\안티그래비티\\지파츠_이베이_자동리스팅\\gparts_24h_stock_watcher.mjs';
const WORLDWIDE_DAEMON = 'e:\\안티그래비티\\시엔위_비즈니스_연구소\\scripts\\worldwide_v2_nonstop_daemon.mjs';
const BRAIN_SYNC_DAEMON = 'e:\\안티그래비티\\gemini_brain_sync_daemon.mjs';
const MARKETING_DAEMON = 'e:\\안티그래비티\\시엔위_비즈니스_연구소\\scripts\\seller_marketing_nonstop_daemon.mjs';
const UNCHARTED_MOAT_DAEMON = 'e:\\안티그래비티\\시엔위_비즈니스_연구소\\scripts\\uncharted_moat_biz_nonstop_daemon.mjs';
const EMBEDDED_CHIP_DAEMON = 'e:\\안티그래비티\\시엔위_비즈니스_연구소\\scripts\\embedded_used_chip_expert_daemon.mjs';
const ANDROID_EXPERT_DAEMON = 'e:\\안티그래비티\\시엔위_비즈니스_연구소\\scripts\\android_expert_nonstop_daemon.mjs';
const EVEN_G2_HUB_DAEMON = 'e:\\안티그래비티\\EvenG2_안티그래비티_AI허브\\server.mjs';

const CLOUD_DIR = 'e:\\안티그래비티\\클라우드_24시간_무중단_관제센터';
const RAW_DATA_DIR = 'e:\\안티그래비티\\시엔위_비즈니스_연구소\\raw_data';
const GDRIVE_DB_DIR = 'G:\\내 드라이브\\안티그래비티_글로벌소싱_DB';

let lastCloudPullTime = 0;

// 한국 시간(KST) 기준 새벽 1시(01:00) ~ 아침 7시(06:59) 사이인지 확인
function isNightCrawlerWindow() {
  if (process.argv.includes('--force-start')) return true;
  if (process.argv.includes('--stop-all')) return false;
  const kstHour = Number(
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Seoul',
      hour: 'numeric',
      hour12: false
    }).format(new Date())
  );
  return kstHour >= 1 && kstHour < 7;
}

async function isPortOpen(port) {
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(`http://127.0.0.1:${port}`, { signal: controller.signal });
    clearTimeout(t);
    return res.ok || res.status < 500;
  } catch {
    return false;
  }
}

function startDetachedNode(scriptPath, extraArgs = []) {
  try {
    const child = spawn(process.execPath, [scriptPath, ...extraArgs], {
      cwd: path.dirname(scriptPath),
      detached: true,
      stdio: 'ignore',
      windowsHide: true
    });
    child.unref();
    console.log(`[Night Watchdog] Started background daemon: ${scriptPath} (PID: ${child.pid})`);
  } catch (e) {
    console.error(`[Night Watchdog] Failed to start ${scriptPath}:`, e.message);
  }
}

// 주간 시간대(07:00 ~ 00:59) 진입 시 로컬 크롤러 데몬 일괄 종료 (안티그래비티 속도 100% 보호)
function stopAllLocalDaemons() {
  try {
    const psCmd = `Get-CimInstance Win32_Process | Where-Object { $_.Name -eq 'node.exe' -and ($_.CommandLine -match 'gemini_brain_sync_daemon' -or $_.CommandLine -match 'nonstop_daemon' -or $_.CommandLine -match 'expert_daemon' -or $_.CommandLine -match 'gparts_24h_stock_watcher') } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }`;
    execSync(`powershell -NoProfile -Command "${psCmd}"`, { stdio: 'ignore', windowsHide: true });
  } catch {}
}

// PC가 꺼져 있던 동안 GitHub 클라우드 서버가 수집한 최신 데이터를 로컬 & 구글 드라이브로 흡수
function syncFromCloudToLocal() {
  if (Date.now() - lastCloudPullTime < 30 * 60 * 1000 && !process.argv.includes('--sync-now')) return;
  lastCloudPullTime = Date.now();

  try {
    console.log('☁️ [Cloud -> Local Sync] PC 전원 OFF 시간 동안 클라우드에 누적된 데이터를 가져옵니다...');
    execSync('git pull --rebase origin main', { cwd: CLOUD_DIR, stdio: 'ignore', windowsHide: true, timeout: 20000 });

    const pairs = [
      ['live_scan_stream_db.json', path.join(RAW_DATA_DIR, 'live_scan_stream_db.json'), path.join(GDRIVE_DB_DIR, 'gdrive_live_stream_db.json')],
      ['seller_marketing_live_stream_db.json', path.join(RAW_DATA_DIR, 'seller_marketing_live_stream_db.json'), path.join(GDRIVE_DB_DIR, 'gdrive_seller_marketing_stream_db.json')],
      ['uncharted_moat_live_stream_db.json', path.join(RAW_DATA_DIR, 'uncharted_moat_live_stream_db.json'), path.join(GDRIVE_DB_DIR, 'gdrive_uncharted_moat_stream_db.json')],
      ['embedded_chip_live_stream_db.json', path.join(RAW_DATA_DIR, 'embedded_chip_live_stream_db.json'), path.join(GDRIVE_DB_DIR, 'gdrive_embedded_chip_stream_db.json')],
      ['android_expert_live_stream_db.json', path.join(RAW_DATA_DIR, 'android_expert_live_stream_db.json'), path.join(GDRIVE_DB_DIR, 'gdrive_android_expert_stream_db.json')]
    ];

    for (const [cloudFile, localDest, gdriveDest] of pairs) {
      const src = path.join(CLOUD_DIR, 'docs', cloudFile);
      if (fs.existsSync(src)) {
        try { fs.copyFileSync(src, localDest); } catch {}
        try {
          if (fs.existsSync(GDRIVE_DB_DIR)) fs.copyFileSync(src, gdriveDest);
        } catch {}
      }
    }

    // 1회성 마스터 두뇌 동기화 실행 (백그라운드 상주 없음)
    if (fs.existsSync(BRAIN_SYNC_DAEMON)) {
      startDetachedNode(BRAIN_SYNC_DAEMON, ['--once']);
    }
  } catch (e) {
    console.error('[Cloud Sync Warning]:', e.message);
  }
}

process.on('uncaughtException', (err) => {
  console.error('[Watchdog Uncaught Exception]:', err.message);
});
process.on('unhandledRejection', (err) => {
  console.error('[Watchdog Unhandled Rejection]:', err);
});

async function checkAndKeepAlive() {
  const [ok3847, ok3848, ok3849, ok3850, ok3851, ok3852, ok3853, ok3860] = await Promise.all([
    isPortOpen(3847),
    isPortOpen(3848),
    isPortOpen(3849),
    isPortOpen(3850),
    isPortOpen(3851),
    isPortOpen(3852),
    isPortOpen(3853),
    isPortOpen(3860)
  ]);

  // Even G2 스마트 안경 <-> PC 안티그래비티 실시간 자동 작업 브릿지(포트 3860)는 PC가 켜져 있는 동안 24시간 상시 가동!
  if (!ok3860 && fs.existsSync(EVEN_G2_HUB_DAEMON)) {
    startDetachedNode(EVEN_G2_HUB_DAEMON);
  }

  const isNight = isNightCrawlerWindow();

  if (!isNight) {
    // 낮 시간대(아침 07:00 ~ 밤 00:59): 하나라도 켜져 있으면 즉시 종료하여 안티그래비티 렉 원천 차단
    if (ok3847 || ok3848 || ok3849 || ok3850 || ok3851 || ok3852 || ok3853) {
      console.log('☀️ [주간 쾌적 모드 (07:00~01:00)] 로컬 백그라운드 데몬을 자동 종료하고 클라우드 모드로 전환합니다.');
      stopAllLocalDaemons();
    }
    syncFromCloudToLocal();
    return;
  }

  // 새벽 시간대(01:00 ~ 07:00): 7대 엔진 가동
  if (!ok3847 && fs.existsSync(GPARTS_DAEMON)) {
    startDetachedNode(GPARTS_DAEMON);
  } else if (ok3847) {
    try {
      const st = await (await fetch('http://127.0.0.1:3847/api/state')).json();
      fs.writeFileSync(path.join(CLOUD_DIR, 'docs', 'gparts_state.json'), JSON.stringify(st, null, 2), 'utf8');
    } catch {}
  }

  if (!ok3848 && fs.existsSync(WORLDWIDE_DAEMON)) startDetachedNode(WORLDWIDE_DAEMON);
  if (!ok3849 && fs.existsSync(BRAIN_SYNC_DAEMON)) startDetachedNode(BRAIN_SYNC_DAEMON, ['--daemon']);
  if (!ok3850 && fs.existsSync(MARKETING_DAEMON)) startDetachedNode(MARKETING_DAEMON);
  if (!ok3851 && fs.existsSync(UNCHARTED_MOAT_DAEMON)) startDetachedNode(UNCHARTED_MOAT_DAEMON);
  if (!ok3852 && fs.existsSync(EMBEDDED_CHIP_DAEMON)) startDetachedNode(EMBEDDED_CHIP_DAEMON);
  if (!ok3853 && fs.existsSync(ANDROID_EXPERT_DAEMON)) startDetachedNode(ANDROID_EXPERT_DAEMON);
}

if (process.argv.includes('--stop-all')) {
  stopAllLocalDaemons();
  syncFromCloudToLocal();
  console.log('🛑 모든 로컬 데몬 종료 및 클라우드 동기화 완료.');
  process.exit(0);
}

console.log('🌙 [Antigravity Night & Cloud Smart Watchdog] 새벽 01:00 ~ 아침 07:00 전용 가동 + 24시간 클라우드 동기화 감시 시작');
await checkAndKeepAlive();
setInterval(checkAndKeepAlive, 60000);
