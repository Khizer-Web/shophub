# PHP Backend API Documentation

This folder contains the PHP backend code for the eCommerce API. In a real production environment, these files would be deployed on a PHP server with MySQL database connectivity.

## Server Requirements

- PHP 8.0+
- MySQL 5.7+ or MariaDB 10.3+
- Apache/Nginx web server
- PDO PHP extension
- JSON PHP extension

## Directory Structure

```
backend/
│
├── config/
│   └── Database.php
│
├── controllers/
│   ├── ProductController.php
│   ├── UserController.php
│   ├── CartController.php
│   └── OrderController.php
│
├── models/
│   ├── Product.php
│   ├── User.php
│   ├── Cart.php
│   └── Order.php
│
├── utils/
│   ├── Response.php
│   └── JwtHandler.php
│
├── middleware/
│   └── AuthMiddleware.php
│
├── .htaccess
└── index.php
```

## API Endpoints

### Products
- GET /api/products - Get all products
- GET /api/products?category={category} - Filter products by category
- GET /api/product/{id} - Get a specific product by ID
- POST /api/products - Create a new product (Admin only)
- PUT /api/product/{id} - Update a product (Admin only)
- DELETE /api/product/{id} - Delete a product (Admin only)

### Users
- POST /api/user/register - Register a new user
- POST /api/user/login - Login and get JWT token
- GET /api/user/profile - Get current user profile
- PUT /api/user/profile - Update user profile
- POST /api/user/logout - Logout (invalidate token)

### Cart
- GET /api/cart - Get cart items for current user
- POST /api/cart - Add item to cart
- PUT /api/cart/{id} - Update cart item quantity
- DELETE /api/cart/{id} - Remove item from cart
- DELETE /api/cart - Clear entire cart

### Orders
- GET /api/orders - Get all orders for current user
- GET /api/order/{id} - Get specific order details
- POST /api/orders - Create a new order
- GET /api/admin/orders - Get all orders (Admin only)
- PUT /api/admin/order/{id} - Update order status (Admin only)

## Database Schema

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image VARCHAR(255),
    stock INT NOT NULL DEFAULT 0,
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY (user_id, product_id)
);

CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'processing', 'shipped', 'delivered') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. When a user logs in, the server returns a JWT token which should be included in the Authorization header for subsequent requests:

```
Authorization: Bearer <token>
```

The token is valid for 24 hours after which the user needs to log in again.