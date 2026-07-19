import { supabase } from "../supabase";
import { Database } from "@/types/database.types";

export type DbPresentation = Database["public"]["Tables"]["presentations"]["Row"];
export type DbPresentationInsert = Database["public"]["Tables"]["presentations"]["Insert"];
export type DbPresentationUpdate = Database["public"]["Tables"]["presentations"]["Update"];

export interface PresentationUi {
  id: string;
  title: string;
  category: string;
  updated: string;
  slides: number;
  progress?: number;
  accent: "electric" | "violet" | "emerald" | "amber";
  description?: string;
}

function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function mapToUi(
  dbPres: DbPresentation & { slides?: { count: number }[] | null },
): PresentationUi {
  let slideCount = 0;
  if (dbPres.slides && dbPres.slides.length > 0) {
    slideCount = dbPres.slides[0].count;
  }

  // Progress metadata could be stored inside description or computed dynamically.
  // We'll read from description if it's stored as JSON, or default to undefined.
  let progress: number | undefined = undefined;
  if (dbPres.description) {
    try {
      const parsed = JSON.parse(dbPres.description);
      if (typeof parsed.progress === "number") {
        progress = parsed.progress;
      }
    } catch {
      // Not JSON description, ignore
    }
  }

  return {
    id: dbPres.id,
    title: dbPres.title,
    category: dbPres.category || "General",
    updated: timeAgo(dbPres.updated_at),
    slides: slideCount,
    progress,
    accent: (dbPres.accent as PresentationUi["accent"]) || "electric",
    description: dbPres.description ?? undefined,
  };
}

export async function getPresentations(userId: string): Promise<PresentationUi[]> {
  const { data, error } = await supabase
    .from("presentations")
    .select(
      `
      *,
      slides(count)
    `,
    )
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching presentations:", error);
    throw error;
  }

  const rawList = (data || []) as unknown as Array<
    DbPresentation & { slides?: { count: number }[] | null }
  >;
  return rawList.map((p) => mapToUi(p));
}

export async function getPresentation(id: string): Promise<PresentationUi | null> {
  const { data, error } = await supabase
    .from("presentations")
    .select(
      `
      *,
      slides(count)
    `,
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching presentation:", error);
    return null;
  }

  const rawPres = data as unknown as DbPresentation & {
    slides?: { count: number }[] | null;
  };
  return mapToUi(rawPres);
}

export async function createPresentation(
  userId: string,
  title: string,
  category: string,
  accent: string,
  description?: string,
): Promise<DbPresentation> {
  const { data, error } = await supabase
    .from("presentations")
    .insert({
      user_id: userId,
      title,
      category,
      accent,
      description,
      status: "draft",
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating presentation:", error);
    throw error;
  }

  return data;
}

export async function updatePresentation(
  id: string,
  updates: DbPresentationUpdate,
): Promise<DbPresentation> {
  const { data, error } = await supabase
    .from("presentations")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating presentation:", error);
    throw error;
  }

  return data;
}

export async function deletePresentation(id: string): Promise<void> {
  const { error } = await supabase.from("presentations").delete().eq("id", id);

  if (error) {
    console.error("Error deleting presentation:", error);
    throw error;
  }
}
