import { prisma } from '@/lib/prisma'
import { Product, ProductVariant, Category, Brand, Prisma } from '@prisma/client'
import { CreateProductDto, UpdateProductDto, CreateProductVariantDto } from '@/types/product'

const productWithRelations = Prisma.validator<Prisma.ProductDefaultArgs>()({
  include: { variants: true, category: true, brand: true },
})

const productWithCategoryAndBrand = Prisma.validator<Prisma.ProductDefaultArgs>()({
  include: { category: true, brand: true },
})

type ProductWithRelations = Prisma.ProductGetPayload<typeof productWithRelations>
type ProductWithCategoryAndBrand = Prisma.ProductGetPayload<typeof productWithCategoryAndBrand>

export class ProductRepository {
  async create(data: CreateProductDto): Promise<Product> {
    return prisma.product.create({
      data,
    })
  }

  async findById(id: string): Promise<ProductWithRelations | null> {
    return prisma.product.findUnique({
      where: { id },
      ...productWithRelations,
    })
  }

  async findBySlug(slug: string): Promise<ProductWithRelations | null> {
    return prisma.product.findUnique({
      where: { slug },
      ...productWithRelations,
    })
  }

  async findAll(params: {
    categoryId?: string
    brandId?: string
    limit?: number
    offset?: number
  }): Promise<{ items: ProductWithCategoryAndBrand[]; total: number }> {
    const where = {
      ...(params.categoryId ? { categoryId: params.categoryId } : {}),
      ...(params.brandId ? { brandId: params.brandId } : {}),
    }

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        take: params.limit || 20,
        skip: params.offset || 0,
        ...productWithCategoryAndBrand,
      }),
      prisma.product.count({ where }),
    ])

    return { items, total }
  }

  async update(id: string, data: UpdateProductDto): Promise<Product> {
    return prisma.product.update({
      where: { id },
      data,
    })
  }

  async createVariant(data: CreateProductVariantDto): Promise<ProductVariant> {
    return prisma.productVariant.create({
      data,
    })
  }

  async findVariantsByProductId(productId: string): Promise<ProductVariant[]> {
    return prisma.productVariant.findMany({
      where: { productId },
    })
  }
}
