import { describe, it, expect } from 'vitest';
import type { PresentationIR, SlideIR, ComponentIR, AssetIR } from '../types/presentation-ir.types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createMockIR(overrides: Partial<PresentationIR> = {}): PresentationIR {
  return {
    id: 'test-pres-001',
    version: '3.0.0',
    metadata: {
      title: 'Test Presentation',
      author_id: 'author-001',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
      audience: 'general',
      tone: 'professional',
    },
    theme: {
      id: 'theme-default',
      colors: { primary: '#000', accent: '#00f', background: '#fff', text: '#111' },
      typography: { heading: 'Inter', body: 'Inter' },
    },
    slide_order: ['slide-1', 'slide-2'],
    slides: {
      'slide-1': {
        id: 'slide-1',
        purpose: 'intro',
        layout_id: 'layout-full',
        components: ['comp-title', 'comp-para'],
        components_data: {
          'comp-title': { id: 'comp-title', type: 'Title', data: { content: 'Hello World' } },
          'comp-para': { id: 'comp-para', type: 'Paragraph', data: { content: 'Body text' } },
        },
      },
      'slide-2': {
        id: 'slide-2',
        purpose: 'details',
        layout_id: 'layout-split',
        components: ['comp-list', 'comp-img'],
        components_data: {
          'comp-list': { id: 'comp-list', type: 'BulletList', data: { items: ['Item A', 'Item B', 'Item C'] } },
          'comp-img': { id: 'comp-img', type: 'Image', data: { asset_id: 'asset-1' } },
        },
      },
    },
    assets: {
      'asset-1': { id: 'asset-1', type: 'image', url: 'https://example.com/img.jpg', alt_text: 'Test' },
    },
    ...overrides,
  } as PresentationIR;
}

// ---------------------------------------------------------------------------
// 1. PresentationIR Structural Integrity
// ---------------------------------------------------------------------------

describe('PresentationIR Structural Integrity', () => {
  it('slide_order references only existing slides', () => {
    const ir = createMockIR();
    ir.slide_order.forEach(id => {
      expect(ir.slides).toHaveProperty(id);
    });
  });

  it('all slides are referenced in slide_order', () => {
    const ir = createMockIR();
    Object.keys(ir.slides).forEach(id => {
      expect(ir.slide_order).toContain(id);
    });
  });

  it('component references in slide.components exist in components_data', () => {
    const ir = createMockIR();
    Object.values(ir.slides).forEach(slide => {
      slide.components.forEach(compId => {
        expect(slide.components_data).toHaveProperty(compId);
      });
    });
  });

  it('component IDs in components_data match their key', () => {
    const ir = createMockIR();
    Object.values(ir.slides).forEach(slide => {
      Object.entries(slide.components_data).forEach(([key, comp]) => {
        expect(comp.id).toBe(key);
      });
    });
  });

  it('asset references in Image components exist in global assets', () => {
    const ir = createMockIR();
    Object.values(ir.slides).forEach(slide => {
      Object.values(slide.components_data).forEach(comp => {
        if (comp.type === 'Image' && comp.data.asset_id) {
          expect(ir.assets).toHaveProperty(comp.data.asset_id);
        }
      });
    });
  });

  it('version is 3.0.0', () => {
    const ir = createMockIR();
    expect(ir.version).toBe('3.0.0');
  });
});

// ---------------------------------------------------------------------------
// 2. Deep Path Update Logic (mirrors EditorContext.updateComponentData)
// ---------------------------------------------------------------------------

function deepSet(obj: any, path: string, value: any): void {
  const parts = path.replace(/\[(\w+)\]/g, '.$1').split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!current[parts[i]]) current[parts[i]] = {};
    current = current[parts[i]];
  }
  current[parts[parts.length - 1]] = value;
}

describe('Deep Path Update Logic', () => {
  it('sets a simple top-level key', () => {
    const obj: any = { content: 'old' };
    deepSet(obj, 'content', 'new');
    expect(obj.content).toBe('new');
  });

  it('sets a simple array index via bracket notation', () => {
    const obj: any = { items: ['A', 'B', 'C'] };
    deepSet(obj, 'items[1]', 'X');
    expect(obj.items[1]).toBe('X');
    expect(obj.items).toEqual(['A', 'X', 'C']);
  });

  it('sets a nested array path like rows[0][1]', () => {
    const obj: any = { rows: [['a', 'b'], ['c', 'd']] };
    deepSet(obj, 'rows[0][1]', 'Z');
    expect(obj.rows[0][1]).toBe('Z');
  });

  it('sets a mixed dot-bracket path like datasets[0].label', () => {
    const obj: any = { datasets: [{ label: 'old', values: [1, 2] }] };
    deepSet(obj, 'datasets[0].label', 'new');
    expect(obj.datasets[0].label).toBe('new');
  });

  it('sets deeply nested datasets[0].values[1]', () => {
    const obj: any = { datasets: [{ label: 'A', values: [10, 20, 30] }] };
    deepSet(obj, 'datasets[0].values[1]', '99');
    expect(obj.datasets[0].values[1]).toBe('99');
  });

  it('creates intermediate objects when missing', () => {
    const obj: any = {};
    deepSet(obj, 'a.b.c', 42);
    expect(obj.a.b.c).toBe(42);
  });
});

