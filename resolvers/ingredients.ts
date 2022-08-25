import { Ingredient, PrismaClient } from '@prisma/client';
import { ApolloError } from 'apollo-server-express';
import { NewIngredientInput } from '../models/new-ingredient-input.model';

const prisma = new PrismaClient();

async function getIngredients(id?: number): Promise<Ingredient[]> {
  const ingredients = await prisma.ingredient.findMany({ where: { id } });
  return ingredients;
}

async function createIngredient(
  input: NewIngredientInput
): Promise<Ingredient> {
  let { name, weightKg } = input;
  name = name ? name.trim() : name;

  if (!name || !weightKg) {
    throw new ApolloError(
      'Please, provide a name and a weight in kilograms for the ingredient'
    );
  }
  const ingredient = await prisma.ingredient.create({ data: input });
  return ingredient;
}

async function updateIngredient(
  id: number,
  newData: NewIngredientInput
): Promise<Ingredient> {
  let { name, weightKg } = newData;
  name = name ? name.trim() : name;

  if (!name && !weightKg) {
    throw new ApolloError(
      'Please, provide a name or a weight to update the ingredient'
    );
  }
  const ingredient = await prisma.ingredient.update({
    where: { id },
    data: newData,
  });
  return ingredient;
}

async function deleteIngredient(id: number): Promise<Ingredient> {
  const ingredient = await prisma.ingredient.delete({ where: { id } });
  return ingredient;
}

export { getIngredients, createIngredient, updateIngredient, deleteIngredient };
