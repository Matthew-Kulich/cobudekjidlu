export const moods = [
  { value: "", label: "Kazda nalada" },
  { value: "COMFORT", label: "Comfort" },
  { value: "QUICK", label: "Rychle hotove" },
  { value: "HEALTHY", label: "Fitness" },
  { value: "CELEBRATION", label: "Neco lepsiho" },
  { value: "ADVENTUROUS", label: "Chci zkusit novinku" },
  { value: "LAZY_DAY", label: "Liny den" }
];

export const recipeTypes = ["BREAKFAST", "LUNCH", "DINNER", "DESSERT", "SNACK", "DRINK"];
export const cuisineTypes = ["CZECH", "ITALIAN", "INDIAN", "MEDITERRANEAN", "INTERNATIONAL"];
export const difficultyLevels = ["EASY", "MEDIUM", "HARD"];
export const visibilityOptions = ["PUBLIC", "PRIVATE"];
export const scopeOptions = [
  { value: "ALL", label: "Vsechny recepty" },
  { value: "FAVORITES", label: "Oblibene" },
  { value: "MINE", label: "Moje recepty" },
  { value: "PRIVATE", label: "Moje soukrome" }
];

export function createEmptyIngredient() {
  return {
    name: "",
    amount: "",
    note: "",
    optionalIngredient: false,
    estimatedPriceCzk: "",
    priceStore: "",
    priceCheckedAt: "",
    priceSourceUrl: ""
  };
}

export function createInitialForm() {
  return {
    name: "",
    description: "",
    imageUrl: "/images/recipes/protein-oats.jpg",
    type: "DINNER",
    cuisine: "INTERNATIONAL",
    difficulty: "EASY",
    visibility: "PUBLIC",
    moodTags: ["HEALTHY"],
    prepMinutes: 10,
    cookMinutes: 20,
    lastCookedAt: "",
    calories: 500,
    proteinGrams: 30,
    carbsGrams: 40,
    fatGrams: 20,
    estimatedPortionPriceCzk: 90,
    priceStore: "BILLA",
    priceCheckedAt: "",
    priceSourceUrl: "",
    priceSourceLabel: "",
    ingredients: [createEmptyIngredient()],
    procedureStepsText: ""
  };
}

export const initialFilters = {
  type: "",
  cuisine: "",
  difficulty: "",
  mood: "",
  scope: "ALL"
};

export const initialAuthForm = {
  displayName: "",
  email: "",
  password: ""
};
