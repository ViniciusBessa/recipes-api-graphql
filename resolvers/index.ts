import { User } from '@prisma/client';
import allowedRoles from '../middlewares/allowed-roles';
import { LoginInput } from '../models/login-input.model';
import { NewCategoryInput } from '../models/new-category-input.model';
import { NewIngredientInput } from '../models/new-ingredient-input.model';
import { NewRecipeInput } from '../models/new-recipe-input.model';
import { NewUserInput } from '../models/new-user-input.model';
import { UpdateRecipeInput } from '../models/update-recipe-input.model';
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
  getUsers,
  createUser,
  deleteUser,
  loginUser,
  updateUserName,
  updateUserEmail,
  updateUserPassword,
} from './users';

interface Context {
  user: User | null;
}

const resolvers = {
  Query: {
    users: async (_parent: any, args: { id?: number }) => getUsers(args.id),

    recipes: async (_parent: any, args: { id?: number }) => getRecipes(args.id),

    ingredients: async (_parent: any, args: { id?: number }) =>
      getIngredients(args.id),

    categories: async (_parent: any, args: { id?: number }) =>
      getCategories(args.id),
  },

  Mutation: {
    // Users Mutations
    createUser: async (_parent: any, args: { input: NewUserInput }) =>
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
    ) => createRecipe(args.input, context.user),

    updateRecipe: async (
      _parent: any,
      args: { id: number; newData: UpdateRecipeInput },
      context: Context
    ) => updateRecipe(args.id, args.newData, context.user),

    deleteRecipe: async (
      _parent: any,
      args: { id: number },
      context: Context
    ) => deleteRecipe(args.id, context.user),

    // Ingredients Mutations
    createIngredient: async (
      _parent: any,
      args: { input: NewIngredientInput },
      context: Context
    ) => {
      allowedRoles(['ADMIN'], context.user);
      return createIngredient(args.input);
    },

    updateIngredient: async (
      _parent: any,
      args: { id: number; newData: NewIngredientInput },
      context: Context
    ) => {
      allowedRoles(['ADMIN'], context.user);
      return updateIngredient(args.id, args.newData);
    },

    deleteIngredient: async (
      _parent: any,
      args: { id: number },
      context: Context
    ) => {
      allowedRoles(['ADMIN'], context.user);
      return deleteIngredient(args.id);
    },

    // Categories Mutations
    createCategory: async (
      _parent: any,
      args: { input: NewCategoryInput },
      context: Context
    ) => {
      allowedRoles(['ADMIN'], context.user);
      return createCategory(args.input);
    },

    updateCategory: async (
      _parent: any,
      args: { id: number; newData: NewCategoryInput },
      context: Context
    ) => {
      allowedRoles(['ADMIN'], context.user);
      return updateCategory(args.id, args.newData);
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
