import { PrismaClient, Review, User } from '@prisma/client';
import { ApolloError } from 'apollo-server-express';
import { ReviewInput } from '../models/review-input.model';

const prisma = new PrismaClient();

async function getReviews(
  id?: number,
  recipeId?: number,
  userId?: number
): Promise<Review[]> {
  const reviews = await prisma.review.findMany({
    where: { id, recipeId, userId },
    include: {
      user: true,
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

  // Checking if all information was passed correctly
  if (!title || !text || !rating) {
    throw new ApolloError(
      'Please provide a title, text and rating for the review'
    );
  }
  // Checking if the user already made a review of the recipe
  const alreadyHaveReview = await prisma.review.findFirst({
    where: { recipeId, userId: user.id },
  });

  if (alreadyHaveReview) {
    throw new ApolloError(
      `You already have a review of the recipe with the ID ${recipeId}`
    );
  }
  // Creating the new review
  const review = await prisma.review.create({
    data: {
      text,
      title,
      rating,
      recipe: { connect: { id: recipeId } },
      user: { connect: { id: user.id } },
    },
    include: {
      user: true,
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
  return review;
}

async function updateReview(
  id: number,
  newData: ReviewInput,
  user: User
): Promise<Review> {
  let { title, text, rating } = newData;
  title = title ? title.trim() : title;
  text = text ? text.trim() : text;

  // Checking if all information was passed correctly
  if (!title && !text && !rating) {
    throw new ApolloError(
      'Please provide a title, text or rating to update the review'
    );
  }
  // Getting the review from the database
  const review = await prisma.review.findFirst({
    where: { id },
    include: { user: true, recipe: true },
  });

  // If the review is not found or the review was not made by the user, an error is thrown
  if (!review) {
    throw new ApolloError(`No review with the ID ${id} was found`);
  } else if (review.userId !== user.id && user.role !== 'ADMIN') {
    throw new ApolloError(
      "You don't have the permission to change this review"
    );
  }
  // Updating the review
  const updatedReview = await prisma.review.update({
    where: { id },
    data: {
      title: title || undefined,
      text: text || undefined,
      rating: rating || undefined,
    },
    include: {
      user: true,
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
  return updatedReview;
}

async function deleteReview(id: number, user: User): Promise<Review> {
  // Getting the review from the database
  const review = await prisma.review.findFirst({
    where: { id },
    include: {
      user: true,
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

  // If the review is not found or the review was not made by the user, an error is thrown
  if (!review) {
    throw new ApolloError(`No review with the ID ${id} was found`);
  } else if (review.userId !== user.id && user.role !== 'ADMIN') {
    throw new ApolloError(
      "You don't have the permission to delete this review"
    );
  }
  await prisma.review.delete({ where: { id } });
  return review;
}

export { getReviews, createReview, updateReview, deleteReview };
