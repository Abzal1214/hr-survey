import { describe, it, expect, vi } from 'vitest';
import { logError } from '../lib/log';

describe('logError', () => {
  it('должен логировать ошибку в консоль', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    logError('test', new Error('fail'));
    expect(spy).toHaveBeenCalledWith('[test]', expect.any(Error));
    spy.mockRestore();
  });
});
