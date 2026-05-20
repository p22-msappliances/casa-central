"use server";

import { createClient } from "@/lib/server";
import { revalidatePath } from "next/cache";
import { Database } from "@/types/database.types";

type Inventory = Database["public"]["Tables"]["inventory"]["Row"];

export async function getInventory(limit = 50, offset = 0) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["ADMIN", "SUPER_ADMIN", "INVENTORY_MANAGER"].includes(profile.role!)) {
    return { success: false, error: "Unauthorized" };
  }

  const { data, error, count } = await supabase
    .from("inventory")
    .select("*, product_variants(sku, products(name)), warehouses(*), vendors(name)", { count: "exact" })
    .order("updated_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return { success: false, error: error.message };
  return { success: true, data, total: count };
}

export async function updateInventoryQuantity(variantId: string, warehouseId: string, quantity: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["ADMIN", "SUPER_ADMIN", "INVENTORY_MANAGER"].includes(profile.role!)) {
    return { success: false, error: "Unauthorized" };
  }

  const { data: existing } = await supabase
    .from("inventory")
    .select("id")
    .eq("variant_id", variantId)
    .eq("warehouse_id", warehouseId)
    .single();

  if (existing) {
    const { data, error } = await supabase
      .from("inventory")
      .update({ quantity, updated_at: new Date().toISOString() })
      .eq("id", existing.id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    revalidatePath("/admin/inventory");
    return { success: true, data };
  } else {
    const { data, error } = await supabase
      .from("inventory")
      .insert([{
        id: crypto.randomUUID(),
        variant_id: variantId,
        warehouse_id: warehouseId,
        quantity,
      }])
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    revalidatePath("/admin/inventory");
    return { success: true, data };
  }
}

export async function getInventoryForVariant(variantId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("inventory")
    .select("*, warehouses(*)")
    .eq("variant_id", variantId);

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function getLowStockItems(limit = 50) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["ADMIN", "SUPER_ADMIN", "INVENTORY_MANAGER"].includes(profile.role!)) {
    return { success: false, error: "Unauthorized" };
  }

  const { data, error } = await supabase
    .from("inventory")
    .select("*, product_variants(sku, products(name)), warehouses(*)")
    .lt("quantity", `low_stock_threshold`)
    .limit(limit);

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function getAllInventory() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["ADMIN", "SUPER_ADMIN", "INVENTORY_MANAGER"].includes(profile.role!)) {
    return { success: false, error: "Unauthorized" };
  }

  const { data, error } = await supabase
    .from("inventory")
    .select("*, product_variants(sku, price, products(id, name, slug)), warehouses(*), vendors(name)")
    .order("updated_at", { ascending: false });

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function addInventory(data: { variant_id: string; warehouse_id: string; quantity: number; low_stock_threshold?: number }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["ADMIN", "SUPER_ADMIN", "INVENTORY_MANAGER"].includes(profile.role!)) {
    return { success: false, error: "Unauthorized" };
  }

  const { data: existing } = await supabase
    .from("inventory")
    .select("id")
    .eq("variant_id", data.variant_id)
    .eq("warehouse_id", data.warehouse_id)
    .single();

  if (existing) {
    const { data: result, error } = await supabase
      .from("inventory")
      .update({ 
        quantity: data.quantity, 
        low_stock_threshold: data.low_stock_threshold || 10,
        updated_at: new Date().toISOString() 
      })
      .eq("id", existing.id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    revalidatePath("/admin/inventory");
    return { success: true, data: result };
  } else {
    const { data: result, error } = await supabase
      .from("inventory")
      .insert([{
        id: crypto.randomUUID(),
        variant_id: data.variant_id,
        warehouse_id: data.warehouse_id,
        quantity: data.quantity,
        low_stock_threshold: data.low_stock_threshold || 10,
      }])
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    revalidatePath("/admin/inventory");
    return { success: true, data: result };
  }
}

