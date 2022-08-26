import { PrismaClient, Step, User } from '@prisma/client';
import { ApolloError } from 'apollo-server-express';

const prisma = new PrismaClient();

async function getSteps(id?: number, recipeId?: number): Promise<Step[]> {
  const steps = await prisma.step.findMany({
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
  return steps;
}

async function createStep(
  recipeId: number,
  description: string,
  user: User
): Promise<Step> {
  description = description ? description.trim() : description;

  if (!description) {
    throw new ApolloError('Please provide a description for the step');
  }
  const recipe = await prisma.recipe.findFirst({
    where: { id: recipeId },
    include: { user: true },
  });

  if (!recipe) {
    throw new ApolloError(`No recipe with the ID ${recipeId} was found`);
  } else if (recipe.userId !== user.id && user.role !== 'ADMIN') {
    throw new ApolloError(
      "You don't have the permission to create a step for this recipe"
    );
  }
  const step = await prisma.step.create({
    data: { description, recipe: { connect: { id: recipeId } } },
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
  return step;
}

async function updateStep(
  id: number,
  newDescription: string,
  user: User
): Promise<Step> {
  newDescription = newDescription ? newDescription.trim() : newDescription;

  if (!newDescription) {
    throw new ApolloError('Please, provide a new description to the step');
  }
  const step = await prisma.step.findFirst({
    where: { id },
    include: { recipe: true },
  });

  // If the step is not found or the step was not made by the user, an error is thrown
  if (!step) {
    throw new ApolloError(`No step with the ID ${id} was found`);
  } else if (step.recipe.userId !== user.id && user.role !== 'ADMIN') {
    throw new ApolloError("You don't have the permission to change this step");
  }
  const updatedStep = await prisma.step.update({
    where: { id },
    data: { description: newDescription },
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
  return updatedStep;
}

async function deleteStep(id: number, user: User): Promise<Step> {
  const step = await prisma.step.findFirst({
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

  // If the step is not found or the step was not made by the user, an error is thrown
  if (!step) {
    throw new ApolloError(`No step with the ID ${id} was found`);
  } else if (step.recipe.userId !== user.id && user.role !== 'ADMIN') {
    throw new ApolloError("You don't have the permission to delete this step");
  }
  await prisma.step.delete({
    where: { id },
  });
  return step;
}

export { getSteps, createStep, updateStep, deleteStep };
