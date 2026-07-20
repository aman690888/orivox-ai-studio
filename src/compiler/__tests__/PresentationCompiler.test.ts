import { describe, it, expect, vi } from 'vitest';
import { PresentationCompiler } from '../PresentationCompiler';
import { CompilerInput } from '../types';

vi.mock('../compilePresentation', () => ({
  compilePresentation: vi.fn(() => ({ id: 'compiled' }))
}));

vi.mock('../compileSlide', () => ({
  compileSlide: vi.fn(() => ({ id: 's1', components: ['x'] }))
}));

describe('PresentationCompiler', () => {
  const getValidInput = (): CompilerInput => ({
    intent: {} as any,
    presentationPlan: {} as any,
    sectionPlan: {} as any,
    slidePlan: { slides: [{ slide_id: 's1' }] } as any,
    layoutPlan: { layouts: [{ slide_id: 's1' }] } as any,
    componentPlan: {} as any,
    contentPlan: {} as any,
    contentOutput: {} as any,
    assetPlan: {} as any,
  });

  it('compiles an entire presentation', () => {
    const compiler = new PresentationCompiler();
    const result = compiler.compile(getValidInput());
    expect(result.id).toBe('compiled');
  });

  it('throws validation error if missing input property', () => {
    const compiler = new PresentationCompiler();
    const input = getValidInput();
    delete (input as any).assetPlan;
    expect(() => compiler.compile(input)).toThrow(/Missing required upstream state/);
  });

  it('throws validation error if slide and layout counts mismatch', () => {
    const compiler = new PresentationCompiler();
    const input = getValidInput();
    input.layoutPlan.layouts = []; // Mismatch
    expect(() => compiler.compile(input)).toThrow(/Slide Plan count does not match/);
  });

  it('compiles a single slide and returns an immutable updated IR', () => {
    const compiler = new PresentationCompiler();
    const existingIR = { metadata: {}, slides: { s1: { id: 's1', components: ['old'] } } } as any;
    
    const updated = compiler.compileSingleSlide('s1', getValidInput(), existingIR);
    
    // Original untouched
    expect(existingIR.slides['s1'].components).toEqual(['old']);
    // New updated
    expect(updated.slides['s1'].components).toEqual(['x']);
    expect(updated.metadata.updated_at).toBeDefined();
  });
});
