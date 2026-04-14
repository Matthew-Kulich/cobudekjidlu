package cz.matej.cobudekjidlu.recipe.dto;

import cz.matej.cobudekjidlu.recipe.model.CuisineType;
import cz.matej.cobudekjidlu.recipe.model.DifficultyLevel;
import cz.matej.cobudekjidlu.recipe.model.MoodTag;
import cz.matej.cobudekjidlu.recipe.model.RecipeType;
import cz.matej.cobudekjidlu.recipe.model.RecipeVisibility;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

public record CreateRecipeRequest(
        @NotBlank String name,
        String description,
        @NotBlank String imageUrl,
        @NotNull RecipeType type,
        @NotNull CuisineType cuisine,
        @NotNull DifficultyLevel difficulty,
        @NotNull RecipeVisibility visibility,
        @NotEmpty Set<MoodTag> moodTags,
        @NotNull @Min(1) @Max(480) Integer prepMinutes,
        @NotNull @Min(1) @Max(480) Integer cookMinutes,
        LocalDateTime lastCookedAt,
        @NotNull @Min(1) @Max(3000) Integer calories,
        @NotNull @DecimalMin("0.0") BigDecimal proteinGrams,
        @NotNull @DecimalMin("0.0") BigDecimal carbsGrams,
        @NotNull @DecimalMin("0.0") BigDecimal fatGrams,
        @DecimalMin("0.0") BigDecimal estimatedPortionPriceCzk,
        String priceStore,
        LocalDate priceCheckedAt,
        String priceSourceUrl,
        String priceSourceLabel,
        @Valid List<IngredientRequest> ingredients,
        List<String> procedureSteps
) {
}

