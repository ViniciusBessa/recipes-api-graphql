import createServer from './app';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import typeDefs from './schema';
import resolvers from './resolvers';

dotenv.config();

const port = process.env.PORT as string;

async function startServer() {
  const prisma = new PrismaClient();
  prisma.$connect();
  const server = await createServer(typeDefs, resolvers);
  server.listen({ port }, () =>
    console.log(`The server is listening at http://localhost:${port}/graphql`)
  );
}

startServer();