export async function adjustInventory(inventoryId: string, quantityChange: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["ADMIN", "SUPER_ADMIN", "INVENTORY_MANAGER"].includes(profile.role!)) {
    return { success: false, error: "Unauthorized" };
  }

  const { data: existing } = await supabase
    .from("inventory")
    .select("quantity")
    .eq("id", inventoryId)
    .single();

  if (!existing) return { success: false, error: "Inventory item not found" };

  const newQuantity = Math.max(0, (existing.quantity || 0) + quantityChange);

  const { data: result, error } = await supabase
    .from("inventory")
    .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
    .eq("id", inventoryId)
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/inventory");
  return { success: true, data: result };
}

export async function getProductsForInventory() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("products")
    .select("id, name, slug, product_variants(id, sku, price)");

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function getWarehouses() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("warehouses")
    .select("*")
    .eq("is_active", true)
    .order("is_virtual")
    .order("name");

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function createTransfer(data: {
  from_warehouse_id: string;
  to_warehouse_id: string;
  items: { variant_id: string; quantity: number }[];
  notes?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["ADMIN", "SUPER_ADMIN", "INVENTORY_MANAGER"].includes(profile.role!)) {
    return { success: false, error: "Unauthorized" };
  }

  if (data.from_warehouse_id === data.to_warehouse_id) {
    return { success: false, error: "Source and destination warehouses must be different" };
  }

  // Check source inventory
  for (const item of data.items) {
    const { data: inv } = await supabase
      .from("inventory")
      .select("quantity")
      .eq("variant_id", item.variant_id)
      .eq("warehouse_id", data.from_warehouse_id)
      .single();

    if (!inv || (inv.quantity || 0) < item.quantity) {
      return { success: false, error: `Insufficient stock for variant ${item.variant_id} in source warehouse` };
    }
  }

  // Create transfer
  const { data: transfer, error: transferError } = await supabase
    .from("warehouse_transfers")
    .insert([{
      from_warehouse_id: data.from_warehouse_id,
      to_warehouse_id: data.to_warehouse_id,
      status: "PENDING",
      notes: data.notes || null,
      created_by: user.id,
    }])
    .select()
    .single();

  if (transferError) return { success: false, error: transferError.message };

  // Create transfer items
  const transferItems = data.items.map(item => ({
    id: crypto.randomUUID(),
    transfer_id: transfer.id,
    variant_id: item.variant_id,
    quantity: item.quantity,
  }));

  const { error: itemsError } = await supabase
    .from("transfer_items")
    .insert(transferItems);

  if (itemsError) {
    await supabase.from("warehouse_transfers").delete().eq("id", transfer.id);
    return { success: false, error: itemsError.message };
  }

  // Deduct from source warehouse
  for (const item of data.items) {
    const { data: inv } = await supabase
      .from("inventory")
      .select("id, quantity")
      .eq("variant_id", item.variant_id)
      .eq("warehouse_id", data.from_warehouse_id)
      .single();

    if (inv) {
      await supabase
        .from("inventory")
        .update({ quantity: Math.max(0, (inv.quantity || 0) - item.quantity) })
        .eq("id", inv.id);
    }
  }

  // Add to destination warehouse (or create entry)
  for (const item of data.items) {
    const { data: existing } = await supabase
      .from("inventory")
      .select("id, quantity")
      .eq("variant_id", item.variant_id)
      .eq("warehouse_id", data.to_warehouse_id)
      .single();

    if (existing) {
      await supabase
        .from("inventory")
        .update({ quantity: (existing.quantity || 0) + item.quantity })
        .eq("id", existing.id);
    } else {
      await supabase
        .from("inventory")
        .insert([{
          id: crypto.randomUUID(),
          variant_id: item.variant_id,
          warehouse_id: data.to_warehouse_id,
          quantity: item.quantity,
          low_stock_threshold: 10,
        }]);
    }
  }

  revalidatePath("/admin/inventory");
  revalidatePath("/admin/transfers");
  return { success: true, data: transfer };
}

