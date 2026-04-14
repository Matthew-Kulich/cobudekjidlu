import { formatEnum, formatHoursSince, formatLastCooked } from "../utils";

export function RecipeCard({ recipe, currentUser, onDetail, onFavorite }) {
  return (
    <article className="recipe-card detail-card">
      <img className="recipe-image" src={recipe.imageUrl} alt={recipe.name} />
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
          <strong>{Number(recipe.estimatedPortionPriceCzk || 0).toFixed(0)} Kc</strong>
          <span>odhad porce</span>
        </div>
        <div>
          <strong>{formatLastCooked(recipe)}</strong>
          <span>naposledy</span>
        </div>
      </div>

      <div className="nutrition-row">
        <span>B {recipe.proteinGrams} g</span>
        <span>S {recipe.carbsGrams} g</span>
        <span>T {recipe.fatGrams} g</span>
      </div>

      <p className="muted">Tohle jidlo jsi mel {formatHoursSince(recipe.hoursSinceLastCooked)}.</p>

      <div className="card-actions">
        <button className="ghost-button" type="button" onClick={() => onDetail(recipe.id)}>
          Detail jidla
        </button>
        {currentUser ? (
          <button className="ghost-button" type="button" onClick={() => onFavorite(recipe)}>
            {recipe.favorite ? "V oblibenych" : "Pridat do oblibenych"}
          </button>
        ) : null}
      </div>
    </article>
  );
}
