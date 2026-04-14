export function formatEnum(value) {
  if (!value) {
    return "Neuvedeno";
  }

  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatLastCooked(recipe) {
  if (!recipe.lastCookedAt) {
    return "Zatim bez zaznamu";
  }

  return new Intl.DateTimeFormat("cs-CZ", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(recipe.lastCookedAt));
}

export function formatHoursSince(hours) {
  if (hours > 1000000) {
    return "Nikdy";
  }

  if (hours < 24) {
    return `pred ${hours} h`;
  }

  return `pred ${Math.floor(hours / 24)} dny`;
}

export function normalizeNumber(value) {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  return Number(value);
}
