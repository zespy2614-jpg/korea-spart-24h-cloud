import { execSync } from 'node:child_process';

const CLOUD_DIR = 'e:\\안티그래비티\\클라우드_24시간_무중단_관제센터';
const REPO_NAME = 'korea-spart-24h-cloud';
const OWNER = 'zespy2614-jpg';

const credOut = execSync('git credential fill', { input: 'protocol=https\nhost=github.com\n\n' }).toString();
const token = credOut.match(/password=(.+)/)?.[1]?.trim();
if (!token) {
  console.error('GitHub 토큰을 찾을 수 없습니다.');
  process.exit(1);
}

const headers = {
  'Authorization': `Bearer ${token}`,
  'Accept': 'application/vnd.github+json',
  'Content-Type': 'application/json',
  'X-GitHub-Api-Version': '2022-11-28'
};

// 1) 저장소 생성 (이미 있으면 패스)
const createRes = await fetch('https://api.github.com/user/repos', {
  method: 'POST',
  headers,
  body: JSON.stringify({
    name: REPO_NAME,
    description: 'KOREA S-PART 24H Nonstop Cloud Control Center (Gparts 40 Live Stock & 8-Country Global Sourcing)',
    private: false,
    auto_init: false
  })
});
console.log('Repo Create Status:', createRes.status);

// 2) Git 초기화 및 Push
function runGit(cmd) {
  return execSync(cmd, { cwd: CLOUD_DIR, stdio: 'pipe' }).toString().trim();
}

try { runGit('git init'); } catch {}
runGit('git config user.name "KOREA-SPART-24H"');
runGit('git config user.email "zespy2614@gmail.com"');
runGit('git branch -M main');
try { runGit('git remote remove origin'); } catch {}
runGit(`git remote add origin https://github.com/${OWNER}/${REPO_NAME}.git`);
runGit('git add -A');
try {
  runGit('git commit -m "☁️ Deploy 24H Nonstop Cloud Crawler & Mobile Control Dashboard"');
} catch {}
runGit('git push -u origin main --force');
console.log('✅ Git Push 완료: https://github.com/' + OWNER + '/' + REPO_NAME);

// 3) GitHub Pages 활성화 (main 브랜치 /docs 폴더)
const pagesRes = await fetch(`https://api.github.com/repos/${OWNER}/${REPO_NAME}/pages`, {
  method: 'POST',
  headers,
  body: JSON.stringify({
    source: {
      branch: 'main',
      path: '/docs'
    }
  })
});
console.log('GitHub Pages Enable Status:', pagesRes.status);

// 4) GitHub Actions 워크플로우 즉시 트리거
await new Promise(r => setTimeout(r, 2000));
const wfRes = await fetch(`https://api.github.com/repos/${OWNER}/${REPO_NAME}/actions/workflows/cloud_24h_daemon.yml/dispatches`, {
  method: 'POST',
  headers,
  body: JSON.stringify({ ref: 'main' })
});
console.log('GitHub Actions Dispatch Status:', wfRes.status);
console.log(`🌐 클라우드 24시간 웹/모바일 관제 대시보드 URL: https://${OWNER}.github.io/${REPO_NAME}/`);
