import { getEventString } from '../getEventString.js'

describe('getEventString', () => {
  const createKeyboardEvent = (options: {
    key: string
    ctrlKey?: boolean
    altKey?: boolean
    shiftKey?: boolean
    metaKey?: boolean
  }): KeyboardEvent => {
    return {
      key: options.key,
      ctrlKey: options.ctrlKey || false,
      altKey: options.altKey || false,
      shiftKey: options.shiftKey || false,
      metaKey: options.metaKey || false,
    } as KeyboardEvent
  }

  it('should normalize a simple key', () => {
    const event = createKeyboardEvent({ key: 'a' })
    expect(getEventString(event)).toBe('a')
  })

  it('should normalize key to lowercase', () => {
    const event = createKeyboardEvent({ key: 'A' })
    expect(getEventString(event)).toBe('a')
  })

  it('should normalize ctrl+key', () => {
    const event = createKeyboardEvent({ key: 's', ctrlKey: true })
    expect(getEventString(event)).toBe('ctrl+s')
  })

  it('should normalize meta+key as ctrl+key', () => {
    const event = createKeyboardEvent({ key: 's', metaKey: true })
    expect(getEventString(event)).toBe('ctrl+s')
  })

  it('should normalize alt+key', () => {
    const event = createKeyboardEvent({ key: 'f', altKey: true })
    expect(getEventString(event)).toBe('alt+f')
  })

  it('should normalize shift+key', () => {
    const event = createKeyboardEvent({ key: 'arrowup', shiftKey: true })
    expect(getEventString(event)).toBe('shift+arrowup')
  })

  it('should normalize multiple modifiers in correct order', () => {
    const event = createKeyboardEvent({
      key: 'arrowup',
      ctrlKey: true,
      altKey: true,
      shiftKey: true,
    })
    expect(getEventString(event)).toBe('ctrl+alt+shift+arrowup')
  })

  it('should normalize ctrl+shift+key', () => {
    const event = createKeyboardEvent({
      key: 't',
      ctrlKey: true,
      shiftKey: true,
    })
    expect(getEventString(event)).toBe('ctrl+shift+t')
  })

  it('should normalize special keys', () => {
    expect(getEventString(createKeyboardEvent({ key: 'Escape' }))).toBe(
      'escape',
    )
    expect(getEventString(createKeyboardEvent({ key: 'Enter' }))).toBe('enter')
    expect(getEventString(createKeyboardEvent({ key: 'ArrowUp' }))).toBe(
      'arrowup',
    )
    expect(getEventString(createKeyboardEvent({ key: 'ArrowDown' }))).toBe(
      'arrowdown',
    )
    expect(getEventString(createKeyboardEvent({ key: 'Tab' }))).toBe('tab')
  })

  it('should handle space key', () => {
    const event = createKeyboardEvent({ key: ' ' })
    expect(getEventString(event)).toBe(' ')
  })
})
