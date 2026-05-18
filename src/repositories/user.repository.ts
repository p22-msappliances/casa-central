import { createClient } from '@/lib/server'
import { Database } from '@/types/database.types'
import { CreateUserDto, UpdateUserDto } from '@/types/user'

type ProfileRow = Database['public']['Tables']['profiles']['Row']

export class UserRepository {
  async create(id: string, data: CreateUserDto): Promise<ProfileRow> {
    const supabase = await createClient()
    const { data: profile, error } = await supabase
      .from('profiles')
      .insert({
        id,
        email: data.email,
        first_name: data.firstName,
        last_name: data.lastName,
        phone_number: data.phoneNumber,
        address: data.address,
        role: data.role || 'CUSTOMER'
      })
      .select()
      .single()

    if (error) throw error
    return profile
  }

  async findById(id: string): Promise<ProfileRow | null> {
    const supabase = await createClient()
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return null
    return profile
  }

  async findByEmail(email: string): Promise<ProfileRow | null> {
    const supabase = await createClient()
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single()

    if (error) return null
    return profile
  }

  async update(id: string, data: UpdateUserDto): Promise<ProfileRow> {
    const supabase = await createClient()
    const { data: profile, error } = await supabase
      .from('profiles')
      .update({
        first_name: data.firstName,
        last_name: data.lastName,
        phone_number: data.phoneNumber,
        address: data.address,
        role: data.role
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return profile
  }

  async delete(id: string): Promise<void> {
    const supabase = await createClient()
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}
