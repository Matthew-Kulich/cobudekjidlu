import { useEffect, useMemo, useState } from "react";
import {
  createRecipe,
  favoriteRecipe,
  fetchCurrentUser,
  fetchRecipe,
  fetchRecipes,
  fetchSuggestions,
  login,
  logout,
  register,
  unfavoriteRecipe
} from "./api";
import { AuthPanel } from "./components/AuthPanel";
import { RecipeCard } from "./components/RecipeCard";
import { RecipeDetailModal } from "./components/RecipeDetailModal";
import { RecipeForm } from "./components/RecipeForm";
import { cuisineTypes, createEmptyIngredient, createInitialForm, initialAuthForm, initialFilters, moods, recipeTypes, difficultyLevels, scopeOptions } from "./constants";
import { formatEnum, normalizeNumber } from "./utils";

function App() {
  const [filters, setFilters] = useState(initialFilters);
  const [recipes, setRecipes] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [formData, setFormData] = useState(createInitialForm);
  const [currentUser, setCurrentUser] = useState(undefined);
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState(initialAuthForm);
  const [status, setStatus] = useState("Nacitam aplikaci...");
  const [error, setError] = useState("");

  useEffect(() => {
    void bootstrap();
  }, []);

  useEffect(() => {
    if (currentUser === undefined) {
      return;
    }

    void loadData(currentUser ? filters : { ...filters, scope: "ALL" });
  }, [filters, currentUser]);

  async function bootstrap() {
    try {
      setCurrentUser(await fetchCurrentUser());
    } catch {
      setCurrentUser(null);
    }
  }

  async function loadData(activeFilters) {
    try {
      const [recipeData, suggestionData] = await Promise.all([
        fetchRecipes(activeFilters),
        fetchSuggestions({ ...activeFilters, limit: 3 })
      ]);

      setRecipes(recipeData);
      setSuggestions(suggestionData);
      setStatus(activeFilters.scope === "ALL" ? "Prochazej komunitni i osobni recepty." : "Mas zapnuty osobni vyber receptu.");
      setError("");
    } catch (loadError) {
      setError(loadError.message);
      setStatus("Frontend ceka na dostupne API.");
      setRecipes([]);
      setSuggestions([]);
    }
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    try {
      const user = authMode === "login"
        ? await login({ email: authForm.email, password: authForm.password })
        : await register(authForm);
      setCurrentUser(user);
      setAuthForm(initialAuthForm);
      setError("");
    } catch (authError) {
      setError(authError.message);
    }
  }

  async function handleLogout() {
    await logout();
    setCurrentUser(null);
    setFilters((current) => ({ ...current, scope: "ALL" }));
    setSelectedRecipe(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const payload = {
      ...formData,
      prepMinutes: normalizeNumber(formData.prepMinutes),
      cookMinutes: normalizeNumber(formData.cookMinutes),
      calories: normalizeNumber(formData.calories),
      proteinGrams: normalizeNumber(formData.proteinGrams),
      carbsGrams: normalizeNumber(formData.carbsGrams),
      fatGrams: normalizeNumber(formData.fatGrams),
      estimatedPortionPriceCzk: normalizeNumber(formData.estimatedPortionPriceCzk),
      lastCookedAt: formData.lastCookedAt || null,
      priceCheckedAt: formData.priceCheckedAt || null,
      ingredients: formData.ingredients
        .filter((ingredient) => ingredient.name.trim() && ingredient.amount.trim())
        .map((ingredient) => ({
          ...ingredient,
          estimatedPriceCzk: normalizeNumber(ingredient.estimatedPriceCzk),
          priceCheckedAt: ingredient.priceCheckedAt || null,
          priceSourceUrl: ingredient.priceSourceUrl || null
        })),
      procedureSteps: formData.procedureStepsText.split("\n").map((step) => step.trim()).filter(Boolean)
    };

    try {
      const createdRecipe = await createRecipe(payload);
      setFormData(createInitialForm());
      setSelectedRecipe(createdRecipe);
      await loadData(filters);
    } catch (submitError) {
      setError(submitError.message);
    }
  }

  async function openRecipeDetail(recipeId) {
    try {
      setSelectedRecipe(await fetchRecipe(recipeId));
    } catch (detailError) {
      setError(detailError.message);
    }
  }

  async function toggleFavorite(recipe) {
    if (!currentUser) {
      setError("Pro oblibene se nejdriv prihlas.");
      return;
    }

    try {
      const updatedRecipe = recipe.favorite ? await unfavoriteRecipe(recipe.id) : await favoriteRecipe(recipe.id);
      setRecipes((current) => current.map((item) => item.id === updatedRecipe.id ? updatedRecipe : item));
      setSuggestions((current) => current.map((item) => item.id === updatedRecipe.id ? updatedRecipe : item));
      if (selectedRecipe?.id === updatedRecipe.id) {
        setSelectedRecipe(updatedRecipe);
      }
    } catch (favoriteError) {
      setError(favoriteError.message);
    }
  }

  function handleFieldChange(field, value) {
    setFormData((current) => ({ ...current, [field]: value }));
  }

  function handleMoodToggle(mood) {
    setFormData((current) => {
      const exists = current.moodTags.includes(mood);
      return { ...current, moodTags: exists ? current.moodTags.filter((item) => item !== mood) : [...current.moodTags, mood] };
    });
  }

  function updateIngredient(index, patch) {
    setFormData((current) => ({
      ...current,
      ingredients: current.ingredients.map((item, currentIndex) => currentIndex === index ? { ...item, ...patch } : item)
    }));
  }

  function addIngredient() {
    setFormData((current) => ({ ...current, ingredients: [...current.ingredients, createEmptyIngredient()] }));
  }

  function removeIngredient(index) {
    setFormData((current) => ({
      ...current,
      ingredients: current.ingredients.length === 1 ? [createEmptyIngredient()] : current.ingredients.filter((_, currentIndex) => currentIndex !== index)
    }));
  }

  const stats = useMemo(() => ({
    totalRecipes: recipes.length,
    averagePrice: recipes.length ? (recipes.reduce((sum, recipe) => sum + (Number(recipe.estimatedPortionPriceCzk) || 0), 0) / recipes.length).toFixed(0) : "0",
    favorites: recipes.filter((recipe) => recipe.favorite).length
  }), [recipes]);

  return (
    <div className="page-shell">
      <section className="hero">
        <div className="hero-copy-block">
          <p className="eyebrow">cobudekjidlu</p>
          <h1>Osobni kucharska aplikace pro recepty, oblibene a chytry vyber jidla.</h1>
          <p className="hero-copy">
            Prihlas se, ukladej svoje soukrome recepty, filtruj komunitni katalog a otevri si detail jidla i s postupem, nutricnimi hodnotami a cenou.
          </p>
          <div className="stats-row">
            <article className="stat-card"><span>{stats.totalRecipes}</span><p>viditelnych receptu</p></article>
            <article className="stat-card"><span>{stats.averagePrice} Kc</span><p>prumerna cena porce</p></article>
            <article className="stat-card"><span>{stats.favorites}</span><p>oblibenych v aktualnim vyberu</p></article>
          </div>
        </div>

        <AuthPanel
          currentUser={currentUser}
          authMode={authMode}
          authForm={authForm}
          error={error}
          status={status}
          onModeChange={setAuthMode}
          onAuthFormChange={(field, value) => setAuthForm((current) => ({ ...current, [field]: value }))}
          onSubmit={handleAuthSubmit}
          onLogout={handleLogout}
        />
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Filtry</p>
            <h2>Prohledavej komunitni, oblibene i soukrome recepty</h2>
          </div>
        </div>

        <div className="filter-grid">
          <label>
            Rozsah
            <select value={filters.scope} onChange={(event) => setFilters({ ...filters, scope: event.target.value })} disabled={!currentUser}>
              {scopeOptions.map((scope) => <option key={scope.value} value={scope.value}>{scope.label}</option>)}
            </select>
          </label>
          <label>
            Typ
            <select value={filters.type} onChange={(event) => setFilters({ ...filters, type: event.target.value })}>
              <option value="">Vse</option>
              {recipeTypes.map((type) => <option key={type} value={type}>{formatEnum(type)}</option>)}
            </select>
          </label>
          <label>
            Kuchyne
            <select value={filters.cuisine} onChange={(event) => setFilters({ ...filters, cuisine: event.target.value })}>
              <option value="">Vse</option>
              {cuisineTypes.map((cuisine) => <option key={cuisine} value={cuisine}>{formatEnum(cuisine)}</option>)}
            </select>
          </label>
          <label>
            Narocnost
            <select value={filters.difficulty} onChange={(event) => setFilters({ ...filters, difficulty: event.target.value })}>
              <option value="">Vse</option>
              {difficultyLevels.map((difficulty) => <option key={difficulty} value={difficulty}>{formatEnum(difficulty)}</option>)}
            </select>
          </label>
          <label>
            Nalada
            <select value={filters.mood} onChange={(event) => setFilters({ ...filters, mood: event.target.value })}>
              {moods.map((mood) => <option key={mood.value} value={mood.value}>{mood.label}</option>)}
            </select>
          </label>
        </div>
      </section>

      <section className="content-grid">
        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Navrhy</p>
              <h2>Co jsi dlouho nemel a stoji za navrat do rotace</h2>
            </div>
          </div>
          <div className="suggestion-grid">
            {suggestions.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} currentUser={currentUser} onDetail={openRecipeDetail} onFavorite={toggleFavorite} />
            ))}
          </div>
        </article>

        <RecipeForm
          currentUser={currentUser}
          formData={formData}
          onFieldChange={handleFieldChange}
          onToggleMood={handleMoodToggle}
          onIngredientChange={updateIngredient}
          onIngredientAdd={addIngredient}
          onIngredientRemove={removeIngredient}
          onSubmit={handleSubmit}
        />
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Katalog</p>
            <h2>Komunitni i osobni recepty s detailnim profilem</h2>
          </div>
        </div>
        <div className="table-grid">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} currentUser={currentUser} onDetail={openRecipeDetail} onFavorite={toggleFavorite} />
          ))}
        </div>
      </section>

      <RecipeDetailModal
        recipe={selectedRecipe}
        currentUser={currentUser}
        onClose={() => setSelectedRecipe(null)}
        onFavorite={toggleFavorite}
      />
    </div>
  );
}

export default App;
