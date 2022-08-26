import { IngredientInput } from "./ingredient-input.model";

export interface NewRecipeInput {
  name: string;
  description: string;
  ingredients: IngredientInput[];
  steps: { description: string }[];
  categoriesIds: number[];
}
