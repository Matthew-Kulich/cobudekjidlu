package cz.matej.cobudekjidlu.recipe;

import cz.matej.cobudekjidlu.recipe.model.MoodTag;
import cz.matej.cobudekjidlu.recipe.model.Recipe;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecipeRepository extends JpaRepository<Recipe, Long> {

    List<Recipe> findDistinctByMoodTagsContaining(MoodTag moodTag);
}

