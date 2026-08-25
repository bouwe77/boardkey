import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { KeyboardProvider, useKeys } from '../index';

describe('KeyboardProvider and useKeys', () => {
  it('should handle simple key press', () => {
    const handler = jest.fn();
    
    function TestComponent() {
      useKeys({ 'a': handler });
      return <div>Test</div>;
    }
    
    render(
      <KeyboardProvider>
        <TestComponent />
      </KeyboardProvider>
    );
    
    fireEvent.keyDown(window, { key: 'a' });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('should handle ctrl+key combination', () => {
    const handler = jest.fn();
    
    function TestComponent() {
      useKeys({ 'ctrl+s': handler });
      return <div>Test</div>;
    }
    
    render(
      <KeyboardProvider>
        <TestComponent />
      </KeyboardProvider>
    );
    
    fireEvent.keyDown(window, { key: 's', ctrlKey: true });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('should respect epoch priority - later component wins', () => {
    const handler1 = jest.fn();
    const handler2 = jest.fn();
    
    function Component1() {
      useKeys({ 'a': handler1 });
      return <div>Component 1</div>;
    }
    
    function Component2() {
      useKeys({ 'a': handler2 });
      return <div>Component 2</div>;
    }
    
    render(
      <KeyboardProvider>
        <Component1 />
        <Component2 />
      </KeyboardProvider>
    );
    
    fireEvent.keyDown(window, { key: 'a' });
    
    // Only the second component's handler should be called
    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).toHaveBeenCalledTimes(1);
  });

  it('should prevent default when handler is null', () => {
    function TestComponent() {
      useKeys({ 'escape': null });
      return <div>Test</div>;
    }
    
    render(
      <KeyboardProvider>
        <TestComponent />
      </KeyboardProvider>
    );
    
    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
    
    window.dispatchEvent(event);
    
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('should not call handler for unregistered keys', () => {
    const handler = jest.fn();
    
    function TestComponent() {
      useKeys({ 'a': handler });
      return <div>Test</div>;
    }
    
    render(
      <KeyboardProvider>
        <TestComponent />
      </KeyboardProvider>
    );
    
    fireEvent.keyDown(window, { key: 'b' });
    expect(handler).not.toHaveBeenCalled();
  });

  it('should handle active option', () => {
    const handler = jest.fn();
    
    function TestComponent({ active }: { active: boolean }) {
      useKeys({ 'a': handler }, { active });
      return <div>Test</div>;
    }
    
    const { rerender } = render(
      <KeyboardProvider>
        <TestComponent active={false} />
      </KeyboardProvider>
    );
    
    fireEvent.keyDown(window, { key: 'a' });
    expect(handler).not.toHaveBeenCalled();
    
    rerender(
      <KeyboardProvider>
        <TestComponent active={true} />
      </KeyboardProvider>
    );
    
    fireEvent.keyDown(window, { key: 'a' });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('should update handler without re-registration', () => {
    let handlerValue = 0;
    
    function TestComponent() {
      const [count, setCount] = React.useState(0);
      
      useKeys({
        'a': () => {
          handlerValue = count;
          setCount(c => c + 1);
        },
      });
      
      return <div>Count: {count}</div>;
    }
    
    render(
      <KeyboardProvider>
        <TestComponent />
      </KeyboardProvider>
    );
    
    // First press
    fireEvent.keyDown(window, { key: 'a' });
    expect(handlerValue).toBe(0);
    
    // Second press - should have updated handler with new count
    fireEvent.keyDown(window, { key: 'a' });
    expect(handlerValue).toBe(1);
  });
});
