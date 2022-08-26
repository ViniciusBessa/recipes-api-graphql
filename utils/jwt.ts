import { UserPayload } from '../models/user-payload.model';
import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';

function getUserPayload(user: User): UserPayload {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function generateJWToken(userPayload: UserPayload): string {
  const token: string = jwt.sign(
    userPayload,
    process.env.JWT_SECRET as string,
    {
      expiresIn: process.env.JWT_EXPIRES_IN as string,
    }
  );
  return token;
}

function verifyJWToken(token: string): UserPayload {
  const userPayload: UserPayload = jwt.verify(
    token,
    process.env.JWT_SECRET as string
  ) as UserPayload;
  return userPayload;
}

export { getUserPayload, generateJWToken, verifyJWToken };
