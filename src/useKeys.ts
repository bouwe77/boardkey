import { useEffect, useRef } from 'react';
import { useKeyboardContext } from './KeyboardProvider';
import { KeyMap, UseKeysOptions } from './types';

let componentIdCounter = 0;

/**
 * useKeys - Hook for registering keybindings with the TUI engine
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
  const { active = true } = options;
  const { registerComponent, unregisterComponent } = useKeyboardContext();
  
  // Store bindings in a ref so the event listener always has the latest version
  const bindingsRef = useRef<KeyMap>(bindings);
  
  // Update the ref whenever bindings change
  useEffect(() => {
    bindingsRef.current = bindings;
  }, [bindings]);
  
  // Generate a unique ID for this component
  const idRef = useRef<string>(`component-${componentIdCounter++}`);
  
  useEffect(() => {
    if (!active) {
      return;
    }
    
    // Register this component with the keyboard engine
    registerComponent(idRef.current, bindingsRef);
    
    // Unregister on unmount or when active changes
    return () => {
      unregisterComponent(idRef.current);
    };
  }, [active, registerComponent, unregisterComponent]);
}
