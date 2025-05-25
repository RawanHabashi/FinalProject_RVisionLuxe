-- Create database
CREATE DATABASE IF NOT EXISTS `rvision_luxe` CHARACTER SET utf8mb4 COLLATE utf8mb4;

-- Select database
USE `rvision_luxe`;

-- Creating the users table
CREATE TABLE IF NOT EXISTS `users` (
    `user_id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `location` VARCHAR(255) NOT NULL,
    `phone_number` VARCHAR(20) NOT NULL,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Creating the products table
CREATE TABLE IF NOT EXISTS `products` (
    `Product_Code` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `Name` VARCHAR(255) NOT NULL,
    `Description` TEXT,
    `Price` DECIMAL(10,2) NOT NULL,
    `Image` VARCHAR(255),
    `Category_Code` INT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Creating the orders table
CREATE TABLE IF NOT EXISTS `orders` (
    `Order_Code` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `Order_Date` DATE NOT NULL,
    `Amount` DECIMAL(10,2) NOT NULL,
    `User_id` INT UNSIGNED,
    `Order_status` VARCHAR(50) NOT NULL,
    FOREIGN KEY (User_id) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Creating the product_orders table
CREATE TABLE IF NOT EXISTS `product_orders` (
    `order_code` INT UNSIGNED,
    `product_code` INT UNSIGNED,
    `quantity` INT NOT NULL,
    PRIMARY KEY (order_code, product_code),
    FOREIGN KEY (order_code) REFERENCES orders(Order_Code),
    FOREIGN KEY (product_code) REFERENCES products(Product_Code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Creating the messages table
CREATE TABLE IF NOT EXISTS `messages` (
    `message_code` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `message_content` TEXT NOT NULL,
    `message_date` DATE NOT NULL,
    `user_id` INT UNSIGNED,
    `order_id` INT UNSIGNED,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (order_id) REFERENCES orders(Order_Code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;