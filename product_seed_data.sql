-- ====================================================================
-- SEED DATA FOR AERO-TECH STORE (RUNNING SHOES CATALOG)
-- Compatible with PostgreSQL / MySQL (Standard JPA naming)
-- ====================================================================

-- Disable Foreign Key checks for easy seeding in MySQL
SET FOREIGN_KEY_CHECKS = 0;

-- 1. DELETE EXISTING DATA (Optional, run with caution)
-- DELETE FROM product_sizes;
-- DELETE FROM product_colors;
-- DELETE FROM images;
-- DELETE FROM products;
-- DELETE FROM categories;
-- DELETE FROM inventories;

-- ====================================================================
-- 2. INSERT CATEGORIES
-- ====================================================================
INSERT INTO categories (id, name, description) VALUES
(1, 'ROAD RUNNING', 'Giày chạy bộ chuyên dụng trên đường nhựa, bê tông, vỉa hè với lớp đệm tối ưu năng lượng.'),
(2, 'TRAIL RUNNING', 'Giày chạy địa hình có độ bám vượt trội, bảo vệ chân trước đá sỏi và chống thấm nước.'),
(3, 'TRACK & FIELD', 'Giày đinh siêu nhẹ tối ưu cho thi đấu điền kinh tốc độ cao trong sân vận động.'),
(4, 'LIFESTYLE', 'Giày thể thao thời trang phong cách năng động, thoải mái cho sử dụng hàng ngày.');

-- Reset auto-increment sequence for categories if using PostgreSQL
-- SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));

