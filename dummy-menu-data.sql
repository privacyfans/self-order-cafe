-- Insert Menu Categories
INSERT INTO menu_categories (name, description, display_order, is_active) VALUES
('Minuman', 'Berbagai pilihan minuman segar', 1, true),
('Makanan Utama', 'Hidangan utama yang mengenyangkan', 2, true),
('Snack', 'Camilan ringan dan appetizer', 3, true),
('Dessert', 'Penutup manis', 4, true);

-- Insert Menu Items
INSERT INTO menu_items (name, description, base_price, category_id, is_available) VALUES
-- Minuman
('Kopi Americano', 'Kopi hitam klasik dengan rasa yang kuat', 15000, 1, true),
('Cappuccino', 'Espresso dengan steamed milk dan foam', 18000, 1, true),
('Latte', 'Espresso dengan steamed milk yang creamy', 20000, 1, true),
('Es Teh Manis', 'Teh manis dingin yang menyegarkan', 8000, 1, true),
('Jus Jeruk', 'Jus jeruk segar tanpa gula tambahan', 12000, 1, true),
('Chocolate Milkshake', 'Milkshake cokelat dengan whipped cream', 25000, 1, true),

-- Makanan Utama
('Nasi Goreng Spesial', 'Nasi goreng dengan telur, ayam, dan sayuran', 28000, 2, true),
('Mie Ayam Bakso', 'Mie ayam dengan bakso dan pangsit', 22000, 2, true),
('Ayam Bakar', 'Ayam bakar bumbu kecap dengan nasi', 35000, 2, true),
('Gado-gado', 'Sayuran segar dengan bumbu kacang', 18000, 2, true),
('Soto Ayam', 'Soto ayam kuning dengan nasi', 20000, 2, true),

-- Snack
('Pisang Goreng', 'Pisang goreng crispy dengan madu', 12000, 3, true),
('Tahu Isi', 'Tahu goreng isi sayuran (5 pcs)', 15000, 3, true),
('French Fries', 'Kentang goreng dengan saus sambal', 18000, 3, true),
('Lumpia Semarang', 'Lumpia basah isi rebung (3 pcs)', 20000, 3, true),

-- Dessert
('Es Krim Vanilla', 'Es krim vanilla dengan topping', 15000, 4, true),
('Brownies Cokelat', 'Brownies hangat dengan es krim', 22000, 4, true),
('Pudding Karamel', 'Pudding lembut dengan saus karamel', 12000, 4, true),
('Fruit Salad', 'Salad buah segar dengan yogurt', 18000, 4, true);
