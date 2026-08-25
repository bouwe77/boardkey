/**
 * React TUI - A React-based Text User Interface (TUI) emulator
 * 
 * This library provides a keyboard-driven TUI engine for React applications.
 * 
 * @example
 * ```tsx
 * import { KeyboardProvider, useKeys } from 'react-tui';
 * 
 * function App() {
 *   return (
 *     <KeyboardProvider>
 *       <MyTUIApp />
 *     </KeyboardProvider>
 *   );
 * }
 * 
 * function MyTUIApp() {
 *   useKeys({
 *     'ctrl+s': () => console.log('Save!'),
 *     'escape': () => console.log('Cancel'),
 *   });
 *   
 *   return <div>My TUI Application</div>;
 * }
 * ```
 */

export { KeyboardProvider, useKeyboardContext } from './KeyboardProvider';
export { useKeys } from './useKeys';
export { useMute } from './useMute';
export { getEventString } from './getEventString';
export type { KeyMap, KeyHandler, UseKeysOptions, KeyboardContextValue, RegistryEntry } from './types';
