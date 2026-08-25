import React, { useState } from 'react';
import { KeyboardProvider, useKeys, useMute } from 'react-tui';

function TextInput() {
  const [value, setValue] = useState('');
  const [isActive, setIsActive] = useState(false);
  
  // Use mute mode when the input is active
  useMute(isActive);
  
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
          padding: '8px', 
          border: '2px solid #3794ff',
          cursor: 'pointer',
          background: '#252526',
          marginBottom: '10px',
        }}
        onClick={() => setIsActive(true)}
      >
        📝 Click to edit (or press 'E')... Current value: {value || '(empty)'}
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
        padding: '8px',
        border: '2px solid #0078d4',
        fontFamily: 'inherit',
        fontSize: 'inherit',
        width: '100%',
        background: '#1e1e1e',
        color: '#d4d4d4',
        marginBottom: '10px',
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
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
        }}
        onClick={onClose}
      />
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          padding: '30px',
          background: '#252526',
          border: '2px solid #0078d4',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
          minWidth: '400px',
          zIndex: 1000,
        }}
      >
        <h2 style={{ margin: '0 0 15px 0', color: '#0078d4' }}>🪟 Modal Dialog</h2>
        <p style={{ marginBottom: '15px' }}>
          This modal has a higher epoch than the main app, so it captures keyboard events first.
        </p>
        <div style={{ 
          padding: '10px', 
          background: '#1e1e1e', 
          border: '1px solid #3794ff',
          fontSize: '12px',
          color: '#858585',
        }}>
          <strong>Try it:</strong> Main app shortcuts (like arrow keys) don't work while this modal is open.
        </div>
        <div style={{ marginTop: '15px', fontSize: '12px', color: '#858585' }}>
          Press <kbd style={{ background: '#1e1e1e', padding: '2px 6px', border: '1px solid #3794ff' }}>ESC</kbd> or{' '}
          <kbd style={{ background: '#1e1e1e', padding: '2px 6px', border: '1px solid #3794ff' }}>Ctrl+W</kbd> to close
        </div>
      </div>
    </>
  );
}

function App() {
  const [count, setCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  
  const addLog = (message: string) => {
    setLog(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${message}`]);
  };
  
  useKeys({
    'ctrl+s': () => addLog('💾 Save triggered (Ctrl+S)'),
    'ctrl+q': () => addLog('🚪 Quit triggered (Ctrl+Q)'),
    'arrowup': () => {
      setCount(c => c + 1);
      addLog('⬆️ Count increased');
    },
    'arrowdown': () => {
      setCount(c => c - 1);
      addLog('⬇️ Count decreased');
    },
    'm': () => {
      setShowModal(true);
      addLog('🪟 Modal opened (M)');
    },
    'e': () => {
      setShowInput(true);
      addLog('📝 Input activated (E)');
    },
    'h': () => addLog('❓ Help triggered (H)'),
    '?': () => addLog('❓ Help triggered (?)'),
  }, { active: !showModal && !showInput });
  
  return (
    <div style={{ 
      padding: '40px', 
      fontFamily: "'Courier New', monospace",
      maxWidth: '900px',
      margin: '0 auto',
      minHeight: '100vh',
    }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ 
          marginBottom: '10px', 
          color: '#0078d4',
          fontSize: '32px',
        }}>
          ⌨️ React TUI Demo
        </h1>
        <p style={{ color: '#858585', fontSize: '14px' }}>
          A keyboard-driven Text User Interface with priority-based event handling
        </p>
      </div>
      
      <div style={{ 
        padding: '20px', 
        background: '#252526', 
        marginBottom: '30px',
        border: '2px solid #3794ff',
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#3794ff' }}>⌨️ Keyboard Commands:</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <strong style={{ color: '#4ec9b0' }}>↑/↓</strong> - Increase/decrease counter<br/>
            <strong style={{ color: '#4ec9b0' }}>M</strong> - Open modal dialog<br/>
            <strong style={{ color: '#4ec9b0' }}>E</strong> - Activate text input<br/>
            <strong style={{ color: '#4ec9b0' }}>H</strong> or <strong style={{ color: '#4ec9b0' }}>?</strong> - Show help
          </div>
          <div>
            <strong style={{ color: '#4ec9b0' }}>Ctrl+S</strong> - Save (logged)<br/>
            <strong style={{ color: '#4ec9b0' }}>Ctrl+Q</strong> - Quit (logged)<br/>
            <strong style={{ color: '#4ec9b0' }}>ESC</strong> - Close modal/input<br/>
            <strong style={{ color: '#4ec9b0' }}>Ctrl+W</strong> - Close modal
          </div>
        </div>
      </div>
      
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ color: '#ce9178', marginBottom: '10px' }}>📊 Counter Demo:</h3>
        <div style={{ 
          padding: '20px', 
          background: '#252526',
          border: '2px solid #ce9178',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#ce9178' }}>
            {count}
          </div>
          <p style={{ fontSize: '12px', color: '#858585', margin: '10px 0 0 0' }}>
            Use ↑/↓ arrow keys to change the counter
          </p>
        </div>
      </div>
      
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ color: '#dcdcaa', marginBottom: '10px' }}>📝 Text Input Demo (with Mute Mode):</h3>
        {showInput ? (
          <TextInput />
        ) : (
          <div 
            style={{ 
              padding: '8px', 
              border: '2px solid #3794ff',
              cursor: 'pointer',
              background: '#252526',
              marginBottom: '10px',
            }}
            onClick={() => setShowInput(true)}
          >
            📝 Click to edit (or press 'E')... Current value: (empty)
          </div>
        )}
        <p style={{ fontSize: '12px', color: '#858585' }}>
          When editing, keyboard shortcuts are muted and only ESC works. Regular typing goes to the input.
        </p>
      </div>
      
      <div>
        <h3 style={{ color: '#4fc1ff', marginBottom: '10px' }}>📋 Event Log:</h3>
        <div style={{ 
          background: '#0c0c0c', 
          color: '#cccccc', 
          padding: '15px',
          fontFamily: 'monospace',
          fontSize: '13px',
          minHeight: '200px',
          maxHeight: '200px',
          overflow: 'auto',
          border: '2px solid #4fc1ff',
        }}>
          {log.length === 0 ? (
            <div style={{ color: '#858585' }}>⏳ Waiting for keyboard events...</div>
          ) : (
            log.map((entry, i) => <div key={i} style={{ marginBottom: '4px' }}>{entry}</div>)
          )}
        </div>
      </div>
      
      {showModal && (
        <Modal onClose={() => {
          setShowModal(false);
          addLog('🪟 Modal closed');
        }} />
      )}
    </div>
  );
}

export default function Root() {
  return (
    <KeyboardProvider>
      <App />
    </KeyboardProvider>
  );
}
