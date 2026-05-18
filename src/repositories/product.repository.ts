import { createClient } from '@/lib/server'
import { Database } from '@/types/database.types'
import { CreateProductDto, UpdateProductDto, CreateProductVariantDto } from '@/types/product'

type ProductRow = Database['public']['Tables']['products']['Row']
type ProductVariantRow = Database['public']['Tables']['product_variants']['Row']

export class ProductRepository {
  async create(data: CreateProductDto): Promise<ProductRow> {
    const supabase = await createClient()
    const { data: product, error } = await supabase
      .from('products')
      .insert({
        name: data.name,
        slug: data.slug,
        description: data.description,
        category_id: data.categoryId,
        brand_id: data.brandId,
        base_price: data.basePrice,
        image_url: data.imageUrl,
        specifications: data.specifications
      })
      .select()
      .single()

    if (error) throw error
    return product
  }

  async findById(id: string): Promise<any> {
    const supabase = await createClient()
    const { data: product, error } = await supabase
      .from('products')
      .select('*, variants(*), category(*), brand(*)')
      .eq('id', id)
      .single()

    if (error) throw error
    return product
  }

  async findBySlug(slug: string): Promise<any> {
    const supabase = await createClient()
    const { data: product, error } = await supabase
      .from('products')
      .select('*, variants(*), category(*), brand(*)')
      .eq('slug', slug)
      .single()

    if (error) throw error
    return product
  }

  async findAll(params: {
    categoryId?: string
    brandId?: string
    limit?: number
    offset?: number
  }): Promise<{ items: any[]; total: number }> {
    const supabase = await createClient()
    let query = supabase
      .from('products')
      .select('*, category(*), brand(*)', { count: 'exact' })

    if (params.categoryId) query = query.eq('category_id', params.categoryId)
    if (params.brandId) query = query.eq('brand_id', params.brandId)

    const { data: items, error, count } = await query
      .range(params.offset || 0, (params.offset || 0) + (params.limit || 20) - 1)

    if (error) throw error
    return { items, total: count || 0 }
  }

  async update(id: string, data: UpdateProductDto): Promise<ProductRow> {
    const supabase = await createClient()
    const { data: product, error } = await supabase
      .from('products')
      .update({
        name: data.name,
        slug: data.slug,
        description: data.description,
        category_id: data.categoryId,
        brand_id: data.brandId,
        base_price: data.basePrice,
        image_url: data.imageUrl,
        specifications: data.specifications
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return product
  }

  async createVariant(data: CreateProductVariantDto): Promise<ProductVariantRow> {
    const supabase = await createClient()
    const { data: variant, error } = await supabase
      .from('product_variants')
      .insert({
        product_id: data.productId,
        sku: data.sku,
        price: data.price,
        attributes: data.attributes,
        image_url: data.imageUrl
      })
      .select()
      .single()

    if (error) throw error
    return variant
  }

  async findVariantsByProductId(productId: string): Promise<ProductVariantRow[]> {
    const supabase = await createClient()
    const { data: variants, error } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', productId)

    if (error) throw error
    return variants
  }
}
