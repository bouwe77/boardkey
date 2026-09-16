import React from 'react'
import { render, fireEvent, screen } from '@testing-library/react'
import { KeyboardProvider } from '../index.js'
import { Panel } from './Panel.js'

const renderInProvider = (ui: React.ReactNode) =>
  render(<KeyboardProvider>{ui}</KeyboardProvider>)

describe('Panel', () => {
  it('should close on escape, on x and on a click', () => {
    const onClose = jest.fn()
    renderInProvider(<Panel title="Title" onClose={onClose} />)

    fireEvent.keyDown(window, { key: 'Escape' })
    fireEvent.keyDown(window, { key: 'x' })
    fireEvent.keyDown(window, { key: 'X', shiftKey: true })
    fireEvent.click(screen.getByLabelText('Close'))

    expect(onClose).toHaveBeenCalledTimes(4)
  })

  it('should bind nothing without onClose', () => {
    const otherHandler = jest.fn()
    const onUnhandled = jest.fn()

    render(
      <KeyboardProvider onUnhandled={onUnhandled}>
        <Panel title="Title" />
      </KeyboardProvider>,
    )

    fireEvent.keyDown(window, { key: 'Escape' })

    expect(otherHandler).not.toHaveBeenCalled()
    expect(onUnhandled).toHaveBeenCalledWith('escape', expect.anything())
    expect(screen.queryByLabelText('Close')).toBeNull()
  })

  it('should explain the close keys in a footer, but only when it can close', () => {
    const { rerender } = renderInProvider(<Panel title="Title" />)
    expect(screen.queryByText(/close/)).toBeNull()

    rerender(
      <KeyboardProvider>
        <Panel title="Title" onClose={jest.fn()} />
      </KeyboardProvider>,
    )
    expect(screen.getByText('esc, x = close')).toBeTruthy()
  })
})
