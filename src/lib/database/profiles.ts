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

export async function ensureProfile(user: any): Promise<Profile | null> {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  
  if (data) {
    return data;
  }
  
  if (error && error.code !== "PGRST116") {
    console.error("Error fetching profile during ensure:", error);
  }

  // Profile not found, create it
  const newProfile = {
    id: user.id,
    full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
    avatar_url: user.user_metadata?.avatar_url || null,
  };

  const { data: inserted, error: insertError } = await supabase
    .from("profiles")
    .insert(newProfile)
    .select()
    .single();

  if (insertError) {
    console.error("Error creating profile:", insertError);
    return null;
  }
  
  return inserted;
}
