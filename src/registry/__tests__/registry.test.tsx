import React from 'react';
import { render, cleanup, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, afterEach } from 'vitest';
import { RendererRegistry } from '../../renderer/RendererRegistry';
import { EditorProvider } from '../../renderer/EditorContext';

describe('Component Registry - Automatic Rendering Tests', () => {
  afterEach(() => {
    cleanup();
  });

  const mockIr = {
    id: 'test-pres',
    version: '3.0.0',
    metadata: {},
    theme: { colors: {}, typography: {} },
    slide_order: ['s1'],
    slides: {
      s1: {
        id: 's1',
        components: ['c1'],
        components_data: { c1: { id: 'c1', type: 'Any', data: {} } }
      }
    },
    assets: {}
  } as any;

  // We loop over every component registered in the system
  const componentTypes = Object.keys(RendererRegistry);

  componentTypes.forEach((type) => {
    it(`renders ${type} component without throwing React errors`, () => {
      const Component = RendererRegistry[type as keyof typeof RendererRegistry];
      
      // We pass mock data that covers required props (e.g. title, items, content, etc)
      // to ensure it gracefully falls back or renders if missing.
      const mockData = {
        content: 'Mock Content',
        items: ['Item 1', 'Item 2'],
        title: 'Mock Title',
        callout: 'Mock Callout',
        rows: [['A', 'B'], ['1', '2']],
        datasets: [{ label: 'Series', values: [10, 20] }]
      };

      const renderComp = () => render(
        <EditorProvider initialIr={mockIr}>
          <Component slideId="s1" componentId="c1" data={mockData} />
        </EditorProvider>
      );

      // 1. Verify no React errors
      expect(renderComp).not.toThrow();
    });
  });

  it('renders Callout fallback correctly if title/content is missing', () => {
    const Callout = RendererRegistry['Callout'];
    render(
      <EditorProvider initialIr={mockIr}>
        <Callout slideId="s1" componentId="c1" data={{ callout: 'Fallback String' }} />
      </EditorProvider>
    );
    expect(screen.getAllByText('Fallback String')[0]).toBeInTheDocument();
  });

  it('renders BulletList with mock data correctly', () => {
    const BulletList = RendererRegistry['BulletList'];
    render(
      <EditorProvider initialIr={mockIr}>
        <BulletList slideId="s1" componentId="c1" data={{ items: ['Alpha', 'Beta'] }} />
      </EditorProvider>
    );
    expect(screen.getAllByText('Alpha')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Beta')[0]).toBeInTheDocument();
  });
});
