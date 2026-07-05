/* 金额分/元互转 · 宪法 §4.1：内部统一用分整数 */

export function yuanToFen(yuan: number): number {
  if (!Number.isFinite(yuan)) return 0;
  return Math.round(yuan * 100);
}

export function fenToYuan(fen: number): number {
  if (!Number.isFinite(fen)) return 0;
  return Math.round(fen) / 100;
}

export function formatYuan(fen: number, withSymbol = true): string {
  const yuan = fenToYuan(fen);
  const fixed = yuan % 1 === 0 ? yuan.toFixed(0) : yuan.toFixed(2);
  return withSymbol ? `¥${fixed}` : fixed;
}

export function formatYuanRange(lowFen: number, highFen: number): string {
  return `${formatYuan(lowFen)} - ${formatYuan(highFen)}`;
}

/* 订单金额一致性校验：差额 > 0 视为不一致（宪法 §4.3） */
export function assertOrderAmountMatch(expectedFen: number, actualFen: number): boolean {
  return Math.abs(expectedFen - actualFen) <= 0;
}
