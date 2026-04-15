const enumLabels = {
  ALL: "Všechny",
  FAVORITES: "Oblíbené",
  MINE: "Moje a uložené",
  PRIVATE: "Soukromé",
  PUBLIC: "Veřejné",
  BREAKFAST: "Snídaně",
  LUNCH: "Oběd",
  DINNER: "Večeře",
  DESSERT: "Dezert",
  SNACK: "Svačina",
  DRINK: "Nápoj",
  CZECH: "Česká",
  ITALIAN: "Italská",
  INDIAN: "Indická",
  MEDITERRANEAN: "Středomořská",
  INTERNATIONAL: "Mezinárodní",
  EASY: "Lehká",
  MEDIUM: "Střední",
  HARD: "Náročná"
};

export function formatEnum(value) {
  if (!value) {
    return "Neuvedeno";
  }

  if (enumLabels[value]) {
    return enumLabels[value];
  }

  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatLastCooked(recipe) {
  if (!recipe.lastCookedAt) {
    return "Zatím bez záznamu";
  }

  return new Intl.DateTimeFormat("cs-CZ", {
    dateStyle: "medium"
  }).format(new Date(recipe.lastCookedAt));
}

export function formatHoursSince(hours) {
  if (hours > 1000000) {
    return "Nikdy";
  }

  if (hours < 24) {
    return `před ${hours} h`;
  }

  return `před ${Math.floor(hours / 24)} dny`;
}

export function normalizeNumber(value) {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  return Number(value);
}
