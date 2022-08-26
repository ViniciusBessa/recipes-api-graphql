import { gql } from 'apollo-server-express';

const schema = gql`
  scalar DateTime

  type Query {
    users(id: Int): [User!]!
    recipes(id: Int): [Recipe!]!
    ingredients(id: Int): [Ingredient!]!
    categories(id: Int): [Category!]!
  }

  type Mutation {
    # Users mutations
    createUser(input: NewUserInput!): AuthInfo!
    updateUserName(newName: String!): User!
    updateUserEmail(newEmail: String!): User!
    updateUserPassword(password: String!, newPassword: String!): User!
    deleteUser(id: Int!): User!
    loginUser(input: LoginInput!): AuthInfo!

    # Recipes Mutations
    createRecipe(input: NewRecipeInput!): Recipe!
    updateRecipe(id: Int!, newData: UpdateRecipeInput!): Recipe!
    deleteRecipe(id: Int!): Recipe!

    # Ingredients Mutations
    createIngredient(input: NewIngredientInput!): Ingredient!
    updateIngredient(id: Int!, newData: NewIngredientInput!): Ingredient!
    deleteIngredient(id: Int!): Ingredient!

    # Categories Mutations
    createCategory(input: NewCategoryInput!): Category!
    updateCategory(id: Int!, newData: NewCategoryInput!): Category!
    deleteCategory(id: Int!): Category!
  }

  type User {
    id: Int!
    name: String!
    email: String!
    role: Role
    recipes: [Recipe!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Recipe {
    id: Int!
    name: String!
    description: String
    ingredients: [RecipeIngredient!]!
    categories: [RecipeCategory!]!
    user: User!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Ingredient {
    id: Int!
    name: String!
    weightKg: Float!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Category {
    id: Int!
    name: String!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type AuthInfo {
    user: User!
    token: String!
  }

  type RecipeIngredient {
    recipeId: Int!
    ingredientId: Int!
    quantity: Int!
    assignedAt: DateTime!
    ingredient: Ingredient!
  }

  type RecipeCategory {
    recipeId: Int!
    categoryId: Int!
    quantity: Int!
    assignedAt: DateTime!
    ingredient: Category!
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

  input NewRecipeInput {
    name: String!
    description: String!
    ingredients: [IngredientQuantity!]!
    categoriesIds: [Int!]!
  }

  input UpdateRecipeInput {
    name: String
    description: String
  }

  input IngredientQuantity {
    ingredientId: Int!
    quantity: Int!
  }

  enum Role {
    USER
    COOK
    ADMIN
  }
`;

export default schema;
