-- ========================================================
-- Radha Catering - MySQL Database Schema
-- Compatible with Hostinger MySQL & phpMyAdmin
-- ========================================================

CREATE DATABASE IF NOT EXISTS `radha_catering` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `radha_catering`;

-- 1. Business Information Table
CREATE TABLE IF NOT EXISTS `business_info` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `business_name` VARCHAR(100) NOT NULL DEFAULT 'Radha Catering',
  `owner_name` VARCHAR(100) DEFAULT 'Radha',
  `tagline` VARCHAR(255) DEFAULT 'Authentic Homestyle Pure Vegetarian Catering',
  `phone` VARCHAR(30) DEFAULT '+1 (978) 652-6164',
  `whatsapp` VARCHAR(30) DEFAULT '19786526164',
  `email` VARCHAR(100) DEFAULT 'info@radhacatering.com',
  `address` VARCHAR(255) DEFAULT 'Powell, OH 43065',
  `city_state` VARCHAR(100) DEFAULT 'Powell, OH',
  `service_areas` TEXT,
  `notice_text` TEXT,
  `announcement` VARCHAR(255) DEFAULT 'Now accepting weekend catering orders for Poojas, Birthdays & Get-Togethers in Powell, OH!',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Initial Business Info
INSERT INTO `business_info` (`business_name`, `owner_name`, `phone`, `whatsapp`, `city_state`, `service_areas`, `notice_text`)
VALUES (
  'Radha Catering',
  'Radha',
  '+1 (978) 652-6164',
  '19786526164',
  'Powell, OH',
  'Powell, Dublin, Lewis Center, Columbus, Worthington, Westerville & Central Ohio',
  'Orders are cooked fresh to order. Please order 24–48 hours in advance for party trays.'
) ON DUPLICATE KEY UPDATE `id`=`id`;

-- 2. Menu Items Table
CREATE TABLE IF NOT EXISTS `menu_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(150) NOT NULL,
  `category` ENUM('starters', 'curries', 'rice', 'breads', 'desserts', 'packages') NOT NULL DEFAULT 'curries',
  `description` TEXT,
  `half_tray_price` DECIMAL(8,2) NOT NULL DEFAULT 0.00,
  `full_tray_price` DECIMAL(8,2) NOT NULL DEFAULT 0.00,
  `half_tray_serves` VARCHAR(50) DEFAULT '10-12 guests',
  `full_tray_serves` VARCHAR(50) DEFAULT '20-25 guests',
  `badge` VARCHAR(50) DEFAULT NULL,
  `image` VARCHAR(255) NOT NULL,
  `is_pure_veg` TINYINT(1) DEFAULT 1,
  `is_jain_available` TINYINT(1) DEFAULT 0,
  `available` TINYINT(1) DEFAULT 1,
  `sort_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Initial Menu Dishes
