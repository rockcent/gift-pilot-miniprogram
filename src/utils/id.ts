/* ID 生成 · 阶段二可换 wx.login + 服务端发号 */

let counter = 0;

export function nextId(prefix: string): string {
  counter += 1;
  const ts = Date.now().toString(36);
  const rnd = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${ts}_${counter.toString(36)}_${rnd}`;
}

export function orderId(): string {
  const now = new Date();
  const ymd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  return `GP${ymd}${Math.floor(Math.random() * 9000 + 1000)}`;
}

export function traceId(): string {
  return `tr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
