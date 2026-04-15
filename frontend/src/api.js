const API_URL = import.meta.env.VITE_API_URL ?? "/api";

async function parseResponse(response) {
  if (!response.ok) {
    let message = `Požadavek na API selhal se stavem ${response.status}`;

    try {
      const payload = await response.json();
      if (payload.message) {
        message = payload.message;
      }
    } catch {
      try {
        const text = await response.text();
        if (text) {
          message = text;
        }
      } catch {
      }
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

function appendIfPresent(params, key, value) {
  if (value) {
    params.set(key, value);
  }
}

async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {})
    }
  });

  return parseResponse(response);
}

export async function fetchCurrentUser() {
  return apiFetch("/auth/me", { headers: {} });
}

export async function login(payload) {
  return apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function register(payload) {
  return apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function logout() {
  return apiFetch("/auth/logout", {
    method: "POST",
    body: "{}"
  });
}

export async function fetchRecipes(filters = {}) {
  const params = new URLSearchParams();
  appendIfPresent(params, "type", filters.type);
  appendIfPresent(params, "cuisine", filters.cuisine);
  appendIfPresent(params, "difficulty", filters.difficulty);
  appendIfPresent(params, "mood", filters.mood);
  appendIfPresent(params, "scope", filters.scope);

  const suffix = params.toString() ? `?${params.toString()}` : "";
  return apiFetch(`/recipes${suffix}`, { headers: {} });
}

export async function fetchRecipe(recipeId) {
  return apiFetch(`/recipes/${recipeId}`, { headers: {} });
}

export async function fetchSuggestions(filters = {}) {
  const params = new URLSearchParams();
  appendIfPresent(params, "mood", filters.mood);
  appendIfPresent(params, "cuisine", filters.cuisine);
  appendIfPresent(params, "difficulty", filters.difficulty);
  params.set("limit", String(filters.limit ?? 3));

  return apiFetch(`/recipes/discover?${params.toString()}`, { headers: {} });
}

export async function createRecipe(recipe) {
  return apiFetch("/recipes", {
    method: "POST",
    body: JSON.stringify(recipe)
  });
}

export async function updateRecipe(recipeId, recipe) {
  return apiFetch(`/recipes/${recipeId}`, {
    method: "PUT",
    body: JSON.stringify(recipe)
  });
}

export async function favoriteRecipe(recipeId) {
  return apiFetch(`/recipes/${recipeId}/favorite`, {
    method: "POST",
    body: "{}"
  });
}

export async function unfavoriteRecipe(recipeId) {
  return apiFetch(`/recipes/${recipeId}/favorite`, {
    method: "DELETE",
    body: "{}"
  });
}

export async function fetchLibrary() {
  return apiFetch("/recipes/library", { headers: {} });
}

export async function addRecipeToLibrary(recipeId) {
  return apiFetch(`/recipes/${recipeId}/library`, {
    method: "POST",
    body: "{}"
  });
}

export async function removeRecipeFromLibrary(recipeId) {
  return apiFetch(`/recipes/${recipeId}/library`, {
    method: "DELETE",
    body: "{}"
  });
}

export async function markRecipeConsumed(recipeId, consumedOn) {
  return apiFetch(`/recipes/${recipeId}/consume`, {
    method: "POST",
    body: JSON.stringify({ consumedOn })
  });
}
