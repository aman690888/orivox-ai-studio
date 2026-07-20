import { describe, it, expect } from 'vitest';
import { compileSlide } from '../compileSlide';
import { CompilerInput } from '../types';

describe('compileSlide', () => {
  const getMockInput = (): CompilerInput => ({
    presentationPlan: {} as any,
    sectionPlan: {} as any,
    slidePlan: {
      slides: [
        { slide_id: 's1', slide_purpose: 'Intro', section_id: 'sec1', narrative_role: 'hook', key_takeaway: 'a' }
      ]
    },
    layoutPlan: {
      layouts: [
        { slide_id: 's1', selected_layout_id: 'layout_1', slot_mappings: [], rationale: 'b' }
      ]
    },
    componentPlan: {
      slides: [
        { slide_id: 's1', component_tree: [
          { id: 'c1', type: 'Title', role: 'Main Title', children: [] },
          { id: 'c2', type: 'BulletList', role: 'List', children: [
            { id: 'c2-child', type: 'Icon', role: 'bullet_icon', children: [] }
          ] }
        ] }
      ]
    },
    contentPlan: {
      slides: [
        { slide_id: 's1', placeholders: [
          { placeholder_id: 'p1', owning_component_id: 'c1', content_type: 'title', requirement_description: 'x' },
          { placeholder_id: 'p2', owning_component_id: 'c2', content_type: 'bullet', requirement_description: 'y' }
        ] }
      ]
    },
    contentOutput: {
      slides: [
        { slide_id: 's1', populated_placeholders: [
          { placeholder_id: 'p1', value: 'Hello Title' },
          { placeholder_id: 'p2', value: ['A', 'B'] }
        ] }
      ]
    },
    assetPlan: {
      assets: [
        { asset_id: 'a1', slide_id: 's1', owning_component_id: 'c1', asset_type: 'image', semantic_purpose: 'z', priority: 'high', generation_required: false, external_source_allowed: true }
      ]
    }
  });

  it('compiles a slide properly with title and bullets', () => {
    const input = getMockInput();
    const slide = compileSlide('s1', input);
    
    expect(slide.id).toBe('s1');
    expect(slide.purpose).toBe('Intro');
    expect(slide.layout_id).toBe('layout_1');
    expect(slide.section_id).toBe('sec1');
    
    // Ordered flat traversal of component tree
    expect(slide.components).toEqual(['c1', 'c2', 'c2-child']);
    
    // Data populating mapping
    expect(slide.components_data['c1'].data.content).toBe('Hello Title');
    expect(slide.components_data['c1'].data.asset_id).toBe('a1');
    expect(slide.components_data['c2'].data.items).toEqual(['A', 'B']);
    expect(slide.components_data['c2-child'].data).toEqual({});
  });

  it('throws an error if a dependency is missing', () => {
    const input = getMockInput();
    input.slidePlan.slides = []; // Remove slide
    expect(() => compileSlide('s1', input)).toThrowError(/Missing upstream dependencies/);
  });

  it('throws an error if content is missing for a placeholder', () => {
    const input = getMockInput();
    input.contentOutput.slides[0].populated_placeholders = []; // Empty content
    expect(() => compileSlide('s1', input)).toThrowError(/Missing populated content/);
  });
});
