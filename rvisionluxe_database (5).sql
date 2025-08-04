-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Jun 24, 2025 at 04:30 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `rvisionluxe_database`
--

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `category_id` int(11) NOT NULL,
  `category_name` varchar(255) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`category_id`, `category_name`, `image_url`) VALUES
(1, 'Wedding Bag', 'weddingBagCategory.jpg'),
(2, 'School Bag', 'schoolBagCategory.jpg'),
(3, 'Daily Bag', 'dailyBagCategory.jpg'),
(4, 'Travel Bag', 'travelBagCategory.jpg'),
(5, 'Brand Bag', 'brandBagCategory.jpg'),
(6, 'Wallet', 'WalletCategory.jpg');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `order_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `order_date` date DEFAULT NULL,
  `total_amount` decimal(10,2) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `product_id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`product_id`, `name`, `price`, `description`, `image`, `category_id`) VALUES
(20, 'BlackBag', 80.00, 'Elegant black wedding bag', 'weddingBag2', 1),
(21, 'ReddishBrown', 108.00, 'trendy wedding bag', 'weddingBag1', 1),
(22, 'BlackaWallet', 70.00, 'big and nice wallet', 'wallet2', 6),
(23, 'PinkWallet', 30.00, 'small wallet for women', 'wallet1', 6),
(24, 'PinkTravelBags', 180.00, 'Two travel bags, one large and the other small', 'travelBag2', 4),
(25, 'colorfulTravelBag', 95.00, 'Eye-catching medium-sized travel bag', 'travelBag1', 4),
(26, 'NikeSchoolBag', 150.00, 'White and black school bag', 'schoolBag1', 2),
(27, 'BrownSchoolBag', 75.00, 'medium school bag', 'schoolBag2', 2),
(28, 'BlackDailyBag', 70.00, 'A stylish everyday bag that goes with all outfits', 'dailyBag2', 3),
(29, 'BeigeDailyBag', 100.00, 'An everyday bag in the perfect size for sophisticated style', 'dailyBag1', 3),
(30, 'BigBrandBag', 180.00, 'A large and elegant bag suitable for university students and mothers', 'brandBag2', 5),
(31, 'PradaBag', 120.00, 'Black bag from the most beautiful brand', 'brandBag1', 5);

-- --------------------------------------------------------

--
-- Table structure for table `reset_codes`
--

CREATE TABLE `reset_codes` (
  `email` varchar(255) NOT NULL,
  `code` varchar(10) NOT NULL,
  `expires_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reset_codes`
--

INSERT INTO `reset_codes` (`email`, `code`, `expires_at`) VALUES
('rawan.hb18@gmail.com', '113349', '2025-06-19 23:29:34'),
('rihan.habashi0@gmail.com\r\n', '158830', '2025-06-18 18:15:03');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `location`, `name`, `phone_number`, `email`, `password`, `role`) VALUES
(5, 'iksal', 'rihan habashi', '0509270013', 'rihan.habashi0@gmail.com', '$2b$10$UoUFmAkMpmcP82HiuMlS5umrpq68C2pGr6b8dWYBdce9H1fY43K0m', 'customer'),
(6, 'iksal', 'rawan habashi', '0503587185', 'rawan.hb18@gmail.com', '$2b$10$pOpLZhvP84/3OpgN8tbVTOty57BQs3e5t.kglDj9lz8pgz7GH0OZ2\r\n\r\n', 'customer'),
(8, 'TelAviv', 'roaia habashi', '0525127600', 'ro2ya.habashi@gmail.com', '$2b$10$awb/gI8gq4Fyx8m/AwRT5ujOovTJe27cLMmTt2ow20lJqV.wbn9Li', 'customer'),
(12, 'Kfar Kana', 'Ghaidaa', '0522678828', 'ghiadaahabashi@gmail.com', '$2b$10$eCzW6P7fWwK7xULdN1oVDuUzhI9OChKZMJTi5Fh9fbUkZfMYuNnZK\r\n', 'customer'),
(13, 'israel', 'ahmad', '0503587185', 'ahmad.hb15@gmail.com', '$2b$10$wh28oHla2PlscOOscntRFeUS5Ic7cT25rQjlUSF8Oy4ggetecaBc.', 'customer'),
(14, 'Haifa', 'admin', '0501234567', 'admin@gmail.com\r\n', '$2b$10$qToHq/A1FHTHAmj0lX25W.f82gCl0JD2sFub7T5gRExCdE9fs8Rxe', 'admin');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`category_id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`order_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`order_id`,`product_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`product_id`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `reset_codes`
--
ALTER TABLE `reset_codes`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `category_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `order_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `product_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`),
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`);

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
