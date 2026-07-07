#!/usr/bin/env node
// scripts/post-build-h5.mjs
// Taro 3.x 的 HtmlWebpackPlugin 和 webpack runtime 都不会把 publicPath 传到 dist 输出。
// 公网部署在 https://gift.rockcent.com/h5/ 子路径，需要手动重写：
//   1. dist/index.html 里的 /js/xxx.js 和 /css/xxx.css → /h5/js/xxx.js 等
//   2. dist/js/*.js 和 dist/chunk/*.js 里的 webpack runtime publicPath .p="/" → .p="/h5/"

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIST = path.join(ROOT, 'dist');
const PREFIX = '/h5';

let totalRewrites = 0;

function rewriteFile(file, transform) {
  if (!fs.existsSync(file)) return;
  const before = fs.readFileSync(file, 'utf8');
  const after = transform(before);
  if (after !== before) {
    fs.writeFileSync(file, after);
    totalRewrites++;
  }
}

// 1. dist/index.html — 重写静态 asset 路径
rewriteFile(path.join(DIST, 'index.html'), (html) => {
  return html.replace(/(src|href)="\/(js|css)\/([^"]+)"/g, (_, attr, kind, rest) =>
    `${attr}="${PREFIX}/${kind}/${rest}"`);
});

// 2. webpack runtime publicPath 重写（精确匹配，避免误伤）
//    匹配 .p="/" 整个 token（带两侧引号），替换为 .p="/h5/"
//    用 word-boundary-like 上下文：.p 前面是 = 或 , 或空白
function rewriteJsRuntime(js) {
  // 匹配三种已知 webpack 5 runtime 编码：
  //   .p="/"
  //   .p="/some/"
  //   publicPath:"/"
  return js
    .replace(/(\.p\s*=\s*)"\/"/g, `$1"${PREFIX}/"`)
    .replace(/(publicPath\s*:\s*)"\/"/g, `$1"${PREFIX}/"`);
}

for (const dir of ['js', 'chunk']) {
  const subdir = path.join(DIST, dir);
  if (!fs.existsSync(subdir)) continue;
  for (const f of fs.readdirSync(subdir)) {
    if (f.endsWith('.js')) {
      rewriteFile(path.join(subdir, f), rewriteJsRuntime);
    }
  }
}

console.log(`[post-build-h5] rewrote ${totalRewrites} files for ${PREFIX}/ subpath`);
