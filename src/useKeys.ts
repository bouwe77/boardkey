import { useEffect, useRef, useId } from 'react'
import { useKeyboardContext } from './KeyboardProvider.js'
import { KeyMap, UseKeysOptions } from './types.js'

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
 * - Each registration gets a unique epoch for priority resolution
 */
export function useKeys(bindings: KeyMap, options: UseKeysOptions = {}) {
  const { active = true } = options
  const { registerComponent, unregisterComponent } = useKeyboardContext()

  // Store bindings in a ref so the event listener always has the latest version
  const bindingsRef = useRef<KeyMap>(bindings)
  bindingsRef.current = bindings

  // Unique ID for this component (useId is safe for concurrent rendering)
  const id = useId()

  useEffect(() => {
    if (!active) {
      return
    }

    registerComponent(id, bindingsRef)

    // Unregister on unmount or when active changes
    return () => {
      unregisterComponent(id)
    }
  }, [active, registerComponent, unregisterComponent, id])
}
