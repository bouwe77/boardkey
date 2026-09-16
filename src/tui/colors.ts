export interface Colors {
  /**
   * Behind everything, including the sidebar. Follows `background` until you
   * set it yourself, so a theme only has to name one background.
   */
  page?: string
  /** The title in the top border line */
  title: string
  /** The border itself, including the rule next to the title */
  border: string
  background: string
  text: string
  selectedBackground: string
  selectedText: string
}

export const DEFAULT_COLORS: Colors = {
  title: '#d4d4d4',
  border: '#d4d4d4',
  background: 'transparent',
  text: '#d4d4d4',
  selectedBackground: '#d4d4d4',
  selectedText: '#1e1e1e',
}

/** Fills the gaps in a partial palette, so components can always read all of it */
export const withDefaults = (colors?: Partial<Colors>): Colors => ({
  ...DEFAULT_COLORS,
  ...colors,
})

/** The page background, or the panel background while it still follows it */
export const pageColor = (colors: Colors) => colors.page ?? colors.background
