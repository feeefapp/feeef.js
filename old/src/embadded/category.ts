export interface EmbaddedCategory {
  name: string;
  description: string;
  photoUrl: string | null;
  ondarkPhotoUrl?: string | null;
  metadata?: Record<string, any>;
}
