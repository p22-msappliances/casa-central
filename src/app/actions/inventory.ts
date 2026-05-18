"use server";

import { createClient } from "@/lib/server";
import { revalidatePath } from "next/cache";
import { CreateInventoryItem, InventoryItem, UpdateInventoryItem } from "@/types/inventory";

export async function readInventoryItems(params: {
  page?: number;
  pageSize?: number;
  search?: string;
}) {
  const { page = 1, pageSize = 10, search } = params;
  const supabase = await createClient();

  let query = supabase
    .from("inventory_items")
    .select("*", { count: "exact" });

  if (search) {
    query = query.ilike("sku", `%${search}%`);
  }

  const { data, count, error } = await query
    .range((page - 1) * pageSize, page * pageSize - 1)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching inventory items:", error);
    return { success: false, error: error.message };
  }

  return {
    success: true,
    data: data as InventoryItem[],
    count: count || 0,
    page,
    pageSize,
  };
}

export async function createInventoryItem(item: CreateInventoryItem) {
  const supabase = await createClient();
  
  // Get current user for updated_by
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from("inventory_items")
    .insert([{ ...item, updated_by: user?.id }])
    .select()
    .single();

  if (error) {
    console.error("Error creating inventory item:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/inventory");
  return { success: true, data: data as InventoryItem };
}

export async function updateInventoryItem(item: UpdateInventoryItem) {
  const { id, ...updates } = item;
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("inventory_items")
    .update({ ...updates, updated_by: user?.id })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating inventory item:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/inventory");
  return { success: true, data: data as InventoryItem };
}

export async function deleteInventoryItem(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("inventory_items")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting inventory item:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/inventory");
  return { success: true };
}
