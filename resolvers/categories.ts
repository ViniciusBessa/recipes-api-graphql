import { Category, PrismaClient } from '@prisma/client';
import { ApolloError } from 'apollo-server-express';

const prisma = new PrismaClient();

async function getCategories(id?: number): Promise<Category[]> {
  const categories = await prisma.category.findMany({ where: { id } });
  return categories;
}

async function createCategory(name: string): Promise<Category> {
  name = name ? name.trim() : name;

  if (!name) {
    throw new ApolloError('Please, provide a name for the category');
  }
  const category = await prisma.category.create({ data: { name } });
  return category;
}

async function updateCategory(id: number, newName: string): Promise<Category> {
  newName = newName ? newName.trim() : newName;

  if (!newName) {
    throw new ApolloError('Please, provide a name to update the category');
  }
  const category = await prisma.category.update({
    where: { id },
    data: { name: newName },
  });
  return category;
}

async function deleteCategory(id: number): Promise<Category> {
  const category = await prisma.category.delete({ where: { id } });
  return category;
}

export { getCategories, createCategory, updateCategory, deleteCategory };
