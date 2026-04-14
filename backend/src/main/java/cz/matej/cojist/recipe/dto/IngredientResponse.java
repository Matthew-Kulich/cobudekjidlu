package cz.matej.cojist.recipe.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record IngredientResponse(
        String name,
        String amount,
        String note,
        boolean optionalIngredient,
        BigDecimal estimatedPriceCzk,
        String priceStore,
        LocalDate priceCheckedAt,
        String priceSourceUrl
) {
}
