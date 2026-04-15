import { memo } from "react";
import { formatEnum, formatHoursSince, formatLastCooked } from "../utils";

function RecipeCardComponent({
  recipe,
  currentUser,
  onDetail,
  onFavorite,
  onLibraryToggle,
  onConsumeToday,
  onEdit
}) {
  const lastSeenLabel = recipe.personalLastCookedAt ? formatLastCooked({ lastCookedAt: recipe.personalLastCookedAt }) : "Zatím bez záznamu";

  return (
    <article className="recipe-card detail-card compact-recipe-card">
      <div className="recipe-image recipe-image-placeholder" aria-hidden="true">
        <span>{formatEnum(recipe.type)}</span>
      </div>
      <div className="recipe-meta">
        <span>{formatEnum(recipe.type)}</span>
        <span>{formatEnum(recipe.cuisine)}</span>
        <span>{formatEnum(recipe.visibility)}</span>
      </div>
      <h3>{recipe.name}</h3>
      <p>{recipe.description}</p>
      <p className="muted">Autor: {recipe.ownerDisplayName}</p>

      <div className="metrics-grid">
        <div>
          <strong>{recipe.totalMinutes} min</strong>
          <span>celkem</span>
        </div>
        <div>
          <strong>{recipe.calories} kcal</strong>
          <span>na porci</span>
        </div>
        <div>
          <strong>{Number(recipe.estimatedPortionPriceCzk || 0).toFixed(0)} Kč</strong>
          <span>odhad porce</span>
        </div>
        <div>
          <strong>{lastSeenLabel}</strong>
          <span>naposledy jsi měl</span>
        </div>
      </div>

      <div className="nutrition-row">
        <span>B {recipe.proteinGrams} g</span>
        <span>S {recipe.carbsGrams} g</span>
        <span>T {recipe.fatGrams} g</span>
      </div>

      <p className="muted">
        {recipe.personalLastCookedAt ? `Tohle jídlo jsi měl ${formatHoursSince(recipe.hoursSinceLastCooked)}.` : "Zapiš si, kdy jsi ho měl naposledy."}
      </p>

      <div className="card-actions">
        <button className="ghost-button" type="button" onClick={() => onDetail(recipe.id)}>
          Detail jídla
        </button>
        {currentUser ? (
          <>
            <button className="ghost-button" type="button" onClick={() => onFavorite(recipe)}>
              {recipe.favorite ? "V oblíbených" : "Přidat do oblíbených"}
            </button>
            <button className="ghost-button" type="button" onClick={() => onLibraryToggle(recipe)}>
              {recipe.inLibrary ? "V mém seznamu" : "Přidat do mého seznamu"}
            </button>
            <button className="ghost-button" type="button" onClick={() => onConsumeToday(recipe)}>
              Měl jsem dneska
            </button>
            {recipe.editable ? (
              <button className="ghost-button" type="button" onClick={() => onEdit(recipe)}>
                Upravit recept
              </button>
            ) : null}
          </>
        ) : null}
      </div>
    </article>
  );
}

export const RecipeCard = memo(RecipeCardComponent);
