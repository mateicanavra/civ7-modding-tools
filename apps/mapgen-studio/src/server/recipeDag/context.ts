import type { RecipeDagResult } from "./schema";

export type RecipeDagService = Readonly<{
  getRecipeDag(recipeId: string): Promise<RecipeDagResult>;
}>;

export type RecipeDagContext = Readonly<{
  recipeDagService: RecipeDagService;
}>;
