import React from 'react'
import { render, fireEvent, screen } from '@testing-library/react'
import { KeyboardProvider } from '../index.js'
import { Panel } from './Panel.js'
import { ListBox } from './ListBox.js'
import { Modal } from './Modal.js'

const renderInProvider = (ui: React.ReactNode) =>
  render(<KeyboardProvider>{ui}</KeyboardProvider>)

describe('Modal', () => {
  it('should win the keys from the screen behind it', () => {
    const closeModal = jest.fn()
    const closePanel = jest.fn()
    const behind = jest.fn()
    const inside = jest.fn()

    renderInProvider(
      <>
        <Panel title="Behind" onClose={closePanel} />
        <ListBox title="Behind" options={['a', 'b']} onSelect={behind} />
        <Modal onClose={closeModal}>
          <ListBox
            title="On top"
            options={['c', 'd']}
            onClose={closeModal}
            onSelect={inside}
          />
        </Modal>
      </>,
    )

    // The modal mounted last, so its epoch is the highest
    fireEvent.keyDown(window, { key: 'Enter' })
    expect(inside).toHaveBeenCalledWith('c')
    expect(behind).not.toHaveBeenCalled()

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(closeModal).toHaveBeenCalledTimes(1)
    expect(closePanel).not.toHaveBeenCalled()
  })

  it('should close on the backdrop, but not on a click inside', () => {
    const onClose = jest.fn()
    const { container } = renderInProvider(
      <Modal onClose={onClose}>
        <Panel title="On top" />
      </Modal>,
    )

    fireEvent.click(screen.getByText('On top'))
    expect(onClose).not.toHaveBeenCalled()

    fireEvent.click(container.firstChild as HTMLElement)
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
