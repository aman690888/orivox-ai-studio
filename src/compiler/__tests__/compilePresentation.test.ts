import { describe, it, expect, vi } from 'vitest';
import { compilePresentation } from '../compilePresentation';
import { CompilerInput } from '../types';
import * as compilerModule from '../compileSlide';

vi.mock('../compileSlide', () => ({
  compileSlide: vi.fn((id) => ({ id, components: [] }))
}));

describe('compilePresentation', () => {
  const getValidInput = (): CompilerInput => ({
    intent: { topic: { value: 'My Topic' }, audience: { value: 'Devs' }, tone: { value: 'Fun' } } as any,
    presentationPlan: {} as any,
    sectionPlan: {} as any,
    slidePlan: { slides: [{ slide_id: 's1' }, { slide_id: 's2' }] } as any,
    layoutPlan: {} as any,
    componentPlan: {} as any,
    contentPlan: {} as any,
    contentOutput: {} as any,
    assetPlan: {
      assets: [
        { asset_id: 'a1', asset_type: 'image', image_style: 'minimal', composition: 'center' }
      ]
    } as any,
  });

  it('aggregates all compiled slides into presentation IR', () => {
    const input = getValidInput();
    const result = compilePresentation(input);

    expect(result.slide_order).toEqual(['s1', 's2']);
    expect(result.slides['s1'].id).toBe('s1');
    expect(result.slides['s2'].id).toBe('s2');
  });

  it('aggregates global assets correctly', () => {
    const input = getValidInput();
    const result = compilePresentation(input);

    expect(result.assets['a1']).toBeDefined();
    expect(result.assets['a1'].type).toBe('image');
    expect(result.assets['a1'].generation_prompt).toBe('minimal center');
  });

  it('maps metadata from the intent', () => {
    const input = getValidInput();
    const result = compilePresentation(input);

    expect(result.metadata.title).toBe('My Topic');
    expect(result.metadata.audience).toBe('Devs');
    expect(result.metadata.tone).toBe('Fun');
  });
});
