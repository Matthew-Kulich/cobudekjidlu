package cz.matej.cobudekjidlu.recipe;

import cz.matej.cobudekjidlu.recipe.model.UserRecipeEntry;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRecipeEntryRepository extends JpaRepository<UserRecipeEntry, Long> {

    List<UserRecipeEntry> findByUser_Id(Long userId);

    Optional<UserRecipeEntry> findByUser_IdAndRecipe_Id(Long userId, Long recipeId);
}
