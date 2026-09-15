import { useEffect, useRef, useId } from 'react'
import { KeyMap, useKeyboardContext } from './KeyboardProvider.js'

export interface UseKeysOptions {
  active?: boolean
}

/**
 * useKeys - Hook for registering keybindings with the keyboard engine
 *
 * @param bindings - Object mapping key strings to handlers (e.g., { 'ctrl+s': handler, 'escape': null })
 * @param options - Configuration options
 * @param options.active - Whether the bindings are currently active (default: true)
 *
 * Features:
 * - Uses a mutable ref to store bindings (no re-registration needed when handlers change)
 * - Automatically registers on mount and unregisters on unmount
 * - Each mount claims a unique epoch for priority resolution, in render order,
 *   so a nested component ranks above its ancestors
 * - Toggling `active` keeps that epoch, so switching bindings off and on again
 *   does not promote a component above the ones that stayed active
 */
export function useKeys(bindings: KeyMap, options: UseKeysOptions = {}) {
  const { active = true } = options
  const { registerComponent, unregisterComponent, claimEpoch } =
    useKeyboardContext()

  // Store bindings in a ref so the event listener always has the latest version.
  // Updated in an effect, because writing to a ref while rendering is not safe.
  const bindingsRef = useRef<KeyMap>(bindings)
  useEffect(() => {
    bindingsRef.current = bindings
  })

  // Unique ID for this component (useId is safe for concurrent rendering)
  const id = useId()

  // Claimed once per mounted instance, while rendering. Render order runs from
  // parent to child, so a nested component ranks above its ancestors. Doing this
  // in an effect would invert that, because child effects run first.
  const epochRef = useRef<number | null>(null)
  if (epochRef.current === null) {
    epochRef.current = claimEpoch()
  }
  const epoch = epochRef.current

  useEffect(() => {
    if (!active) {
      return
    }

    registerComponent(id, bindingsRef, epoch)

    // Unregister on unmount or when active changes
    return () => {
      unregisterComponent(id)
    }
  }, [active, registerComponent, unregisterComponent, id, epoch])
}
