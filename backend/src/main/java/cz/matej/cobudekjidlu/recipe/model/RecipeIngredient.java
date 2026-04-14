package cz.matej.cobudekjidlu.recipe.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.math.BigDecimal;
import java.time.LocalDate;

@Embeddable
public class RecipeIngredient {

    @Column(name = "ingredient_name")
    private String name;

    @Column(name = "ingredient_amount")
    private String amount;

    @Column(name = "ingredient_note", length = 600)
    private String note;

    @Column(name = "ingredient_optional")
    private boolean optionalIngredient;

    @Column(name = "ingredient_price_czk", precision = 10, scale = 2)
    private BigDecimal estimatedPriceCzk;

    @Column(name = "ingredient_price_store")
    private String priceStore;

    @Column(name = "ingredient_price_checked_at")
    private LocalDate priceCheckedAt;

    @Column(name = "ingredient_price_source_url", length = 1200)
    private String priceSourceUrl;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAmount() {
        return amount;
    }

    public void setAmount(String amount) {
        this.amount = amount;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public boolean isOptionalIngredient() {
        return optionalIngredient;
    }

    public void setOptionalIngredient(boolean optionalIngredient) {
        this.optionalIngredient = optionalIngredient;
    }

    public BigDecimal getEstimatedPriceCzk() {
        return estimatedPriceCzk;
    }

    public void setEstimatedPriceCzk(BigDecimal estimatedPriceCzk) {
        this.estimatedPriceCzk = estimatedPriceCzk;
    }

    public String getPriceStore() {
        return priceStore;
    }

    public void setPriceStore(String priceStore) {
        this.priceStore = priceStore;
    }

    public LocalDate getPriceCheckedAt() {
        return priceCheckedAt;
    }

    public void setPriceCheckedAt(LocalDate priceCheckedAt) {
        this.priceCheckedAt = priceCheckedAt;
    }

    public String getPriceSourceUrl() {
        return priceSourceUrl;
    }

    public void setPriceSourceUrl(String priceSourceUrl) {
        this.priceSourceUrl = priceSourceUrl;
    }
}

