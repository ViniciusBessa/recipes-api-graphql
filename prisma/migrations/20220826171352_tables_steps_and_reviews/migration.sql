/*
  Warnings:

  - You are about to drop the column `name` on the `ingredients` table. All the data in the column will be lost.
  - You are about to drop the column `weightKg` on the `ingredients` table. All the data in the column will be lost.
  - You are about to drop the `recipe_ingredients` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `description` to the `ingredients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `ingredients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recipeId` to the `ingredients` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "recipe_ingredients" DROP CONSTRAINT "recipe_ingredients_ingredientId_fkey";

-- DropForeignKey
ALTER TABLE "recipe_ingredients" DROP CONSTRAINT "recipe_ingredients_recipeId_fkey";

-- DropIndex
DROP INDEX "ingredients_name_key";

-- AlterTable
ALTER TABLE "ingredients" DROP COLUMN "name",
DROP COLUMN "weightKg",
ADD COLUMN     "description" VARCHAR(100) NOT NULL,
ADD COLUMN     "quantity" INTEGER NOT NULL,
ADD COLUMN     "recipeId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "recipe_ingredients";

-- CreateTable
CREATE TABLE "steps" (
    "id" SERIAL NOT NULL,
    "description" VARCHAR(200) NOT NULL,
    "recipeId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "text" VARCHAR(600) NOT NULL,
    "rating" DECIMAL(2,1) NOT NULL,
    "recipeId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ingredients" ADD CONSTRAINT "ingredients_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "steps" ADD CONSTRAINT "steps_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
