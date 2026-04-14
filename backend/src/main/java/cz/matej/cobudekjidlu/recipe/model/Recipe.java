package cz.matej.cobudekjidlu.recipe.model;

import cz.matej.cobudekjidlu.user.model.AppUser;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "recipes")
public class Recipe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(length = 1400)
    private String description;

    @Column
    private String imageUrl;

    @ManyToOne
    @JoinColumn(name = "owner_id")
    private AppUser owner;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RecipeType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CuisineType cuisine;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DifficultyLevel difficulty;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RecipeVisibility visibility = RecipeVisibility.PUBLIC;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "recipe_moods", joinColumns = @JoinColumn(name = "recipe_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "mood_tag", nullable = false)
    private Set<MoodTag> moodTags = new HashSet<>();

    @Column(nullable = false)
    private Integer prepMinutes;

    @Column(nullable = false)
    private Integer cookMinutes;

    private LocalDateTime lastCookedAt;

    @Column(nullable = false)
    private Integer calories;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal proteinGrams;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal carbsGrams;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal fatGrams;

    @Column(precision = 10, scale = 2)
    private BigDecimal estimatedPortionPriceCzk;

    private LocalDate priceCheckedAt;

    private String priceStore;

    @Column(length = 1200)
    private String priceSourceUrl;

    @Column(length = 300)
    private String priceSourceLabel;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "recipe_ingredients", joinColumns = @JoinColumn(name = "recipe_id"))
    private List<RecipeIngredient> ingredients = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "recipe_steps", joinColumns = @JoinColumn(name = "recipe_id"))
    @Column(name = "step_text", length = 1200)
    private List<String> procedureSteps = new ArrayList<>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public AppUser getOwner() {
        return owner;
    }

    public void setOwner(AppUser owner) {
        this.owner = owner;
    }

    public RecipeType getType() {
        return type;
    }

    public void setType(RecipeType type) {
        this.type = type;
    }

    public CuisineType getCuisine() {
        return cuisine;
    }

    public void setCuisine(CuisineType cuisine) {
        this.cuisine = cuisine;
    }

    public DifficultyLevel getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(DifficultyLevel difficulty) {
        this.difficulty = difficulty;
    }

    public RecipeVisibility getVisibility() {
        return visibility;
    }

    public void setVisibility(RecipeVisibility visibility) {
        this.visibility = visibility;
    }

    public Set<MoodTag> getMoodTags() {
        return moodTags;
    }

    public void setMoodTags(Set<MoodTag> moodTags) {
        this.moodTags = moodTags;
    }

    public Integer getPrepMinutes() {
        return prepMinutes;
    }

    public void setPrepMinutes(Integer prepMinutes) {
        this.prepMinutes = prepMinutes;
    }

    public Integer getCookMinutes() {
        return cookMinutes;
    }

    public void setCookMinutes(Integer cookMinutes) {
        this.cookMinutes = cookMinutes;
    }

    public LocalDateTime getLastCookedAt() {
        return lastCookedAt;
    }

    public void setLastCookedAt(LocalDateTime lastCookedAt) {
        this.lastCookedAt = lastCookedAt;
    }

    public Integer getCalories() {
        return calories;
    }

    public void setCalories(Integer calories) {
        this.calories = calories;
    }

    public BigDecimal getProteinGrams() {
        return proteinGrams;
    }

    public void setProteinGrams(BigDecimal proteinGrams) {
        this.proteinGrams = proteinGrams;
    }

    public BigDecimal getCarbsGrams() {
        return carbsGrams;
    }

    public void setCarbsGrams(BigDecimal carbsGrams) {
        this.carbsGrams = carbsGrams;
    }

    public BigDecimal getFatGrams() {
        return fatGrams;
    }

    public void setFatGrams(BigDecimal fatGrams) {
        this.fatGrams = fatGrams;
    }

    public BigDecimal getEstimatedPortionPriceCzk() {
        return estimatedPortionPriceCzk;
    }

    public void setEstimatedPortionPriceCzk(BigDecimal estimatedPortionPriceCzk) {
        this.estimatedPortionPriceCzk = estimatedPortionPriceCzk;
    }

    public LocalDate getPriceCheckedAt() {
        return priceCheckedAt;
    }

    public void setPriceCheckedAt(LocalDate priceCheckedAt) {
        this.priceCheckedAt = priceCheckedAt;
    }

    public String getPriceStore() {
        return priceStore;
    }

    public void setPriceStore(String priceStore) {
        this.priceStore = priceStore;
    }

    public String getPriceSourceUrl() {
        return priceSourceUrl;
    }

    public void setPriceSourceUrl(String priceSourceUrl) {
        this.priceSourceUrl = priceSourceUrl;
    }

    public String getPriceSourceLabel() {
        return priceSourceLabel;
    }

    public void setPriceSourceLabel(String priceSourceLabel) {
        this.priceSourceLabel = priceSourceLabel;
    }

    public List<RecipeIngredient> getIngredients() {
        return ingredients;
    }

    public void setIngredients(List<RecipeIngredient> ingredients) {
        this.ingredients = ingredients;
    }

    public List<String> getProcedureSteps() {
        return procedureSteps;
    }

    public void setProcedureSteps(List<String> procedureSteps) {
        this.procedureSteps = procedureSteps;
    }
}

