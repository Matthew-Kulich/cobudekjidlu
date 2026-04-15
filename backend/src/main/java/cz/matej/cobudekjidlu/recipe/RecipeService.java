package cz.matej.cobudekjidlu.recipe;

import cz.matej.cobudekjidlu.recipe.dto.CreateRecipeRequest;
import cz.matej.cobudekjidlu.recipe.dto.IngredientRequest;
import cz.matej.cobudekjidlu.recipe.dto.IngredientResponse;
import cz.matej.cobudekjidlu.recipe.dto.RecipeConsumptionRequest;
import cz.matej.cobudekjidlu.recipe.dto.RecipeResponse;
import cz.matej.cobudekjidlu.recipe.model.CuisineType;
import cz.matej.cobudekjidlu.recipe.model.DifficultyLevel;
import cz.matej.cobudekjidlu.recipe.model.MoodTag;
import cz.matej.cobudekjidlu.recipe.model.Recipe;
import cz.matej.cobudekjidlu.recipe.model.RecipeIngredient;
import cz.matej.cobudekjidlu.recipe.model.RecipeScope;
import cz.matej.cobudekjidlu.recipe.model.RecipeType;
import cz.matej.cobudekjidlu.recipe.model.RecipeVisibility;
import cz.matej.cobudekjidlu.recipe.model.UserRecipeEntry;
import cz.matej.cobudekjidlu.user.UserRepository;
import cz.matej.cobudekjidlu.user.model.AppUser;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class RecipeService {

    private final RecipeRepository recipeRepository;
    private final UserRepository userRepository;
    private final UserRecipeEntryRepository userRecipeEntryRepository;

    public RecipeService(
            RecipeRepository recipeRepository,
            UserRepository userRepository,
            UserRecipeEntryRepository userRecipeEntryRepository
    ) {
        this.recipeRepository = recipeRepository;
        this.userRepository = userRepository;
        this.userRecipeEntryRepository = userRecipeEntryRepository;
    }

    public List<RecipeResponse> getAllRecipes(
            RecipeType type,
            CuisineType cuisine,
            DifficultyLevel difficulty,
            MoodTag mood,
            RecipeScope scope,
            AppUser currentUser
    ) {
        Map<Long, UserRecipeEntry> entryMap = getEntryMap(currentUser);
        return recipeRepository.findAll().stream()
                .filter(recipe -> isVisibleTo(recipe, currentUser))
                .filter(recipe -> type == null || recipe.getType() == type)
                .filter(recipe -> cuisine == null || recipe.getCuisine() == cuisine)
                .filter(recipe -> difficulty == null || recipe.getDifficulty() == difficulty)
                .filter(recipe -> mood == null || recipe.getMoodTags().contains(mood))
                .filter(recipe -> matchesScope(recipe, scope, currentUser, entryMap.get(recipe.getId())))
                .sorted(Comparator
                        .comparing(Recipe::getLastCookedAt, Comparator.nullsFirst(Comparator.naturalOrder()))
                        .thenComparing(Recipe::getName, String.CASE_INSENSITIVE_ORDER))
                .map(recipe -> toResponse(recipe, currentUser, entryMap.get(recipe.getId())))
                .toList();
    }

    public RecipeResponse getRecipe(Long recipeId, AppUser currentUser) {
        Recipe recipe = findRecipe(recipeId);
        if (!isVisibleTo(recipe, currentUser)) {
            throw new ResponseStatusException(FORBIDDEN, "Tenhle recept neni dostupny.");
        }

        return toResponse(recipe, currentUser, findEntry(currentUser, recipeId));
    }

    @Transactional
    public RecipeResponse createRecipe(CreateRecipeRequest request, AppUser currentUser) {
        Recipe recipe = new Recipe();
        applyRecipeChanges(recipe, request);
        recipe.setOwner(currentUser);

        Recipe savedRecipe = recipeRepository.save(recipe);
        UserRecipeEntry entry = getOrCreateEntry(currentUser, savedRecipe);
        userRecipeEntryRepository.save(entry);

        return toResponse(savedRecipe, currentUser, entry);
    }

    @Transactional
    public RecipeResponse updateRecipe(Long recipeId, CreateRecipeRequest request, AppUser currentUser) {
        Recipe recipe = findRecipe(recipeId);
        if (!isOwner(recipe, currentUser)) {
            throw new ResponseStatusException(FORBIDDEN, "Upravovat muzes jen svoje recepty.");
        }

        applyRecipeChanges(recipe, request);
        Recipe savedRecipe = recipeRepository.save(recipe);
        return toResponse(savedRecipe, currentUser, findEntry(currentUser, recipeId));
    }

    public List<RecipeResponse> getLibrary(AppUser currentUser) {
        Map<Long, UserRecipeEntry> entryMap = getEntryMap(currentUser);
        Map<Long, Recipe> uniqueRecipes = new LinkedHashMap<>();

        recipeRepository.findAll().stream()
                .filter(recipe -> isOwner(recipe, currentUser))
                .forEach(recipe -> uniqueRecipes.put(recipe.getId(), recipe));

        entryMap.values().stream()
                .map(UserRecipeEntry::getRecipe)
                .filter(recipe -> isVisibleTo(recipe, currentUser))
                .forEach(recipe -> uniqueRecipes.put(recipe.getId(), recipe));

        return uniqueRecipes.values().stream()
                .sorted(Comparator
                        .comparing((Recipe recipe) -> getPersonalLastCookedAt(entryMap.get(recipe.getId())), Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(Recipe::getName, String.CASE_INSENSITIVE_ORDER))
                .map(recipe -> toResponse(recipe, currentUser, entryMap.get(recipe.getId())))
                .toList();
    }

    public List<RecipeResponse> discoverRecipes(
            MoodTag mood,
            CuisineType cuisine,
            DifficultyLevel difficulty,
            int limit,
            AppUser currentUser
    ) {
        Map<Long, UserRecipeEntry> entryMap = getEntryMap(currentUser);
        List<Recipe> recipes = mood == null
                ? recipeRepository.findAll()
                : recipeRepository.findDistinctByMoodTagsContaining(mood);

        return recipes.stream()
                .filter(recipe -> isVisibleTo(recipe, currentUser))
                .filter(recipe -> cuisine == null || recipe.getCuisine() == cuisine)
                .filter(recipe -> difficulty == null || recipe.getDifficulty() == difficulty)
                .sorted(Comparator
                        .comparing(Recipe::getLastCookedAt, Comparator.nullsFirst(Comparator.naturalOrder()))
                        .thenComparing(recipe -> defaultInt(recipe.getCookMinutes()))
                        .thenComparing(Recipe::getName, String.CASE_INSENSITIVE_ORDER))
                .limit(limit)
                .map(recipe -> toResponse(recipe, currentUser, entryMap.get(recipe.getId())))
                .toList();
    }

    @Transactional
    public RecipeResponse addRecipeToLibrary(Long recipeId, AppUser currentUser) {
        Recipe recipe = findRecipe(recipeId);
        if (!isVisibleTo(recipe, currentUser)) {
            throw new ResponseStatusException(FORBIDDEN, "Tenhle recept si nemuzes pridat.");
        }

        UserRecipeEntry entry = getOrCreateEntry(currentUser, recipe);
        userRecipeEntryRepository.save(entry);
        return toResponse(recipe, currentUser, entry);
    }

    @Transactional
    public RecipeResponse removeRecipeFromLibrary(Long recipeId, AppUser currentUser) {
        Recipe recipe = findRecipe(recipeId);
        userRecipeEntryRepository.findByUser_IdAndRecipe_Id(currentUser.getId(), recipeId)
                .ifPresent(userRecipeEntryRepository::delete);
        return toResponse(recipe, currentUser, null);
    }

    @Transactional
    public RecipeResponse markRecipeConsumed(Long recipeId, RecipeConsumptionRequest request, AppUser currentUser) {
        Recipe recipe = findRecipe(recipeId);
        if (!isVisibleTo(recipe, currentUser)) {
            throw new ResponseStatusException(FORBIDDEN, "Tenhle recept neni dostupny.");
        }

        UserRecipeEntry entry = getOrCreateEntry(currentUser, recipe);
        entry.setLastCookedAt(request.consumedOn().atTime(12, 0));
        userRecipeEntryRepository.save(entry);
        return toResponse(recipe, currentUser, entry);
    }

    @Transactional
    public RecipeResponse favoriteRecipe(Long recipeId, AppUser currentUser) {
        Recipe recipe = findRecipe(recipeId);
        if (!isVisibleTo(recipe, currentUser)) {
            throw new ResponseStatusException(FORBIDDEN, "Tenhle recept neni dostupny.");
        }

        AppUser managedUser = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Uzivatel nebyl nalezen."));
        managedUser.getFavoriteRecipes().add(recipe);
        userRepository.save(managedUser);
        return toResponse(recipe, managedUser, findEntry(managedUser, recipeId));
    }

    @Transactional
    public RecipeResponse unfavoriteRecipe(Long recipeId, AppUser currentUser) {
        Recipe recipe = findRecipe(recipeId);
        AppUser managedUser = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Uzivatel nebyl nalezen."));
        managedUser.getFavoriteRecipes().removeIf(item -> Objects.equals(item.getId(), recipeId));
        userRepository.save(managedUser);
        return toResponse(recipe, managedUser, findEntry(managedUser, recipeId));
    }

    private Recipe findRecipe(Long recipeId) {
        return recipeRepository.findById(recipeId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Recept nebyl nalezen."));
    }

    private void applyRecipeChanges(Recipe recipe, CreateRecipeRequest request) {
        recipe.setName(request.name());
        recipe.setDescription(request.description());
        recipe.setImageUrl(request.imageUrl());
        recipe.setType(request.type());
        recipe.setCuisine(request.cuisine());
        recipe.setDifficulty(request.difficulty());
        recipe.setVisibility(request.visibility());
        recipe.setMoodTags(request.moodTags());
        recipe.setPrepMinutes(request.prepMinutes());
        recipe.setCookMinutes(request.cookMinutes());
        recipe.setLastCookedAt(request.lastCookedAt());
        recipe.setCalories(request.calories());
        recipe.setProteinGrams(request.proteinGrams());
        recipe.setCarbsGrams(request.carbsGrams());
        recipe.setFatGrams(request.fatGrams());
        recipe.setEstimatedPortionPriceCzk(request.estimatedPortionPriceCzk());
        recipe.setPriceStore(request.priceStore());
        recipe.setPriceCheckedAt(request.priceCheckedAt());
        recipe.setPriceSourceUrl(request.priceSourceUrl());
        recipe.setPriceSourceLabel(request.priceSourceLabel());
        recipe.setIngredients(mapIngredients(request.ingredients()));
        recipe.setProcedureSteps(request.procedureSteps() == null ? List.of() : request.procedureSteps());
    }

    private boolean matchesScope(Recipe recipe, RecipeScope scope, AppUser currentUser, UserRecipeEntry entry) {
        if (scope == null || scope == RecipeScope.ALL) {
            return true;
        }

        if (currentUser == null) {
            return false;
        }

        return switch (scope) {
            case FAVORITES -> isFavorite(recipe, currentUser);
            case MINE -> isOwner(recipe, currentUser) || entry != null;
            case PRIVATE -> isOwner(recipe, currentUser) && recipe.getVisibility() == RecipeVisibility.PRIVATE;
            case ALL -> true;
        };
    }

    private boolean isVisibleTo(Recipe recipe, AppUser currentUser) {
        if (recipe.getVisibility() == null || recipe.getVisibility() == RecipeVisibility.PUBLIC) {
            return true;
        }

        return isOwner(recipe, currentUser);
    }

    private boolean isOwner(Recipe recipe, AppUser currentUser) {
        return currentUser != null
                && recipe.getOwner() != null
                && Objects.equals(recipe.getOwner().getId(), currentUser.getId());
    }

    private boolean isFavorite(Recipe recipe, AppUser currentUser) {
        return currentUser != null
                && currentUser.getFavoriteRecipes().stream()
                .anyMatch(item -> Objects.equals(item.getId(), recipe.getId()));
    }

    private RecipeResponse toResponse(Recipe recipe, AppUser currentUser, UserRecipeEntry entry) {
        LocalDateTime personalLastCookedAt = getPersonalLastCookedAt(entry);
        long hoursSinceLastCooked = personalLastCookedAt == null
                ? Long.MAX_VALUE
                : ChronoUnit.HOURS.between(personalLastCookedAt, LocalDateTime.now());

        return new RecipeResponse(
                recipe.getId(),
                recipe.getName(),
                recipe.getDescription(),
                recipe.getImageUrl(),
                recipe.getOwner() == null ? null : recipe.getOwner().getId(),
                recipe.getOwner() == null ? "Komunita" : recipe.getOwner().getDisplayName(),
                recipe.getType(),
                recipe.getCuisine(),
                recipe.getDifficulty(),
                recipe.getVisibility(),
                isFavorite(recipe, currentUser),
                currentUser != null && (entry != null || isOwner(recipe, currentUser)),
                isOwner(recipe, currentUser),
                recipe.getMoodTags(),
                defaultInt(recipe.getPrepMinutes()),
                defaultInt(recipe.getCookMinutes()),
                defaultInt(recipe.getPrepMinutes()) + defaultInt(recipe.getCookMinutes()),
                recipe.getLastCookedAt(),
                personalLastCookedAt,
                hoursSinceLastCooked,
                defaultInt(recipe.getCalories()),
                recipe.getProteinGrams(),
                recipe.getCarbsGrams(),
                recipe.getFatGrams(),
                recipe.getEstimatedPortionPriceCzk(),
                recipe.getPriceStore(),
                recipe.getPriceCheckedAt(),
                recipe.getPriceSourceUrl(),
                recipe.getPriceSourceLabel(),
                recipe.getIngredients().stream().map(this::toIngredientResponse).toList(),
                recipe.getProcedureSteps()
        );
    }

    private Map<Long, UserRecipeEntry> getEntryMap(AppUser currentUser) {
        if (currentUser == null) {
            return Map.of();
        }

        Map<Long, UserRecipeEntry> entryMap = new HashMap<>();
        for (UserRecipeEntry entry : userRecipeEntryRepository.findByUser_Id(currentUser.getId())) {
            entryMap.put(entry.getRecipe().getId(), entry);
        }
        return entryMap;
    }

    private UserRecipeEntry findEntry(AppUser currentUser, Long recipeId) {
        if (currentUser == null) {
            return null;
        }

        return userRecipeEntryRepository.findByUser_IdAndRecipe_Id(currentUser.getId(), recipeId).orElse(null);
    }

    private UserRecipeEntry getOrCreateEntry(AppUser currentUser, Recipe recipe) {
        return userRecipeEntryRepository.findByUser_IdAndRecipe_Id(currentUser.getId(), recipe.getId())
                .orElseGet(() -> {
                    UserRecipeEntry entry = new UserRecipeEntry();
                    entry.setUser(currentUser);
                    entry.setRecipe(recipe);
                    entry.setAddedAt(LocalDateTime.now());
                    return entry;
                });
    }

    private LocalDateTime getPersonalLastCookedAt(UserRecipeEntry entry) {
        return entry == null ? null : entry.getLastCookedAt();
    }

    private List<RecipeIngredient> mapIngredients(List<IngredientRequest> ingredients) {
        if (ingredients == null) {
            return List.of();
        }

        return ingredients.stream()
                .map(this::toIngredient)
                .toList();
    }

    private RecipeIngredient toIngredient(IngredientRequest ingredientRequest) {
        RecipeIngredient ingredient = new RecipeIngredient();
        ingredient.setName(ingredientRequest.name());
        ingredient.setAmount(ingredientRequest.amount());
        ingredient.setNote(ingredientRequest.note());
        ingredient.setOptionalIngredient(ingredientRequest.optionalIngredient());
        ingredient.setEstimatedPriceCzk(ingredientRequest.estimatedPriceCzk());
        ingredient.setPriceStore(ingredientRequest.priceStore());
        ingredient.setPriceCheckedAt(ingredientRequest.priceCheckedAt());
        ingredient.setPriceSourceUrl(ingredientRequest.priceSourceUrl());
        return ingredient;
    }

    private IngredientResponse toIngredientResponse(RecipeIngredient ingredient) {
        return new IngredientResponse(
                ingredient.getName(),
                ingredient.getAmount(),
                ingredient.getNote(),
                ingredient.isOptionalIngredient(),
                ingredient.getEstimatedPriceCzk(),
                ingredient.getPriceStore(),
                ingredient.getPriceCheckedAt(),
                ingredient.getPriceSourceUrl()
        );
    }

    private int defaultInt(Integer value) {
        return value == null ? 0 : value;
    }
}
