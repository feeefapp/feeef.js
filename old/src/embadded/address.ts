export interface EmbaddedAddress {
  city: string;
  state: string;
  country?: string;
  street?: string;
  zip?: string;
  location?: {
    geohash?: string;
    lat: number;
    long: number;
  };
  metadata?: Record<string, any>;
}
