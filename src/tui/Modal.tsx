import React from 'react'

export interface ModalProps {
  children: React.ReactNode
  onClose: () => void
}

/**
 * Puts whatever you give it on top of everything, behind a dimmed backdrop.
 * The content brings its own panel, so there is no second border around it.
 *
 * It mounts later than the screen below, so its panel claims a higher epoch and
 * its keys win: escape closes the modal, not the dialog behind it.
 */
export function Modal({ children, onClose }: ModalProps) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
      }}
    >
      {/* A click inside the modal must not reach the backdrop */}
      <div
        onClick={(event) => event.stopPropagation()}
        style={{ width: '100%', maxWidth: '420px' }}
      >
        {children}
      </div>
    </div>
  )
}
