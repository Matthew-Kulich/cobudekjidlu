package cz.matej.cojist.config;

import cz.matej.cojist.recipe.RecipeRepository;
import cz.matej.cojist.recipe.model.CuisineType;
import cz.matej.cojist.recipe.model.DifficultyLevel;
import cz.matej.cojist.recipe.model.MoodTag;
import cz.matej.cojist.recipe.model.Recipe;
import cz.matej.cojist.recipe.model.RecipeIngredient;
import cz.matej.cojist.recipe.model.RecipeType;
import cz.matej.cojist.recipe.model.RecipeVisibility;
import cz.matej.cojist.user.UserRepository;
import cz.matej.cojist.user.model.AppUser;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Configuration
public class SeedDataConfig {

    private static final LocalDate PRICE_SNAPSHOT_DATE = LocalDate.of(2026, 4, 12);
    private static final BCryptPasswordEncoder PASSWORD_ENCODER = new BCryptPasswordEncoder();

    @Bean
    CommandLineRunner seedRecipes(RecipeRepository recipeRepository, UserRepository userRepository) {
        return args -> {
            AppUser matej = findOrCreateUser(userRepository, "Matej", "matej@cobudekjidlu.local", "demo123");
            AppUser anna = findOrCreateUser(userRepository, "Anna", "anna@cobudekjidlu.local", "demo123");

            List<Recipe> demoRecipes = buildDemoRecipes(matej, anna);
            Map<String, Recipe> existingByName = new HashMap<>();

            for (Recipe existingRecipe : recipeRepository.findAll()) {
                existingByName.put(existingRecipe.getName(), existingRecipe);
            }

            List<Recipe> recipesToSave = new ArrayList<>();
            for (Recipe demoRecipe : demoRecipes) {
                Recipe existingRecipe = existingByName.get(demoRecipe.getName());
                if (existingRecipe == null) {
                    recipesToSave.add(demoRecipe);
                    continue;
                }

                mergeRecipe(existingRecipe, demoRecipe);
                recipesToSave.add(existingRecipe);
            }

            if (!recipesToSave.isEmpty()) {
                recipeRepository.saveAll(recipesToSave);
            }

            matej.getFavoriteRecipes().clear();
            recipeRepository.findAll().stream()
                    .filter(recipe -> Set.of(
                            "Cizrnove curry se spenatem",
                            "Losos se spenatem a tagliatelle",
                            "Overnight oats s bananem"
                    ).contains(recipe.getName()))
                    .forEach(recipe -> matej.getFavoriteRecipes().add(recipe));
            userRepository.save(matej);
        };
    }

    private AppUser findOrCreateUser(UserRepository userRepository, String displayName, String email, String password) {
        return userRepository.findByEmailIgnoreCase(email)
                .orElseGet(() -> {
                    AppUser user = new AppUser();
                    user.setDisplayName(displayName);
                    user.setEmail(email);
                    user.setPasswordHash(PASSWORD_ENCODER.encode(password));
                    return userRepository.save(user);
                });
    }

