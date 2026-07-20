import { PresentationIR, SlideIR, ComponentIR } from "@/types/presentation-ir.types";
import { ValidationIssue } from "./types";
import { LayoutRegistry } from "@/registry/layout-registry";
import { ComponentRegistry } from "@/registry/component-registry";

// -----------------------------------------------------------------------------
// Stage 1: Schema Validation
// Checks basic IR sanity, missing references, and strict enum checking.
// -----------------------------------------------------------------------------
export function validateSchema(ir: PresentationIR): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (ir.version !== "3.0.0") {
    issues.push({
      issue_id: "UNSUPPORTED_VERSION",
      severity: "error",
      validator_stage: "schema",
      description: `Unsupported IR version: ${ir.version}`,
      recommended_fix: "Migrate IR to version 3.0.0",
      autofix_possible: false,
    });
  }

  // Validate slide sequence matches slide map
  ir.slide_order.forEach((slideId) => {
    if (!ir.slides[slideId]) {
      issues.push({
        issue_id: "MISSING_SLIDE_REFERENCE",
        severity: "error",
        validator_stage: "schema",
        slide_id: slideId,
        description: `Slide ID ${slideId} in slide_order is missing from slides map.`,
        recommended_fix: "Remove missing ID from slide_order or recreate slide.",
        autofix_possible: true,
      });
    }
  });

  // Validate components mapping against the ComponentRegistry
  Object.values(ir.slides).forEach((slide) => {
    slide.components.forEach((compId) => {
      const comp = slide.components_data[compId];
      if (!comp) {
        issues.push({
          issue_id: "MISSING_COMPONENT_REFERENCE",
          severity: "error",
          validator_stage: "schema",
          slide_id: slide.id,
          component_id: compId,
          description: `Component ${compId} missing from components_data.`,
          recommended_fix: "Remove from slide.components array.",
          autofix_possible: true,
        });
      } else {
        const def = ComponentRegistry[comp.type];
        if (!def) {
          issues.push({
            issue_id: "INVALID_COMPONENT_TYPE",
            severity: "error",
            validator_stage: "schema",
            slide_id: slide.id,
            component_id: comp.id,
            description: `Unknown component type '${comp.type}'.`,
            recommended_fix: "Regenerate component.",
            autofix_possible: false,
          });
        } else {
          // Check required fields based on payload_schema
          def.required_fields.forEach((field) => {
            if (comp.data[field] === undefined) {
              issues.push({
                issue_id: "MISSING_REQUIRED_FIELD",
                severity: "error",
                validator_stage: "schema",
                slide_id: slide.id,
                component_id: comp.id,
                description: `Component missing required field: ${field}.`,
                recommended_fix: "Regenerate component data.",
                autofix_possible: false,
              });
            }
          });
        }
      }
    });
  });

  return issues;
}

// -----------------------------------------------------------------------------
// Stage 2: Layout Validation
// Validates structural capacity, required/optional layout components.
// -----------------------------------------------------------------------------
export function validateLayouts(ir: PresentationIR): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  Object.values(ir.slides).forEach((slide) => {
    const layoutDef = LayoutRegistry[slide.layout_id];
    if (!layoutDef) {
      issues.push({
        issue_id: "INVALID_LAYOUT_ID",
        severity: "error",
        validator_stage: "layout",
        slide_id: slide.id,
        description: `Unknown layout ID '${slide.layout_id}'.`,
        recommended_fix: "Assign a valid layout ID from the LayoutRegistry.",
        autofix_possible: false,
      });
      return; // Skip further layout checks for this slide
    }

    const { constraints } = layoutDef;
    let chartCount = 0;
    let imageCount = 0;

    // Check component capacities & types against layout constraints
    if (slide.components.length > constraints.max_components) {
      issues.push({
        issue_id: "LAYOUT_CAPACITY_EXCEEDED",
        severity: "error",
        validator_stage: "layout",
        slide_id: slide.id,
        description: `Slide exceeds max components limit (${slide.components.length} > ${constraints.max_components}).`,
        recommended_fix: "Remove excess components or split slide.",
        autofix_possible: false,
      });
    }

    // Check supported components
    slide.components.forEach((compId) => {
      const comp = slide.components_data[compId];
      if (comp) {
        if (!constraints.supported_components.includes(comp.type)) {
          issues.push({
            issue_id: "UNSUPPORTED_COMPONENT_IN_LAYOUT",
            severity: "error",
            validator_stage: "layout",
            slide_id: slide.id,
            component_id: comp.id,
            description: `${comp.type} is not allowed in ${layoutDef.id}.`,
            recommended_fix: `Remove ${comp.type} or change layout.`,
            autofix_possible: true,
          });
        }
        if (comp.type === "Chart") chartCount++;
        if (comp.type === "Image" || comp.type === "HeroImage") imageCount++;
      }
    });

    if (chartCount > constraints.max_charts) {
      issues.push({
        issue_id: "MAX_CHARTS_EXCEEDED",
        severity: "error",
        validator_stage: "layout",
        slide_id: slide.id,
        description: `Slide exceeds max charts (${chartCount} > ${constraints.max_charts}).`,
        recommended_fix: "Remove excess charts.",
        autofix_possible: true,
      });
    }

    if (imageCount > constraints.max_images) {
      issues.push({
        issue_id: "MAX_IMAGES_EXCEEDED",
        severity: "error",
        validator_stage: "layout",
        slide_id: slide.id,
        description: `Slide exceeds max images (${imageCount} > ${constraints.max_images}).`,
        recommended_fix: "Remove excess images.",
        autofix_possible: true,
      });
    }
  });

  return issues;
}

