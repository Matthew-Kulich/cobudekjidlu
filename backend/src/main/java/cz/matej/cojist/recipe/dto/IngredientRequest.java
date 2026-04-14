package cz.matej.cojist.recipe.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;
import java.time.LocalDate;

public record IngredientRequest(
        @NotBlank String name,
        @NotBlank String amount,
        String note,
        boolean optionalIngredient,
        @DecimalMin("0.0") BigDecimal estimatedPriceCzk,
        String priceStore,
        LocalDate priceCheckedAt,
        String priceSourceUrl
) {
}
