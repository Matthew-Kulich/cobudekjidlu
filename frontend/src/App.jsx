import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import {
  addRecipeToLibrary,
  createRecipe,
  favoriteRecipe,
  fetchCurrentUser,
  fetchLibrary,
  fetchRecipe,
  fetchRecipes,
  fetchSuggestions,
  login,
  logout,
  markRecipeConsumed,
  register,
  removeRecipeFromLibrary,
  unfavoriteRecipe,
  updateRecipe
} from "./api";
import { AuthPanel } from "./components/AuthPanel";
import { RecipeCard } from "./components/RecipeCard";
import { RecipeDetailModal } from "./components/RecipeDetailModal";
import { RecipeForm } from "./components/RecipeForm";
import {
  cuisineTypes,
  createEmptyIngredient,
  createInitialForm,
  difficultyLevels,
  initialAuthForm,
  initialFilters,
  moods,
  recipeTypes,
  scopeOptions
} from "./constants";
import { formatEnum, normalizeNumber } from "./utils";

function buildRecipePayload(formData) {
  return {
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
}

function toFormData(recipe) {
  return {
    name: recipe.name,
    description: recipe.description ?? "",
    imageUrl: recipe.imageUrl ?? "",
    type: recipe.type,
    cuisine: recipe.cuisine,
    difficulty: recipe.difficulty,
    visibility: recipe.visibility,
    moodTags: recipe.moodTags ?? [],
    prepMinutes: recipe.prepMinutes,
    cookMinutes: recipe.cookMinutes,
    lastCookedAt: recipe.lastCookedAt ? recipe.lastCookedAt.slice(0, 16) : "",
    calories: recipe.calories,
    proteinGrams: recipe.proteinGrams,
    carbsGrams: recipe.carbsGrams,
    fatGrams: recipe.fatGrams,
    estimatedPortionPriceCzk: recipe.estimatedPortionPriceCzk ?? "",
    priceStore: recipe.priceStore ?? "",
    priceCheckedAt: recipe.priceCheckedAt ?? "",
    priceSourceUrl: recipe.priceSourceUrl ?? "",
    priceSourceLabel: recipe.priceSourceLabel ?? "",
    ingredients: recipe.ingredients?.length
      ? recipe.ingredients.map((ingredient) => ({
        name: ingredient.name ?? "",
        amount: ingredient.amount ?? "",
        note: ingredient.note ?? "",
        optionalIngredient: ingredient.optionalIngredient ?? false,
        estimatedPriceCzk: ingredient.estimatedPriceCzk ?? "",
        priceStore: ingredient.priceStore ?? "",
        priceCheckedAt: ingredient.priceCheckedAt ?? "",
        priceSourceUrl: ingredient.priceSourceUrl ?? ""
      }))
      : [createEmptyIngredient()],
    procedureStepsText: recipe.procedureSteps?.join("\n") ?? ""
  };
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function App() {
  const [activeView, setActiveView] = useState("discover");
  const [filters, setFilters] = useState(initialFilters);
  const [recipes, setRecipes] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [libraryRecipes, setLibraryRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [formData, setFormData] = useState(createInitialForm);
  const [editingRecipeId, setEditingRecipeId] = useState(null);
  const [currentUser, setCurrentUser] = useState(undefined);
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState(initialAuthForm);
  const [status, setStatus] = useState("Načítám aplikaci...");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLibraryLoading, setIsLibraryLoading] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const requestSequenceRef = useRef(0);
  const deferredFilters = useDeferredValue(filters);

  useEffect(() => {
    void bootstrap();
  }, []);

  useEffect(() => {
    if (currentUser === undefined) {
      return;
    }

    void loadDiscover(currentUser ? deferredFilters : { ...deferredFilters, scope: "ALL" });
  }, [deferredFilters, currentUser]);

  useEffect(() => {
    if (currentUser) {
      void loadLibrary(currentUser);
    } else {
      setLibraryRecipes([]);
    }
  }, [currentUser]);

  async function bootstrap() {
    try {
      setCurrentUser(await fetchCurrentUser());
    } catch {
      setCurrentUser(null);
    }
  }

  async function loadDiscover(activeFilters) {
    const requestId = ++requestSequenceRef.current;

    try {
      setIsLoading(true);
      const [recipeData, suggestionData] = await Promise.all([
        fetchRecipes(activeFilters),
        fetchSuggestions({ ...activeFilters, limit: 3 })
      ]);

      if (requestId !== requestSequenceRef.current) {
        return;
      }

      setRecipes(recipeData);
      setSuggestions(suggestionData);
      setStatus(activeFilters.scope === "ALL" ? "Procházej komunitní i osobní recepty." : "Máš zapnutý výběr podle vlastní knihovny.");
      setError("");
    } catch (loadError) {
      if (requestId !== requestSequenceRef.current) {
        return;
      }

      setError(loadError.message);
      setStatus("Frontend čeká na dostupné API.");
      setRecipes([]);
      setSuggestions([]);
    } finally {
      if (requestId === requestSequenceRef.current) {
        setIsLoading(false);
      }
    }
  }

  async function loadLibrary(user = currentUser) {
    if (!user) {
      return;
    }

    try {
      setIsLibraryLoading(true);
      setLibraryRecipes(await fetchLibrary());
    } catch (libraryError) {
      setError(libraryError.message);
    } finally {
      setIsLibraryLoading(false);
    }
  }

  async function refreshAllViews() {
    const activeFilters = currentUser ? deferredFilters : { ...deferredFilters, scope: "ALL" };
    await Promise.all([
      loadDiscover(activeFilters),
      currentUser ? loadLibrary(currentUser) : Promise.resolve()
    ]);
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    try {
      const user = authMode === "login"
        ? await login({ email: authForm.email, password: authForm.password })
        : await register(authForm);
      setCurrentUser(user);
      setAuthForm(initialAuthForm);
      setActiveView("my-recipes");
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
    setEditingRecipeId(null);
    setFormData(createInitialForm());
    setActiveView("discover");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const payload = buildRecipePayload(formData);

    try {
      const savedRecipe = editingRecipeId
        ? await updateRecipe(editingRecipeId, payload)
        : await createRecipe(payload);

      setEditingRecipeId(null);
      setFormData(createInitialForm());
      setSelectedRecipe(savedRecipe);
      setActiveView("my-recipes");
      await refreshAllViews();
    } catch (submitError) {
      setError(submitError.message);
    }
  }

  async function openRecipeDetail(recipeId) {
    try {
      setIsDetailLoading(true);
      setSelectedRecipe(await fetchRecipe(recipeId));
    } catch (detailError) {
      setError(detailError.message);
    } finally {
      setIsDetailLoading(false);
    }
  }

  async function toggleFavorite(recipe) {
    if (!currentUser) {
      setError("Pro oblíbené se nejdřív přihlas.");
      return;
    }

    try {
      const updatedRecipe = recipe.favorite ? await unfavoriteRecipe(recipe.id) : await favoriteRecipe(recipe.id);
      setSelectedRecipe((current) => current?.id === updatedRecipe.id ? updatedRecipe : current);
      await refreshAllViews();
    } catch (favoriteError) {
      setError(favoriteError.message);
    }
  }

  async function toggleLibrary(recipe) {
    if (!currentUser) {
      setError("Pro vlastní seznam se nejdřív přihlas.");
      return;
    }

    try {
      const updatedRecipe = recipe.inLibrary ? await removeRecipeFromLibrary(recipe.id) : await addRecipeToLibrary(recipe.id);
      setSelectedRecipe((current) => current?.id === updatedRecipe.id ? updatedRecipe : current);
      await refreshAllViews();
    } catch (libraryError) {
      setError(libraryError.message);
    }
  }

  async function handleConsume(recipe, consumedOn = todayIsoDate()) {
    if (!currentUser) {
      setError("Pro záznam jídla se nejdřív přihlas.");
      return;
    }

    try {
      const updatedRecipe = await markRecipeConsumed(recipe.id, consumedOn);
      setSelectedRecipe((current) => current?.id === updatedRecipe.id ? updatedRecipe : current);
      setActiveView("my-recipes");
      await refreshAllViews();
    } catch (consumeError) {
      setError(consumeError.message);
    }
  }

  function startEditing(recipe) {
    setEditingRecipeId(recipe.id);
    setFormData(toFormData(recipe));
    setActiveView("my-recipes");
    setSelectedRecipe(null);
  }

  function cancelEditing() {
    setEditingRecipeId(null);
    setFormData(createInitialForm());
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

  const filterSummary = useMemo(() => {
    const selectedCount = Object.entries(filters).filter(([key, value]) => key !== "scope" && Boolean(value)).length;
    return selectedCount ? `${selectedCount} aktivní filtry` : "Bez aktivních filtrů";
  }, [filters]);

  return (
    <div className="page-shell">
      <section className="hero">
        <div className="hero-copy-block">
          <p className="eyebrow">cobudekjidlu</p>
          <h1>Společný pool receptů, tvoje vlastní knihovna a rychlý zápis toho, co jsi měl.</h1>
          <p className="hero-copy">
            Procházej komunitní recepty, přidávej si je do svého seznamu, vytvářej vlastní jídla a sleduj, kdy sis je dal naposledy.
          </p>
          <div className="stats-row">
            <article className="stat-card"><span>{stats.totalRecipes}</span><p>viditelných receptů</p></article>
            <article className="stat-card"><span>{stats.averagePrice} Kč</span><p>průměrná cena porce</p></article>
            <article className="stat-card"><span>{currentUser ? libraryRecipes.length : 0}</span><p>v mém seznamu</p></article>
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
        <div className="view-switch">
          <button
            className={activeView === "discover" ? "chip active" : "chip"}
            type="button"
            onClick={() => setActiveView("discover")}
          >
            Objevovat recepty
          </button>
          {currentUser ? (
            <button
              className={activeView === "my-recipes" ? "chip active" : "chip"}
              type="button"
              onClick={() => setActiveView("my-recipes")}
            >
              Můj seznam
            </button>
          ) : null}
        </div>
      </section>

      {activeView === "discover" ? (
        <>
          <section className="panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Filtry</p>
                <h2>Prohledávej komunitní, oblíbené i soukromé recepty</h2>
              </div>
              <button
                className="ghost-button mobile-filter-toggle"
                type="button"
                onClick={() => setIsMobileFiltersOpen((current) => !current)}
              >
                {isMobileFiltersOpen ? "Skrýt filtry" : "Upravit filtry"}
              </button>
            </div>

            <div className="filter-summary-row">
              <span className="tag">{filterSummary}</span>
              {isLoading ? <span className="tag">Načítám data...</span> : <span className="tag">{recipes.length} receptů</span>}
            </div>

            <div className={`filter-grid ${isMobileFiltersOpen ? "filter-grid-open" : ""}`}>
              <label>
                Rozsah
                <select value={filters.scope} onChange={(event) => setFilters({ ...filters, scope: event.target.value })} disabled={!currentUser}>
                  {scopeOptions.map((scope) => <option key={scope.value} value={scope.value}>{scope.label}</option>)}
                </select>
              </label>
              <label>
                Typ
                <select value={filters.type} onChange={(event) => setFilters({ ...filters, type: event.target.value })}>
                  <option value="">Vše</option>
                  {recipeTypes.map((type) => <option key={type} value={type}>{formatEnum(type)}</option>)}
                </select>
              </label>
              <label>
                Kuchyně
                <select value={filters.cuisine} onChange={(event) => setFilters({ ...filters, cuisine: event.target.value })}>
                  <option value="">Vše</option>
                  {cuisineTypes.map((cuisine) => <option key={cuisine} value={cuisine}>{formatEnum(cuisine)}</option>)}
                </select>
              </label>
              <label>
                Náročnost
                <select value={filters.difficulty} onChange={(event) => setFilters({ ...filters, difficulty: event.target.value })}>
                  <option value="">Vše</option>
                  {difficultyLevels.map((difficulty) => <option key={difficulty} value={difficulty}>{formatEnum(difficulty)}</option>)}
                </select>
              </label>
              <label>
                Nálada
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
                  <p className="eyebrow">Návrhy</p>
                  <h2>Co jsi dlouho neměl a stojí za návrat do rotace</h2>
                </div>
              </div>
              {isLoading ? <p className="muted section-state">Načítám doporučené recepty...</p> : null}
              {!isLoading && suggestions.length === 0 ? <p className="muted section-state">Zatím tu nic není. Zkus povolit víc receptů nebo ubrat filtry.</p> : null}
              {suggestions.length > 0 ? (
                <div className="suggestion-grid">
                  {suggestions.map((recipe) => (
                    <RecipeCard
                      key={recipe.id}
                      recipe={recipe}
                      currentUser={currentUser}
                      onDetail={openRecipeDetail}
                      onFavorite={toggleFavorite}
                      onLibraryToggle={toggleLibrary}
                      onConsumeToday={(item) => handleConsume(item, todayIsoDate())}
                      onEdit={startEditing}
                    />
                  ))}
                </div>
              ) : null}
            </article>

            <RecipeForm
              currentUser={currentUser}
              formData={formData}
              isEditing={Boolean(editingRecipeId)}
              onFieldChange={handleFieldChange}
              onToggleMood={handleMoodToggle}
              onIngredientChange={updateIngredient}
              onIngredientAdd={addIngredient}
              onIngredientRemove={removeIngredient}
              onSubmit={handleSubmit}
              onCancelEdit={cancelEditing}
            />
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Katalog</p>
                <h2>Komunitní i osobní recepty s detailním profilem</h2>
              </div>
            </div>
            {isLoading ? <p className="muted section-state">Načítám katalog receptů...</p> : null}
            {!isLoading && recipes.length === 0 ? <p className="muted section-state">Tomuhle výběru teď neodpovídá žádný recept.</p> : null}
            {recipes.length > 0 ? (
              <div className="table-grid">
                {recipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    currentUser={currentUser}
                    onDetail={openRecipeDetail}
                    onFavorite={toggleFavorite}
                    onLibraryToggle={toggleLibrary}
                    onConsumeToday={(item) => handleConsume(item, todayIsoDate())}
                    onEdit={startEditing}
                  />
                ))}
              </div>
            ) : null}
          </section>
        </>
      ) : (
        <>
          <section className="content-grid">
            <article className="panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">Můj seznam</p>
                  <h2>Recepty, které sis uložil nebo sám vytvořil</h2>
                </div>
              </div>
              {isLibraryLoading ? <p className="muted section-state">Načítám tvůj seznam...</p> : null}
              {!isLibraryLoading && libraryRecipes.length === 0 ? <p className="muted section-state">Zatím tu nic není. Přidej si recept ze společného poolu nebo vytvoř vlastní.</p> : null}
              {libraryRecipes.length > 0 ? (
                <div className="table-grid">
                  {libraryRecipes.map((recipe) => (
                    <RecipeCard
                      key={recipe.id}
                      recipe={recipe}
                      currentUser={currentUser}
                      onDetail={openRecipeDetail}
                      onFavorite={toggleFavorite}
                      onLibraryToggle={toggleLibrary}
                      onConsumeToday={(item) => handleConsume(item, todayIsoDate())}
                      onEdit={startEditing}
                    />
                  ))}
                </div>
              ) : null}
            </article>

            <RecipeForm
              currentUser={currentUser}
              formData={formData}
              isEditing={Boolean(editingRecipeId)}
              onFieldChange={handleFieldChange}
              onToggleMood={handleMoodToggle}
              onIngredientChange={updateIngredient}
              onIngredientAdd={addIngredient}
              onIngredientRemove={removeIngredient}
              onSubmit={handleSubmit}
              onCancelEdit={cancelEditing}
            />
          </section>
        </>
      )}

      <RecipeDetailModal
        recipe={selectedRecipe}
        isLoading={isDetailLoading}
        currentUser={currentUser}
        onClose={() => setSelectedRecipe(null)}
        onFavorite={toggleFavorite}
        onLibraryToggle={toggleLibrary}
        onConsume={handleConsume}
        onEdit={startEditing}
      />
    </div>
  );
}

export default App;
