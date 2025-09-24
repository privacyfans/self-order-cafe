-- Demo staff data with properly hashed passwords
-- Passwords: admin123, cashier123, kitchen123, password123

INSERT INTO staff (employee_id, full_name, email, phone_number, username, password_hash, role, is_active) VALUES
('EMP001', 'Admin User', 'admin@cafe.com', '081234567890', 'admin', '$2b$10$tj8hXw.299Kp7vG47tz60u3ef5yXzAwWEUcSy0e9o8jC74n9yrdxe', 'ADMIN', TRUE),
('EMP002', 'John Cashier', 'cashier1@cafe.com', '081234567891', 'cashier1', '$2b$10$MIBJt19rhipehAF1d2rpaeI.nWVzHqyiArHUuhvCKV2xse8nsoyHy', 'CASHIER', TRUE),
('EMP003', 'Jane Kitchen', 'kitchen1@cafe.com', '081234567892', 'kitchen1', '$2b$10$K4SBEK8rXhhemGIGZCrAJOwFflcPICOU34uhuuwHKgStDLcLbvKPq', 'KITCHEN', TRUE),
('EMP004', 'Bob Manager', 'manager@cafe.com', '081234567893', 'manager', '$2b$10$u.MLHcXuugL5CCgpVTZ4lOm2TaDj/AzaCFNXBLoDWa/1m2wBElci.', 'MANAGER', TRUE),
('EMP005', 'Alice Waiter', 'waiter1@cafe.com', '081234567894', 'waiter1', '$2b$10$u.MLHcXuugL5CCgpVTZ4lOm2TaDj/AzaCFNXBLoDWa/1m2wBElci.', 'WAITER', TRUE);

-- To update existing records, run:
-- UPDATE staff SET password_hash = '$2b$10$tj8hXw.299Kp7vG47tz60u3ef5yXzAwWEUcSy0e9o8jC74n9yrdxe' WHERE username = 'admin';
-- UPDATE staff SET password_hash = '$2b$10$MIBJt19rhipehAF1d2rpaeI.nWVzHqyiArHUuhvCKV2xse8nsoyHy' WHERE username = 'cashier1';
-- UPDATE staff SET password_hash = '$2b$10$K4SBEK8rXhhemGIGZCrAJOwFflcPICOU34uhuuwHKgStDLcLbvKPq' WHERE username = 'kitchen1';
-- UPDATE staff SET password_hash = '$2b$10$u.MLHcXuugL5CCgpVTZ4lOm2TaDj/AzaCFNXBLoDWa/1m2wBElci.' WHERE username = 'manager';
-- UPDATE staff SET password_hash = '$2b$10$u.MLHcXuugL5CCgpVTZ4lOm2TaDj/AzaCFNXBLoDWa/1m2wBElci.' WHERE username = 'waiter1';
