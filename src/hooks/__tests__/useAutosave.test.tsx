import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAutosave } from '../useAutosave';

describe('useAutosave Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('debounces multiple calls and saves once', async () => {
    const saveFn = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useAutosave({ saveFn, delay: 500 }));

    act(() => {
      result.current.triggerSave({ id: 1 });
    });
    
    act(() => {
      vi.advanceTimersByTime(200);
      result.current.triggerSave({ id: 2 });
    });

    act(() => {
      vi.advanceTimersByTime(400); // Hasn't been 500 since last call
    });
    expect(saveFn).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(100); // Now it's 500ms since last call
    });

    expect(saveFn).toHaveBeenCalledTimes(1);
    expect(saveFn).toHaveBeenCalledWith({ id: 2 });
  });

  it('immediately triggers next save if pending data arrived during a slow save', async () => {
    let resolveSave: any;
    const saveFn = vi.fn().mockReturnValue(new Promise(resolve => {
      resolveSave = resolve;
    }));

    const { result } = renderHook(() => useAutosave({ saveFn, delay: 100 }));

    act(() => { result.current.triggerSave({ id: 1 }); });
    
    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    expect(saveFn).toHaveBeenCalledTimes(1);
    expect(result.current.status).toBe('saving');

    // While saving is happening, trigger a new save
    act(() => { result.current.triggerSave({ id: 2 }); });

    // Resolve the first save
    await act(async () => {
      resolveSave();
      // Need to flush microtasks
      await Promise.resolve();
    });

    // The second save should immediately fire
    expect(saveFn).toHaveBeenCalledTimes(2);
    expect(saveFn).toHaveBeenCalledWith({ id: 2 });
  });

  it('sets status to failed on error and allows manual retry', async () => {
    const saveFn = vi.fn().mockRejectedValueOnce(new Error('Network error')).mockResolvedValueOnce(undefined);
    const onError = vi.fn();

    const { result } = renderHook(() => useAutosave({ saveFn, delay: 100, onError }));

    act(() => { result.current.triggerSave({ id: 1 }); });
    
    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    expect(saveFn).toHaveBeenCalledTimes(1);
    expect(result.current.status).toBe('failed');
    expect(onError).toHaveBeenCalled();

    // Trigger manual retry
    await act(async () => {
      result.current.retry();
    });

    expect(saveFn).toHaveBeenCalledTimes(2);
    expect(result.current.status).toBe('saved');
  });
});
