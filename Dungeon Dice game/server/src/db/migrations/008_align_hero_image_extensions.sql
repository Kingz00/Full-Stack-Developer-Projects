-- Update persisted enemy image snapshots to use the optimized WebP assets.
-- Only change URLs whose path ends in .png.
UPDATE battles
SET enemy_image_url =
    substr(enemy_image_url, 1, length(enemy_image_url) - 4) || '.webp'
WHERE enemy_image_url LIKE '%.png';
