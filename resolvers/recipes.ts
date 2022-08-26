import { PrismaClient, Recipe, User } from '@prisma/client';
import { ApolloError } from 'apollo-server-express';
import { NewRecipeInput } from '../models/new-recipe-input.model';
import { UpdateRecipeInput } from '../models/update-recipe-input.model';

const prisma = new PrismaClient();

async function getRecipes(id?: number): Promise<Recipe[]> {
  const recipes = await prisma.recipe.findMany({
    where: { id },
    include: {
      user: true,
      categories: { include: { category: true } },
      ingredients: true,
      steps: true,
      reviews: true,
    },
  });
  return recipes;
}

async function createRecipe(
  input: NewRecipeInput,
  user: User
): Promise<Recipe> {
  let { name, description, ingredients, steps, categoriesIds } = input;
  name = name ? name.trim() : name;
  description = description ? description.trim() : description;

  if (!categoriesIds || categoriesIds.length == 0) {
    throw new ApolloError(
      'Please provide at least one category for the recipe'
    );
  }
  if (!ingredients || ingredients.length == 0) {
    throw new ApolloError(
      'Please provide at least one ingredient for the recipe'
    );
  }
  if (!steps || steps.length == 0) {
    throw new ApolloError('Please provide at least one step for the recipe');
  }
  if (!name || !description) {
    throw new ApolloError(
      'Please provide a name and description for the recipe'
    );
  }
  const recipe = await prisma.recipe.create({
    data: {
      name,
      description,
      categories: {
        create: categoriesIds.map((categoryId) => ({
          category: { connect: { id: categoryId } },
        })),
      },
      ingredients: {
        createMany: { data: ingredients },
      },
      steps: {
        createMany: { data: steps },
      },
      user: { connect: { id: user.id } },
    },
    include: {
      user: true,
      categories: { include: { category: true } },
      ingredients: true,
      steps: true,
      reviews: true,
    },
  });
  return recipe;
}

async function updateRecipe(
  id: number,
  newData: UpdateRecipeInput,
  user: User | null
): Promise<Recipe> {
  let { name, description } = newData;
  name = name ? name.trim() : name;
  description = description ? description.trim() : description;

  if (!name || !description) {
    throw new ApolloError(
      'Please, provide a name or a description to update the recipe'
    );
  }
  const recipe = await prisma.recipe.update({
    where: { id },
    data: { name, description },
    include: {
      user: true,
      categories: { include: { category: true } },
      ingredients: true,
      steps: true,
      reviews: true,
    },
  });
  return recipe;
}

async function deleteRecipe(id: number, user: User | null): Promise<Recipe> {
  const recipe = await prisma.recipe.delete({
    where: { id },
    include: {
      user: true,
      categories: { include: { category: true } },
      ingredients: true,
      steps: true,
      reviews: true,
    },
  });
  return recipe;
}

export { getRecipes, createRecipe, updateRecipe, deleteRecipe };