export async function getTransfers(limit = 50, offset = 0) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Not authenticated" };

  const { data, error, count } = await supabase
    .from("warehouse_transfers")
    .select("*, from_warehouses:warehouses!from_warehouse_id(name, is_virtual), to_warehouses:warehouses!to_warehouse_id(name, is_virtual), transfer_items(*, product_variants(sku, products(name))), profiles(first_name, last_name)")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return { success: false, error: error.message };
  return { success: true, data, total: count };
}

export async function updateTransferStatus(transferId: string, status: "PENDING" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED") {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["ADMIN", "SUPER_ADMIN", "INVENTORY_MANAGER"].includes(profile.role!)) {
    return { success: false, error: "Unauthorized" };
  }

  const { data: transfer, error: fetchError } = await supabase
    .from("warehouse_transfers")
    .select("*, transfer_items(*)")
    .eq("id", transferId)
    .single();

  if (fetchError || !transfer) return { success: false, error: "Transfer not found" };

  if (status === "CANCELLED" && transfer.status !== "PENDING") {
    return { success: false, error: "Can only cancel pending transfers" };
  }

  if (status === "DELIVERED" && transfer.status === "DELIVERED") {
    return { success: false, error: "Transfer already delivered" };
  }

  // If cancelling a non-pending transfer, reverse inventory
  if (status === "CANCELLED" && transfer.status !== "PENDING") {
    for (const item of transfer.transfer_items) {
      const { data: sourceInv } = await supabase
        .from("inventory")
        .select("id, quantity")
        .eq("variant_id", item.variant_id)
        .eq("warehouse_id", transfer.from_warehouse_id)
        .single();

      if (sourceInv) {
        await supabase
          .from("inventory")
          .update({ quantity: (sourceInv.quantity || 0) + item.quantity })
          .eq("id", sourceInv.id);
      }

      const { data: destInv } = await supabase
        .from("inventory")
        .select("id, quantity")
        .eq("variant_id", item.variant_id)
        .eq("warehouse_id", transfer.to_warehouse_id)
        .single();

      if (destInv) {
        await supabase
          .from("inventory")
          .update({ quantity: Math.max(0, (destInv.quantity || 0) - item.quantity) })
          .eq("id", destInv.id);
      }
    }
  }

  const { data, error } = await supabase
    .from("warehouse_transfers")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", transferId)
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/inventory");
  revalidatePath("/admin/transfers");
  return { success: true, data };
}

