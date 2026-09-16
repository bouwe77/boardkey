/**
 * Retro TUI components built on boardkey. A separate entry point, so an app
 * that only uses the hooks never pulls any of this into its bundle:
 *
 * ```tsx
 * import { Panel, ListBox } from 'boardkey/tui'
 * ```
 */

export { Panel, PANEL_PADDING } from './Panel.js'
export type { PanelProps } from './Panel.js'
export { ListBox } from './ListBox.js'
export type { ListBoxProps } from './ListBox.js'
export { Modal } from './Modal.js'
export type { ModalProps } from './Modal.js'
export { Hint } from './Hint.js'
export type { HintProps } from './Hint.js'
export { DEFAULT_COLORS, withDefaults, pageColor } from './colors.js'
export type { Colors } from './colors.js'
