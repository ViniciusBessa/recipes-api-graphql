import { PrismaClient, Recipe, User } from '@prisma/client';
import { ApolloError } from 'apollo-server-express';
import { NewRecipeInput } from '../models/new-recipe-input.model';
import { UpdateRecipeInput } from '../models/update-recipe-input.model';

const prisma = new PrismaClient();

async function getRecipes(id?: number, userId?: number): Promise<Recipe[]> {
  const recipes = await prisma.recipe.findMany({
    where: { id, userId },
    include: {
      user: true,
      categories: { include: { category: true } },
      ingredients: true,
      steps: true,
      reviews: { include: { user: true } },
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
      reviews: { include: { user: true } },
    },
  });
  return recipe;
}

async function updateRecipe(
  id: number,
  newData: UpdateRecipeInput,
  user: User
): Promise<Recipe> {
  let { name, description } = newData;
  name = name ? name.trim() : name;
  description = description ? description.trim() : description;

  if (!name && !description) {
    throw new ApolloError(
      'Please, provide a name or a description to update the recipe'
    );
  }
  const recipe = await prisma.recipe.findFirst({
    where: { id },
    include: {
      user: true,
    },
  });

  if (!recipe) {
    throw new ApolloError(`No recipe with the ID ${id} was found`);
  } else if (recipe.userId !== user.id && user.role !== 'ADMIN') {
    throw new ApolloError(
      "You don't have the permission to update this recipe"
    );
  }
  const updatedRecipe = await prisma.recipe.update({
    where: { id },
    data: { name, description },
    include: {
      user: true,
      categories: { include: { category: true } },
      ingredients: true,
      steps: true,
      reviews: { include: { user: true } },
    },
  });
  return updatedRecipe;
}

async function deleteRecipe(id: number, user: User): Promise<Recipe> {
  const recipe = await prisma.recipe.findFirst({
    where: { id },
    include: {
      user: true,
      categories: { include: { category: true } },
      ingredients: true,
      steps: true,
      reviews: { include: { user: true } },
    },
  });

  if (!recipe) {
    throw new ApolloError(`No recipe with the ID ${id} was found`);
  } else if (recipe.userId !== user.id && user.role !== 'ADMIN') {
    throw new ApolloError(
      "You don't have the permission to delete this recipe"
    );
  }
  await prisma.recipe.delete({
    where: { id },
  });
  return recipe;
}

export { getRecipes, createRecipe, updateRecipe, deleteRecipe };
