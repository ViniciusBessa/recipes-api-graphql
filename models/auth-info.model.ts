import { User } from '@prisma/client';

export interface AuthInfo {
  user: User;
  token: string;
}