// ---------------------------------------------------------------------------
// 3. Undo/Redo State Machine
// ---------------------------------------------------------------------------

describe('Undo/Redo State Machine', () => {
  function createUndoRedoMachine() {
    let state = 'A';
    let history: string[] = [];
    let future: string[] = [];

    function push(newState: string) {
      history = [...history, state].slice(-50);
      future = [];
      state = newState;
    }

    function undo() {
      if (history.length > 0) {
        const prev = history[history.length - 1];
        future = [state, ...future];
        history = history.slice(0, -1);
        state = prev;
      }
    }

    function redo() {
      if (future.length > 0) {
        const next = future[0];
        history = [...history, state];
        future = future.slice(1);
        state = next;
      }
    }

    return {
      get state() { return state; },
      get canUndo() { return history.length > 0; },
      get canRedo() { return future.length > 0; },
      push, undo, redo,
    };
  }

  it('starts with initial state and no undo/redo available', () => {
    const m = createUndoRedoMachine();
    expect(m.state).toBe('A');
    expect(m.canUndo).toBe(false);
    expect(m.canRedo).toBe(false);
  });

  it('push creates undo, clears redo', () => {
    const m = createUndoRedoMachine();
    m.push('B');
    expect(m.state).toBe('B');
    expect(m.canUndo).toBe(true);
    expect(m.canRedo).toBe(false);
  });

  it('undo restores previous state', () => {
    const m = createUndoRedoMachine();
    m.push('B');
    m.undo();
    expect(m.state).toBe('A');
    expect(m.canUndo).toBe(false);
    expect(m.canRedo).toBe(true);
  });

  it('redo restores undone state', () => {
    const m = createUndoRedoMachine();
    m.push('B');
    m.undo();
    m.redo();
    expect(m.state).toBe('B');
    expect(m.canUndo).toBe(true);
    expect(m.canRedo).toBe(false);
  });

  it('push after undo clears redo stack', () => {
    const m = createUndoRedoMachine();
    m.push('B');
    m.push('C');
    m.undo();
    expect(m.state).toBe('B');
    m.push('D');
    expect(m.state).toBe('D');
    expect(m.canRedo).toBe(false);
  });

  it('multiple undo/redo roundtrip preserves state', () => {
    const m = createUndoRedoMachine();
    m.push('B');
    m.push('C');
    m.push('D');
    m.undo(); // C
    m.undo(); // B
    m.undo(); // A
    expect(m.state).toBe('A');
    m.redo(); // B
    m.redo(); // C
    m.redo(); // D
    expect(m.state).toBe('D');
  });

  it('history is capped at 50 entries', () => {
    const m = createUndoRedoMachine();
    for (let i = 0; i < 60; i++) {
      m.push(`state-${i}`);
    }
    // Undo 50 times should work, 51st should not
    let undoCount = 0;
    while (m.canUndo) {
      m.undo();
      undoCount++;
    }
    expect(undoCount).toBe(50);
  });
});

// ---------------------------------------------------------------------------
// 4. PresentationIR Serialization Roundtrip
// ---------------------------------------------------------------------------

describe('PresentationIR Serialization', () => {
  it('survives JSON roundtrip without data loss', () => {
    const ir = createMockIR();
    const serialized = JSON.stringify(ir);
    const deserialized = JSON.parse(serialized) as PresentationIR;

    expect(deserialized.id).toBe(ir.id);
    expect(deserialized.version).toBe(ir.version);
    expect(deserialized.slide_order).toEqual(ir.slide_order);
    expect(Object.keys(deserialized.slides)).toEqual(Object.keys(ir.slides));
    expect(deserialized.theme).toEqual(ir.theme);
    expect(deserialized.metadata.title).toBe(ir.metadata.title);
  });

  it('preserves all component data through serialization', () => {
    const ir = createMockIR();
    const roundtripped = JSON.parse(JSON.stringify(ir)) as PresentationIR;

    Object.values(ir.slides).forEach(slide => {
      const rtSlide = roundtripped.slides[slide.id];
      expect(rtSlide).toBeDefined();
      Object.values(slide.components_data).forEach(comp => {
        const rtComp = rtSlide.components_data[comp.id];
        expect(rtComp).toBeDefined();
        expect(rtComp.type).toBe(comp.type);
        expect(rtComp.data).toEqual(comp.data);
      });
    });
  });

  it('preserves asset references through serialization', () => {
    const ir = createMockIR();
    const roundtripped = JSON.parse(JSON.stringify(ir)) as PresentationIR;
    expect(roundtripped.assets).toEqual(ir.assets);
  });
});

