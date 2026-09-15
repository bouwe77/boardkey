import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from 'react'
import { getEventString } from './getEventString.js'

export type KeyHandler = ((event: KeyboardEvent) => void) | null

export type KeyMap = {
  [key: string]: KeyHandler
}

interface RegistryEntry {
  epoch: number
  bindings: React.MutableRefObject<KeyMap>
}

interface KeyboardContextValue {
  isMuted: boolean
  addMute: (id: string) => void
  removeMute: (id: string) => void
  claimEpoch: () => number
  registerComponent: (
    id: string,
    bindings: React.MutableRefObject<KeyMap>,
    epoch: number,
  ) => void
  unregisterComponent: (id: string) => void
}

const KeyboardContext = createContext<KeyboardContextValue | null>(null)

export interface KeyboardProviderProps {
  children: React.ReactNode
  /**
   * Called when a key is pressed that no active registration handles, with the
   * normalized key string (e.g. "ctrl+s", "arrowup"). Useful for debugging or
   * for telling the user a key does nothing.
   *
   * Not called while muted: a text input owns the keyboard then, so unmatched
   * keys are being typed, not unhandled.
   */
  onUnhandled?: (key: string, event: KeyboardEvent) => void
}

/**
 * KeyboardProvider - The core keyboard engine that manages keyboard event handling
 *
 * Features:
 * - Registry: Stores active keybindings with unique IDs and epoch priority
 * - Epoch: Claimed once per mounted useKeys (higher = higher priority), so
 *   toggling `active` does not change a component's priority
 * - isMuted: Only the highest-epoch registration handles keys (for text inputs).
 *   Muted while at least one component asks for it, so nested inputs work.
 * - Event listener: Single keydown listener with epoch-based resolution
 */
export const KeyboardProvider: React.FC<KeyboardProviderProps> = ({
  children,
  onUnhandled,
}) => {
  const registryRef = useRef<Map<string, RegistryEntry>>(new Map())
  const nextEpochRef = useRef<number>(0)
  // Every component that wants mute mode, by id. Muted while at least one is
  // left, so closing one does not unmute the others. A Set instead of a count
  // keeps a duplicate add or a double cleanup harmless.
  const muteIdsRef = useRef<Set<string>>(new Set())
  const [isMuted, setIsMuted] = useState<boolean>(false)

  const addMute = useCallback((id: string) => {
    muteIdsRef.current.add(id)
    setIsMuted(muteIdsRef.current.size > 0)
  }, [])

  const removeMute = useCallback((id: string) => {
    muteIdsRef.current.delete(id)
    setIsMuted(muteIdsRef.current.size > 0)
  }, [])

  // In a ref so an inline callback does not re-add the window listener. Updated
  // in an effect, because writing to a ref while rendering is not safe.
  const onUnhandledRef = useRef(onUnhandled)
  useEffect(() => {
    onUnhandledRef.current = onUnhandled
  })

  // Claimed once per mounted useKeys, not per registration
  const claimEpoch = useCallback(() => {
    const epoch = nextEpochRef.current
    nextEpochRef.current += 1
    return epoch
  }, [])

  const registerComponent = useCallback(
    (id: string, bindings: React.MutableRefObject<KeyMap>, epoch: number) => {
      registryRef.current.set(id, { epoch, bindings })
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
        // No one handles this key, let the browser handle it
        if (!isMuted) {
          onUnhandledRef.current?.(eventString, event)
        }
        return
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

  // Memoized, so consumers do not re-render on every provider render
  const contextValue: KeyboardContextValue = useMemo(
    () => ({
      isMuted,
      addMute,
      removeMute,
      claimEpoch,
      registerComponent,
      unregisterComponent,
    }),
    [
      isMuted,
      addMute,
      removeMute,
      claimEpoch,
      registerComponent,
      unregisterComponent,
    ],
  )

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

/**
 * Whether mute mode is on, so a text input owns the keyboard. Handy for
 * showing or hiding a shortcut hint.
 */
export const useIsMuted = () => useKeyboardContext().isMuted
