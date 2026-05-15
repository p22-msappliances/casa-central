import { ProductRepository } from '@/repositories/product.repository'
import { Product, ProductVariant, Prisma } from '@prisma/client'
import { CreateProductDto, UpdateProductDto, CreateProductVariantDto } from '@/types/product'

const productWithRelations = Prisma.validator<Prisma.ProductDefaultArgs>()({
  include: { variants: true, category: true, brand: true },
})

const productWithCategoryAndBrand = Prisma.validator<Prisma.ProductDefaultArgs>()({
  include: { category: true, brand: true },
})

export type ProductWithRelations = Prisma.ProductGetPayload<typeof productWithRelations>
export type ProductWithCategoryAndBrand = Prisma.ProductGetPayload<typeof productWithCategoryAndBrand>

const productRepository = new ProductRepository()

export class ProductService {
  async createProduct(data: CreateProductDto): Promise<Product> {
    return productRepository.create(data)
  }

  async getProductById(id: string): Promise<ProductWithRelations | null> {
    return productRepository.findById(id)
  }

  async getProductBySlug(slug: string): Promise<ProductWithRelations | null> {
    return productRepository.findBySlug(slug)
  }

  async listProducts(params: {
    categoryId?: string
    brandId?: string
    limit?: number
    offset?: number
  }): Promise<{ items: ProductWithCategoryAndBrand[]; total: number }> {
    return productRepository.findAll(params)
  }

  async updateProduct(id: string, data: UpdateProductDto): Promise<Product> {
    return productRepository.update(id, data)
  }

  async addVariant(data: CreateProductVariantDto): Promise<ProductVariant> {
    return productRepository.createVariant(data)
  }

  async getProductVariants(productId: string): Promise<ProductVariant[]> {
    return productRepository.findVariantsByProductId(productId)
  }
}
