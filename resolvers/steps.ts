import { PrismaClient, Step } from '@prisma/client';
import { ApolloError } from 'apollo-server-express';

const prisma = new PrismaClient();

async function getSteps(id?: number): Promise<Step[]> {
  const steps = await prisma.step.findMany({
    where: { id },
    include: { recipe: true },
  });
  return steps;
}

async function updateStep(id: number, newDescription: string): Promise<Step> {
  newDescription = newDescription ? newDescription.trim() : newDescription;

  if (!newDescription) {
    throw new ApolloError('Please, provide a new description to the step');
  }
  const step = await prisma.step.update({
    where: { id },
    data: { description: newDescription },
    include: { recipe: true },
  });
  return step;
}

async function deleteStep(id: number): Promise<Step> {
  const step = await prisma.step.delete({
    where: { id },
    include: { recipe: true },
  });
  return step;
}

export { getSteps, updateStep, deleteStep };
