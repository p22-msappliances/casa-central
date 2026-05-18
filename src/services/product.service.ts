import { ProductRepository } from '@/repositories/product.repository'
import { CreateProductDto, UpdateProductDto, CreateProductVariantDto } from '@/types/product'
import { Database } from '@/types/database.types'

type ProductRow = Database['public']['Tables']['products']['Row']
type ProductVariantRow = Database['public']['Tables']['product_variants']['Row']

const productRepository = new ProductRepository()

export class ProductService {
  async createProduct(data: CreateProductDto): Promise<ProductRow> {
    return productRepository.create(data)
  }

  async getProductById(id: string): Promise<any | null> {
    return productRepository.findById(id)
  }

  async getProductBySlug(slug: string): Promise<any | null> {
    return productRepository.findBySlug(slug)
  }

  async listProducts(params: {
    categoryId?: string
    brandId?: string
    limit?: number
    offset?: number
  }): Promise<{ items: any[]; total: number }> {
    return productRepository.findAll(params)
  }

  async updateProduct(id: string, data: UpdateProductDto): Promise<ProductRow> {
    return productRepository.update(id, data)
  }

  async addVariant(data: CreateProductVariantDto): Promise<ProductVariantRow> {
    return productRepository.createVariant(data)
  }

  async getProductVariants(productId: string): Promise<ProductVariantRow[]> {
    return productRepository.findVariantsByProductId(productId)
  }
}
