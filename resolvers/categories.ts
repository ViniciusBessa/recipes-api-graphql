import { Category, PrismaClient } from '@prisma/client';
import { ApolloError } from 'apollo-server-express';
import { NewCategoryInput } from '../models/new-category-input.model';

const prisma = new PrismaClient();

async function getCategories(id?: number): Promise<Category[]> {
  const categories = await prisma.category.findMany({ where: { id } });
  return categories;
}

async function createCategory(input: NewCategoryInput): Promise<Category> {
  let { name } = input;
  name = name ? name.trim() : name;

  if (!name) {
    throw new ApolloError('Please, provide a name for the category');
  }
  const category = await prisma.category.create({ data: input });
  return category;
}

async function updateCategory(
  id: number,
  newData: NewCategoryInput
): Promise<Category> {
  let { name } = newData;
  name = name ? name.trim() : name;

  if (!name) {
    throw new ApolloError('Please, provide a name to update the category');
  }
  const category = await prisma.category.update({
    where: { id },
    data: newData,
  });
  return category;
}

async function deleteCategory(id: number): Promise<Category> {
  const category = await prisma.category.delete({ where: { id } });
  return category;
}

export { getCategories, createCategory, updateCategory, deleteCategory };
