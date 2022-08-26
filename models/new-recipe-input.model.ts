export interface NewRecipeInput {
  name: string;
  description: string;
  ingredients: { ingredientId: number; quantity: number }[];
  categoriesIds: number[];
}