// -----------------------------------------------------------------------------
// Stage 3: Design Validation
// Evaluates visual balance, word limits, cognitive load based on design rules.
// -----------------------------------------------------------------------------
export function validateDesign(ir: PresentationIR): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  Object.values(ir.slides).forEach((slide) => {
    const layoutDef = LayoutRegistry[slide.layout_id];
    if (!layoutDef) return;

    let slideWordCount = 0;

    slide.components.forEach((compId) => {
      const comp = slide.components_data[compId];
      if (!comp) return;
      const def = ComponentRegistry[comp.type];

      // Word count calculation heuristic
      let compWords = 0;
      if (comp.data.content && typeof comp.data.content === "string") {
        compWords = comp.data.content.split(/\s+/).length;
      } else if (comp.data.text && typeof comp.data.text === "string") {
        compWords = comp.data.text.split(/\s+/).length;
      }
      
      slideWordCount += compWords;

      // Component-level constraints (max words)
      if (def.constraints.max_words && compWords > def.constraints.max_words) {
        issues.push({
          issue_id: "COMPONENT_MAX_WORDS_EXCEEDED",
          severity: "warning",
          validator_stage: "design",
          slide_id: slide.id,
          component_id: comp.id,
          description: `${comp.type} exceeds max words (${compWords} > ${def.constraints.max_words}).`,
          recommended_fix: "Condense text.",
          autofix_possible: false,
        });
      }
      
      // Component-level constraints (max items)
      if (comp.type === "BulletList" || comp.type === "NumberedList") {
        const items = comp.data.items || [];
        if (def.constraints.max_items && items.length > def.constraints.max_items) {
          issues.push({
            issue_id: "MAX_LIST_ITEMS_EXCEEDED",
            severity: "error",
            validator_stage: "design",
            slide_id: slide.id,
            component_id: comp.id,
            description: `List exceeds max items (${items.length} > ${def.constraints.max_items}).`,
            recommended_fix: "Shorten list.",
            autofix_possible: true,
          });
        }
      }
    });

    // Slide-level word count against layout max
    if (slideWordCount > layoutDef.constraints.max_words_total) {
      issues.push({
        issue_id: "LAYOUT_MAX_WORDS_EXCEEDED",
        severity: "error",
        validator_stage: "design",
        slide_id: slide.id,
        description: `Slide exceeds layout total word constraint (${slideWordCount} > ${layoutDef.constraints.max_words_total}).`,
        recommended_fix: "Edit copy or split slide.",
        autofix_possible: false,
      });
    }
  });

  return issues;
}

// -----------------------------------------------------------------------------
// Stage 4: Presentation Validation
// Evaluates overall pacing, narrative flow, duplicate info, sequence constraints.
// -----------------------------------------------------------------------------
export function validatePresentation(ir: PresentationIR): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const totalSlides = ir.slide_order.length;

  if (totalSlides === 0) {
    issues.push({
      issue_id: "EMPTY_PRESENTATION",
      severity: "error",
      validator_stage: "presentation",
      description: "Presentation has no slides.",
      recommended_fix: "Generate slides.",
      autofix_possible: false,
    });
    return issues;
  }

  // Missing cover check
  const firstSlideId = ir.slide_order[0];
  const firstSlide = ir.slides[firstSlideId];
  if (firstSlide) {
    const firstLayout = LayoutRegistry[firstSlide.layout_id];
    if (firstLayout && firstLayout.family !== "cover") {
      issues.push({
        issue_id: "MISSING_COVER_SLIDE",
        severity: "warning",
        validator_stage: "presentation",
        slide_id: firstSlide.id,
        description: "First slide does not use a cover layout.",
        recommended_fix: "Prepend a cover slide layout.",
        autofix_possible: false,
      });
    }
  }

  // Repeated layouts check
  let consecutiveLayoutId = "";
  let layoutStreak = 0;

  ir.slide_order.forEach((slideId, index) => {
    const slide = ir.slides[slideId];
    if (!slide) return;
    
    if (slide.layout_id === consecutiveLayoutId) {
      layoutStreak++;
    } else {
      consecutiveLayoutId = slide.layout_id;
      layoutStreak = 1;
    }

    if (layoutStreak > 2) {
      issues.push({
        issue_id: "REPEATED_LAYOUT_FATIGUE",
        severity: "warning",
        validator_stage: "presentation",
        slide_id: slide.id,
        description: `Layout '${slide.layout_id}' repeated ${layoutStreak} times consecutively. Causes visual fatigue.`,
        recommended_fix: "Select an alternative layout family.",
        autofix_possible: false,
      });
    }
  });

  return issues;
}
