import { PrismaClient } from '@prisma/client';
import { generatePassword } from '../utils/bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Users
  const syntyche = await prisma.user.create({
    data: {
      name: 'Syntyche Joann',
      email: 'syntyche@gmail.com',
      password: await generatePassword('sjoann'),
      role: 'ADMIN',
    },
  });

  const ulrik = await prisma.user.create({
    data: {
      name: 'Ulrik Meginrat',
      email: 'ulrik@gmail.com',
      password: await generatePassword('umeginrat'),
      role: 'COOK',
    },
  });

  const taqqiq = await prisma.user.create({
    data: {
      name: 'Taqqiq Berlin',
      email: 'taqqiq@gmail.com',
      password: await generatePassword('tberlin'),
      role: 'USER',
    },
  });

  const rosalinda = await prisma.user.create({
    data: {
      name: 'Rosalinda Astrid',
      email: 'rosalinda@gmail.com',
      password: await generatePassword('rastrid'),
      role: 'USER',
    },
  });

  const john = await prisma.user.create({
    data: {
      name: 'John Astrid',
      email: 'john@gmail.com',
      password: await generatePassword('jastrid'),
      role: 'USER',
    },
  });

  const richard = await prisma.user.create({
    data: {
      name: 'Richard Smith',
      email: 'richard@gmail.com',
      password: await generatePassword('rsmith'),
      role: 'USER',
    },
  });

  // Categories
  const frenchCategory = await prisma.category.create({
    data: { name: 'French' },
  });

  const dessertCategory = await prisma.category.create({
    data: { name: 'Dessert' },
  });

  const chineseCategory = await prisma.category.create({
    data: { name: 'Chinese' },
  });

  const ItalianCategory = await prisma.category.create({
    data: { name: 'Italian' },
  });

  const spanishCategory = await prisma.category.create({
    data: { name: 'Spanish' },
  });

  // Recipes
  const chocolateCake = await prisma.recipe.create({
    data: {
      name: 'Chocolate Cake',
      description: 'A chocolate cake',
      categories: {
        create: { category: { connect: { id: dessertCategory.id } } },
      },
      ingredients: {
        createMany: {
          data: [
            { description: '200g of chocolate chips', quantity: 1 },
            { description: '2 cups of sugar', quantity: 1 },
          ],
        },
      },
      steps: {
        createMany: {
          data: [
            { description: 'Preheat the oven to 380° F' },
            { description: 'Add the chocolate chips and the cups of sugar' },
            { description: 'Bake for 40 minutes' },
          ],
        },
      },
      user: { connect: { id: ulrik.id } },
    },
  });

  const frenchCrepes = await prisma.recipe.create({
    data: {
      name: 'French Crepes',
      description: 'French crepes',
      categories: {
        create: [
          { category: { connect: { id: frenchCategory.id } } },
          { category: { connect: { id: dessertCategory.id } } },
        ],
      },
      ingredients: {
        createMany: {
          data: [
            { description: 'An egg', quantity: 3 },
            { description: '20g of salt', quantity: 2 },
            { description: '1/2 cup of milk', quantity: 1 },
          ],
        },
      },
      steps: {
        createMany: {
          data: [
            { description: 'Mix the ingredients together' },
            { description: 'Let the crepes rest for 20 minutes' },
            { description: 'Cook the crepes individually' },
          ],
        },
      },
      user: { connect: { id: syntyche.id } },
    },
  });

  const chickenStirFry = await prisma.recipe.create({
    data: {
      name: 'Chicken Stir Fry',
      description: 'A chicken stir fry recipe!',
      categories: {
        create: { category: { connect: { id: chineseCategory.id } } },
      },
      ingredients: {
        createMany: {
          data: [
            { description: '300g of chicken breast', quantity: 3 },
            { description: 'Red chilli', quantity: 2 },
            { description: 'Carrot', quantity: 4 },
          ],
        },
      },
      steps: {
        createMany: {
          data: [
            { description: 'Cut the chicken breast into thin strips' },
            { description: 'Stir fry briefly, then add the carrots' },
            { description: 'Add the red chillis' },
          ],
        },
      },
      user: { connect: { id: ulrik.id } },
    },
  });

  // Reviews
  await prisma.review.create({
    data: {
      title: 'Great chocolate cake recipe!',
      text: 'Great recipe!',
      rating: 5,
      recipe: { connect: { id: chocolateCake.id } },
      user: { connect: { id: syntyche.id } },
    },
  });

  await prisma.review.create({
    data: {
      title: 'Delicious recipe',
      text: 'This is a good recipe',
      rating: 4,
      recipe: { connect: { id: frenchCrepes.id } },
      user: { connect: { id: taqqiq.id } },
    },
  });

  await prisma.review.create({
    data: {
      title: 'Bad recipe',
      text: "This recipe doesn't make any sense",
      rating: 1,
      recipe: { connect: { id: frenchCrepes.id } },
      user: { connect: { id: ulrik.id } },
    },
  });
}

main();
