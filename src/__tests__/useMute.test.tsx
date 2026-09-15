import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { KeyboardProvider, useKeys, useMute } from '../index.js'

describe('useMute', () => {
  it('should enable mute mode on mount and disable on unmount', () => {
    const parentHandler = jest.fn()
    const mutedHandler = jest.fn()

    function ParentComponent({ showMuted }: { showMuted: boolean }) {
      useKeys({ a: parentHandler })

      return (
        <div>
          Parent
          {showMuted && <MutedComponent />}
        </div>
      )
    }

    function MutedComponent() {
      useMute()
      useKeys({ escape: mutedHandler })
      return <div>Muted</div>
    }

    const { rerender } = render(
      <KeyboardProvider>
        <ParentComponent showMuted={false} />
      </KeyboardProvider>,
    )

    // Without muted component, parent should handle 'a'
    fireEvent.keyDown(window, { key: 'a' })
    expect(parentHandler).toHaveBeenCalledTimes(1)

    // Mount muted component
    rerender(
      <KeyboardProvider>
        <ParentComponent showMuted={true} />
      </KeyboardProvider>,
    )

    // Now parent handler should not be called for 'a' (muted)
    fireEvent.keyDown(window, { key: 'a' })
    expect(parentHandler).toHaveBeenCalledTimes(1) // Still 1, not called again

    // But escape should work in muted component
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(mutedHandler).toHaveBeenCalledTimes(1)

    // Unmount muted component
    rerender(
      <KeyboardProvider>
        <ParentComponent showMuted={false} />
      </KeyboardProvider>,
    )

    // Parent should work again
    fireEvent.keyDown(window, { key: 'a' })
    expect(parentHandler).toHaveBeenCalledTimes(2)
  })

  it('should only allow highest epoch component in mute mode', () => {
    const handler1 = jest.fn()
    const handler2 = jest.fn()
    const escapeHandler = jest.fn()

    function Component1() {
      useKeys({ a: handler1 })
      return <div>Component 1</div>
    }

    function Component2() {
      useMute()
      useKeys({
        escape: escapeHandler,
        b: handler2,
      })
      return <input type="text" />
    }

    render(
      <KeyboardProvider>
        <Component1 />
        <Component2 />
      </KeyboardProvider>,
    )

    // In mute mode, only Component2 (highest epoch) can handle keys
    fireEvent.keyDown(window, { key: 'a' })
    expect(handler1).not.toHaveBeenCalled()

    fireEvent.keyDown(window, { key: 'b' })
    expect(handler2).toHaveBeenCalledTimes(1)

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(escapeHandler).toHaveBeenCalledTimes(1)
  })

  it('should allow typing in input when muted', () => {
    function TextInputComponent() {
      useMute()
      useKeys({ escape: jest.fn() })
      return <input type="text" data-testid="input" />
    }

    const { getByTestId } = render(
      <KeyboardProvider>
        <TextInputComponent />
      </KeyboardProvider>,
    )

    const input = getByTestId('input') as HTMLInputElement

    // Regular typing should work (not prevented by TUI)
    fireEvent.change(input, { target: { value: 'hello' } })
    expect(input.value).toBe('hello')
  })

  it('should stay muted until the last muting component is gone', () => {
    const appHandler = jest.fn()

    function AppKeys() {
      useKeys({ a: appHandler })
      return <div>App</div>
    }

    function TextInput() {
      useMute()
      useKeys({ escape: jest.fn() })
      return <input type="text" />
    }

    function Modal() {
      useMute()
      useKeys({ escape: jest.fn() })
      return <div>Modal</div>
    }

    // A modal on top of a text input: both are muted
    const { rerender } = render(
      <KeyboardProvider>
        <AppKeys />
        <TextInput />
        <Modal />
      </KeyboardProvider>,
    )

    fireEvent.keyDown(window, { key: 'a' })
    expect(appHandler).not.toHaveBeenCalled()

    // Closing the modal must not unmute: the input is still open
    rerender(
      <KeyboardProvider>
        <AppKeys />
        <TextInput />
      </KeyboardProvider>,
    )

    fireEvent.keyDown(window, { key: 'a' })
    expect(appHandler).not.toHaveBeenCalled()
  })

  it('should not let a re-activated app outrank a muted input', () => {
    const appHandler = jest.fn()

    // Mirrors the demo: app keys switch off while the modal is open
    function AppKeys({ showModal }: { showModal: boolean }) {
      useKeys({ h: appHandler }, { active: !showModal })
      return <div>App</div>
    }

    function TextInput() {
      useMute()
      useKeys({ escape: jest.fn() })
      return <input type="text" />
    }

    function Modal() {
      useMute()
      useKeys({ escape: jest.fn() })
      return <div>Modal</div>
    }

    const { rerender } = render(
      <KeyboardProvider>
        <AppKeys showModal={true} />
        <TextInput />
        <Modal />
      </KeyboardProvider>,
    )

    // Closing the modal re-activates the app keys, but the input still owns the
    // keyboard, so a letter must not trigger an app binding
    rerender(
      <KeyboardProvider>
        <AppKeys showModal={false} />
        <TextInput />
      </KeyboardProvider>,
    )

    fireEvent.keyDown(window, { key: 'h' })
    expect(appHandler).not.toHaveBeenCalled()
  })

  it('should rank a muted child above its own parent', () => {
    const parentHandler = jest.fn()
    const escapeHandler = jest.fn()

    // The child mounts together with the parent, so nothing but render order
    // decides who wins
    function Parent() {
      useKeys({ h: parentHandler })
      return (
        <div>
          Parent
          <TextInput />
        </div>
      )
    }

    function TextInput() {
      useMute()
      useKeys({ escape: escapeHandler })
      return <input type="text" />
    }

    render(
      <KeyboardProvider>
        <Parent />
      </KeyboardProvider>,
    )

    // The input owns the keyboard, so 'h' is a letter, not a shortcut
    fireEvent.keyDown(window, { key: 'h' })
    expect(parentHandler).not.toHaveBeenCalled()

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(escapeHandler).toHaveBeenCalledTimes(1)
  })
})
