<?php
class Product {
    // Database connection and table name
    private $conn;
    private $table_name = "products";
    
    // Object properties
    public $id;
    public $title;
    public $description;
    public $price;
    public $image;
    public $stock;
    public $category;
    public $created_at;
    
    // Constructor with DB connection
    public function __construct($db) {
        $this->conn = $db;
    }
    
    // Read all products
    public function read() {
        // Query
        $query = "SELECT * FROM " . $this->table_name . " ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        return $stmt;
    }
    
    // Read products by category
    public function readByCategory($category) {
        // Query
        $query = "SELECT * FROM " . $this->table_name . " WHERE category = ? ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $category);
        $stmt->execute();
        
        return $stmt;
    }
    
    // Read one product
    public function readOne() {
        // Query
        $query = "SELECT * FROM " . $this->table_name . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($row) {
            // Set properties
            $this->title = $row['title'];
            $this->description = $row['description'];
            $this->price = $row['price'];
            $this->image = $row['image'];
            $this->stock = $row['stock'];
            $this->category = $row['category'];
            $this->created_at = $row['created_at'];
            
            return true;
        }
        
        return false;
    }
    
    // Create product
    public function create() {
        // Query
        $query = "INSERT INTO " . $this->table_name . " (title, description, price, image, stock, category) VALUES (?, ?, ?, ?, ?, ?)";
        $stmt = $this->conn->prepare($query);
        
        // Sanitize data
        $this->title = htmlspecialchars(strip_tags($this->title));
        $this->description = htmlspecialchars(strip_tags($this->description));
        $this->price = floatval($this->price);
        $this->image = htmlspecialchars(strip_tags($this->image));
        $this->stock = intval($this->stock);
        $this->category = htmlspecialchars(strip_tags($this->category));
        
        // Bind data
        $stmt->bindParam(1, $this->title);
        $stmt->bindParam(2, $this->description);
        $stmt->bindParam(3, $this->price);
        $stmt->bindParam(4, $this->image);
        $stmt->bindParam(5, $this->stock);
        $stmt->bindParam(6, $this->category);
        
        // Execute query
        if ($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        
        return false;
    }
    
    // Update product
    public function update() {
        // Query
        $query = "UPDATE " . $this->table_name . " 
                  SET title = ?, description = ?, price = ?, image = ?, stock = ?, category = ? 
                  WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        
        // Sanitize data
        $this->title = htmlspecialchars(strip_tags($this->title));
        $this->description = htmlspecialchars(strip_tags($this->description));
        $this->price = floatval($this->price);
        $this->image = htmlspecialchars(strip_tags($this->image));
        $this->stock = intval($this->stock);
        $this->category = htmlspecialchars(strip_tags($this->category));
        $this->id = intval($this->id);
        
        // Bind data
        $stmt->bindParam(1, $this->title);
        $stmt->bindParam(2, $this->description);
        $stmt->bindParam(3, $this->price);
        $stmt->bindParam(4, $this->image);
        $stmt->bindParam(5, $this->stock);
        $stmt->bindParam(6, $this->category);
        $stmt->bindParam(7, $this->id);
        
        // Execute query
        if ($stmt->execute()) {
            return true;
        }
        
        return false;
    }
    
    // Delete product
    public function delete() {
        // Query
        $query = "DELETE FROM " . $this->table_name . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        
        // Sanitize
        $this->id = intval($this->id);
        
        // Bind data
        $stmt->bindParam(1, $this->id);
        
        // Execute query
        if ($stmt->execute()) {
            return true;
        }
        
        return false;
    }
    
    // Search products
    public function search($keywords) {
        // Query
        $query = "SELECT * FROM " . $this->table_name . " 
                 WHERE title LIKE ? OR description LIKE ? OR category LIKE ?
                 ORDER BY created_at DESC";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize
        $keywords = htmlspecialchars(strip_tags($keywords));
        $keywords = "%{$keywords}%";
        
        // Bind
        $stmt->bindParam(1, $keywords);
        $stmt->bindParam(2, $keywords);
        $stmt->bindParam(3, $keywords);
        
        // Execute query
        $stmt->execute();
        
        return $stmt;
    }
    
    // Update stock quantity
    public function updateStock($quantity) {
        // Query to update stock
        $query = "UPDATE " . $this->table_name . " SET stock = stock - ? WHERE id = ? AND stock >= ?";
        $stmt = $this->conn->prepare($query);
        
        // Bind values
        $stmt->bindParam(1, $quantity, PDO::PARAM_INT);
        $stmt->bindParam(2, $this->id, PDO::PARAM_INT);
        $stmt->bindParam(3, $quantity, PDO::PARAM_INT);
        
        // Execute query
        if ($stmt->execute() && $stmt->rowCount() > 0) {
            return true;
        }
        
        return false;
    }
}