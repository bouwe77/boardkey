import { useEffect } from 'react';
import { useKeyboardContext } from './KeyboardProvider';

/**
 * useMute - Hook to enable mute mode for text inputs
 * 
 * When a component mounts with useMute, the TUI engine enters "muted" mode:
 * - Only the component with the highest epoch can handle keys
 * - This allows text inputs to work while still allowing escape keys
 * 
 * Typically used by components that render <input> or <textarea>
 * 
 * @param active - Whether mute mode should be active (default: true)
 */
export function useMute(active: boolean = true) {
  const { setIsMuted } = useKeyboardContext();
  
  useEffect(() => {
    if (active) {
      // Enable mute mode
      setIsMuted(true);
      
      // Disable mute mode on cleanup
      return () => {
        setIsMuted(false);
      };
    }
    // Note: No cleanup needed when active is false - mute mode remains disabled
  }, [setIsMuted, active]);
}
