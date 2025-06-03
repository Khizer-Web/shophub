<?php
require_once __DIR__ . '/../models/Cart.php';
require_once __DIR__ . '/../models/Product.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class CartController {
    private $db;
    private $authMiddleware;
    
    public function __construct($db) {
        $this->db = $db;
        $this->authMiddleware = new AuthMiddleware();
    }
    
    // Get user cart
    public function getCart() {
        // Validate token
        $userData = $this->authMiddleware->validateToken();
        
        if (!$userData) {
            Response::unauthorized();
        }
        
        // Create cart object
        $cart = new Cart($this->db);
        $cart->user_id = $userData['id'];
        
        // Get cart items
        $result = $cart->getUserCart();
        
        $cart_items = [];
        $cart_items['data'] = [];
        
        while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
            $cart_item = [
                'id' => $row['id'],
                'product' => [
                    'id' => $row['product_id'],
                    'title' => $row['title'],
                    'price' => $row['price'],
                    'image' => $row['image'],
                    'stock' => $row['stock'],
                    'category' => $row['category']
                ],
                'quantity' => $row['quantity']
            ];
            
            array_push($cart_items['data'], $cart_item);
        }
        
        $cart_items['success'] = true;
        
        // Set response code - 200 OK
        Response::json($cart_items);
    }
    
    // Add item to cart
    public function addItem() {
        // Validate token
        $userData = $this->authMiddleware->validateToken();
        
        if (!$userData) {
            Response::unauthorized();
        }
        
        // Get posted data
        $data = json_decode(file_get_contents("php://input"));
        
        // Validate required fields
        if (
            !isset($data->productId) ||
            !isset($data->quantity)
        ) {
            Response::error('Missing required fields', 400);
        }
        
        // Validate quantity
        if ($data->quantity <= 0) {
            Response::error('Quantity must be greater than zero', 400);
        }
        
        // Check if product exists and has sufficient stock
        $product = new Product($this->db);
        $product->id = $data->productId;
        
        if (!$product->readOne()) {
            Response::notFound('Product not found');
        }
        
        if ($product->stock < $data->quantity) {
            Response::error('Not enough stock available', 400);
        }
        
        // Create cart object
        $cart = new Cart($this->db);
        $cart->user_id = $userData['id'];
        $cart->product_id = $data->productId;
        $cart->quantity = $data->quantity;
        
        // Add item to cart
        if ($cart->addItem()) {
            // Return updated cart
            $this->getCart();
        } else {
            Response::serverError('Unable to add item to cart');
        }
    }
    
    // Update cart item
    public function updateItem($id) {
        // Validate token
        $userData = $this->authMiddleware->validateToken();
        
        if (!$userData) {
            Response::unauthorized();
        }
        
        // Get posted data
        $data = json_decode(file_get_contents("php://input"));
        
        // Validate required fields
        if (!isset($data->quantity)) {
            Response::error('Missing required fields', 400);
        }
        
        // Create cart object
        $cart = new Cart($this->db);
        $cart->id = $id;
        $cart->user_id = $userData['id'];
        $cart->quantity = $data->quantity;
        
        // If quantity is 0 or less, remove the item
        if ($data->quantity <= 0) {
            if ($cart->removeItem()) {
                // Return updated cart
                $this->getCart();
            } else {
                Response::serverError('Unable to remove item from cart');
            }
            return;
        }
        
        // Update item quantity
        if ($cart->updateQuantity()) {
            // Return updated cart
            $this->getCart();
        } else {
            Response::serverError('Unable to update cart item');
        }
    }
    
    // Remove item from cart
    public function removeItem($id) {
        // Validate token
        $userData = $this->authMiddleware->validateToken();
        
        if (!$userData) {
            Response::unauthorized();
        }
        
        // Create cart object
        $cart = new Cart($this->db);
        $cart->id = $id;
        $cart->user_id = $userData['id'];
        
        // Remove item
        if ($cart->removeItem()) {
            // Return updated cart
            $this->getCart();
        } else {
            Response::serverError('Unable to remove item from cart');
        }
    }
    
    // Clear cart
    public function clearCart() {
        // Validate token
        $userData = $this->authMiddleware->validateToken();
        
        if (!$userData) {
            Response::unauthorized();
        }
        
        // Create cart object
        $cart = new Cart($this->db);
        $cart->user_id = $userData['id'];
        
        // Clear cart
        if ($cart->clearCart()) {
            Response::success([], 'Cart cleared successfully');
        } else {
            Response::serverError('Unable to clear cart');
        }
    }
}