import { User } from '@prisma/client';
import allowedRoles from '../middlewares/allowed-roles';
import { LoginInput } from '../models/login-input.model';
import { NewRecipeInput } from '../models/new-recipe-input.model';
import { UpdateRecipeInput } from '../models/update-recipe-input.model';
import { ReviewInput } from '../models/review-input.model';
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from './categories';
import {
  createIngredient,
  deleteIngredient,
  getIngredients,
  updateIngredient,
} from './ingredients';
import {
  createRecipe,
  deleteRecipe,
  getRecipes,
  updateRecipe,
} from './recipes';
import {
  createReview,
  deleteReview,
  getReviews,
  updateReview,
} from './reviews';
import { createStep, deleteStep, getSteps, updateStep } from './steps';
import {
  getUsers,
  createUser,
  deleteUser,
  loginUser,
  updateUserName,
  updateUserEmail,
  updateUserPassword,
} from './users';
import { IngredientInput } from '../models/ingredient-input.model';
import { UserInput } from '../models/user-input.model';

interface Context {
  user: User | null;
}

const resolvers = {
  Query: {
    users: async (_parent: any, args: { id?: number }) => getUsers(args.id),

    recipes: async (_parent: any, args: { id?: number; userId?: number }) =>
      getRecipes(args.id, args.userId),

    ingredients: async (
      _parent: any,
      args: { id?: number; recipeId?: number }
    ) => getIngredients(args.id, args.recipeId),

    steps: async (_parent: any, args: { id?: number; recipeId?: number }) =>
      getSteps(args.id, args.recipeId),

    reviews: async (
      _parent: any,
      args: { id?: number; recipeId?: number; userId?: number }
    ) => getReviews(args.id, args.recipeId, args.userId),

    categories: async (_parent: any, args: { id?: number }) =>
      getCategories(args.id),
  },

  Mutation: {
    // Users Mutations
    createUser: async (_parent: any, args: { input: UserInput }) =>
      createUser(args.input),

    updateUserName: async (
      _parent: any,
      args: { newName: string },
      context: Context
    ) => {
      allowedRoles(['USER', 'COOK', 'ADMIN'], context.user);
      return updateUserName(args.newName, context.user!);
    },

    updateUserEmail: async (
      _parent: any,
      args: { newEmail: string },
      context: Context
    ) => {
      allowedRoles(['USER', 'COOK', 'ADMIN'], context.user);
      return updateUserEmail(args.newEmail, context.user!);
    },

    updateUserPassword: async (
      _parent: any,
      args: { password: string; newPassword: string },
      context: Context
    ) => {
      allowedRoles(['USER', 'COOK', 'ADMIN'], context.user);
      return updateUserPassword(args.password, args.newPassword, context.user!);
    },

    deleteUser: async (
      _parent: any,
      args: { id: number },
      context: Context
    ) => {
      allowedRoles(['USER', 'COOK', 'ADMIN'], context.user);
      return deleteUser(args.id, context.user!);
    },

    loginUser: async (_parent: any, args: { input: LoginInput }) =>
      loginUser(args.input),

    // Recipes Mutations
    createRecipe: async (
      _parent: any,
      args: { input: NewRecipeInput },
      context: Context
    ) => {
      allowedRoles(['COOK', 'ADMIN'], context.user);
      return createRecipe(args.input, context.user!);
    },

    updateRecipe: async (
      _parent: any,
      args: { id: number; newData: UpdateRecipeInput },
      context: Context
    ) => {
      allowedRoles(['COOK', 'ADMIN'], context.user);
      return updateRecipe(args.id, args.newData, context.user!);
    },

    deleteRecipe: async (
      _parent: any,
      args: { id: number },
      context: Context
    ) => {
      allowedRoles(['COOK', 'ADMIN'], context.user);
      return deleteRecipe(args.id, context.user!);
    },

    // Ingredients Mutations
    createIngredient: async (
      _parent: any,
      args: { recipeId: number; ingredientInput: IngredientInput },
      context: Context
    ) => {
      allowedRoles(['COOK', 'ADMIN'], context.user);
      return createIngredient(
        args.recipeId,
        args.ingredientInput,
        context.user!
      );
    },

    updateIngredient: async (
      _parent: any,
      args: { id: number; newData: IngredientInput },
      context: Context
    ) => {
      allowedRoles(['COOK', 'ADMIN'], context.user);
      return updateIngredient(args.id, args.newData, context.user!);
    },

    deleteIngredient: async (
      _parent: any,
      args: { id: number },
      context: Context
    ) => {
      allowedRoles(['COOK', 'ADMIN'], context.user);
      return deleteIngredient(args.id, context.user!);
    },

    // Steps Mutations
    createStep: async (
      _parent: any,
      args: { recipeId: number; description: string },
      context: Context
    ) => {
      allowedRoles(['COOK', 'ADMIN'], context.user);
      return createStep(args.recipeId, args.description, context.user!);
    },

    updateStep: async (
      _parent: any,
      args: { id: number; newDescription: string },
      context: Context
    ) => {
      allowedRoles(['COOK', 'ADMIN'], context.user);
      return updateStep(args.id, args.newDescription, context.user!);
    },

    deleteStep: async (
      _parent: any,
      args: { id: number },
      context: Context
    ) => {
      allowedRoles(['COOK', 'ADMIN'], context.user);
      return deleteStep(args.id, context.user!);
    },

    // Reviews Mutations
    createReview: async (
      _parent: any,
      args: { recipeId: number; review: ReviewInput },
      context: Context
    ) => {
      allowedRoles(['USER', 'COOK', 'ADMIN'], context.user);
      return createReview(args.recipeId, args.review, context.user!);
    },

    updateReview: async (
      _parent: any,
      args: { id: number; newData: ReviewInput },
      context: Context
    ) => {
      allowedRoles(['USER', 'COOK', 'ADMIN'], context.user);
      return updateReview(args.id, args.newData, context.user!);
    },

    deleteReview: async (
      _parent: any,
      args: { id: number },
      context: Context
    ) => {
      allowedRoles(['USER', 'COOK', 'ADMIN'], context.user);
      return deleteReview(args.id, context.user!);
    },

    // Categories Mutations
    createCategory: async (
      _parent: any,
      args: { name: string },
      context: Context
    ) => {
      allowedRoles(['ADMIN'], context.user);
      return createCategory(args.name);
    },

    updateCategory: async (
      _parent: any,
      args: { id: number; newName: string },
      context: Context
    ) => {
      allowedRoles(['ADMIN'], context.user);
      return updateCategory(args.id, args.newName);
    },

    deleteCategory: async (
      _parent: any,
      args: { id: number },
      context: Context
    ) => {
      allowedRoles(['ADMIN'], context.user);
      return deleteCategory(args.id);
    },
  },
};

export default resolvers;
