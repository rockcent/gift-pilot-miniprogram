import { nextId, orderId, traceId } from '../../src/utils/id';

describe('utils/id', () => {
  test('nextId uses prefix and is unique', () => {
    const a = nextId('rec');
    const b = nextId('rec');
    expect(a).toMatch(/^rec_/);
    expect(b).toMatch(/^rec_/);
    expect(a).not.toBe(b);
  });

  test('orderId matches GP + yyyymmdd + 4 digits', () => {
    const id = orderId();
    expect(id).toMatch(/^GP\d{8}\d{4}$/);
  });

  test('traceId has tr_ prefix', () => {
    const id = traceId();
    expect(id).toMatch(/^tr_/);
  });
});
