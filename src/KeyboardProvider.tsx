import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from 'react'
import { getEventString } from './getEventString.js'
import { KeyboardContextValue, RegistryEntry, KeyMap } from './types.js'

const KeyboardContext = createContext<KeyboardContextValue | null>(null)

export interface KeyboardProviderProps {
  children: React.ReactNode
}

/**
 * KeyboardProvider - The core keyboard engine that manages keyboard event handling
 *
 * Features:
 * - Registry: Stores active keybindings with unique IDs and epoch priority
 * - Epoch: Counter that increments for each new registration (higher = higher priority)
 * - isMuted: Only the highest-epoch registration handles keys (for text inputs)
 * - Event listener: Single keydown listener with epoch-based resolution
 */
export const KeyboardProvider: React.FC<KeyboardProviderProps> = ({
  children,
}) => {
  const registryRef = useRef<Map<string, RegistryEntry>>(new Map())
  const nextEpochRef = useRef<number>(0)
  const [isMuted, setIsMuted] = useState<boolean>(false)

  const registerComponent = useCallback(
    (id: string, bindings: React.MutableRefObject<KeyMap>) => {
      registryRef.current.set(id, {
        id,
        epoch: nextEpochRef.current,
        bindings,
      })
      nextEpochRef.current += 1
    },
    [],
  )

  const unregisterComponent = useCallback((id: string) => {
    registryRef.current.delete(id)
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const eventString = getEventString(event)

      // Highest epoch wins. When muted, only that one registration may handle keys.
      const entries = [...registryRef.current.values()].sort(
        (a, b) => b.epoch - a.epoch,
      )
      const match = (isMuted ? entries.slice(0, 1) : entries).find(
        (entry) => entry.bindings.current[eventString] !== undefined,
      )

      if (!match) {
        return // No one handles this key, let the browser handle it
      }

      // Prevent default regardless of whether the handler is null (NOOP) or a function
      event.preventDefault()
      match.bindings.current[eventString]?.(event)
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isMuted])

  const contextValue: KeyboardContextValue = {
    isMuted,
    setIsMuted,
    registerComponent,
    unregisterComponent,
  }

  return (
    <KeyboardContext.Provider value={contextValue}>
      {children}
    </KeyboardContext.Provider>
  )
}

export const useKeyboardContext = () => {
  const context = useContext(KeyboardContext)
  if (!context) {
    throw new Error('useKeyboardContext must be used within a KeyboardProvider')
  }
  return context
}
