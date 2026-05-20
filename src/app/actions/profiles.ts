"use server";

import { createClient } from "@/lib/server";
import { revalidatePath } from "next/cache";
import { Database } from "@/types/database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export async function getUserProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
    return { success: false, error: error.message };
  }

  return { success: true, data: data as Profile };
}

export async function readProfiles() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching profiles:", error);
    return { success: false, error: error.message };
  }

  return { success: true, data: data as Profile[] };
}

export async function updateUserProfile(updates: Database["public"]["Tables"]["profiles"]["Update"]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id)
    .select()
    .single();

  if (error) {
    console.error("Error updating profile:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/account/profile");
  return { success: true, data: data as Profile };
}

export async function deleteUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("profiles")
    .delete()
    .eq("id", user.id);

  if (error) {
    console.error("Error deleting profile:", error);
    return { success: false, error: error.message };
  }

  await supabase.auth.signOut();
  return { success: true };
}

export async function getAdminCustomers(limit = 50, offset = 0) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["ADMIN", "SUPER_ADMIN"].includes(profile.role!)) {
    return { success: false, error: "Unauthorized" };
  }

  const { data, error, count } = await supabase
    .from("profiles")
    .select("*", { count: "exact" })
    .eq("role", "CUSTOMER")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return { success: false, error: error.message };
  return { success: true, data, total: count };
}

export async function updateUserRole(userId: string, role: Database["public"]["Enums"]["role_name"]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Not authenticated" };

  const { data: currentUser } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (currentUser?.role !== "SUPER_ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({ role, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/customers");
  return { success: true, data };
}
