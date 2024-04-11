export interface EmbaddedCategory {
  name: string
  description: string | null
  photoUrl: string | null
  ondarkPhotoUrl?: string | null
  metadata?: Record<string, any>
}
