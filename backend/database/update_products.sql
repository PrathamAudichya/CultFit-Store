-- ============================================================
-- CultFit Store — Final Product Data & Image Cleanup
-- Run this against ecommerce_db to set clean names and verified URLs
-- ============================================================

USE ecommerce_db;

-- 1. MB Biozyme Whey (Clean name + HKRT CDN)
UPDATE products SET title = 'MuscleBlaze Biozyme Whey' WHERE id = 1;
UPDATE product_images SET image_url = 'https://img1.hkrtcdn.com/28870/prd_2886958-MuscleBlaze-Biozyme-Performance-Whey-Protein-4-4-lb-Rich-Chocolate_o.jpg' WHERE product_id = 1 AND is_primary = TRUE;

-- 2. ON Gold Standard (Clean name + HKRT CDN)
UPDATE products SET title = 'ON Gold Standard Whey' WHERE id = 2;
UPDATE product_images SET image_url = 'https://img2.hkrtcdn.com/7877/prd_787721-ON-Gold-Standard-100-Whey-Protein-5-lb-Double-Rich-Chocolate_o.jpg' WHERE product_id = 2 AND is_primary = TRUE;

-- 3. BigMuscles Gold Whey (Clean name + HKRT CDN)
UPDATE products SET title = 'BigMuscles Gold Whey' WHERE id = 3;
UPDATE product_images SET image_url = 'https://img3.hkrtcdn.com/37025/prd_3702451-BigMuscles-Nutrition-Premium-Gold-Whey-Protein-4.4-lbs_o.jpg' WHERE product_id = 3 AND is_primary = TRUE;

-- 4. Asitis Atom Whey (Clean Name + HKRT CDN)
UPDATE products SET title = 'Asitis Atom Whey' WHERE id = 4;
UPDATE product_images SET image_url = 'https://img4.hkrtcdn.com/22007/prd_2200718-Asitis-Atom-Whey-Protein-2-kg-Unflavoured_o.jpg' WHERE product_id = 4 AND is_primary = TRUE;

-- 5. MB Mass Gainer (Clean name + Confirmed working URL)
UPDATE products SET title = 'MuscleBlaze Gainer' WHERE id = 5;
UPDATE product_images SET image_url = 'https://img4.hkrtcdn.com/38824/prd_3882323-MuscleBlaze-Super-Gainer-XXL-6.6-lb-Matcha_o.jpg' WHERE product_id = 5 AND is_primary = TRUE;

-- 6. Labrada Mass Gainer (Clean name + Confirmed working URL)
UPDATE products SET title = 'Labrada Gainer' WHERE id = 6;
UPDATE product_images SET image_url = 'https://img3.hkrtcdn.com/19806/prd_1980592-Labrada-Muscle-Mass-Gainer-11-lb-Chocolate_o.jpg' WHERE product_id = 6 AND is_primary = TRUE;

-- 7. MuscleBlaze Creatine (Clean name + HKRT CDN)
UPDATE products SET title = 'MuscleBlaze Creatine' WHERE id = 7;
UPDATE product_images SET image_url = 'https://img1.hkrtcdn.com/14459/prd_1445964-MuscleBlaze-Creatine-Monohydrate-100g_o.jpg' WHERE product_id = 7 AND is_primary = TRUE;

-- 8. ON Micronized Creatine (Clean name + HKRT CDN)
UPDATE products SET title = 'ON Micronized Creatine' WHERE id = 8;
UPDATE product_images SET image_url = 'https://img2.hkrtcdn.com/7571/prd_757165-ON-Micronized-Creatine-Powder-250-g-Unflavoured_o.jpg' WHERE product_id = 8 AND is_primary = TRUE;

-- 9. Cellucor C4 Pre-Workout (Clean name + HKRT CDN)
UPDATE products SET title = 'Cellucor C4 Pre-Workout' WHERE id = 9;
UPDATE product_images SET image_url = 'https://img3.hkrtcdn.com/8289/prd_828970-Cellucor-C4-Original-Pre-Workout-390-g-Fruit-Punch_o.jpg' WHERE product_id = 9 AND is_primary = TRUE;

-- 10. MB Pre-Workout (Clean name + Confirmed Nutrabay URL)
UPDATE products SET title = 'MuscleBlaze Pre-Workout' WHERE id = 10;
UPDATE product_images SET image_url = 'https://cdn.nutrabay.com/wp-content/uploads/2018/05/NB-MBZ-1009-01-05.jpg' WHERE product_id = 10 AND is_primary = TRUE;

-- 11. Plix Plant Protein (Clean name + HKRT CDN)
UPDATE products SET title = 'Plix Plant Protein' WHERE id = 11;
UPDATE product_images SET image_url = 'https://img1.hkrtcdn.com/38063/prd_3806301-Plix-Plant-Protein-500-g-Chocolate_o.jpg' WHERE product_id = 11 AND is_primary = TRUE;

-- 12. Fast&Up Plant Protein (Clean name + HKRT CDN)
UPDATE products SET title = 'Fast&Up Plant Protein' WHERE id = 12;
UPDATE product_images SET image_url = 'https://img2.hkrtcdn.com/30041/prd_3004132-Fast-Up-Evolve-Plant-Protein-1-kg-Chocolate_o.jpg' WHERE product_id = 12 AND is_primary = TRUE;

-- 13. Adjustable Dumbbells (Clean name + HKRT CDN)
UPDATE products SET title = 'Adjustable Dumbbells (20kg)' WHERE id = 13;
UPDATE product_images SET image_url = 'https://img3.hkrtcdn.com/24013/prd_2401364-Kore-PVC-Dumbbells-Combo-2-kg-each-2-5-kg-each-3-kg-each-4-kg-each_o.jpg' WHERE product_id = 13 AND is_primary = TRUE;

-- 14. Resistance Bands (Clean name + HKRT CDN)
UPDATE products SET title = 'Boldfit Resistance Bands' WHERE id = 14;
UPDATE product_images SET image_url = 'https://img4.hkrtcdn.com/36617/prd_3661742-Boldfit-Power-Resistance-Bands-Light_o.jpg' WHERE product_id = 14 AND is_primary = TRUE;

-- 15. Home Gym Set (Clean name + HKRT CDN)
UPDATE products SET title = 'Home Gym Set (PVC)' WHERE id = 15;
UPDATE product_images SET image_url = 'https://img1.hkrtcdn.com/18441/prd_1844120-Kore-PVC-10-40KG-Home-Gym-Set_o.jpg' WHERE product_id = 15 AND is_primary = TRUE;

-- VERIFICATION
SELECT p.id, p.title, pi.image_url
FROM products p
JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = TRUE
ORDER BY p.id;
