package cz.matej.cojist.recipe.dto;

import cz.matej.cojist.recipe.model.CuisineType;
import cz.matej.cojist.recipe.model.DifficultyLevel;
import cz.matej.cojist.recipe.model.MoodTag;
import cz.matej.cojist.recipe.model.RecipeType;
import cz.matej.cojist.recipe.model.RecipeVisibility;
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
