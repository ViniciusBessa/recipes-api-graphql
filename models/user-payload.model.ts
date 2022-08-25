export interface UserPayload {
  id: number;
  name: string;
  email: string;
  role: 'USER' | 'CREATOR' | 'ADMIN';
  createdAt: Date;
  updatedAt: Date;
}
