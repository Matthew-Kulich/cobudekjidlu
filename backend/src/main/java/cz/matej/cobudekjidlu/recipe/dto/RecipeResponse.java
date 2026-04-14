package cz.matej.cobudekjidlu.recipe.dto;

import cz.matej.cobudekjidlu.recipe.model.CuisineType;
import cz.matej.cobudekjidlu.recipe.model.DifficultyLevel;
import cz.matej.cobudekjidlu.recipe.model.MoodTag;
import cz.matej.cobudekjidlu.recipe.model.RecipeType;
import cz.matej.cobudekjidlu.recipe.model.RecipeVisibility;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

public record RecipeResponse(
        Long id,
        String name,
        String description,
        String imageUrl,
        Long ownerId,
        String ownerDisplayName,
        RecipeType type,
        CuisineType cuisine,
        DifficultyLevel difficulty,
        RecipeVisibility visibility,
        boolean favorite,
        Set<MoodTag> moodTags,
        Integer prepMinutes,
        Integer cookMinutes,
        Integer totalMinutes,
        LocalDateTime lastCookedAt,
        long hoursSinceLastCooked,
        Integer calories,
        BigDecimal proteinGrams,
        BigDecimal carbsGrams,
        BigDecimal fatGrams,
        BigDecimal estimatedPortionPriceCzk,
        String priceStore,
        LocalDate priceCheckedAt,
        String priceSourceUrl,
        String priceSourceLabel,
        List<IngredientResponse> ingredients,
        List<String> procedureSteps
) {
}

