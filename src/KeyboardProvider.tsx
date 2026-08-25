import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { getEventString } from './getEventString';
import { KeyboardContextValue, RegistryEntry, KeyMap } from './types';

const KeyboardContext = createContext<KeyboardContextValue | null>(null);

export interface KeyboardProviderProps {
  children: React.ReactNode;
}

/**
 * KeyboardProvider - The core TUI engine that manages keyboard event handling
 * 
 * Features:
 * - Registry: Stores active keybindings with unique IDs and epoch priority
 * - nextEpoch: Counter that increments for each new registration (higher = higher priority)
 * - isMuted: Flag to disable TUI engine (for text inputs)
 * - Event listener: Single keydown listener with epoch-based resolution
 */
export const KeyboardProvider: React.FC<KeyboardProviderProps> = ({ children }) => {
  const registryRef = useRef<Map<string, RegistryEntry>>(new Map());
  const nextEpochRef = useRef<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const registerComponent = useCallback((id: string, bindings: React.MutableRefObject<KeyMap>): number => {
    const epoch = nextEpochRef.current;
    nextEpochRef.current += 1;
    
    registryRef.current.set(id, {
      id,
      epoch,
      bindings,
    });
    
    return epoch;
  }, []);

  const unregisterComponent = useCallback((id: string) => {
    registryRef.current.delete(id);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Step 1: Normalize the key event
      const eventString = getEventString(event);
      
      // Step 2: Check if muted
      if (isMuted) {
        // In muted mode, only check the component with the highest epoch
        let highestEpochEntry: RegistryEntry | null = null;
        
        registryRef.current.forEach((entry) => {
          if (!highestEpochEntry || entry.epoch > highestEpochEntry.epoch) {
            highestEpochEntry = entry;
          }
        });
        
        if (highestEpochEntry) {
          const entry: RegistryEntry = highestEpochEntry;
          const handler = entry.bindings.current[eventString];
          if (handler !== undefined) {
            event.preventDefault();
            if (handler !== null) {
              handler(event);
            }
          }
        }
        return;
      }
      
      // Step 3: Find all components that have a binding for this key
      const matchingEntries: RegistryEntry[] = [];
      
      registryRef.current.forEach((entry) => {
        if (entry.bindings.current[eventString] !== undefined) {
          matchingEntries.push(entry);
        }
      });
      
      if (matchingEntries.length === 0) {
        return; // No one handles this key, let browser handle it
      }
      
      // Step 4: Sort by epoch (descending) and pick the highest
      matchingEntries.sort((a, b) => b.epoch - a.epoch);
      const winningEntry = matchingEntries[0];
      
      const handler = winningEntry.bindings.current[eventString];
      
      // Prevent default regardless of whether handler is null or function
      event.preventDefault();
      
      if (handler !== null) {
        handler(event);
      }
      // If handler is null, it's a NOOP - we just prevented default
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMuted]);

  const contextValue: KeyboardContextValue = {
    registry: registryRef.current,
    nextEpoch: nextEpochRef.current,
    isMuted,
    setIsMuted,
    registerComponent,
    unregisterComponent,
  };

  return (
    <KeyboardContext.Provider value={contextValue}>
      {children}
    </KeyboardContext.Provider>
  );
};

export const useKeyboardContext = () => {
  const context = useContext(KeyboardContext);
  if (!context) {
    throw new Error('useKeyboardContext must be used within a KeyboardProvider');
  }
  return context;
};
