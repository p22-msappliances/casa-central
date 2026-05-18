import { Database } from '@/types/database.types'

type ProfileRow = Database['public']['Tables']['profiles']['Row']

export type UserWithProfile = ProfileRow

export type CreateUserDto = {
  email: string
  password: string
  firstName?: string
  lastName?: string
  phoneNumber?: string
  address?: string
  role?: Database['public']['Enums']['role_name']
}

export type UpdateUserDto = Partial<CreateUserDto>
