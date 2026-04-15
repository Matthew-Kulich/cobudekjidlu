package cz.matej.cobudekjidlu.recipe;

import cz.matej.cobudekjidlu.recipe.dto.CreateRecipeRequest;
import cz.matej.cobudekjidlu.recipe.dto.RecipeConsumptionRequest;
import cz.matej.cobudekjidlu.recipe.dto.RecipeResponse;
import cz.matej.cobudekjidlu.recipe.model.CuisineType;
import cz.matej.cobudekjidlu.recipe.model.DifficultyLevel;
import cz.matej.cobudekjidlu.recipe.model.MoodTag;
import cz.matej.cobudekjidlu.recipe.model.RecipeScope;
import cz.matej.cobudekjidlu.recipe.model.RecipeType;
import cz.matej.cobudekjidlu.user.AuthService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/recipes")
public class RecipeController {

    private final RecipeService recipeService;
    private final AuthService authService;

    public RecipeController(RecipeService recipeService, AuthService authService) {
        this.recipeService = recipeService;
        this.authService = authService;
    }

    @GetMapping
    public List<RecipeResponse> getRecipes(
            @RequestParam(required = false) RecipeType type,
            @RequestParam(required = false) CuisineType cuisine,
            @RequestParam(required = false) DifficultyLevel difficulty,
            @RequestParam(required = false) MoodTag mood,
            @RequestParam(defaultValue = "ALL") RecipeScope scope,
            HttpSession session
    ) {
        return recipeService.getAllRecipes(type, cuisine, difficulty, mood, scope, authService.findCurrentUser(session));
    }

    @GetMapping("/{id}")
    public RecipeResponse getRecipe(@PathVariable Long id, HttpSession session) {
        return recipeService.getRecipe(id, authService.findCurrentUser(session));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RecipeResponse createRecipe(@Valid @RequestBody CreateRecipeRequest request, HttpSession session) {
        return recipeService.createRecipe(request, authService.requireCurrentUser(session));
    }

    @PutMapping("/{id}")
    public RecipeResponse updateRecipe(@PathVariable Long id, @Valid @RequestBody CreateRecipeRequest request, HttpSession session) {
        return recipeService.updateRecipe(id, request, authService.requireCurrentUser(session));
    }

    @GetMapping("/discover")
    public List<RecipeResponse> discoverRecipes(
            @RequestParam(required = false) MoodTag mood,
            @RequestParam(required = false) CuisineType cuisine,
            @RequestParam(required = false) DifficultyLevel difficulty,
            @RequestParam(defaultValue = "3") int limit,
            HttpSession session
    ) {
        return recipeService.discoverRecipes(mood, cuisine, difficulty, limit, authService.findCurrentUser(session));
    }

    @PostMapping("/{id}/favorite")
    public RecipeResponse favoriteRecipe(@PathVariable Long id, HttpSession session) {
        return recipeService.favoriteRecipe(id, authService.requireCurrentUser(session));
    }

    @DeleteMapping("/{id}/favorite")
    public RecipeResponse unfavoriteRecipe(@PathVariable Long id, HttpSession session) {
        return recipeService.unfavoriteRecipe(id, authService.requireCurrentUser(session));
    }

    @GetMapping("/library")
    public List<RecipeResponse> getLibrary(HttpSession session) {
        return recipeService.getLibrary(authService.requireCurrentUser(session));
    }

    @PostMapping("/{id}/library")
    public RecipeResponse addRecipeToLibrary(@PathVariable Long id, HttpSession session) {
        return recipeService.addRecipeToLibrary(id, authService.requireCurrentUser(session));
    }

    @DeleteMapping("/{id}/library")
    public RecipeResponse removeRecipeFromLibrary(@PathVariable Long id, HttpSession session) {
        return recipeService.removeRecipeFromLibrary(id, authService.requireCurrentUser(session));
    }

    @PostMapping("/{id}/consume")
    public RecipeResponse markRecipeConsumed(
            @PathVariable Long id,
            @Valid @RequestBody RecipeConsumptionRequest request,
            HttpSession session
    ) {
        return recipeService.markRecipeConsumed(id, request, authService.requireCurrentUser(session));
    }
}
