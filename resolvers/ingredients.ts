import { Ingredient, PrismaClient, User } from '@prisma/client';
import { ApolloError } from 'apollo-server-express';
import { IngredientInput } from '../models/ingredient-input.model';
const prisma = new PrismaClient();

async function getIngredients(
  id?: number,
  recipeId?: number
): Promise<Ingredient[]> {
  const ingredients = await prisma.ingredient.findMany({
    where: { id, recipeId },
    include: {
      recipe: {
        include: {
          user: true,
          reviews: { include: { user: true, recipe: true } },
          steps: true,
          ingredients: true,
          categories: {
            include: {
              category: true,
            },
          },
        },
      },
    },
  });
  return ingredients;
}

async function createIngredient(
  recipeId: number,
  ingredientInput: IngredientInput,
  user: User
): Promise<Ingredient> {
  let { description, quantity } = ingredientInput;
  description = description ? description.trim() : description;

  if (!description || !quantity) {
    throw new ApolloError(
      'Please provide a description and a quantity for the ingredient'
    );
  }
  const recipe = await prisma.recipe.findFirst({
    where: { id: recipeId },
    include: { user: true },
  });

  if (!recipe) {
    throw new ApolloError(`No recipe with the ID ${recipeId} was found`);
  } else if (recipe.userId !== user.id && user.role !== 'ADMIN') {
    throw new ApolloError(
      "You don't have the permission to add an ingredient to this recipe"
    );
  }
  const ingredient = await prisma.ingredient.create({
    data: { description, quantity, recipe: { connect: { id: recipeId } } },
    include: {
      recipe: {
        include: {
          user: true,
          reviews: { include: { user: true, recipe: true } },
          steps: true,
          ingredients: true,
          categories: {
            include: {
              category: true,
            },
          },
        },
      },
    },
  });
  return ingredient;
}

async function updateIngredient(
  id: number,
  newData: IngredientInput,
  user: User
): Promise<Ingredient> {
  let { description, quantity } = newData;
  description = description ? description.trim() : description;

  if (!description && !quantity) {
    throw new ApolloError(
      'Please, provide a description or quantity to update the ingredient'
    );
  }
  const ingredient = await prisma.ingredient.findFirst({
    where: { id },
    include: {
      recipe: {
        include: {
          user: true,
          reviews: { include: { user: true, recipe: true } },
          steps: true,
          ingredients: true,
          categories: {
            include: {
              category: true,
            },
          },
        },
      },
    },
  });

  if (!ingredient) {
    throw new ApolloError(`No ingredient with the ID ${id} was found`);
  } else if (ingredient.recipe.userId !== user.id && user.role !== 'ADMIN') {
    throw new ApolloError(
      "You don't have the permission to change this ingredient"
    );
  }
  const updatedIngredient = await prisma.ingredient.update({
    where: { id },
    data: {
      description: description || undefined,
      quantity: quantity || undefined,
    },
    include: { recipe: true },
  });
  return updatedIngredient;
}

async function deleteIngredient(id: number, user: User): Promise<Ingredient> {
  const ingredient = await prisma.ingredient.findFirst({
    where: { id },
    include: {
      recipe: {
        include: {
          user: true,
          reviews: { include: { user: true, recipe: true } },
          steps: true,
          ingredients: true,
          categories: {
            include: {
              category: true,
            },
          },
        },
      },
    },
  });

  if (!ingredient) {
    throw new ApolloError(`No ingredient with the ID ${id} was found`);
  } else if (ingredient.recipe.userId !== user.id && user.role !== 'ADMIN') {
    throw new ApolloError(
      "You don't have the permission to delete this ingredient"
    );
  }
  await prisma.ingredient.delete({
    where: { id },
  });
  return ingredient;
}

export { getIngredients, createIngredient, updateIngredient, deleteIngredient };
