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
  // To keep it simple and bulletproof, we will delete existing slides and insert new ones
  // inside a transactional-like sequence or back-to-back queries, or do an upsert.
  // Deleting and inserting is very clean for replacing the entire presentation state.

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