// Vendors
export async function getVendors() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vendors")
    .select("*")
    .order("name");

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function createVendor(data: { name: string; contact_email?: string; contact_phone?: string; address?: string; notes?: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Not authenticated" };

  const { data: result, error } = await supabase
    .from("vendors")
    .insert([{
      id: crypto.randomUUID(),
      name: data.name,
      contact_email: data.contact_email || null,
      contact_phone: data.contact_phone || null,
      address: data.address || null,
      notes: data.notes || null,
    }])
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/inventory");
  return { success: true, data: result };
}

export async function updateVendor(id: string, data: { name?: string; contact_email?: string; contact_phone?: string; address?: string; notes?: string; is_active?: boolean }) {
  const supabase = await createClient();
  const { data: result, error } = await supabase
    .from("vendors")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/inventory");
  return { success: true, data: result };
}

export async function deleteVendor(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("vendors")
    .delete()
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/inventory");
  return { success: true };
}

// Purchase Orders
export async function getPurchaseOrders() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("purchase_orders")
    .select("*, vendors(name, contact_email), warehouses(name, is_virtual), purchase_order_items(*, product_variants(sku, products(name)))")
    .order("created_at", { ascending: false });

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function createPurchaseOrder(data: {
  vendor_id: string;
  warehouse_id: string;
  items: { variant_id: string; quantity: number; unit_cost: number }[];
  expected_date?: string;
  notes?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Not authenticated" };

  const { data: po, error: poError } = await supabase
    .from("purchase_orders")
    .insert([{
      id: crypto.randomUUID(),
      vendor_id: data.vendor_id,
      warehouse_id: data.warehouse_id,
      status: "DRAFT",
      expected_date: data.expected_date || null,
      notes: data.notes || null,
      created_by: user.id,
    }])
    .select()
    .single();

  if (poError) return { success: false, error: poError.message };

  const items = data.items.map(item => ({
    id: crypto.randomUUID(),
    po_id: po.id,
    variant_id: item.variant_id,
    quantity: item.quantity,
    unit_cost: item.unit_cost,
  }));

  const { error: itemsError } = await supabase
    .from("purchase_order_items")
    .insert(items);

  if (itemsError) {
    await supabase.from("purchase_orders").delete().eq("id", po.id);
    return { success: false, error: itemsError.message };
  }

  revalidatePath("/admin/inventory");
  return { success: true, data: po };
}

export async function updatePOStatus(poId: string, status: "DRAFT" | "ORDERED" | "SHIPPED" | "RECEIVED" | "CANCELLED") {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Not authenticated" };

  const { data: po, error: fetchError } = await supabase
    .from("purchase_orders")
    .select("*, purchase_order_items(*)")
    .eq("id", poId)
    .single();

  if (fetchError || !po) return { success: false, error: "Purchase order not found" };

  // When receiving, add inventory
  if (status === "RECEIVED" && po.status !== "RECEIVED") {
    for (const item of po.purchase_order_items) {
      const { data: existing } = await supabase
        .from("inventory")
        .select("id, quantity")
        .eq("variant_id", item.variant_id)
        .eq("warehouse_id", po.warehouse_id)
        .single();

      if (existing) {
        await supabase
          .from("inventory")
          .update({ 
            quantity: (existing.quantity || 0) + item.quantity,
            vendor_id: po.vendor_id,
          })
          .eq("id", existing.id);
      } else {
        await supabase
          .from("inventory")
          .insert([{
            id: crypto.randomUUID(),
            variant_id: item.variant_id,
            warehouse_id: po.warehouse_id,
            quantity: item.quantity,
            vendor_id: po.vendor_id,
            low_stock_threshold: 10,
          }]);
      }
    }
  }

  // If cancelling after receiving, reverse inventory
  if (status === "CANCELLED" && po.status === "RECEIVED") {
    for (const item of po.purchase_order_items) {
      const { data: inv } = await supabase
        .from("inventory")
        .select("id, quantity")
        .eq("variant_id", item.variant_id)
        .eq("warehouse_id", po.warehouse_id)
        .single();

      if (inv) {
        await supabase
          .from("inventory")
          .update({ quantity: Math.max(0, (inv.quantity || 0) - item.quantity) })
          .eq("id", inv.id);
      }
    }
  }

  const { data, error } = await supabase
    .from("purchase_orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", poId)
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/inventory");
  return { success: true, data };
}

export async function deletePurchaseOrder(poId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("purchase_orders")
    .delete()
    .eq("id", poId);

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/inventory");
  return { success: true };
}

// Warehouse management
export async function createWarehouse(data: { name: string; location?: string; is_virtual?: boolean }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Not authenticated" };

  const { data: result, error } = await supabase
    .from("warehouses")
    .insert([{
      id: crypto.randomUUID(),
      name: data.name,
      location: data.location || null,
      is_virtual: data.is_virtual || false,
    }])
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/inventory");
  return { success: true, data: result };
}

export async function updateWarehouse(id: string, data: { name?: string; location?: string; is_active?: boolean }) {
  const supabase = await createClient();
  const { data: result, error } = await supabase
    .from("warehouses")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/inventory");
  return { success: true, data: result };
}

export async function deleteWarehouse(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("warehouses")
    .delete()
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/inventory");
  return { success: true };
}
