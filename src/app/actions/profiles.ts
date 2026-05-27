/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { createClient } from "@/lib/server";
import { formatPhone } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { Database } from "@/types/database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export async function getUserProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, email, phone_number, address, role, created_at, updated_at")
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
    .select("id, first_name, last_name, email, phone_number, role, updated_at")
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

  const formatted = {
    ...updates,
    phone_number: updates.phone_number ? formatPhone(updates.phone_number) : updates.phone_number,
  };

  const { data, error } = await supabase
    .from("profiles")
    .update(formatted)
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

export async function getAdminCustomers(limit = 50, cursor?: string) {
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

  let query = supabase
    .from("profiles")
    .select("id, first_name, last_name, email, phone_number, role, created_at, updated_at", { count: "planned" })
    .eq("role", "CUSTOMER")
    .order("created_at", { ascending: false });

  if (cursor) {
    query = query.lt('created_at', cursor);
  }

  const { data, error, count } = await query.limit(limit + 1);

  if (error) return { success: false, error: error.message };

  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, -1) : data;
  const nextCursor = hasMore ? items[items.length - 1].created_at : null;

  return { success: true, data: items, nextCursor, hasMore, estimatedTotal: count };
}

export async function updateUserRoleForm(formData: FormData) {
  const userId = formData.get('user_id') as string;
  const role = formData.get('role') as Database["public"]["Enums"]["role_name"];
  if (!userId || !role) return { success: false, error: "Missing fields" };
  const result = await updateUserRole(userId, role);
  if (result.success) revalidatePath('/admin/customers');
  return result;
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
