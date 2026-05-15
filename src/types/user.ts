import { User, RoleName } from '@prisma/client'

export type UserWithProfile = User

export type CreateUserDto = {
  email: string
  password: string
  firstName?: string
  lastName?: string
  phoneNumber?: string
  address?: string
  role?: RoleName
}

export type UpdateUserDto = Partial<CreateUserDto>
