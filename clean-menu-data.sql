-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- Clear existing data
DELETE FROM menu_items;
DELETE FROM menu_categories;

-- Reset auto increment
ALTER TABLE menu_categories AUTO_INCREMENT = 1;
ALTER TABLE menu_items AUTO_INCREMENT = 1;

-- Insert Menu Categories
INSERT INTO menu_categories (id, name, description, display_order, is_active) VALUES
(1, 'Minuman', 'Berbagai pilihan minuman segar', 1, true),
(2, 'Makanan Utama', 'Hidangan utama yang mengenyangkan', 2, true),
(3, 'Snack', 'Camilan ringan dan appetizer', 3, true),
(4, 'Dessert', 'Penutup manis', 4, true);

-- Insert Menu Items
INSERT INTO menu_items (name, description, base_price, category_id, is_available, is_active) VALUES
-- Minuman
('Kopi Americano', 'Kopi hitam klasik dengan rasa yang kuat', 15000, 1, true, true),
('Cappuccino', 'Espresso dengan steamed milk dan foam', 18000, 1, true, true),
('Latte', 'Espresso dengan steamed milk yang creamy', 20000, 1, true, true),
('Es Teh Manis', 'Teh manis dingin yang menyegarkan', 8000, 1, true, true),
('Jus Jeruk', 'Jus jeruk segar tanpa gula tambahan', 12000, 1, true, true),
('Chocolate Milkshake', 'Milkshake cokelat dengan whipped cream', 25000, 1, true, true),

-- Makanan Utama
('Nasi Goreng Spesial', 'Nasi goreng dengan telur, ayam, dan sayuran', 28000, 2, true, true),
('Mie Ayam Bakso', 'Mie ayam dengan bakso dan pangsit', 22000, 2, true, true),
('Ayam Bakar', 'Ayam bakar bumbu kecap dengan nasi', 35000, 2, true, true),
('Gado-gado', 'Sayuran segar dengan bumbu kacang', 18000, 2, true, true),
('Soto Ayam', 'Soto ayam kuning dengan nasi', 20000, 2, true, true),

-- Snack
('Pisang Goreng', 'Pisang goreng crispy dengan madu', 12000, 3, true, true),
('Tahu Isi', 'Tahu goreng isi sayuran (5 pcs)', 15000, 3, true, true),
('French Fries', 'Kentang goreng dengan saus sambal', 18000, 3, true, true),
('Lumpia Semarang', 'Lumpia basah isi rebung (3 pcs)', 20000, 3, true, true),

-- Dessert
('Es Krim Vanilla', 'Es krim vanilla dengan topping', 15000, 4, true, true),
('Brownies Cokelat', 'Brownies hangat dengan es krim', 22000, 4, true, true),
('Pudding Karamel', 'Pudding lembut dengan saus karamel', 12000, 4, true, true),
('Fruit Salad', 'Salad buah segar dengan yogurt', 18000, 4, true, true);

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;
