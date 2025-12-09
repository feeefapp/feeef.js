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











