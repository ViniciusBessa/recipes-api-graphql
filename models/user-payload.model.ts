export interface UserPayload {
  id: number;
  name: string;
  email: string;
  role: 'USER' | 'COOK' | 'ADMIN';
  createdAt: Date;
  updatedAt: Date;
}