    private List<Recipe> buildDemoRecipes(AppUser matej, AppUser anna) {
        return List.of(
                createRecipe(
                        "Overnight oats s bananem",
                        "Rychla snidane do lednice pres noc, vysoka na bilkoviny a idealni na hekticka rana.",
                        "/images/recipes/protein-oats.jpg",
                        matej,
                        RecipeVisibility.PUBLIC,
                        RecipeType.BREAKFAST,
                        CuisineType.INTERNATIONAL,
                        DifficultyLevel.EASY,
                        Set.of(MoodTag.HEALTHY, MoodTag.QUICK, MoodTag.COMFORT),
                        8,
                        0,
                        LocalDateTime.of(2026, 4, 8, 7, 35),
                        420,
                        "26.0",
                        "55.0",
                        "10.5",
                        "39.00",
                        "BILLA",
                        "BILLA snapshot 12. 4. 2026",
                        "https://www.billa.cz/produkt/bio-ovesne-vlocky-bez-lepku-jemne-250-g-82334069",
                        List.of(
                                ingredient("ovesne vlocky", "80 g", false, "43.90", "BILLA", "https://www.billa.cz/produkt/bio-ovesne-vlocky-bez-lepku-jemne-250-g-82334069"),
                                ingredient("skyr natur", "130 g", false, "22.90", "BILLA", "https://www.billa.cz/produkt/skyr-natur-130-g-82308534"),
                                ingredient("banan", "1 ks", false, null, null, null)
                        ),
                        List.of(
                                "Do misky nebo sklenice nasyp ovesne vlocky.",
                                "Primichej skyr a trochu vody nebo mleka podle hustoty.",
                                "Nakraj banan navrch a nech pres noc v lednici.",
                                "Rano jen promichej a podavej."
                        )
                ),
                createRecipe(
                        "Kureci prsa s fazolovym salatem",
                        "Vysokoproteinovy obed inspirovany receptem od Kauflandu. Hodne bilkovin a prijemna sytivost.",
                        "/images/recipes/chicken-bean-salad.jpg",
                        anna,
                        RecipeVisibility.PUBLIC,
                        RecipeType.LUNCH,
                        CuisineType.CZECH,
                        DifficultyLevel.MEDIUM,
                        Set.of(MoodTag.HEALTHY, MoodTag.QUICK),
                        15,
                        15,
                        LocalDateTime.of(2026, 3, 14, 12, 30),
                        404,
                        "45.0",
                        "25.0",
                        "14.0",
                        "92.00",
                        "BILLA",
                        "BILLA snapshot 12. 4. 2026",
                        "https://www.billa.cz/produkt/farmarske-kure-z-udlic-kureci-prsni-rizek-82318751",
                        List.of(
                                ingredient("kureci prsni rizek", "2 ks", false, "197.89", "BILLA", "https://www.billa.cz/produkt/farmarske-kure-z-udlic-kureci-prsni-rizek-82318751"),
                                ingredient("bile fazole", "1 plechovka", false, null, null, null),
                                ingredient("zelene fazolky", "300 g", false, null, null, null),
                                ingredient("zakysana smetana", "100 g", true, null, null, null)
                        ),
                        List.of(
                                "Kureci maso osol a opec na panvi do zlatova.",
                                "Fazole a fazolky prohrej nebo kratce povar.",
                                "Smichej salat se zakysanou smetanou a dochut.",
                                "Na taliri podavej maso na fazolovem salatu."
                        )
                ),
                createRecipe(
                        "Cizrnove curry se spenatem",
                        "Jednoduche indicke curry do pul hodiny. Dobre funguje jako levnejsi meal prep.",
                        "/images/recipes/chickpea-curry.jpg",
                        anna,
                        RecipeVisibility.PUBLIC,
                        RecipeType.DINNER,
                        CuisineType.INDIAN,
                        DifficultyLevel.EASY,
                        Set.of(MoodTag.HEALTHY, MoodTag.ADVENTUROUS, MoodTag.LAZY_DAY),
                        10,
                        20,
                        LocalDateTime.of(2026, 2, 28, 19, 10),
                        522,
                        "16.0",
                        "52.0",
                        "24.0",
                        "59.00",
                        "BILLA",
                        "BILLA snapshot 12. 4. 2026",
                        "https://www.billa.cz/produkt/billa-cizrna-ve-slanem-nalevu-540g-82356992",
                        List.of(
                                ingredient("cizrna ve slanem nalevu", "1 plechovka", false, "34.90", "BILLA", "https://www.billa.cz/produkt/billa-cizrna-ve-slanem-nalevu-540g-82356992"),
                                ingredient("kokosove mleko", "400 ml", false, "54.90", "BILLA", "https://www.billa.cz/produkt/asia-time-kokosove-mleko-400ml-82301626"),
                                ingredient("spenat", "200 g", false, null, null, null),
                                ingredient("ryze", "150 g", true, null, null, null)
                        ),
                        List.of(
                                "Na oleji orestuj cibuli a kari koreni.",
                                "Prilij kokosove mleko a pridej cizrnu.",
                                "Po 10 minutach pridej spenat a nech zavadnout.",
                                "Podavej s ryzi nebo samotne."
                        )
                ),
                createRecipe(
                        "Losos se spenatem a tagliatelle",
                        "Vecere s vyssim obsahem bilkovin a tuku, ktera pusobi slavnostneji.",
                        "/images/recipes/salmon-spinach.jpg",
                        matej,
                        RecipeVisibility.PUBLIC,
                        RecipeType.DINNER,
                        CuisineType.MEDITERRANEAN,
                        DifficultyLevel.MEDIUM,
                        Set.of(MoodTag.HEALTHY, MoodTag.CELEBRATION),
                        15,
                        20,
                        LocalDateTime.of(2026, 2, 7, 20, 0),
                        681,
                        "37.0",
                        "45.0",
                        "37.0",
                        "149.00",
                        "BILLA",
                        "BILLA snapshot 12. 4. 2026",
                        "https://shop.billa.cz/produkt/losos-na-gril-mexicke-bbq-250g-82365224",
                        List.of(
                                ingredient("losos", "250 g", false, "299.00", "BILLA", "https://shop.billa.cz/produkt/losos-na-gril-mexicke-bbq-250g-82365224"),
                                ingredient("tagliatelle", "250 g", false, "37.90", "BILLA", "https://www.billa.cz/produkt/billa-ready-tagliatelle-testoviny-vajecne-nesusene-250g-82354035"),
                                ingredient("spenat", "150 g", false, null, null, null),
                                ingredient("parmazan", "20 g", true, null, null, null)
                        ),
                        List.of(
                                "Uvar tagliatelle podle navodu.",
                                "Lososa opec na panvi kuzi dolu a pak dodelej z druhe strany.",
                                "Na druhe panvi kratce orestuj spenat a smichej s testovinami.",
                                "Navrch pridej lososa a parmazan."
                        )
                ),
                createRecipe(
                        "Testoviny s pestem ze susenych rajcat",
                        "Italsky styl, rychla priprava a prijemny comfort food na vecer.",
                        "/images/recipes/tomato-pesto-pasta.jpg",
                        anna,
                        RecipeVisibility.PUBLIC,
                        RecipeType.DINNER,
                        CuisineType.ITALIAN,
                        DifficultyLevel.EASY,
                        Set.of(MoodTag.COMFORT, MoodTag.QUICK, MoodTag.ADVENTUROUS),
                        10,
                        15,
                        LocalDateTime.of(2026, 4, 1, 18, 40),
                        612,
                        "19.0",
                        "78.0",
                        "24.0",
                        "63.00",
                        "BILLA",
                        "BILLA snapshot 12. 4. 2026",
                        "https://www.billa.cz/produkt/billa-ready-tagliatelle-testoviny-vajecne-nesusene-250g-82354035",
                        List.of(
                                ingredient("tagliatelle", "250 g", false, "37.90", "BILLA", "https://www.billa.cz/produkt/billa-ready-tagliatelle-testoviny-vajecne-nesusene-250g-82354035"),
                                ingredient("susena rajcata v oleji", "6 ks", false, null, null, null),
                                ingredient("olivy", "60 g", true, null, null, null),
                                ingredient("bazalka", "1 hrst", true, null, null, null)
                        ),
                        List.of(
                                "Uvar testoviny ve slane vode.",
                                "Rajcata rozmixuj s trochou oleje na pesto.",
                                "Smichej pesto s testovinami a dodej olivy s bazalkou.",
                                "Podavej ihned."
                        )
                ),
                createRecipe(
                        "Matejuv privatni meal prep wrap",
                        "Soukromy recept na rychly fitness wrap do prace.",
                        "/images/recipes/baked-pasta.jpg",
                        matej,
                        RecipeVisibility.PRIVATE,
                        RecipeType.LUNCH,
                        CuisineType.INTERNATIONAL,
                        DifficultyLevel.EASY,
                        Set.of(MoodTag.QUICK, MoodTag.HEALTHY),
                        10,
                        8,
                        LocalDateTime.of(2026, 4, 10, 11, 50),
                        510,
                        "38.0",
                        "40.0",
                        "19.0",
                        "68.00",
                        "Kaufland",
                        "Kaufland snapshot 12. 4. 2026",
                        "https://prodejny.kaufland.cz/",
                        List.of(
                                ingredient("tortilla", "2 ks", false, null, null, null),
                                ingredient("kureci maso", "150 g", false, null, null, null),
                                ingredient("salat", "1 hrst", false, null, null, null),
                                ingredient("jogurtovy dip", "2 lzice", true, null, null, null)
                        ),
                        List.of(
                                "Opec maso a nakrajej ho na male kousky.",
                                "Tortillu kratce prohrej na panvi.",
                                "Naplni ji salatem, masem a dipem.",
                                "Zabal a rozpul."
                        )
                )
        );
    }

