import {
  cuisineTypes,
  difficultyLevels,
  moods,
  recipeTypes,
  visibilityOptions
} from "../constants";
import { formatEnum } from "../utils";

export function RecipeForm({
  currentUser,
  formData,
  onFieldChange,
  onToggleMood,
  onIngredientChange,
  onIngredientAdd,
  onIngredientRemove,
  onSubmit
}) {
  if (!currentUser) {
    return (
      <article className="panel form-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Novy recept</p>
            <h2>Vlastni recept vytvori jen prihlaseny uzivatel</h2>
          </div>
        </div>
        <p className="muted">Pro vytvareni receptu se prihlas. Soukrome recepty pak uvidis jen ty.</p>
      </article>
    );
  }

  return (
    <article className="panel form-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Novy recept</p>
          <h2>Pridat vlastni jidlo i s postupem, surovinami a cenou</h2>
        </div>
      </div>

      <form className="recipe-form" onSubmit={onSubmit}>
        <label>
          Nazev
          <input value={formData.name} onChange={(event) => onFieldChange("name", event.target.value)} required />
        </label>

        <label>
          URL obrazku
          <input value={formData.imageUrl} onChange={(event) => onFieldChange("imageUrl", event.target.value)} required />
        </label>

        <label>
          Popis
          <textarea rows="3" value={formData.description} onChange={(event) => onFieldChange("description", event.target.value)} />
        </label>

        <div className="form-row">
          <label>
            Typ
            <select value={formData.type} onChange={(event) => onFieldChange("type", event.target.value)}>
              {recipeTypes.map((type) => <option key={type} value={type}>{formatEnum(type)}</option>)}
            </select>
          </label>

          <label>
            Kuchyne
            <select value={formData.cuisine} onChange={(event) => onFieldChange("cuisine", event.target.value)}>
              {cuisineTypes.map((cuisine) => <option key={cuisine} value={cuisine}>{formatEnum(cuisine)}</option>)}
            </select>
          </label>

          <label>
            Viditelnost
            <select value={formData.visibility} onChange={(event) => onFieldChange("visibility", event.target.value)}>
              {visibilityOptions.map((visibility) => <option key={visibility} value={visibility}>{formatEnum(visibility)}</option>)}
            </select>
          </label>
        </div>

        <div className="form-row">
          <label>
            Narocnost
            <select value={formData.difficulty} onChange={(event) => onFieldChange("difficulty", event.target.value)}>
              {difficultyLevels.map((difficulty) => <option key={difficulty} value={difficulty}>{formatEnum(difficulty)}</option>)}
            </select>
          </label>

          <label>
            Priprava
            <input type="number" min="0" value={formData.prepMinutes} onChange={(event) => onFieldChange("prepMinutes", event.target.value)} />
          </label>

          <label>
            Vareni
            <input type="number" min="0" value={formData.cookMinutes} onChange={(event) => onFieldChange("cookMinutes", event.target.value)} />
          </label>
        </div>

        <div className="form-row">
          <label>
            Kcal
            <input type="number" min="1" value={formData.calories} onChange={(event) => onFieldChange("calories", event.target.value)} />
          </label>

          <label>
            Bilkoviny
            <input type="number" step="0.1" value={formData.proteinGrams} onChange={(event) => onFieldChange("proteinGrams", event.target.value)} />
          </label>

          <label>
            Sacharidy
            <input type="number" step="0.1" value={formData.carbsGrams} onChange={(event) => onFieldChange("carbsGrams", event.target.value)} />
          </label>

          <label>
            Tuky
            <input type="number" step="0.1" value={formData.fatGrams} onChange={(event) => onFieldChange("fatGrams", event.target.value)} />
          </label>
        </div>

        <div className="form-row">
          <label>
            Cena porce
            <input type="number" step="0.1" value={formData.estimatedPortionPriceCzk} onChange={(event) => onFieldChange("estimatedPortionPriceCzk", event.target.value)} />
          </label>

          <label>
            Obchod
            <input value={formData.priceStore} onChange={(event) => onFieldChange("priceStore", event.target.value)} />
          </label>

          <label>
            Datum ceny
            <input type="date" value={formData.priceCheckedAt} onChange={(event) => onFieldChange("priceCheckedAt", event.target.value)} />
          </label>
        </div>

        <label>
          Zdroj ceny
          <input value={formData.priceSourceUrl} onChange={(event) => onFieldChange("priceSourceUrl", event.target.value)} />
        </label>

        <label>
          Naposledy jedeno
          <input type="datetime-local" value={formData.lastCookedAt} onChange={(event) => onFieldChange("lastCookedAt", event.target.value)} />
        </label>

        <fieldset>
          <legend>Nalady</legend>
          <div className="chip-row">
            {moods.filter((mood) => mood.value).map((mood) => (
              <button
                key={mood.value}
                type="button"
                className={formData.moodTags.includes(mood.value) ? "chip active" : "chip"}
                onClick={() => onToggleMood(mood.value)}
              >
                {mood.label}
              </button>
            ))}
          </div>
        </fieldset>

        <label>
          Postup pripravy
          <textarea
            rows="5"
            value={formData.procedureStepsText}
            onChange={(event) => onFieldChange("procedureStepsText", event.target.value)}
            placeholder="Kazdy krok napis na novy radek"
          />
        </label>

        <fieldset>
          <legend>Suroviny</legend>
          <div className="ingredient-list">
            {formData.ingredients.map((ingredient, index) => (
              <div key={`${ingredient.name}-${index}`} className="ingredient-card">
                <div className="form-row">
                  <label>
                    Nazev
                    <input value={ingredient.name} onChange={(event) => onIngredientChange(index, { name: event.target.value })} />
                  </label>

                  <label>
                    Mnozstvi
                    <input value={ingredient.amount} onChange={(event) => onIngredientChange(index, { amount: event.target.value })} />
                  </label>
                </div>

                <div className="form-row">
                  <label>
                    Cena
                    <input type="number" step="0.1" value={ingredient.estimatedPriceCzk} onChange={(event) => onIngredientChange(index, { estimatedPriceCzk: event.target.value })} />
                  </label>

                  <label>
                    Obchod
                    <input value={ingredient.priceStore} onChange={(event) => onIngredientChange(index, { priceStore: event.target.value })} />
                  </label>

                  <label>
                    Zdroj
                    <input value={ingredient.priceSourceUrl} onChange={(event) => onIngredientChange(index, { priceSourceUrl: event.target.value })} />
                  </label>
                </div>

                <label className="checkbox-row">
                  <input type="checkbox" checked={ingredient.optionalIngredient} onChange={(event) => onIngredientChange(index, { optionalIngredient: event.target.checked })} />
                  Volitelna surovina
                </label>

                <button type="button" className="ghost-button" onClick={() => onIngredientRemove(index)}>
                  Odebrat surovinu
                </button>
              </div>
            ))}
          </div>

          <button type="button" className="ghost-button" onClick={onIngredientAdd}>
            Pridat dalsi surovinu
          </button>
        </fieldset>

        <button className="primary-button" type="submit">
          Ulozit recept
        </button>
      </form>
    </article>
  );
}
