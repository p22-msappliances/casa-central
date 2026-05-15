import { UserRepository } from '@/repositories/user.repository'
import { CreateUserDto, UpdateUserDto } from '@/types/user'
import { User } from '@prisma/client'

const userRepository = new UserRepository()

export class UserService {
  async registerUser(data: CreateUserDto): Promise<User> {
    const existingUser = await userRepository.findByEmail(data.email)
    if (existingUser) {
      throw new Error('User with this email already exists')
    }
    return userRepository.create(data)
  }

  async getUserById(id: string): Promise<User | null> {
    return userRepository.findById(id)
  }

  async updateProfile(id: string, data: UpdateUserDto): Promise<User> {
    return userRepository.update(id, data)
  }

  async deleteAccount(id: string): Promise<User> {
    return userRepository.delete(id)
  }
}
