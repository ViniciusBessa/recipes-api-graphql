import { gql } from 'apollo-server-express';

const schema = gql`
  scalar DateTime

  type Query {
    users: [User!]!
    recipes: [Recipe!]!
    ingredients: [Ingredient!]!
    categories: [Category!]!
  }

  type Mutation {
    # Users mutations
    createUser(input: NewUserInput!): AuthInfo!
    updateUser(id: ID!, newData: NewUserInput!): User!
    deleteUser(id: ID!): User!
    loginUser(input: LoginInput!): AuthInfo!

    # Recipes Mutations

    # Ingredients Mutations
    createIngredient(input: NewIngredientInput!): Ingredient!
    updateIngredient(id: ID!, newData: NewIngredientInput!): Ingredient!
    deleteIngredient(id: ID!): Ingredient!

    # Categories Mutations
    createCategory(input: NewCategoryInput!): Category!
    updateCategory(id: ID!, newData: NewCategoryInput!): Category!
    deleteCategory(id: ID!): Category!
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
    weightKg: Float!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Category {
    id: ID!
    name: String!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type AuthInfo {
    user: User!
    token: String!
  }

  input NewUserInput {
    name: String!
    email: String!
    password: String!
  }

  input LoginInput {
    name: String
    email: String
    password: String!
  }

  input NewIngredientInput {
    name: String!
    weightKg: Float!
  }

  input NewCategoryInput {
    name: String!
  }

  enum Role {
    USER
    CREATOR
    ADMIN
  }
`;

export default schema;
