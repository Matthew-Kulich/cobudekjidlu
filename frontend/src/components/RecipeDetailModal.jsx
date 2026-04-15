import { useEffect, useState } from "react";
import { formatEnum, formatLastCooked } from "../utils";
import { SmartImage } from "./SmartImage";

function todayValue() {
  return new Date().toISOString().slice(0, 10);
}

export function RecipeDetailModal({
  recipe,
  isLoading,
  currentUser,
  onClose,
  onFavorite,
  onLibraryToggle,
  onConsume,
  onEdit
}) {
  const [consumedOn, setConsumedOn] = useState(todayValue());

  useEffect(() => {
    if (!recipe && !isLoading) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [recipe, isLoading, onClose]);

  useEffect(() => {
    setConsumedOn(todayValue());
  }, [recipe?.id]);

  if (!recipe && !isLoading) {
    return null;
  }

  return (
    <section className="detail-overlay" onClick={onClose}>
      <article className="detail-modal" onClick={(event) => event.stopPropagation()}>
        {isLoading && !recipe ? <p className="muted section-state">Načítám detail receptu...</p> : null}
        {!recipe ? null : (
          <>
            <button className="close-button" type="button" onClick={onClose}>
              Zavřít
            </button>
            <SmartImage className="detail-image" src={recipe.imageUrl} alt={recipe.name} loading="lazy" />
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
                <div className="detail-action-group">
                  <button className="ghost-button" type="button" onClick={() => onFavorite(recipe)}>
                    {recipe.favorite ? "Odebrat z oblíbených" : "Přidat do oblíbených"}
                  </button>
                  <button className="ghost-button" type="button" onClick={() => onLibraryToggle(recipe)}>
                    {recipe.inLibrary ? "V mém seznamu" : "Přidat do mého seznamu"}
                  </button>
                  {recipe.editable ? (
                    <button className="ghost-button" type="button" onClick={() => onEdit(recipe)}>
                      Upravit recept
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="detail-grid">
              <section className="detail-panel">
                <h3>Základní info</h3>
                <p>{recipe.description}</p>
                <div className="metrics-grid">
                  <div>
                    <strong>{recipe.totalMinutes} min</strong>
                    <span>celková doba</span>
                  </div>
                  <div>
                    <strong>{recipe.calories} kcal</strong>
                    <span>na porci</span>
                  </div>
                  <div>
                    <strong>{recipe.estimatedPortionPriceCzk} Kč</strong>
                    <span>{recipe.priceStore || "odhad"}</span>
                  </div>
                  <div>
                    <strong>{formatLastCooked(recipe)}</strong>
                    <span>naposledy jedeno</span>
                  </div>
                </div>
                <div className="nutrition-row">
                  <span>Bílkoviny {recipe.proteinGrams} g</span>
                  <span>Sacharidy {recipe.carbsGrams} g</span>
                  <span>Tuky {recipe.fatGrams} g</span>
                </div>
                {recipe.priceSourceUrl ? (
                  <a className="source-link" href={recipe.priceSourceUrl} target="_blank" rel="noreferrer">
                    {recipe.priceSourceLabel || "Zdroj ceny"}
                  </a>
                ) : null}
                {currentUser ? (
                  <div className="consume-box">
                    <button className="primary-button" type="button" onClick={() => onConsume(recipe, todayValue())}>
                      Měl jsem dneska
                    </button>
                    <label>
                      Jiný den
                      <input type="date" value={consumedOn} onChange={(event) => setConsumedOn(event.target.value)} />
                    </label>
                    <button className="ghost-button" type="button" onClick={() => onConsume(recipe, consumedOn)}>
                      Uložit datum
                    </button>
                  </div>
                ) : null}
              </section>

              <section className="detail-panel">
                <h3>Suroviny</h3>
                <ul className="ingredient-read-list">
                  {recipe.ingredients.map((ingredient) => (
                    <li key={`${ingredient.name}-${ingredient.amount}`}>
                      <span>
                        {ingredient.name} - {ingredient.amount}
                        {ingredient.optionalIngredient ? " (volitelné)" : ""}
                      </span>
                      {ingredient.estimatedPriceCzk ? (
                        <small>
                          {ingredient.estimatedPriceCzk} Kč
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
          </>
        )}
      </article>
    </section>
  );
}
