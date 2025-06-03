<?php
class Cart {
    // Database connection and table name
    private $conn;
    private $table_name = "cart";
    
    // Object properties
    public $id;
    public $user_id;
    public $product_id;
    public $quantity;
    
    // Constructor with DB connection
    public function __construct($db) {
        $this->conn = $db;
    }
    
    // Get cart items for a user
    public function getUserCart() {
        // Query to get cart items with product details
        $query = "SELECT c.id, c.user_id, c.product_id, c.quantity,
                 p.title, p.price, p.image, p.stock, p.category
                 FROM " . $this->table_name . " c
                 LEFT JOIN products p ON c.product_id = p.id
                 WHERE c.user_id = ?
                 ORDER BY c.id DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->user_id);
        $stmt->execute();
        
        return $stmt;
    }
    
    // Check if product is already in user's cart
    public function isProductInCart() {
        $query = "SELECT id, quantity FROM " . $this->table_name . " 
                 WHERE user_id = ? AND product_id = ?";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->user_id);
        $stmt->bindParam(2, $this->product_id);
        $stmt->execute();
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    // Add item to cart
    public function addItem() {
        // Check if product is already in cart
        $existingItem = $this->isProductInCart();
        
        if ($existingItem) {
            // Update quantity if item already in cart
            $this->id = $existingItem['id'];
            $this->quantity = $existingItem['quantity'] + $this->quantity;
            return $this->updateQuantity();
        } else {
            // Insert new item
            $query = "INSERT INTO " . $this->table_name . " (user_id, product_id, quantity) VALUES (?, ?, ?)";
            $stmt = $this->conn->prepare($query);
            
            // Clean data
            $this->user_id = intval($this->user_id);
            $this->product_id = intval($this->product_id);
            $this->quantity = intval($this->quantity);
            
            // Bind values
            $stmt->bindParam(1, $this->user_id);
            $stmt->bindParam(2, $this->product_id);
            $stmt->bindParam(3, $this->quantity);
            
            // Execute query
            if ($stmt->execute()) {
                $this->id = $this->conn->lastInsertId();
                return true;
            }
            
            return false;
        }
    }
    
    // Update cart item quantity
    public function updateQuantity() {
        $query = "UPDATE " . $this->table_name . " SET quantity = ? WHERE id = ? AND user_id = ?";
        $stmt = $this->conn->prepare($query);
        
        // Clean data
        $this->quantity = intval($this->quantity);
        $this->id = intval($this->id);
        $this->user_id = intval($this->user_id);
        
        // Bind values
        $stmt->bindParam(1, $this->quantity);
        $stmt->bindParam(2, $this->id);
        $stmt->bindParam(3, $this->user_id);
        
        // Execute query
        if ($stmt->execute()) {
            return true;
        }
        
        return false;
    }
    
    // Remove item from cart
    public function removeItem() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = ? AND user_id = ?";
        $stmt = $this->conn->prepare($query);
        
        // Clean data
        $this->id = intval($this->id);
        $this->user_id = intval($this->user_id);
        
        // Bind values
        $stmt->bindParam(1, $this->id);
        $stmt->bindParam(2, $this->user_id);
        
        // Execute query
        if ($stmt->execute()) {
            return true;
        }
        
        return false;
    }
    
    // Clear cart
    public function clearCart() {
        $query = "DELETE FROM " . $this->table_name . " WHERE user_id = ?";
        $stmt = $this->conn->prepare($query);
        
        // Clean data
        $this->user_id = intval($this->user_id);
        
        // Bind values
        $stmt->bindParam(1, $this->user_id);
        
        // Execute query
        if ($stmt->execute()) {
            return true;
        }
        
        return false;
    }
}