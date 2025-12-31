export interface CategoryEntity {
  id: string
  storeId: string
  parentId: string | null
  name: string
  description: string | null
  photoUrl: string | null
  metadata: Record<string, any>
  parent?: CategoryEntity | null
  children?: CategoryEntity[]
  createdAt: any
  updatedAt: any
}

/**
 * Input data for creating a new category
 */
export interface CategoryCreateInput {
  name: string
  storeId: string
  parentId?: string
  description?: string
  photoUrl?: string
  metadata?: Record<string, any>
}

/**
 * Input data for updating an existing category
 */
export interface CategoryUpdateInput {
  name?: string
  parentId?: string | null
  description?: string
  photoUrl?: string
  metadata?: Record<string, any>
}