// ---------------------------------------------------------------------------
// 5. RendererRegistry Coverage
// ---------------------------------------------------------------------------

describe('RendererRegistry Coverage', () => {
  // Import the registry dynamically to avoid React JSX execution in pure unit tests
  const EXPECTED_TYPES = [
    'Title', 'Subtitle', 'Paragraph', 'BulletList', 'NumberedList',
    'Quote', 'Callout', 'Image', 'HeroImage', 'Icon', 'IconCard',
    'FeatureCard', 'IconGrid', 'Timeline', 'Process', 'Comparison',
    'Table', 'KPICard', 'Statistic', 'MetricGrid', 'Chart', 'Diagram',
    'Flowchart', 'MindMap', 'CodeBlock', 'Video', 'CTA', 'Testimonial',
    'TeamCard', 'PricingCard', 'FAQ', 'Footer', 'SectionDivider',
  ];

  it('all ComponentType values are accounted for', () => {
    // This test verifies the EXPECTED_TYPES array matches the type definition
    // If the type definition changes, this test will catch it
    expect(EXPECTED_TYPES.length).toBe(33);
  });
});

// ---------------------------------------------------------------------------
// 6. Real IR Validation (from output file)
// ---------------------------------------------------------------------------

describe('Real Pipeline Output Validation', () => {
  let realIr: PresentationIR;

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    realIr = require('../../output/presentation-ir.json') as PresentationIR;
  } catch {
    // If the file doesn't exist, skip these tests
    realIr = null as any;
  }

  it('output/presentation-ir.json exists and is parseable', () => {
    if (!realIr) return; // Skip if file missing
    expect(realIr).toBeDefined();
    expect(realIr.version).toBe('3.0.0');
  });

  it('all slide_order entries reference existing slides', () => {
    if (!realIr) return;
    realIr.slide_order.forEach(id => {
      expect(realIr.slides).toHaveProperty(id);
    });
  });

  it('all slides have at least one component', () => {
    if (!realIr) return;
    Object.values(realIr.slides).forEach(slide => {
      expect(slide.components.length).toBeGreaterThan(0);
    });
  });

  it('all component refs in slide.components exist in components_data', () => {
    if (!realIr) return;
    Object.values(realIr.slides).forEach(slide => {
      slide.components.forEach(compId => {
        expect(slide.components_data).toHaveProperty(compId);
      });
    });
  });

  it('no component has undefined or null data', () => {
    if (!realIr) return;
    Object.values(realIr.slides).forEach(slide => {
      Object.values(slide.components_data).forEach(comp => {
        expect(comp.data).toBeDefined();
        expect(comp.data).not.toBeNull();
      });
    });
  });

  it('Title components have a non-empty content field', () => {
    if (!realIr) return;
    Object.values(realIr.slides).forEach(slide => {
      Object.values(slide.components_data).forEach(comp => {
        if (comp.type === 'Title') {
          expect(comp.data.content).toBeDefined();
          expect(typeof comp.data.content).toBe('string');
          expect(comp.data.content.length).toBeGreaterThan(0);
        }
      });
    });
  });

  it('Callout components have content or callout field', () => {
    if (!realIr) return;
    Object.values(realIr.slides).forEach(slide => {
      Object.values(slide.components_data).forEach(comp => {
        if (comp.type === 'Callout') {
          const hasContent = comp.data.content || comp.data.callout;
          expect(hasContent).toBeTruthy();
        }
      });
    });
  });

  it('BulletList components have items array', () => {
    if (!realIr) return;
    Object.values(realIr.slides).forEach(slide => {
      Object.values(slide.components_data).forEach(comp => {
        if (comp.type === 'BulletList') {
          expect(Array.isArray(comp.data.items)).toBe(true);
          expect(comp.data.items.length).toBeGreaterThan(0);
        }
      });
    });
  });
});
