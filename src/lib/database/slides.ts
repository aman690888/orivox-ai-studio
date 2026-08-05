import { supabase } from "../supabase";
import { Database } from "@/types/database.types";
import { SlideKind, Slide } from "@/lib/mock";

type DbSlide = Database["public"]["Tables"]["slides"]["Row"];

export function mapToUi(dbSlide: DbSlide): Slide {
  const content = (dbSlide.content as { title?: string; bullets?: string[] }) || {};
  return {
    id: dbSlide.id,
    kind: dbSlide.slide_type as SlideKind,
    title: content.title || "",
    bullets: content.bullets || [],
    notes: dbSlide.notes || undefined,
  };
}

export async function getSlides(presentationId: string): Promise<Slide[]> {
  const { data, error } = await supabase
    .from("slides")
    .select("*")
    .eq("presentation_id", presentationId)
    .order("slide_order", { ascending: true });

  if (error) {
    console.error("Error fetching slides:", error);
    throw error;
  }

  return (data || []).map(mapToUi);
}

export async function saveSlides(presentationId: string, slides: Slide[]): Promise<Slide[]> {
  // Guard: validate all slides have required fields before touching the DB
  for (const s of slides) {
    if (!s.kind) throw new Error(`Slide "${s.title}" is missing a kind/slide_type. Aborting save.`);
  }

  const { error: deleteError } = await supabase
    .from("slides")
    .delete()
    .eq("presentation_id", presentationId);

  if (deleteError) {
    console.error("Error clearing existing slides:", deleteError);
    throw deleteError;
  }

  if (slides.length === 0) return [];

  const rows = slides.map((s, index) => ({
    presentation_id: presentationId,
    slide_order: index,
    slide_type: s.kind,
    content: {
      title: s.title,
      bullets: s.bullets || [],
    },
    notes: s.notes || null,
  }));

  const { data, error: insertError } = await supabase.from("slides").insert(rows).select();

  if (insertError) {
    console.error("Error inserting slides:", insertError);
    throw insertError;
  }

  return (data || []).map(mapToUi);
}

/**
 * Update a single slide in-place by its DB id.
 * Safe — does NOT touch any other slides in the presentation.
 */
export async function updateSlide(slideId: string, patch: Partial<Slide>): Promise<Slide> {
  if (!patch.kind && patch.kind !== undefined) {
    throw new Error("Cannot update slide with a null kind.");
  }

  const update: Record<string, unknown> = {};
  if (patch.kind !== undefined) update.slide_type = patch.kind;
  if (patch.notes !== undefined) update.notes = patch.notes ?? null;

  // title and bullets live inside the `content` JSONB column —
  // fetch existing content first so we can merge cleanly
  if (patch.title !== undefined || patch.bullets !== undefined) {
    const { data: existing, error: fetchErr } = await supabase
      .from("slides")
      .select("content")
      .eq("id", slideId)
      .single();
    if (fetchErr) throw fetchErr;

    const existingContent = (existing?.content as { title?: string; bullets?: string[] }) || {};
    update.content = {
      title: patch.title ?? existingContent.title ?? "",
      bullets: patch.bullets ?? existingContent.bullets ?? [],
    };
  }

  const { data, error } = await supabase
    .from("slides")
    .update(update)
    .eq("id", slideId)
    .select()
    .single();

  if (error) {
    console.error("Error updating slide:", error);
    throw error;
  }

  return mapToUi(data);
}

