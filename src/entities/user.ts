export interface UserEntity {
  id: string;
  name: string | null;
  email: string;
  phone: string;
  password: string;
  photoUrl: string | null;
  emailVerifiedAt: any | null;
  phoneVerifiedAt: any | null;
  verifiedAt: any | null;
  blockedAt: any | null;
  createdAt: any;
  updatedAt: any | null;
  metadata: Record<string, any>;
}
