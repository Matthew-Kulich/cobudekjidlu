import { formatEnum, formatLastCooked } from "../utils";

export function RecipeDetailModal({ recipe, currentUser, onClose, onFavorite }) {
  if (!recipe) {
    return null;
  }

  return (
    <section className="detail-overlay" onClick={onClose}>
      <article className="detail-modal" onClick={(event) => event.stopPropagation()}>
        <button className="close-button" type="button" onClick={onClose}>
          Zavrit
        </button>
        <img className="detail-image" src={recipe.imageUrl} alt={recipe.name} />
        <div className="detail-header">
          <div>
            <p className="eyebrow">Detail receptu</p>
            <h2>{recipe.name}</h2>
            <p className="muted">
              {recipe.ownerDisplayName} • {formatEnum(recipe.visibility)} •{" "}
              {formatEnum(recipe.difficulty)}
            </p>
          </div>
          {currentUser ? (
            <button className="ghost-button" type="button" onClick={() => onFavorite(recipe)}>
              {recipe.favorite ? "Odebrat z oblibenych" : "Pridat do oblibenych"}
            </button>
          ) : null}
        </div>

        <div className="detail-grid">
          <section className="detail-panel">
            <h3>Zakladni info</h3>
            <p>{recipe.description}</p>
            <div className="metrics-grid">
              <div>
                <strong>{recipe.totalMinutes} min</strong>
                <span>celkova doba</span>
              </div>
              <div>
                <strong>{recipe.calories} kcal</strong>
                <span>na porci</span>
              </div>
              <div>
                <strong>{recipe.estimatedPortionPriceCzk} Kc</strong>
                <span>{recipe.priceStore || "odhad"}</span>
              </div>
              <div>
                <strong>{formatLastCooked(recipe)}</strong>
                <span>naposledy jedeno</span>
              </div>
            </div>
            <div className="nutrition-row">
              <span>Bilkoviny {recipe.proteinGrams} g</span>
              <span>Sacharidy {recipe.carbsGrams} g</span>
              <span>Tuky {recipe.fatGrams} g</span>
            </div>
            {recipe.priceSourceUrl ? (
              <a className="source-link" href={recipe.priceSourceUrl} target="_blank" rel="noreferrer">
                {recipe.priceSourceLabel || "Zdroj ceny"}
              </a>
            ) : null}
          </section>

          <section className="detail-panel">
            <h3>Suroviny</h3>
            <ul className="ingredient-read-list">
              {recipe.ingredients.map((ingredient) => (
                <li key={`${ingredient.name}-${ingredient.amount}`}>
                  <span>
                    {ingredient.name} - {ingredient.amount}
                    {ingredient.optionalIngredient ? " (volitelne)" : ""}
                  </span>
                  {ingredient.estimatedPriceCzk ? (
                    <small>
                      {ingredient.estimatedPriceCzk} Kc
                      {ingredient.priceStore ? ` / ${ingredient.priceStore}` : ""}
                    </small>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>

          <section className="detail-panel full-width">
            <h3>Postup</h3>
            <ol className="step-list">
              {recipe.procedureSteps.map((step, index) => (
                <li key={`${step}-${index}`}>{step}</li>
              ))}
            </ol>
          </section>
        </div>
      </article>
    </section>
  );
}
