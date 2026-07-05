import { yuanToFen, fenToYuan, formatYuan, formatYuanRange, assertOrderAmountMatch } from '../../src/utils/money';

describe('utils/money', () => {
  test('yuanToFen rounds to integer', () => {
    expect(yuanToFen(1)).toBe(100);
    expect(yuanToFen(1.99)).toBe(199);
    expect(yuanToFen(0.01)).toBe(1);
  });

  test('fenToYuan preserves precision', () => {
    expect(fenToYuan(100)).toBe(1);
    expect(fenToYuan(199)).toBe(1.99);
  });

  test('formatYuan adds ¥ and zero-fills', () => {
    expect(formatYuan(19900)).toBe('¥199');
    expect(formatYuan(19999)).toBe('¥199.99');
  });

  test('formatYuanRange produces readable range', () => {
    expect(formatYuanRange(10000, 30000)).toBe('¥100 - ¥300');
  });

  test('assertOrderAmountMatch enforces exact match (宪法 §4.3)', () => {
    expect(assertOrderAmountMatch(19900, 19900)).toBe(true);
    expect(assertOrderAmountMatch(19900, 19901)).toBe(false);
  });
});
