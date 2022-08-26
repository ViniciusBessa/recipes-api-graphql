import { PrismaClient, Review, User } from '@prisma/client';
import { ApolloError } from 'apollo-server-express';
import { ReviewInput } from '../models/review-input.model';

const prisma = new PrismaClient();

async function getReviews(id?: number): Promise<Review[]> {
  const reviews = await prisma.review.findMany({
    where: { id },
    include: { user: true, recipe: true },
  });
  return reviews;
}

async function createReview(
  recipeId: number,
  input: ReviewInput,
  user: User
): Promise<Review> {
  let { title, text, rating } = input;
  title = title ? title.trim() : title;
  text = text ? text.trim() : text;

  if (!title || !text || !rating) {
    throw new ApolloError(
      'Please provide a title, text and rating for the review'
    );
  }
  const review = await prisma.review.create({
    data: {
      text,
      title,
      rating,
      recipe: { connect: { id: recipeId } },
      user: { connect: { id: user.id } },
    },
    include: { user: true, recipe: true },
  });
  return review;
}

async function updateReview(id: number, newData: ReviewInput): Promise<Review> {
  let { title, text, rating } = newData;
  title = title ? title.trim() : title;
  text = text ? text.trim() : text;

  if (!title && !text && !rating) {
    throw new ApolloError(
      'Please provide a title, text or rating to update the review'
    );
  }
  const review = await prisma.review.update({
    where: { id },
    data: { title, text, rating },
    include: { user: true, recipe: true },
  });
  return review;
}

async function deleteReview(id: number): Promise<Review> {
  const review = await prisma.review.delete({
    where: { id },
    include: { user: true, recipe: true },
  });
  return review;
}

export { getReviews, createReview, updateReview, deleteReview };
