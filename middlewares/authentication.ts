import { PrismaClient, User } from '@prisma/client';
import { Request } from 'express';
import { verifyJWToken } from '../utils/jwt';

const prisma = new PrismaClient();

async function authenticationMiddleware(
  req: Request
): Promise<{ user: User | null }> {
  const token = req.headers.authorization;

  if (!token) {
    return { user: null };
  }
  const userPayload = verifyJWToken(token);
  const user = await prisma.user.findFirst({ where: { id: userPayload.id } });

  if (!user) {
    return { user: null };
  }
  return { user };
}

export default authenticationMiddleware;
