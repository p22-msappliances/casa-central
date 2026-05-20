"use server";

import { createClient } from '@/lib/server';
import { revalidatePath } from 'next/cache';
import { Database } from '@/types/database.types';

type ProductRow = Database['public']['Tables']['products']['Row'];
type ProductVariantRow = Database['public']['Tables']['product_variants']['Row'];

async function resolveBrand(supabase: any, brandName: string) {
  if (!brandName) return null;
  
  const { data: existing } = await supabase
    .from('brands')
    .select('id')
    .eq('name', brandName)
    .single();

  if (existing) return existing.id;

  const slug = brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const { data: created, error } = await supabase
    .from('brands')
    .insert([{ name: brandName, slug }])
    .select('id')
    .single();

  if (error) throw new Error(`Failed to create brand: ${error.message}`);
  return created.id;
}

async function resolveCategory(supabase: any, categoryName: string) {
  if (!categoryName) return null;

  const { data: existing } = await supabase
    .from('categories')
    .select('id')
    .eq('name', categoryName)
    .single();

  if (existing) return existing.id;

  const slug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const { data: created, error } = await supabase
    .from('categories')
    .insert([{ name: categoryName, slug }])
    .select('id')
    .single();

  if (error) throw new Error(`Failed to create category: ${error.message}`);
  return created.id;
}

export async function getProducts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

export async function createProduct(formData: any) {
  const supabase = await createClient();
  
  try {
    let brandId = formData.brand_id || null;
    let categoryId = formData.category_id || null;

    if (!brandId && formData.brand) {
      brandId = await resolveBrand(supabase, formData.brand);
    }
    if (!categoryId && formData.category) {
      categoryId = await resolveCategory(supabase, formData.category);
    }

    const productId = formData.id || crypto.randomUUID();

    const { data, error } = await supabase
      .from('products')
      .insert([{
        id: productId,
        name: formData.name,
        slug: formData.slug,
        description: formData.description || null,
        image_url: formData.image_url || null,
        base_price: formData.base_price,
        brand_id: brandId,
        category_id: categoryId,
      }])
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    // Create default variant
    const variantId = crypto.randomUUID();
    await supabase
      .from('product_variants')
      .insert([{
        id: variantId,
        product_id: productId,
        sku: formData.slug.toUpperCase() + '-DEFAULT',
        price: formData.base_price,
      }]);

    // Create default inventory entry
    const { data: warehouse } = await supabase
      .from('warehouses')
      .select('id')
      .limit(1)
      .single();

    if (warehouse) {
      await supabase
        .from('inventory')
        .insert([{
          id: crypto.randomUUID(),
          variant_id: variantId,
          warehouse_id: warehouse.id,
          quantity: 0,
          low_stock_threshold: 10,
        }]);
    }

    revalidatePath('/admin/products');
    revalidatePath('/products');
    return { success: true, data };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function updateProduct(id: string, formData: any) {
  const supabase = await createClient();
  
  try {
    let brandId = formData.brand_id || null;
    let categoryId = formData.category_id || null;

    if (!brandId && formData.brand) {
      brandId = await resolveBrand(supabase, formData.brand);
    }
    if (!categoryId && formData.category) {
      categoryId = await resolveCategory(supabase, formData.category);
    }

    const { data, error } = await supabase
      .from('products')
      .update({
        name: formData.name,
        slug: formData.slug,
        description: formData.description || null,
        image_url: formData.image_url || null,
        base_price: formData.base_price,
        brand_id: brandId,
        category_id: categoryId,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath('/admin/products');
    revalidatePath(`/products/${formData.slug}`);
    return { success: true, data };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) return { success: false, error: error.message };

  revalidatePath('/admin/products');
  revalidatePath('/products');
  return { success: true };
}

export async function getProductsByCategory(categoryId: string, limit = 50, offset = 0) {
  const supabase = await createClient();
  
  const { data, error, count } = await supabase
    .from('products')
    .select('*, categories(*), brands(*), product_variants(*)', { count: 'exact' })
    .eq('category_id', categoryId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return { success: false, error: error.message };
  return { success: true, data, total: count };
}

export async function getProductById(id: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(*), brands(*), product_variants(*), reviews(*)')
    .eq('id', id)
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function searchProducts(query: string, limit = 50) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(*), brands(*)')
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    .limit(limit);

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function getProductsByBrand(brandId: string, limit = 50) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('products')
    .select('*, brands(*), categories(*)')
    .eq('brand_id', brandId)
    .limit(limit);

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function createProductVariant(variantData: any) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('product_variants')
    .insert([{ ...variantData, id: crypto.randomUUID() }])
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/products');
  return { success: true, data };
}

export async function updateProductVariant(id: string, variantData: any) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('product_variants')
    .update({ ...variantData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/products');
  return { success: true, data };
}

export async function deleteProductVariant(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('product_variants')
    .delete()
    .eq('id', id);

  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/products');
  return { success: true };
}
