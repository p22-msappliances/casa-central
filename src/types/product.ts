/* eslint-disable @typescript-eslint/no-explicit-any */

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
