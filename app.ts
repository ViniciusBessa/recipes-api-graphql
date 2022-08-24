import { ApolloServer } from 'apollo-server-express';
import { DocumentNode } from 'graphql';
import express, { Express } from 'express';
import { createServer } from 'http';
import {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageLocalDefault,
} from 'apollo-server-core';
import { Server } from 'http';

async function startServer(
  typeDefs: DocumentNode,
  resolvers: {}
): Promise<Server> {
  const app: Express = express();
  const httpServer = createServer(app);
  const server: ApolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    csrfPrevention: true,
    cache: 'bounded',
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      ApolloServerPluginLandingPageLocalDefault({ embed: true }),
    ],
  });
  await server.start();
  server.applyMiddleware({ app });
  return httpServer;
}

export default startServer;
