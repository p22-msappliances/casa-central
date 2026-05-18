import { Database } from '@/types/database.types'

type ProductRow = Database['public']['Tables']['products']['Row']
type ProductVariantRow = Database['public']['Tables']['product_variants']['Row']
type CategoryRow = Database['public']['Tables']['categories']['Row']
type BrandRow = Database['public']['Tables']['brands']['Row']

export type CreateProductDto = {
  name: string
  slug: string
  description: string
  categoryId: string
  brandId: string
  basePrice: number
  imageUrl?: string
  specifications?: any
}

export type UpdateProductDto = Partial<CreateProductDto>

export type CreateProductVariantDto = {
  productId: string
  sku: string
  price: number
  attributes?: any
  imageUrl?: string
}
