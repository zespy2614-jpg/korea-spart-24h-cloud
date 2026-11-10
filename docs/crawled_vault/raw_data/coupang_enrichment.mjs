import fs from 'node:fs';

const exactMap = JSON.parse(
  fs.readFileSync(new URL('./exact_coupang_100_map.json', import.meta.url), 'utf8')
);

export const NEW_CLEARANCE_RANKS = new Set([
  1, 2, 3, 5, 7, 8, 15, 16, 17, 18, 19, 22, 23, 27, 28, 29, 30, 32, 36, 38, 40, 42, 46, 47, 51, 53, 72, 77, 78, 84, 85, 93, 94
]);

export function getCoupangInfo(item) {
  const rank = item.rank;
  const entry = exactMap[rank] || {};
  const sourcingType =
    entry.sourcingType ||
    (NEW_CLEARANCE_RANKS.has(rank) ? '신품·창고방출(尾货) 소싱형' : '중고·탈거 코어 필수형');

  return {
    sourcingType,
    coupangName: entry.coupangTitle || item.coupangName || '',
    coupangUrl: entry.coupangUrl || item.coupangUrl || '',
    coupangSubUrl1: entry.coupangSubUrl1 || '',
    coupangSubUrl2: entry.coupangSubUrl2 || '',
    coupangPrice: entry.coupangPrice || '',
    coupangRev: typeof entry.coupangRev === 'number' ? entry.coupangRev : 0,
    channelNote: entry.channelNote || ''
  };
}
