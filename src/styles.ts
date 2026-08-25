/**
 * Global TUI styles
 * 
 * Applies monospaced font and fluid layout for TUI applications
 */

export const tuiStyles = {
  fontFamily: "'Courier New', 'Courier', monospace",
  fontSize: '14px',
  lineHeight: '1.5',
  boxSizing: 'border-box' as const,
};

/**
 * CSS string for global TUI styles
 */
export const tuiGlobalStyles = `
  * {
    box-sizing: border-box;
  }
  
  body {
    font-family: 'Courier New', 'Courier', monospace;
    font-size: 14px;
    line-height: 1.5;
    margin: 0;
    padding: 0;
  }
  
  .tui-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100vh;
  }
  
  .tui-focused {
    outline: 2px solid #0078d4;
    outline-offset: -2px;
  }
`;

/**
 * Inject TUI styles into the document head
 */
export function injectTUIStyles() {
  if (typeof document === 'undefined') {
    return;
  }
  
  const styleId = 'react-tui-global-styles';
  
  // Don't inject if already present
  if (document.getElementById(styleId)) {
    return;
  }
  
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = tuiGlobalStyles;
  document.head.appendChild(style);
}
