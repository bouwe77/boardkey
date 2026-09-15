/**
 * boardkey - Keyboard handling for React
 *
 * This library only handles keyboard input. It renders no UI and ships no styles.
 *
 * @example
 * ```tsx
 * import { KeyboardProvider, useKeys } from 'boardkey';
 *
 * function App() {
 *   return (
 *     <KeyboardProvider>
 *       <MyApp />
 *     </KeyboardProvider>
 *   );
 * }
 *
 * function MyApp() {
 *   useKeys({
 *     'ctrl+s': () => console.log('Save!'),
 *     'escape': () => console.log('Cancel'),
 *   });
 *
 *   return <div>My app</div>;
 * }
 * ```
 */

export { KeyboardProvider, useIsMuted } from './KeyboardProvider.js'
export type {
  KeyboardProviderProps,
  KeyMap,
  KeyHandler,
} from './KeyboardProvider.js'
export { useKeys } from './useKeys.js'
export type { UseKeysOptions } from './useKeys.js'
export { useMute } from './useMute.js'
