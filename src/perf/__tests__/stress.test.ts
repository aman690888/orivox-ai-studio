import { describe, it, expect } from 'vitest';
import { PresentationCompiler } from '../../compiler/PresentationCompiler';
import { CompilerInput } from '../../compiler/types';
import { PresentationIR } from '../../types/presentation-ir.types';

describe('Performance Stress Tests', () => {
  it('handles compiling a 100-slide presentation efficiently', () => {
    // Generate massive mock input
    const slidePlanSlides = [];
    const layoutPlanLayouts = [];
    const componentPlanSlides = [];
    const contentPlanSlides = [];
    const contentOutputSlides = [];
    const assets = [];

    const numSlides = 100;
    const componentsPerSlide = 50; // Total 5000 components

    for (let i = 0; i < numSlides; i++) {
      const slideId = `s_${i}`;
      slidePlanSlides.push({ slide_id: slideId, slide_purpose: 'test', section_id: 'sec1', narrative_role: 'hook', key_takeaway: 'a' });
      layoutPlanLayouts.push({ slide_id: slideId, selected_layout_id: 'l1', slot_mappings: [], rationale: 'b' });
      
      const componentTree = [];
      const placeholders = [];
      const populated = [];

      for (let j = 0; j < componentsPerSlide; j++) {
        const compId = `c_${i}_${j}`;
        componentTree.push({ id: compId, type: 'Paragraph', role: 'body', children: [] });
        placeholders.push({ placeholder_id: `p_${i}_${j}`, owning_component_id: compId, content_type: 'paragraph', requirement_description: 'x' });
        populated.push({ placeholder_id: `p_${i}_${j}`, value: `Paragraph content ${j}` });
        
        if (j % 5 === 0) { // Every 5th component gets an asset (Total 1000 assets)
          assets.push({ asset_id: `a_${i}_${j}`, slide_id: slideId, owning_component_id: compId, asset_type: 'image', semantic_purpose: 'z', priority: 'high', generation_required: false, external_source_allowed: true });
        }
      }

      componentPlanSlides.push({ slide_id: slideId, component_tree: componentTree });
      contentPlanSlides.push({ slide_id: slideId, placeholders });
      contentOutputSlides.push({ slide_id: slideId, populated_placeholders: populated });
    }

    const input: CompilerInput = {
      intent: { topic: { value: 'Stress' }, audience: { value: 'All' }, tone: { value: 'Neutral' } } as any,
      presentationPlan: {} as any,
      sectionPlan: {} as any,
      slidePlan: { slides: slidePlanSlides } as any,
      layoutPlan: { layouts: layoutPlanLayouts } as any,
      componentPlan: { slides: componentPlanSlides } as any,
      contentPlan: { slides: contentPlanSlides } as any,
      contentOutput: { slides: contentOutputSlides } as any,
      assetPlan: { assets } as any,
    };

    const compiler = new PresentationCompiler();
    
    const startTime = performance.now();
    const result = compiler.compile(input);
    const duration = performance.now() - startTime;

    // Verify correct lengths
    expect(Object.keys(result.slides).length).toBe(100);
    expect(Object.keys(result.assets).length).toBe(1000);
    // Rough check on time - 5000 components tree walking and matching should be < 500ms
    expect(duration).toBeLessThan(500); 
  });
  
  it('handles 100 surgical single-slide recompilations fast', () => {
    const existingIR: PresentationIR = {
      id: 'pres',
      version: '3.0.0',
      metadata: {},
      theme: { colors: {}, typography: {} },
      slide_order: ['s1'],
      slides: {
        s1: { id: 's1', components: [], components_data: {} } as any
      },
      assets: {}
    } as any;

    const input: CompilerInput = {
      intent: {} as any, presentationPlan: {} as any, sectionPlan: {} as any,
      slidePlan: { slides: [{ slide_id: 's1', slide_purpose: 'test' }] } as any,
      layoutPlan: { layouts: [{ slide_id: 's1', selected_layout_id: 'l1' }] } as any,
      componentPlan: { slides: [{ slide_id: 's1', component_tree: [{ id: 'c1', type: 'Title', children: [] }] }] } as any,
      contentPlan: { slides: [{ slide_id: 's1', placeholders: [{ placeholder_id: 'p1', owning_component_id: 'c1', content_type: 'title' }] }] } as any,
      contentOutput: { slides: [{ slide_id: 's1', populated_placeholders: [{ placeholder_id: 'p1', value: 'New' }] }] } as any,
      assetPlan: { assets: [] } as any,
    };

    const compiler = new PresentationCompiler();
    const startTime = performance.now();
    
    let currentIr = existingIR;
    for(let i = 0; i < 100; i++) {
      currentIr = compiler.compileSingleSlide('s1', input, currentIr);
    }
    const duration = performance.now() - startTime;

    // 100 surgical single-slide recompilations should be very fast (< 100ms)
    expect(duration).toBeLessThan(150);
  });
});
