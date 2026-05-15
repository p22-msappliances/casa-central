import { prisma } from '@/lib/prisma'
import { User, RoleName } from '@prisma/client'
import { CreateUserDto, UpdateUserDto } from '@/types/user'

export class UserRepository {
  async create(data: CreateUserDto): Promise<User> {
    return prisma.user.create({
      data,
    })
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    })
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    })
  }

  async update(id: string, data: UpdateUserDto): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    })
  }

  async delete(id: string): Promise<User> {
    return prisma.user.delete({
      where: { id },
    })
  }
}
