import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { KeyboardProvider, useKeys, useMute } from '../index';

describe('useMute', () => {
  it('should enable mute mode on mount and disable on unmount', () => {
    const parentHandler = jest.fn();
    const mutedHandler = jest.fn();
    
    function ParentComponent({ showMuted }: { showMuted: boolean }) {
      useKeys({ 'a': parentHandler });
      
      return (
        <div>
          Parent
          {showMuted && <MutedComponent />}
        </div>
      );
    }
    
    function MutedComponent() {
      useMute();
      useKeys({ 'escape': mutedHandler });
      return <div>Muted</div>;
    }
    
    const { rerender } = render(
      <KeyboardProvider>
        <ParentComponent showMuted={false} />
      </KeyboardProvider>
    );
    
    // Without muted component, parent should handle 'a'
    fireEvent.keyDown(window, { key: 'a' });
    expect(parentHandler).toHaveBeenCalledTimes(1);
    
    // Mount muted component
    rerender(
      <KeyboardProvider>
        <ParentComponent showMuted={true} />
      </KeyboardProvider>
    );
    
    // Now parent handler should not be called for 'a' (muted)
    fireEvent.keyDown(window, { key: 'a' });
    expect(parentHandler).toHaveBeenCalledTimes(1); // Still 1, not called again
    
    // But escape should work in muted component
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(mutedHandler).toHaveBeenCalledTimes(1);
    
    // Unmount muted component
    rerender(
      <KeyboardProvider>
        <ParentComponent showMuted={false} />
      </KeyboardProvider>
    );
    
    // Parent should work again
    fireEvent.keyDown(window, { key: 'a' });
    expect(parentHandler).toHaveBeenCalledTimes(2);
  });

  it('should only allow highest epoch component in mute mode', () => {
    const handler1 = jest.fn();
    const handler2 = jest.fn();
    const escapeHandler = jest.fn();
    
    function Component1() {
      useKeys({ 'a': handler1 });
      return <div>Component 1</div>;
    }
    
    function Component2() {
      useMute();
      useKeys({
        'escape': escapeHandler,
        'b': handler2,
      });
      return <input type="text" />;
    }
    
    render(
      <KeyboardProvider>
        <Component1 />
        <Component2 />
      </KeyboardProvider>
    );
    
    // In mute mode, only Component2 (highest epoch) can handle keys
    fireEvent.keyDown(window, { key: 'a' });
    expect(handler1).not.toHaveBeenCalled();
    
    fireEvent.keyDown(window, { key: 'b' });
    expect(handler2).toHaveBeenCalledTimes(1);
    
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(escapeHandler).toHaveBeenCalledTimes(1);
  });

  it('should allow typing in input when muted', () => {
    function TextInputComponent() {
      useMute();
      useKeys({ 'escape': jest.fn() });
      return <input type="text" data-testid="input" />;
    }
    
    const { getByTestId } = render(
      <KeyboardProvider>
        <TextInputComponent />
      </KeyboardProvider>
    );
    
    const input = getByTestId('input') as HTMLInputElement;
    
    // Regular typing should work (not prevented by TUI)
    fireEvent.change(input, { target: { value: 'hello' } });
    expect(input.value).toBe('hello');
  });
});