    private void mergeRecipe(Recipe target, Recipe source) {
        target.setDescription(source.getDescription());
        target.setImageUrl(source.getImageUrl());
        target.setOwner(source.getOwner());
        target.setType(source.getType());
        target.setCuisine(source.getCuisine());
        target.setDifficulty(source.getDifficulty());
        target.setVisibility(source.getVisibility());
        target.setMoodTags(source.getMoodTags());
        target.setPrepMinutes(source.getPrepMinutes());
        target.setCookMinutes(source.getCookMinutes());
        target.setLastCookedAt(source.getLastCookedAt());
        target.setCalories(source.getCalories());
        target.setProteinGrams(source.getProteinGrams());
        target.setCarbsGrams(source.getCarbsGrams());
        target.setFatGrams(source.getFatGrams());
        target.setEstimatedPortionPriceCzk(source.getEstimatedPortionPriceCzk());
        target.setPriceStore(source.getPriceStore());
        target.setPriceCheckedAt(source.getPriceCheckedAt());
        target.setPriceSourceUrl(source.getPriceSourceUrl());
        target.setPriceSourceLabel(source.getPriceSourceLabel());
        target.setIngredients(source.getIngredients());
        target.setProcedureSteps(source.getProcedureSteps());
    }

    private Recipe createRecipe(
            String name,
            String description,
            String imageUrl,
            AppUser owner,
            RecipeVisibility visibility,
            RecipeType type,
            CuisineType cuisine,
            DifficultyLevel difficulty,
            Set<MoodTag> moodTags,
            int prepMinutes,
            int cookMinutes,
            LocalDateTime lastCookedAt,
            int calories,
            String proteinGrams,
            String carbsGrams,
            String fatGrams,
            String estimatedPortionPriceCzk,
            String priceStore,
            String priceSourceLabel,
            String priceSourceUrl,
            List<RecipeIngredient> ingredients,
            List<String> procedureSteps
    ) {
        Recipe recipe = new Recipe();
        recipe.setName(name);
        recipe.setDescription(description);
        recipe.setImageUrl(imageUrl);
        recipe.setOwner(owner);
        recipe.setVisibility(visibility);
        recipe.setType(type);
        recipe.setCuisine(cuisine);
        recipe.setDifficulty(difficulty);
        recipe.setMoodTags(moodTags);
        recipe.setPrepMinutes(prepMinutes);
        recipe.setCookMinutes(cookMinutes);
        recipe.setLastCookedAt(lastCookedAt);
        recipe.setCalories(calories);
        recipe.setProteinGrams(new BigDecimal(proteinGrams));
        recipe.setCarbsGrams(new BigDecimal(carbsGrams));
        recipe.setFatGrams(new BigDecimal(fatGrams));
        recipe.setEstimatedPortionPriceCzk(new BigDecimal(estimatedPortionPriceCzk));
        recipe.setPriceStore(priceStore);
        recipe.setPriceCheckedAt(PRICE_SNAPSHOT_DATE);
        recipe.setPriceSourceUrl(priceSourceUrl);
        recipe.setPriceSourceLabel(priceSourceLabel);
        recipe.setIngredients(ingredients);
        recipe.setProcedureSteps(procedureSteps);
        return recipe;
    }

    private RecipeIngredient ingredient(
            String name,
            String amount,
            boolean optionalIngredient,
            String estimatedPriceCzk,
            String priceStore,
            String priceSourceUrl
    ) {
        RecipeIngredient ingredient = new RecipeIngredient();
        ingredient.setName(name);
        ingredient.setAmount(amount);
        ingredient.setOptionalIngredient(optionalIngredient);
        ingredient.setEstimatedPriceCzk(estimatedPriceCzk == null ? null : new BigDecimal(estimatedPriceCzk));
        ingredient.setPriceStore(priceStore);
        ingredient.setPriceCheckedAt(priceSourceUrl == null ? null : PRICE_SNAPSHOT_DATE);
        ingredient.setPriceSourceUrl(priceSourceUrl);
        return ingredient;
    }
}
