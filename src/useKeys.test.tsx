import { describe, it, expect, beforeEach } from '@jest/globals'
import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { KeyboardProvider, useKeys, useMute } from './index.js'

describe('useKeys called more than once in one component', () => {
  const calls: string[] = []

  function TwoCalls({ mute }: { mute: boolean }) {
    useMute(mute)
    useKeys({ a: () => calls.push('first:a'), b: () => calls.push('first:b') })
    useKeys({ a: () => calls.push('second:a') })
    return null
  }

  beforeEach(() => {
    calls.length = 0
  })

  it('should let the later call win for a key both calls bind', () => {
    render(
      <KeyboardProvider>
        <TwoCalls mute={false} />
      </KeyboardProvider>,
    )

    // Each call claims its own epoch in render order, so the second one ranks
    // above the first. A key only the first call binds still falls through.
    fireEvent.keyDown(window, { key: 'a' })
    fireEvent.keyDown(window, { key: 'b' })

    expect(calls).toEqual(['second:a', 'first:b'])
  })

  it('should leave only the last call reachable while muted', () => {
    render(
      <KeyboardProvider>
        <TwoCalls mute={true} />
      </KeyboardProvider>,
    )

    // Muted means only the highest registration handles keys, and that is the
    // last call. So a component that mutes should keep its bindings together.
    fireEvent.keyDown(window, { key: 'a' })
    fireEvent.keyDown(window, { key: 'b' })

    expect(calls).toEqual(['second:a'])
  })
})