INSERT INTO `menu_items` (`title`, `category`, `description`, `half_tray_price`, `full_tray_price`, `badge`, `image`, `is_jain_available`) VALUES
('Paneer Butter Masala', 'curries', 'Tender cubes of fresh cottage cheese simmered in a velvety, rich tomato, butter, and cashew gravy infused with fragrant fenugreek leaves.', 65.00, 120.00, 'Bestseller', 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80', 1),
('Hyderabadi Veg Dum Biryani', 'rice', 'Layered long-grain basmati rice with marinated seasonal vegetables, aromatic spices, fresh mint, and saffron steam-cooked in authentic Dum style.', 60.00, 115.00, 'Signature Dish', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80', 0),
('Vegetable Samosas (20 / 40 pcs)', 'starters', 'Handcrafted flaky, crisp golden pastry generously stuffed with spiced potatoes, green peas, cumin, and coriander seeds. Served with sweet tamarind and mint chutneys.', 45.00, 85.00, 'Party Favorite', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80', 1),
('Palak Paneer', 'curries', 'Soft cottage cheese cubes cooked in a vibrant, spiced fresh spinach gravy finished with a touch of fresh cream and roasted cumin.', 65.00, 120.00, 'Classic', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80', 1),
('Dal Makhani', 'curries', 'Slow-simmered whole black lentils and kidney beans cooked overnight with butter, rich cream, and delicate spices for an unmatched creamy texture.', 50.00, 95.00, 'Chef Special', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80', 0),
('Paneer Tikka (Tandoori Style)', 'starters', 'Fresh paneer cubes, bell peppers, and red onions marinated in hung yogurt, ajwain, and aromatic tandoori masala, roasted to perfection.', 60.00, 110.00, 'Popular', 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80', 1),
('Fresh Garlic Naan (15 / 30 pcs)', 'breads', 'Leavened oven-baked flatbread topped with minced roasted garlic, fresh cilantro, and brushed with melted butter.', 40.00, 75.00, 'Bestseller', 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=800&q=80', 0),
('Traditional Gulab Jamun (25 / 50 pcs)', 'desserts', 'Classic sweet fried dumplings prepared with milk solids (khoya), dipped in warm aromatic sugar syrup flavored with green cardamom and rose water.', 45.00, 85.00, 'Crowd Favorite', 'https://images.unsplash.com/photo-1605197143477-d64e9a4cb3e0?auto=format&fit=crop&w=800&q=80', 1),
('Royal Kesar Rasmalai (20 / 40 pcs)', 'desserts', 'Pillowy soft cottage cheese patties soaked in luscious thickened saffron-infused milk (rabdi) and garnished with slivered pistachios and almonds.', 55.00, 105.00, 'Royal Special', 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80', 1);

-- 3. Homepage Scrolling Carousel Photos Table
CREATE TABLE IF NOT EXISTS `slider_photos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(150) NOT NULL,
  `tagline` VARCHAR(255) DEFAULT NULL,
  `category` VARCHAR(100) DEFAULT 'Radha Special',
  `image` VARCHAR(255) NOT NULL,
  `link` VARCHAR(100) DEFAULT 'menu.html',
  `sort_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `slider_photos` (`title`, `tagline`, `category`, `image`, `link`, `sort_order`) VALUES
('Hyderabadi Veg Dum Biryani', 'Slow-cooked with fragrant saffron, aromatic basmati rice & fresh herbs', 'Biryani & Rice', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80', 'menu.html#rice', 1),
('Paneer Butter Masala', 'Velvety tomato cashew gravy with succulent cottage cheese cubes', 'Main Course', 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80', 'menu.html#curries', 2),
('Crispy Vegetable Samosas', 'Golden flaky crust filled with spiced potatoes, green peas & mint chutney', 'Starters', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80', 'menu.html#starters', 3),
('Dal Makhani', 'Slow-simmered black lentils with cream, butter & homestyle spices', 'Main Course', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80', 'menu.html#curries', 4),
('Fresh Garlic Naan & Rotis', 'Warm, soft tandoori style breads brushed with melted butter', 'Breads', 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=800&q=80', 'menu.html#breads', 5),
('Royal Gulab Jamun', 'Warm melt-in-the-mouth milk dumplings in scented cardamom syrup', 'Desserts', 'https://images.unsplash.com/photo-1605197143477-d64e9a4cb3e0?auto=format&fit=crop&w=800&q=80', 'menu.html#desserts', 6);

-- 4. Customer Catering Booking Inquiries Table
CREATE TABLE IF NOT EXISTS `catering_inquiries` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `customer_name` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(30) NOT NULL,
  `email` VARCHAR(100) DEFAULT NULL,
  `event_date` DATE NOT NULL,
  `meal_time` VARCHAR(100) DEFAULT NULL,
  `guests_count` INT NOT NULL,
  `occasion` VARCHAR(100) DEFAULT NULL,
  `dietary_preference` VARCHAR(100) DEFAULT NULL,
  `requested_dishes` TEXT,
  `notes` TEXT,
  `status` ENUM('new', 'confirmed', 'completed', 'cancelled') DEFAULT 'new',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
