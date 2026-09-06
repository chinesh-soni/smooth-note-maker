import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { debounce } from '@/lib/utils/debounce';

describe('Debounce Utility', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should debounce function execution by 700ms', () => {
    const callback = vi.fn();
    const debouncedFn = debounce(callback, 700);

    debouncedFn('first');
    debouncedFn('second');
    debouncedFn('third');

    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(699);
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('third');
  });

  it('should cancel pending execution when cancel is invoked', () => {
    const callback = vi.fn();
    const debouncedFn = debounce(callback, 700);

    debouncedFn('will-be-cancelled');
    debouncedFn.cancel();

    vi.advanceTimersByTime(1000);
    expect(callback).not.toHaveBeenCalled();
  });

  it('should immediately execute pending call when flush is invoked', () => {
    const callback = vi.fn();
    const debouncedFn = debounce(callback, 700);

    debouncedFn('flush-me');
    expect(callback).not.toHaveBeenCalled();

    debouncedFn.flush();
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('flush-me');

    // Timer shouldn't trigger duplicate call later
    vi.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
