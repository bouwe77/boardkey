/**
 * Type definitions for the TUI keyboard engine
 */

export type KeyHandler = ((event: KeyboardEvent) => void) | null;

export type KeyMap = {
  [key: string]: KeyHandler;
};

export interface RegistryEntry {
  id: string;
  epoch: number;
  bindings: React.MutableRefObject<KeyMap>;
}

export interface KeyboardContextValue {
  registry: Map<string, RegistryEntry>;
  nextEpoch: number;
  isMuted: boolean;
  setIsMuted: (value: boolean) => void;
  registerComponent: (id: string, bindings: React.MutableRefObject<KeyMap>) => number;
  unregisterComponent: (id: string) => void;
}

export interface UseKeysOptions {
  active?: boolean;
}
