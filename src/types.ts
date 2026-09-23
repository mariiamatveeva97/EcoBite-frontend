export interface User {
  id: string;
  email: string;
  display_name?: string;
}

export interface Profile {
  id: string;
  email: string;
  created_at?: string;
  display_name?: string | null;
  daily_calorie_target?: number | null;
  dietary_preferences?: string[] | null;
  allergies?: string[] | null;
  cooking_experience_level?: string | null;
  preferred_cooking_time_minutes?: number | null;
}

export interface Ingredient {
  id: string;
  user_id: string;
  name: string;
  quantity: number;
  unit: string;
  category?: string | null;
  expiration_date?: string | null;
  created_at: string;
}

export interface RecipeIngredient {
  ingredient_name: string;
  amount: number;
  unit: string;
}

export interface Nutrition {
  calories: number;
  proteins: number;
  fats: number;
  carbs: number;
  nutri_score: string;
  calories_per_serving: number;
  proteins_per_serving: number;
  fats_per_serving: number;
  carbs_per_serving: number;
}

export interface Energy {
  estimated_kwh: number;
  co2_impact_grams: number;
  energy_efficiency_label: string;
  estimated_cost_eur: number;
}

export interface Recipe {
  id: string;
  user_id?: string | null;
  title: string;
  description?: string | null;
  instructions: string[];
  cooking_time_minutes: number;
  servings?: number | null;
  tags?: string[] | null;
  created_at: string;
  ingredients: RecipeIngredient[];
  nutrition?: Nutrition | null;
  energy?: Energy | null;
}