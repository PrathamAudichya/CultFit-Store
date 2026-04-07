-- ============================================================
-- CultFit Store — Final Image & Name Update (Local Assets)
-- Run this against ecommerce_db to use premium internal images
-- ============================================================

USE ecommerce_db;

-- Protein
UPDATE products SET title = 'MuscleBlaze Biozyme Whey' WHERE id = 1;
UPDATE product_images SET image_url = 'images/whey.png' WHERE product_id = 1 AND is_primary = TRUE;

UPDATE products SET title = 'ON Gold Standard Whey' WHERE id = 2;
UPDATE product_images SET image_url = 'images/whey.png' WHERE product_id = 2 AND is_primary = TRUE;

UPDATE products SET title = 'BigMuscles Gold Whey' WHERE id = 3;
UPDATE product_images SET image_url = 'images/whey.png' WHERE product_id = 3 AND is_primary = TRUE;

UPDATE products SET title = 'Asitis Atom Whey' WHERE id = 4;
UPDATE product_images SET image_url = 'images/whey.png' WHERE product_id = 4 AND is_primary = TRUE;

-- Gainer
UPDATE products SET title = 'MuscleBlaze Gainer' WHERE id = 5;
UPDATE product_images SET image_url = 'images/gainer.png' WHERE product_id = 5 AND is_primary = TRUE;

UPDATE products SET title = 'Labrada Gainer' WHERE id = 6;
UPDATE product_images SET image_url = 'images/gainer.png' WHERE product_id = 6 AND is_primary = TRUE;

-- Creatine
UPDATE products SET title = 'MuscleBlaze Creatine' WHERE id = 7;
UPDATE product_images SET image_url = 'images/creatine.png' WHERE product_id = 7 AND is_primary = TRUE;

UPDATE products SET title = 'ON Micronized Creatine' WHERE id = 8;
UPDATE product_images SET image_url = 'images/creatine.png' WHERE product_id = 8 AND is_primary = TRUE;

-- Pre-workout
UPDATE products SET title = 'Cellucor C4 Pre-Workout' WHERE id = 9;
UPDATE product_images SET image_url = 'images/preworkout.png' WHERE product_id = 9 AND is_primary = TRUE;

UPDATE products SET title = 'MuscleBlaze Pre-Workout' WHERE id = 10;
UPDATE product_images SET image_url = 'images/preworkout.png' WHERE product_id = 10 AND is_primary = TRUE;

-- Plant Protein
UPDATE products SET title = 'Plix Plant Protein' WHERE id = 11;
UPDATE product_images SET image_url = 'images/plant.png' WHERE product_id = 11 AND is_primary = TRUE;

UPDATE products SET title = 'Fast&Up Plant Protein' WHERE id = 12;
UPDATE product_images SET image_url = 'images/plant.png' WHERE product_id = 12 AND is_primary = TRUE;

-- Equipment
UPDATE products SET title = 'Adjustable Dumbbells (20kg)' WHERE id = 13;
UPDATE product_images SET image_url = 'images/dumbbells.png' WHERE product_id = 13 AND is_primary = TRUE;

UPDATE products SET title = 'Boldfit Resistance Bands' WHERE id = 14;
UPDATE product_images SET image_url = 'images/bands.png' WHERE product_id = 14 AND is_primary = TRUE;

UPDATE products SET title = 'Home Gym Set (PVC)' WHERE id = 15;
UPDATE product_images SET image_url = 'images/homegym.png' WHERE product_id = 15 AND is_primary = TRUE;

-- Verification
SELECT p.id, p.title, pi.image_url
FROM products p
JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = TRUE
ORDER BY p.id;
