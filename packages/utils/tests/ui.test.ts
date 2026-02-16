import { describe, it, expect, vi } from 'vitest'
import { delay } from '../src/ui'

describe('delay', () => {
  it('resolves after the specified time', async () => {
    vi.useFakeTimers()
    const promise = delay(100)
    vi.advanceTimersByTime(100)
    await expect(promise).resolves.toBeUndefined()
    vi.useRealTimers()
  })

  it('uses 500ms as default', async () => {
    vi.useFakeTimers()
    const promise = delay()
    vi.advanceTimersByTime(499)
    // Should not have resolved yet
    let resolved = false
    promise.then(() => {
      resolved = true
    })
    await vi.advanceTimersByTimeAsync(0)
    expect(resolved).toBe(false)

    vi.advanceTimersByTime(1)
    await vi.advanceTimersByTimeAsync(0)
    expect(resolved).toBe(true)
    vi.useRealTimers()
  })

  it('returns a promise', () => {
    vi.useFakeTimers()
    const result = delay(10)
    expect(result).toBeInstanceOf(Promise)
    vi.advanceTimersByTime(10)
    vi.useRealTimers()
  })
})
