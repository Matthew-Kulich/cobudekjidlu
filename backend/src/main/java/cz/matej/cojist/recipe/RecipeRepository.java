package cz.matej.cojist.recipe;

import cz.matej.cojist.recipe.model.MoodTag;
import cz.matej.cojist.recipe.model.Recipe;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecipeRepository extends JpaRepository<Recipe, Long> {

    List<Recipe> findDistinctByMoodTagsContaining(MoodTag moodTag);
}
