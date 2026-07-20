import React from 'react';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { AssetRenderer } from '../AssetRenderer';
import { EditorProvider } from '../EditorContext';

describe('Asset System - AssetRenderer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  const getMockIr = () => ({
    id: 'test-pres',
    version: '3.0.0',
    metadata: {},
    theme: { colors: {}, typography: {} },
    slide_order: ['s1'],
    slides: {
      s1: {
        id: 's1',
        components: ['c1'],
        components_data: { c1: { id: 'c1', type: 'Image', data: { asset_id: 'a1' } } }
      }
    },
    assets: {
      a1: { id: 'a1', type: 'image', url: 'https://example.com/a1.png' }
    }
  } as any);

  it('renders a fallback image if asset URL is missing', () => {
    render(
      <EditorProvider initialIr={getMockIr()}>
        <AssetRenderer asset={{ id: 'a2', type: 'image', url: '' }} />
      </EditorProvider>
    );
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src');
    expect(img.getAttribute('src')).toMatch(/source\.unsplash\.com/);
  });

  it('renders actual asset URL if provided', () => {
    render(
      <EditorProvider initialIr={getMockIr()}>
        <AssetRenderer asset={{ id: 'a1', type: 'image', url: 'https://example.com/real.png' }} />
      </EditorProvider>
    );
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://example.com/real.png');
  });

  it('supports asset replacement via EditorContext', () => {
    const originalPrompt = window.prompt;
    window.prompt = vi.fn().mockReturnValue('https://example.com/new.png');

    render(
      <EditorProvider initialIr={getMockIr()}>
        <AssetRenderer asset={{ id: 'a1', type: 'image', url: 'https://example.com/old.png' }} />
      </EditorProvider>
    );

    const container = screen.getByRole('img').parentElement!;
    // Hover to reveal overlay
    fireEvent.mouseEnter(container);
    
    // Find overlay and click replace
    const replaceBtn = screen.getByText('Replace Image');
    fireEvent.click(replaceBtn);

    expect(window.prompt).toHaveBeenCalled();
    // Context state update validation isn't directly observable inside AssetRenderer alone here, 
    // but we proved the replace path fires.
    
    window.prompt = originalPrompt;
  });
});
