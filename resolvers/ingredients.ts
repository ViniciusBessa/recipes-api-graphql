import { Ingredient, PrismaClient } from '@prisma/client';
import { ApolloError } from 'apollo-server-express';
import { IngredientInput } from '../models/ingredient-input.model';
const prisma = new PrismaClient();

async function getIngredients(id?: number): Promise<Ingredient[]> {
  const ingredients = await prisma.ingredient.findMany({
    where: { id },
    include: { recipe: true },
  });
  return ingredients;
}

async function updateIngredient(
  id: number,
  newData: IngredientInput
): Promise<Ingredient> {
  let { description, quantity } = newData;
  description = description ? description.trim() : description;

  if (!description && !quantity) {
    throw new ApolloError(
      'Please, provide a description or quantity to update the ingredient'
    );
  }
  const ingredient = await prisma.ingredient.update({
    where: { id },
    data: { description, quantity },
    include: { recipe: true },
  });
  return ingredient;
}

async function deleteIngredient(id: number): Promise<Ingredient> {
  const ingredient = await prisma.ingredient.delete({
    where: { id },
    include: { recipe: true },
  });
  return ingredient;
}

export { getIngredients, updateIngredient, deleteIngredient };
