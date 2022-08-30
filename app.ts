import { ApolloServer } from 'apollo-server-express';
import { DocumentNode } from 'graphql';
import express, { Express } from 'express';
import { createServer, Server } from 'http';
import {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageLocalDefault,
} from 'apollo-server-core';
import authenticationMiddleware from './middlewares/authentication';
import helmet from 'helmet';
import cors from 'cors';
import rateLimiter from 'express-rate-limit';
import dotenv from 'dotenv';
dotenv.config();

async function startServer(
  typeDefs: DocumentNode,
  resolvers: {}
): Promise<Server> {
  const app: Express = express();

  // Security Middlewares
  app.set('trust_proxy', 1);
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          'img-src': [
            "'self'",
            'https://apollo-server-landing-page.cdn.apollographql.com',
          ],
          'default-src': [
            "'self'",
            'https://apollo-server-landing-page.cdn.apollographql.com',
          ],
          'script-src': [
            "'self'",
            'https://embeddable-sandbox.cdn.apollographql.com',
            "'unsafe-inline'",
          ],
          'frame-src': ["'self'", 'https://sandbox.embed.apollographql.com/'],
        },
      },
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: { policy: 'unsafe-none' },
    })
  );
  app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
  app.use(
    rateLimiter({
      windowMs: 5 * 60 * 1000, // Five minutes
      max: 1000,
      message: 'Request limit reached',
    })
  );

  const httpServer = createServer(app);
  const server: ApolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    csrfPrevention: true,
    context: ({ req }) => authenticationMiddleware(req),
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
