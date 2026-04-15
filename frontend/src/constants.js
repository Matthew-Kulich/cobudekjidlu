export const moods = [
  { value: "", label: "Každá nálada" },
  { value: "COMFORT", label: "Comfort" },
  { value: "QUICK", label: "Rychle hotové" },
  { value: "HEALTHY", label: "Fitness" },
  { value: "CELEBRATION", label: "Něco lepšího" },
  { value: "ADVENTUROUS", label: "Chci zkusit novinku" },
  { value: "LAZY_DAY", label: "Líný den" }
];

export const recipeTypes = ["BREAKFAST", "LUNCH", "DINNER", "DESSERT", "SNACK", "DRINK"];
export const cuisineTypes = ["CZECH", "ITALIAN", "INDIAN", "MEDITERRANEAN", "INTERNATIONAL"];
export const difficultyLevels = ["EASY", "MEDIUM", "HARD"];
export const visibilityOptions = ["PUBLIC", "PRIVATE"];
export const scopeOptions = [
  { value: "ALL", label: "Všechny recepty" },
  { value: "FAVORITES", label: "Oblíbené" },
  { value: "MINE", label: "Moje a uložené" },
  { value: "PRIVATE", label: "Moje soukromé" }
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
