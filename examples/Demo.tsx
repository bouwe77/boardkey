import React, { useState } from 'react';
import { KeyboardProvider, useKeys, useMute } from '../src';

/**
 * Example TUI Application
 * 
 * Demonstrates:
 * - KeyboardProvider setup
 * - useKeys for component-level keybindings
 * - Nested components with different epochs
 * - useMute for text input handling
 */

function TextInput() {
  const [value, setValue] = useState('');
  const [isActive, setIsActive] = useState(false);
  
  // Use mute mode when the input is active
  if (isActive) {
    useMute();
  }
  
  // Register escape key to exit input mode
  useKeys({
    'escape': () => {
      setIsActive(false);
    },
  }, { active: isActive });
  
  if (!isActive) {
    return (
      <div 
        style={{ 
          padding: '4px', 
          border: '1px solid #ccc',
          cursor: 'pointer',
        }}
        onClick={() => setIsActive(true)}
      >
        Click to edit (or press 'e')... Current value: {value || '(empty)'}
      </div>
    );
  }
  
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      autoFocus
      style={{
        padding: '4px',
        border: '1px solid #0078d4',
        fontFamily: 'inherit',
        fontSize: 'inherit',
        width: '100%',
      }}
      placeholder="Type here... Press ESC to exit"
    />
  );
}

function Modal({ onClose }: { onClose: () => void }) {
  useKeys({
    'escape': onClose,
    'ctrl+w': onClose,
  });
  
  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        padding: '20px',
        background: '#fff',
        border: '2px solid #0078d4',
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
        minWidth: '300px',
      }}
    >
      <h3 style={{ margin: '0 0 10px 0' }}>Modal Dialog</h3>
      <p>This is a modal. It has a higher epoch than the main app.</p>
      <p style={{ fontSize: '12px', color: '#666' }}>
        Press ESC or Ctrl+W to close
      </p>
    </div>
  );
}

function App() {
  const [count, setCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  
  const addLog = (message: string) => {
    setLog(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${message}`]);
  };
  
  useKeys({
    'ctrl+s': () => addLog('Save triggered (Ctrl+S)'),
    'ctrl+q': () => addLog('Quit triggered (Ctrl+Q)'),
    'arrowup': () => {
      setCount(c => c + 1);
      addLog('Count increased (↑)');
    },
    'arrowdown': () => {
      setCount(c => c - 1);
      addLog('Count decreased (↓)');
    },
    'm': () => {
      setShowModal(true);
      addLog('Modal opened (M)');
    },
    'h': () => addLog('Help triggered (H)'),
    '?': () => addLog('Help triggered (?)'),
  });
  
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: "'Courier New', monospace",
      maxWidth: '800px',
      margin: '0 auto',
    }}>
      <h1 style={{ marginBottom: '20px' }}>React TUI Demo</h1>
      
      <div style={{ 
        padding: '10px', 
        background: '#f0f0f0', 
        marginBottom: '20px',
        border: '1px solid #ccc',
      }}>
        <h3 style={{ margin: '0 0 10px 0' }}>Keyboard Commands:</h3>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li>↑/↓ - Increase/decrease counter</li>
          <li>M - Open modal</li>
          <li>Ctrl+S - Save (logged)</li>
          <li>Ctrl+Q - Quit (logged)</li>
          <li>H or ? - Help (logged)</li>
        </ul>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Counter: {count}</h3>
        <p style={{ fontSize: '12px', color: '#666' }}>
          Use arrow keys to change the counter
        </p>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Text Input Demo:</h3>
        <TextInput />
        <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
          When editing, only ESC works. Other keys type into the input.
        </p>
      </div>
      
      <div>
        <h3>Event Log:</h3>
        <div style={{ 
          background: '#000', 
          color: '#0f0', 
          padding: '10px',
          fontFamily: 'monospace',
          fontSize: '12px',
          minHeight: '150px',
          maxHeight: '150px',
          overflow: 'auto',
        }}>
          {log.length === 0 ? (
            <div style={{ color: '#666' }}>Waiting for keyboard events...</div>
          ) : (
            log.map((entry, i) => <div key={i}>{entry}</div>)
          )}
        </div>
      </div>
      
      {showModal && (
        <Modal onClose={() => {
          setShowModal(false);
          addLog('Modal closed');
        }} />
      )}
    </div>
  );
}

export function Demo() {
  return (
    <KeyboardProvider>
      <App />
    </KeyboardProvider>
  );
}

export default Demo;
