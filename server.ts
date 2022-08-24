import { gql } from 'apollo-server-express';
import createServer from './app';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const typeDefs = gql`
  scalar DateTime

  type Query {
    users: [User!]!
    recipes: [Recipe!]!
    ingredients: [Ingredients!]!
    categories: [Categories!]!
  }

  type Mutation {
    createUser(name: String!, email: String!, password: String!): AuthInfo
  }

  type User {
    id: ID!
    name: String!
    email: String!
    role: Role
    recipes: [Recipe!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Recipe {
    id: ID!
    name: String!
    description: String
    ingredients: [Ingredient!]!
    categories: [Category!]!
    user: User!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Ingredient {
    id: ID!
    name: String!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Category {
    id: ID!
    name: String!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  interface AuthInfo {
    user: User!
    token: String!
  }

  enum Role {
    USER
    ADMIN
  }
`;

const port = process.env.PORT as string;

async function startServer() {
  const prisma = new PrismaClient()
  prisma.$connect();
  const server = await createServer(typeDefs, {});
  server.listen({ port }, () =>
    console.log(`The server is listening at http://localhost:${port}/graphql`)
  );
}

startServer();
