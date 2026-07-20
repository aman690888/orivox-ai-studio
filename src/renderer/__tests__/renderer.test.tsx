import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { EditorProvider, useEditor } from '../EditorContext';
import { SlideCanvas } from '../SlideCanvas';
import { EditableText } from '../EditableText';
import { RendererRegistry } from '../RendererRegistry';
import type { PresentationIR } from '../../types/presentation-ir.types';

// Mock the server function
vi.mock('@tanstack/react-start', () => {
  return {
    createServerFn: () => {
      const fn = Object.assign(
        vi.fn().mockResolvedValue({ success: true }),
        { validator: () => fn, handler: () => fn }
      );
      return fn;
    }
  };
});

function createMockIR(): PresentationIR {
  return {
    id: 'test-pres',
    version: '3.0.0',
    metadata: { title: 'Test Pres', author_id: 'a', created_at: 'now', updated_at: 'now', audience: 'all', tone: 'neutral' },
    theme: { id: 'default', colors: { primary: '#f00' }, typography: { heading: 'Arial', body: 'Arial' } },
    slide_order: ['s1'],
    slides: {
      s1: {
        id: 's1',
        purpose: 'test',
        layout_id: 'l1',
        components: ['c1'],
        components_data: {
          c1: { id: 'c1', type: 'Title', data: { content: 'Initial Title' } }
        }
      }
    },
    assets: {}
  } as PresentationIR;
}

describe('React Components', () => {
  afterEach(() => {
    cleanup();
  });

  describe('EditorContext & Undo/Redo', () => {
    const TestComponent = () => {
      const { ir, updateComponentData, undo, redo, canUndo, canRedo } = useEditor();
      const content = ir.slides['s1'].components_data['c1'].data.content;
      
      return (
        <div>
          <div data-testid="content">{content}</div>
          <button onClick={() => updateComponentData('s1', 'c1', { content: 'Updated Title' })}>Update</button>
          <button onClick={undo} disabled={!canUndo}>Undo</button>
          <button onClick={redo} disabled={!canRedo}>Redo</button>
        </div>
      );
    };

    it('updates state and handles undo/redo', () => {
      render(<EditorProvider initialIr={createMockIR()}><TestComponent /></EditorProvider>);
      
      expect(screen.getByTestId('content').textContent).toBe('Initial Title');
      expect(screen.getByText('Undo')).toBeDisabled();
      
      fireEvent.click(screen.getByText('Update'));
      expect(screen.getByTestId('content').textContent).toBe('Updated Title');
      expect(screen.getByText('Undo')).not.toBeDisabled();
      
      fireEvent.click(screen.getByText('Undo'));
      expect(screen.getByTestId('content').textContent).toBe('Initial Title');
      expect(screen.getByText('Redo')).not.toBeDisabled();
      
      fireEvent.click(screen.getByText('Redo'));
      expect(screen.getByTestId('content').textContent).toBe('Updated Title');
    });
  });

  describe('EditableText', () => {
    it('switches to input on click and updates on blur', () => {
      const TestWrapper = () => {
        const { ir } = useEditor();
        return (
          <div>
            <EditableText slideId="s1" componentId="c1" field="content" value={ir.slides['s1'].components_data['c1'].data.content} />
            <div data-testid="display">{ir.slides['s1'].components_data['c1'].data.content}</div>
          </div>
        );
      };

      render(<EditorProvider initialIr={createMockIR()}><TestWrapper /></EditorProvider>);
      
      const textSpan = screen.getAllByText('Initial Title')[0];
      fireEvent.click(textSpan);
      
      const input = screen.getByDisplayValue('Initial Title');
      fireEvent.change(input, { target: { value: 'New Typed Title' } });
      fireEvent.blur(input);
      
      expect(screen.getByTestId('display').textContent).toBe('New Typed Title');
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('Ctrl+Z triggers undo globally', () => {
      const TestComponent = () => {
        const { ir, updateComponentData } = useEditor();
        return (
          <div>
            <div data-testid="content">{ir.slides['s1'].components_data['c1'].data.content}</div>
            <button data-testid="btn" onClick={() => updateComponentData('s1', 'c1', { content: 'Changed' })}>Change</button>
          </div>
        );
      };

      render(<EditorProvider initialIr={createMockIR()}><TestComponent /></EditorProvider>);
      
      fireEvent.click(screen.getByTestId('btn'));
      expect(screen.getByTestId('content').textContent).toBe('Changed');
      
      fireEvent.keyDown(window, { key: 'z', ctrlKey: true });
      expect(screen.getByTestId('content').textContent).toBe('Initial Title');
    });
  });

  describe('SlideCanvas Navigation', () => {
    it('ignores arrow keys when typing in an input', () => {
      const multiSlideIr = createMockIR();
      multiSlideIr.slide_order.push('s2');
      multiSlideIr.slides['s2'] = { ...multiSlideIr.slides['s1'], id: 's2', components_data: { c1: { id: 'c1', type: 'Title', data: { content: 'Slide 2' } } } } as any;

      render(<EditorProvider initialIr={multiSlideIr}><SlideCanvas /></EditorProvider>);
      
      const textSpan = screen.getAllByText('Initial Title')[0];
      fireEvent.click(textSpan);
      
      const input = screen.getByDisplayValue('Initial Title');
      fireEvent.keyDown(input, { key: 'ArrowRight', bubbles: true });
      
      expect(input).toBeInTheDocument();
      expect(screen.queryByText('Slide 2')).not.toBeInTheDocument();
    });
  });

  describe('Renderer Registry', () => {
    it('renders a Title component using EditableText', () => {
      const TitleRenderer = RendererRegistry['Title'];
      render(
        <EditorProvider initialIr={createMockIR()}>
          <TitleRenderer slideId="s1" componentId="c1" data={{ content: 'Hello Title' }} />
        </EditorProvider>
      );
      
      const elem = screen.getAllByText('Hello Title')[0];
      expect(elem).toBeInTheDocument();
      expect(elem.tagName).toBe('SPAN');
    });
  });
});