-- ====================================================================
-- 3. INSERT PRODUCTS
-- ====================================================================
INSERT INTO products (id, name, description, sku_code, price, old_price, discount_percentage, is_new, brand, foam_tech, plate_tech, upper_tech, category_id, created_at, updated_at) VALUES
-- Product 1 (Road Running - High-end Carbon)
(1, 'Aero-Knit X1 Premium', 'Đỉnh cao công nghệ giày chạy bộ thế hệ mới với đệm siêu nảy và đĩa carbon trợ lực vượt trội.', 'AERO-X1-RED', 189.00, 220.00, 14, true, 'Aero-Tech', 'HyperBurst Foam', 'Full-Length Carbon Plate', 'Aero-Knit V2 Weave', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Product 2 (Road Running - Daily Trainer)
(2, 'Aero-Cushion Glide', 'Dòng giày tập luyện hàng ngày siêu êm ái, bảo vệ tối đa khớp gối khỏi chấn thương.', 'AERO-GLIDE-BLU', 120.00, 150.00, 20, false, 'Aero-Tech', 'ReactLite Cush', 'None', 'Engineered Mesh', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Product 3 (Trail Running)
(3, 'Trail-Blazer Carbon GTX', 'Mẫu giày chạy địa hình được trang bị đĩa carbon trợ lực và màng chống thấm nước GORE-TEX cao cấp.', 'TRAIL-GTX-BLK', 165.00, 195.00, 15, true, 'Aero-Tech', 'TerraFoam Responsive', 'Stabilizing Carbon Y-Plate', 'Gore-Tex Ripstop Mesh', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Product 4 (Track & Field)
(4, 'Speed-Spike Olympic', 'Giày đinh điền kinh siêu nhẹ 120g tối ưu cho các cự ly chạy ngắn từ 100m đến 400m.', 'SPIKE-OLY-WHT', 145.00, 170.00, 14, true, 'Aero-Tech', 'SpeedFoam Zoom', 'Propulsive Carbon Spikes', 'Mono-Mesh Ultra', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Product 5 (Lifestyle)
(5, 'Aero-Street Retro Sneaker', 'Mẫu sneaker cổ điển kết hợp đệm khí hiện đại mang lại cảm giác êm ái suốt cả ngày dài năng động.', 'RETRO-ST-GRY', 95.00, 95.00, 0, false, 'Aero-Tech', 'Air-Active Cush', 'TUP Shank', 'Premium Suede & Leather', 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Reset auto-increment sequence for products if using PostgreSQL
-- SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));

-- ====================================================================
-- 4. INSERT PRODUCT COLORS (Hexadecimal colors for UI buttons)
-- ====================================================================
INSERT INTO product_colors (product_id, color) VALUES
-- Product 1: Red, Blue, Black
(1, '#ff2d55'), -- Bright Red
(1, '#0052ff'), -- Electric Blue
(1, '#1e1e1e'), -- Matte Black

-- Product 2: Cyan, Yellow, White
(2, '#00c7e5'), -- Cyan Blue
(2, '#ffcc00'), -- Volt Yellow
(2, '#ffffff'), -- Pure White

-- Product 3: Olive Green, Charcoal Black
(3, '#556b2f'), -- Dark Olive Green
(3, '#2f4f4f'), -- Dark Slate Gray
(3, '#1a1a1a'), -- Night Black

-- Product 4: Olympic Gold, Neon Orange
(4, '#d4af37'), -- Metallic Gold
(4, '#ff5722'), -- Neon Orange
(4, '#ffffff'), -- Olympic White

-- Product 5: Wolf Gray, Cream White, Forest Green
(5, '#a9a9a9'), -- Dark Gray
(5, '#f5f5dc'), -- Beige/Cream
(5, '#1b4d3e'); -- Forest Green

-- ====================================================================
-- 5. INSERT PRODUCT SIZES (US sizing format standard)
-- ====================================================================
INSERT INTO product_sizes (product_id, size) VALUES
-- Product 1 (US Sizes 7.0 - 11.0)
(1, 7.0), (1, 8.0), (1, 8.5), (1, 9.0), (1, 9.5), (1, 10.0), (1, 10.5), (1, 11.0),
-- Product 2
(2, 6.0), (2, 7.0), (2, 8.0), (2, 9.0), (2, 10.0), (2, 11.0),
-- Product 3
(3, 8.0), (3, 8.5), (3, 9.0), (3, 9.5), (3, 10.0), (3, 10.5), (3, 11.0), (3, 12.0),
-- Product 4
(4, 7.0), (4, 7.5), (4, 8.0), (4, 8.5), (4, 9.0), (4, 9.5), (4, 10.0),
-- Product 5
(5, 5.0), (5, 6.0), (5, 7.0), (5, 8.0), (5, 9.0), (5, 10.0), (5, 11.0);

-- ====================================================================
-- 6. INSERT PRODUCT IMAGES (Beautiful real-world high quality running shoes URLs)
-- ====================================================================
INSERT INTO images (id, name, url, product_id) VALUES
-- Product 1 (Aero-Knit X1 Premium)
(1, 'red_angle.png', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDlNG2P_20pGAAH4lD1LeB5XUPjnnrFc1Iqelb0yK_m5pU8LBE-r1o2Qc0s98A3ibTFLgTBWkOL_Of5_oOH0uULbeky0x39_KUNX_WWNODTJMDKHAAG_xht_x1U0gWH71RRXbW_ZtO1ozzj1yI-3cDWy7ha4kOLfSxqzcFYN7BgdKbZ3lfnDHt2k0E7f0EimKNABOUGiiHM7MyaiARflxSGkXj5a0rOM8LI-ylmoHgcPxKHEJvRV5XyWWxtRcZzNNk7Ff5qopsRjeM', 1),
(2, 'red_side.png', 'https://lh3.googleusercontent.com/aida-public/AB6AXuC0RVALbOkLApO_oXHaOyd3IWWZ8Qvks5oe-kHfsvF7mW75C2xuAjpcGIUGPI-gSj9wL5DFdjTwLg_yykk_NcgMz11D88DnV5QQxcfFf4FoHCVaz7jq_AAA-M-5q0HAfN4gImuC1pbHX3O-2ndzjL2XmHZyS22WnMsUdZUWrRqOnwHNhjd8mmVUM0GPKSzSzLW_npyBKLUzzaJQEANEWMxYnif5AKpViFptzlZJo8Kuyuv24ENPSUdQmcRrEaPBZPQ2io5_yTbQ4b8', 1),

-- Product 2 (Aero-Cushion Glide - Light Blue Trainer)
(3, 'blue_angle.png', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDlNG2P_20pGAAH4lD1LeB5XUPjnnrFc1Iqelb0yK_m5pU8LBE-r1o2Qc0s98A3ibTFLgTBWkOL_Of5_oOH0uULbeky0x39_KUNX_WWNODTJMDKHAAG_xht_x1U0gWH71RRXbW_ZtO1ozzj1yI-3cDWy7ha4kOLfSxqzcFYN7BgdKbZ3lfnDHt2k0E7f0EimKNABOUGiiHM7MyaiARflxSGkXj5a0rOM8LI-ylmoHgcPxKHEJvRV5XyWWxtRcZzNNk7Ff5qopsRjeM', 2),

-- Product 3 (Trail-Blazer Carbon GTX - Dark/Teal Rugged Shoe)
(4, 'trail_black.png', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80', 3),
(5, 'trail_soles.png', 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=600&q=80', 3),

-- Product 4 (Speed-Spike Olympic - Neon Track spike)
(6, 'spike_white.png', 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=600&q=80', 4),

-- Product 5 (Aero-Street Retro Sneaker - Gray lifestyle shoe)
(7, 'retro_gray.png', 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80', 5);

-- Reset auto-increment sequence for images if using PostgreSQL
-- SELECT setval('images_id_seq', (SELECT MAX(id) FROM images));

-- ====================================================================
-- 7. INSERT INVENTORIES (Stock data for inventory-service)
-- ====================================================================
-- DELETE FROM inventories;

INSERT INTO inventories (id, sku_code, quantity) VALUES
(1, 'AERO-X1-RED', 150),
(2, 'AERO-GLIDE-BLU', 200),
(3, 'TRAIL-GTX-BLK', 80),
(4, 'SPIKE-OLY-WHT', 50),
(5, 'RETRO-ST-GRY', 120);

-- Reset auto-increment sequence for inventories if using PostgreSQL
-- SELECT setval('inventories_id_seq', (SELECT MAX(id) FROM inventories));

-- Re-enable Foreign Key checks in MySQL
SET FOREIGN_KEY_CHECKS = 1;
