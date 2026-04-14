CREATE TABLE IF NOT EXISTS app_users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS recipes (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(1400),
    image_url VARCHAR(255),
    owner_id BIGINT,
    type VARCHAR(255) NOT NULL,
    visibility VARCHAR(255) NOT NULL DEFAULT 'PUBLIC',
    prep_minutes INTEGER NOT NULL DEFAULT 0,
    last_cooked_at TIMESTAMP
);

ALTER TABLE recipes ADD COLUMN IF NOT EXISTS cuisine VARCHAR(255);
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS difficulty VARCHAR(255);
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS cook_minutes INTEGER;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS calories INTEGER;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS protein_grams NUMERIC(10, 2);
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS carbs_grams NUMERIC(10, 2);
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS fat_grams NUMERIC(10, 2);
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS estimated_portion_price_czk NUMERIC(10, 2);
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS price_checked_at DATE;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS price_store VARCHAR(255);
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS price_source_url VARCHAR(1200);
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS price_source_label VARCHAR(300);
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS owner_id BIGINT;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS visibility VARCHAR(255) DEFAULT 'PUBLIC';

ALTER TABLE recipes
    ALTER COLUMN last_cooked_at TYPE TIMESTAMP
    USING last_cooked_at::timestamp;

UPDATE recipes
SET cuisine = COALESCE(cuisine, 'INTERNATIONAL'),
    difficulty = COALESCE(difficulty, 'EASY'),
    visibility = COALESCE(visibility, 'PUBLIC'),
    cook_minutes = COALESCE(cook_minutes, GREATEST(prep_minutes, 10)),
    calories = COALESCE(calories, 500),
    protein_grams = COALESCE(protein_grams, 30.00),
    carbs_grams = COALESCE(carbs_grams, 40.00),
    fat_grams = COALESCE(fat_grams, 20.00),
    estimated_portion_price_czk = COALESCE(estimated_portion_price_czk, 90.00),
    price_store = COALESCE(price_store, 'BILLA'),
    price_source_label = COALESCE(price_source_label, 'Legacy seed data'),
    image_url = COALESCE(image_url, '/images/recipes/protein-oats.jpg')
WHERE cuisine IS NULL
   OR difficulty IS NULL
   OR visibility IS NULL
   OR cook_minutes IS NULL
   OR calories IS NULL
   OR protein_grams IS NULL
   OR carbs_grams IS NULL
   OR fat_grams IS NULL
   OR estimated_portion_price_czk IS NULL
   OR price_store IS NULL
   OR price_source_label IS NULL
   OR image_url IS NULL;
