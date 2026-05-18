import { UserRepository } from '@/repositories/user.repository'
import { CreateUserDto, UpdateUserDto } from '@/types/user'
import { Database } from '@/types/database.types'

type ProfileRow = Database['public']['Tables']['profiles']['Row']

const userRepository = new UserRepository()

export class UserService {
  async getUserById(id: string): Promise<ProfileRow | null> {
    return userRepository.findById(id)
  }

  async updateProfile(id: string, data: UpdateUserDto): Promise<ProfileRow> {
    return userRepository.update(id, data)
  }

  async deleteAccount(id: string): Promise<void> {
    return userRepository.delete(id)
  }
}
