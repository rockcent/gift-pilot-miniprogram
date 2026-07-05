#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const all = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
const platform = all['@rockcent/platform'];

let ok = true;
if (!platform) {
  console.error('FAIL: @rockcent/platform not declared');
  ok = false;
} else if (!platform.startsWith('git+https://github.com/rockcent/rockcent-platform.git#')) {
  console.error('FAIL: @rockcent/platform must use git+https pinned tag, got:', platform);
  ok = false;
} else {
  console.log('OK: @rockcent/platform pinned at', platform);
}
const forbidden = ['github:rockcent/rockcent-platform', 'git+ssh://', 'file:/Volumes/Rock2/rockcent-platform'];
for (const [name, ver] of Object.entries(all)) {
  for (const f of forbidden) {
    if (typeof ver === 'string' && ver.includes(f)) {
      console.error('FAIL: ' + name + ' uses forbidden form ' + f);
      ok = false;
    }
  }
}
if (!ok) process.exit(1);
console.log('platform-deps check passed.');
