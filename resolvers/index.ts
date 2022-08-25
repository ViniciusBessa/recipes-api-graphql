import { Context } from 'vm';
import { LoginInput } from '../models/login-input.model';
import { NewCategoryInput } from '../models/new-category-input.model';
import { NewIngredientInput } from '../models/new-ingredient-input.model';
import { NewUserInput } from '../models/new-user-input.model';
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
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  loginUser,
} from './users';

const resolvers = {
  Query: {
    users: (id?: number) => getUsers(id),
    ingredients: (id?: number) => getIngredients(id),
    categories: (id?: number) => getCategories(id),
  },

  Mutation: {
    // Users Mutations
    createUser: async (_parent: any, args: { input: NewUserInput }) =>
      createUser(args.input),

    updateUser: async (
      _parent: any,
      args: { id: string; newData: NewUserInput },
      context: Context
    ) => updateUser(+args.id, args.newData, context),

    deleteUser: async (_parent: any, args: { id: string }, context: Context) =>
      deleteUser(+args.id, context),

    loginUser: async (_parent: any, args: { input: LoginInput }) =>
      loginUser(args.input),

    // Recipes Mutations

    // Ingredients Mutations
    createIngredient: async (
      _parent: any,
      args: { input: NewIngredientInput }
    ) => createIngredient(args.input),

    updateIngredient: async (
      _parent: any,
      args: { id: string; newData: NewIngredientInput }
    ) => updateIngredient(+args.id, args.newData),

    deleteIngredient: async (_parent: any, args: { id: string }) =>
      deleteIngredient(+args.id),

    // Categories Mutations
    createCategory: async (_parent: any, args: { input: NewCategoryInput }) =>
      createCategory(args.input),

    updateCategory: async (
      _parent: any,
      args: { id: string; newData: NewCategoryInput }
    ) => updateCategory(+args.id, args.newData),

    deleteCategory: async (_parent: any, args: { id: string }) =>
      deleteCategory(+args.id),
  },
};

export default resolvers;
