import { PrismaClient, User } from '@prisma/client';
import { Request } from 'express';
import { verifyJWToken } from '../utils/jwt';

const prisma = new PrismaClient();

async function authenticationMiddleware(
  req: Request
): Promise<{ user: User | null }> {
  try {
    const token = req.headers.authorization;

    // If the user doesn't provide a token, set user as null
    if (!token) {
      return { user: null };
    }
    const userPayload = verifyJWToken(token);
    const user = await prisma.user.findFirst({ where: { id: userPayload.id } });

    // If the user wasn't found in the database, set user as null
    if (!user) {
      return { user: null };
    }
    return { user };
  } catch {
    return { user: null };
  }
}

export default authenticationMiddleware;
