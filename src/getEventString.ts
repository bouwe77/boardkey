/**
 * Normalizes a keyboard event into a standard string format
 * Format: [ctrl+][alt+][shift+]key
 * Example: "ctrl+s", "alt+shift+arrowup", "enter"
 */
export function getEventString(event: KeyboardEvent): string {
  const parts: string[] = []

  // Add modifiers in consistent order
  if (event.ctrlKey || event.metaKey) {
    parts.push('ctrl')
  }
  if (event.altKey) {
    parts.push('alt')
  }
  if (event.shiftKey) {
    parts.push('shift')
  }

  // Add the key itself, lowercased
  const key = event.key.toLowerCase()
  parts.push(key)

  return parts.join('+')
}
