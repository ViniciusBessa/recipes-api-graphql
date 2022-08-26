import { gql } from 'apollo-server-express';

const schema = gql`
  scalar DateTime

  type Query {
    users(id: Int): [User!]!
    recipes(id: Int, userId: Int): [Recipe!]!
    ingredients(id: Int, recipeId: Int): [Ingredient!]!
    steps(id: Int, recipeId: Int): [Step!]!
    reviews(id: Int, recipeId: Int, userId: Int): [Review!]!
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
    createIngredient(recipeId: Int!, ingredientInput: NewIngredientInput!): Ingredient!
    updateIngredient(id: Int!, newData: UpdateIngredientInput!): Ingredient!
    deleteIngredient(id: Int!): Ingredient!

    # Steps Mutations
    createStep(recipeId: Int!, description: String!): Step!
    updateStep(id: Int!, newDescription: String!): Step!
    deleteStep(id: Int!): Step!

    # Reviews Mutations
    createReview(recipeId: Int!, review: NewReviewInput!): Review!
    updateReview(id: Int!, newData: UpdateReviewInput!): Review!
    deleteReview(id: Int!): Review!

    # Categories Mutations
    createCategory(name: String!): Category!
    updateCategory(id: Int!, newName: String!): Category!
    deleteCategory(id: Int!): Category!
  }

  type User {
    id: Int!
    name: String!
    email: String!
    role: Role
    recipes: [Recipe!]!
    reviews: [Review!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Recipe {
    id: Int!
    name: String!
    description: String
    ingredients: [Ingredient!]!
    categories: [RecipeCategory!]!
    steps: [Step!]!
    reviews: [Review!]!
    user: User!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Ingredient {
    id: Int!
    description: String!
    quantity: Int!
    recipe: Recipe!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Category {
    id: Int!
    name: String!
    recipes: [RecipeCategory!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Step {
    id: Int!
    description: String!
    recipe: Recipe!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Review {
    id: Int!
    title: String!
    text: String!
    rating: Float!
    recipe: Recipe!
    user: User!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type AuthInfo {
    user: User!
    token: String!
  }

  type RecipeCategory {
    recipe: Recipe!
    recipeId: Int!
    category: Category!
    categoryId: Int!
    assignedAt: DateTime!
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

  input NewRecipeInput {
    name: String!
    description: String!
    ingredients: [NewIngredientInput!]!
    steps: [NewStepInput!]!
    categoriesIds: [Int!]!
  }

  input UpdateRecipeInput {
    name: String
    description: String
  }

  input NewIngredientInput {
    description: String!
    quantity: Int!
  }

  input UpdateIngredientInput {
    description: String
    quantity: Int
  }

  input NewStepInput {
    description: String!
  }

  input NewReviewInput {
    title: String!
    text: String!
    rating: Float!
  }

  input UpdateReviewInput {
    title: String
    text: String
    rating: Float
  }

  enum Role {
    USER
    COOK
    ADMIN
  }
`;

export default schema;
