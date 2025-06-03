<?php
class User {
    // Database connection and table name
    private $conn;
    private $table_name = "users";
    
    // Object properties
    public $id;
    public $name;
    public $email;
    public $password;
    public $is_admin;
    public $created_at;
    
    // Constructor with DB connection
    public function __construct($db) {
        $this->conn = $db;
    }
    
    // Get user by ID
    public function findById($id) {
        $query = "SELECT id, name, email, is_admin, created_at FROM " . $this->table_name . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $id);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($row) {
            $this->id = $row['id'];
            $this->name = $row['name'];
            $this->email = $row['email'];
            $this->is_admin = $row['is_admin'];
            $this->created_at = $row['created_at'];
            return true;
        }
        
        return false;
    }
    
    // Get user by email
    public function findByEmail($email) {
        $query = "SELECT id, name, email, password, is_admin, created_at FROM " . $this->table_name . " WHERE email = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $email);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($row) {
            $this->id = $row['id'];
            $this->name = $row['name'];
            $this->email = $row['email'];
            $this->password = $row['password'];
            $this->is_admin = $row['is_admin'];
            $this->created_at = $row['created_at'];
            return true;
        }
        
        return false;
    }
    
    // Create new user
    public function create() {
        // First, check if email already exists
        if ($this->emailExists()) {
            return false;
        }
        
        // Hash the password
        $this->password = password_hash($this->password, PASSWORD_DEFAULT);
        
        // Insert query
        $query = "INSERT INTO " . $this->table_name . " (name, email, password, is_admin) VALUES (?, ?, ?, ?)";
        $stmt = $this->conn->prepare($query);
        
        // Clean and bind data
        $this->name = htmlspecialchars(strip_tags($this->name));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->is_admin = $this->is_admin ? 1 : 0;
        
        $stmt->bindParam(1, $this->name);
        $stmt->bindParam(2, $this->email);
        $stmt->bindParam(3, $this->password);
        $stmt->bindParam(4, $this->is_admin);
        
        // Execute query
        if ($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        
        return false;
    }
    
    // Update user
    public function update() {
        // Update query - not including password
        $query = "UPDATE " . $this->table_name . " SET name = ? WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        
        // Clean and bind data
        $this->name = htmlspecialchars(strip_tags($this->name));
        
        $stmt->bindParam(1, $this->name);
        $stmt->bindParam(2, $this->id);
        
        // Execute query
        if ($stmt->execute()) {
            return true;
        }
        
        return false;
    }
    
    // Update password
    public function updatePassword() {
        // Hash the new password
        $this->password = password_hash($this->password, PASSWORD_DEFAULT);
        
        // Update query
        $query = "UPDATE " . $this->table_name . " SET password = ? WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(1, $this->password);
        $stmt->bindParam(2, $this->id);
        
        // Execute query
        if ($stmt->execute()) {
            return true;
        }
        
        return false;
    }
    
    // Check if email exists
    private function emailExists() {
        $query = "SELECT id FROM " . $this->table_name . " WHERE email = ?";
        $stmt = $this->conn->prepare($query);
        
        // Sanitize
        $this->email = htmlspecialchars(strip_tags($this->email));
        
        $stmt->bindParam(1, $this->email);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            return true;
        }
        
        return false;
    }
    
    // Validate login credentials
    public function validate() {
        // Find user by email
        if ($this->findByEmail($this->email)) {
            // Verify password
            if (password_verify($this->password, $this->password)) {
                return true;
            }
        }
        
        return false;
    }
    
    // Return user data for JWT token
    public function getUserData() {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'isAdmin' => (bool)$this->is_admin
        ];
    }
}