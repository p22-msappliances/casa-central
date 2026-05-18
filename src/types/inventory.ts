export type UserRole = 'admin' | 'manager' | 'viewer';

export interface Profile {
  id: string;
  updated_at: string;
  full_name: string;
  role: UserRole;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  quantity: number;
  cost_price: number;
  retail_price: number;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
}

export interface CreateInventoryItem {
  sku: string;
  name: string;
  description?: string;
  quantity: number;
  cost_price: number;
  retail_price: number;
}

export interface UpdateInventoryItem extends Partial<CreateInventoryItem> {
  id: string;
}
