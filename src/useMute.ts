import { useEffect, useId } from 'react'
import { useKeyboardContext } from './KeyboardProvider.js'

/**
 * useMute - Hook to enable mute mode for text inputs
 *
 * When a component mounts with useMute, the keyboard engine enters "muted" mode:
 * - Only the component with the highest epoch can handle keys
 * - This allows text inputs to work while still allowing escape keys
 *
 * Several components may mute at the same time (a modal on top of a text input,
 * for example). Mute mode ends only when the last of them is gone.
 *
 * Typically used by components that render <input> or <textarea>
 *
 * @param active - Whether mute mode should be active (default: true)
 */
export function useMute(active: boolean = true) {
  const { addMute, removeMute } = useKeyboardContext()

  // Unique ID for this component (useId is safe for concurrent rendering)
  const id = useId()

  useEffect(() => {
    if (!active) {
      return
    }

    addMute(id)

    return () => {
      removeMute(id)
    }
  }, [addMute, removeMute, active, id])
}
