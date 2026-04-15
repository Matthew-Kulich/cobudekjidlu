package cz.matej.cobudekjidlu.recipe.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record RecipeConsumptionRequest(
        @NotNull LocalDate consumedOn
) {
}
