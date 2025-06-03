<?php
class Order {
    // Database connection and table names
    private $conn;
    private $table_name = "orders";
    private $items_table = "order_items";
    
    // Object properties
    public $id;
    public $user_id;
    public $total_price;
    public $status;
    public $created_at;
    public $items = []; // Array of order items
    
    // Constructor with DB connection
    public function __construct($db) {
        $this->conn = $db;
    }
    
    // Create new order
    public function create() {
        // Start transaction
        $this->conn->beginTransaction();
        
        try {
            // Create order record
            $query = "INSERT INTO " . $this->table_name . " (user_id, total_price, status) VALUES (?, ?, ?)";
            $stmt = $this->conn->prepare($query);
            
            // Clean data
            $this->user_id = intval($this->user_id);
            $this->total_price = floatval($this->total_price);
            $this->status = htmlspecialchars(strip_tags($this->status));
            
            // Bind values
            $stmt->bindParam(1, $this->user_id);
            $stmt->bindParam(2, $this->total_price);
            $stmt->bindParam(3, $this->status);
            
            // Execute query
            if (!$stmt->execute()) {
                // If order creation fails, roll back and return false
                $this->conn->rollBack();
                return false;
            }
            
            // Get order ID
            $this->id = $this->conn->lastInsertId();
            
            // Create order items
            foreach ($this->items as $item) {
                $query = "INSERT INTO " . $this->items_table . " (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)";
                $stmt = $this->conn->prepare($query);
                
                $order_id = $this->id;
                $product_id = intval($item['product_id']);
                $quantity = intval($item['quantity']);
                $price = floatval($item['price']);
                
                $stmt->bindParam(1, $order_id);
                $stmt->bindParam(2, $product_id);
                $stmt->bindParam(3, $quantity);
                $stmt->bindParam(4, $price);
                
                if (!$stmt->execute()) {
                    // If item creation fails, roll back and return false
                    $this->conn->rollBack();
                    return false;
                }
                
                // Update product stock
                $product = new Product($this->conn);
                $product->id = $product_id;
                
                if (!$product->updateStock($quantity)) {
                    // If stock update fails, roll back and return false
                    $this->conn->rollBack();
                    return false;
                }
            }
            
            // If everything is successful, commit the transaction
            $this->conn->commit();
            return true;
            
        } catch (Exception $e) {
            // Rollback on any exception
            $this->conn->rollBack();
            return false;
        }
    }
    
    // Get all orders for a user
    public function getUserOrders() {
        $query = "SELECT o.id, o.user_id, o.total_price, o.status, o.created_at
                 FROM " . $this->table_name . " o
                 WHERE o.user_id = ?
                 ORDER BY o.created_at DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->user_id);
        $stmt->execute();
        
        return $stmt;
    }
    
    // Get all orders (admin only)
    public function getAllOrders() {
        $query = "SELECT o.id, o.user_id, o.total_price, o.status, o.created_at, u.name as user_name
                 FROM " . $this->table_name . " o
                 LEFT JOIN users u ON o.user_id = u.id
                 ORDER BY o.created_at DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        return $stmt;
    }
    
    // Get order details by ID
    public function getOrderDetails() {
        // First, get the order info
        $query = "SELECT * FROM " . $this->table_name . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$row) {
            return false;
        }
        
        // Set order properties
        $this->user_id = $row['user_id'];
        $this->total_price = $row['total_price'];
        $this->status = $row['status'];
        $this->created_at = $row['created_at'];
        
        // Now get the order items with product details
        $query = "SELECT oi.id, oi.product_id, oi.quantity, oi.price,
                 p.title, p.description, p.image, p.category
                 FROM " . $this->items_table . " oi
                 LEFT JOIN products p ON oi.product_id = p.id
                 WHERE oi.order_id = ?";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        $stmt->execute();
        
        $this->items = [];
        
        while ($item = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $this->items[] = $item;
        }
        
        return true;
    }
    
    // Update order status (admin only)
    public function updateStatus() {
        $query = "UPDATE " . $this->table_name . " SET status = ? WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        
        // Clean data
        $this->status = htmlspecialchars(strip_tags($this->status));
        $this->id = intval($this->id);
        
        // Bind values
        $stmt->bindParam(1, $this->status);
        $stmt->bindParam(2, $this->id);
        
        // Execute query
        if ($stmt->execute()) {
            return true;
        }
        
        return false;
    }
}