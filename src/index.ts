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

export { KeyboardProvider, useKeyboardContext } from './KeyboardProvider.js'
export type { KeyboardProviderProps } from './KeyboardProvider.js'
export { useKeys } from './useKeys.js'
export { useMute } from './useMute.js'
export { getEventString } from './getEventString.js'
export type { KeyMap, KeyHandler, UseKeysOptions } from './types.js'
