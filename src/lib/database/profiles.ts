import { supabase } from "../supabase";
import { Database } from "@/types/database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export async function getProfile(id: string): Promise<Profile | null> {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", id).single();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
  return data;
}

export async function updateProfile(id: string, profile: ProfileUpdate): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .update(profile)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
  return data;
}
