import { describe, it, expect, jest } from '@jest/globals'
import React from 'react'
import { render, fireEvent, screen } from '@testing-library/react'
import { KeyboardProvider } from '../index.js'
import { ListBox } from './ListBox.js'

const renderInProvider = (ui: React.ReactNode) =>
  render(<KeyboardProvider>{ui}</KeyboardProvider>)

describe('ListBox', () => {
  const OPTIONS = ['One', 'Two', 'Three']

  const selected = () =>
    screen
      .getAllByRole('option')
      .find((option) => option.getAttribute('aria-selected') === 'true')
      ?.textContent

  it('should start on the first option and wrap around at both ends', () => {
    renderInProvider(<ListBox title="Numbers" options={OPTIONS} />)
    expect(selected()).toBe('One')

    fireEvent.keyDown(window, { key: 'ArrowDown' })
    expect(selected()).toBe('Two')

    // Up from the first option lands on the last one
    fireEvent.keyDown(window, { key: 'ArrowUp' })
    fireEvent.keyDown(window, { key: 'ArrowUp' })
    expect(selected()).toBe('Three')

    fireEvent.keyDown(window, { key: 'ArrowDown' })
    expect(selected()).toBe('One')
  })

  it('should pick the selected option on enter', () => {
    const onSelect = jest.fn()
    renderInProvider(
      <ListBox title="Numbers" options={OPTIONS} onSelect={onSelect} />,
    )

    fireEvent.keyDown(window, { key: 'ArrowDown' })
    fireEvent.keyDown(window, { key: 'Enter' })

    expect(onSelect).toHaveBeenCalledWith('Two')
  })

  it('should pick an option in one click, without hovering first', () => {
    const onSelect = jest.fn()
    renderInProvider(
      <ListBox title="Numbers" options={OPTIONS} onSelect={onSelect} />,
    )

    fireEvent.click(screen.getByText('Three'))

    expect(onSelect).toHaveBeenCalledWith('Three')
    // Hovering must not take the selection away from the arrow keys
    fireEvent.mouseEnter(screen.getByText('Two'))
    expect(selected()).toBe('One')
  })

  it('should report the selection on mount and on every move', () => {
    const onChange = jest.fn()
    renderInProvider(
      <ListBox title="Numbers" options={OPTIONS} onChange={onChange} />,
    )

    expect(onChange).toHaveBeenCalledWith('One')

    fireEvent.keyDown(window, { key: 'ArrowDown' })

    expect(onChange).toHaveBeenLastCalledWith('Two')
  })

  it('should leave the arrow keys alone while inactive', () => {
    const active = jest.fn()
    const inactive = jest.fn()

    renderInProvider(
      <>
        {/* Mounted last, so epochs alone would give this one the keys */}
        <ListBox title="Left" options={OPTIONS} onSelect={active} />
        <ListBox
          title="Right"
          options={OPTIONS}
          active={false}
          onSelect={inactive}
        />
      </>,
    )

    fireEvent.keyDown(window, { key: 'ArrowDown' })
    fireEvent.keyDown(window, { key: 'Enter' })

    expect(active).toHaveBeenCalledWith('Two')
    expect(inactive).not.toHaveBeenCalled()
  })
})
