#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const banned = [
  /\bwx[a-f0-9]{16}\b/i,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  /sk_live_[A-Za-z0-9]+/,
  /AIza[0-9A-Za-z\-_]{35}/,
  /access_token=[A-Za-z0-9\-_.]{20,}/
];

let hits = 0;
function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    if (f === '.git' || f === 'node_modules' || f === 'dist') continue;
    const p = path.join(dir, f);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p);
    else if (/\.(ts|tsx|js|json|md|scss)$/.test(f)) {
      const body = fs.readFileSync(p, 'utf8');
      for (const re of banned) {
        const m = body.match(re);
        if (m) {
          console.error('FOUND sensitive pattern in', path.relative(ROOT, p), '→', m[0]);
          hits += 1;
        }
      }
    }
  }
}
walk(ROOT);
if (hits > 0) {
  console.error('FAIL: found', hits, 'sensitive patterns');
  process.exit(1);
}
console.log('no sensitive patterns.');
