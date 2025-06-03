<?php
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/JwtHandler.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class UserController {
    private $db;
    private $jwtHandler;
    private $authMiddleware;
    
    public function __construct($db) {
        $this->db = $db;
        $this->jwtHandler = new JwtHandler();
        $this->authMiddleware = new AuthMiddleware();
    }
    
    // Register new user
    public function register() {
        // Get posted data
        $data = json_decode(file_get_contents("php://input"));
        
        // Validate required fields
        if (
            empty($data->name) ||
            empty($data->email) ||
            empty($data->password)
        ) {
            Response::error('Missing required fields', 400);
        }
        
        // Create user object
        $user = new User($this->db);
        
        // Check if email already exists
        if ($user->findByEmail($data->email)) {
            Response::error('Email already exists', 400);
        }
        
        // Set user property values
        $user->name = $data->name;
        $user->email = $data->email;
        $user->password = $data->password;
        $user->is_admin = false; // Default to regular user
        
        // Create user
        if ($user->create()) {
            // Generate JWT token
            $token = $this->jwtHandler->encode($user->getUserData());
            
            Response::success([
                'user' => $user->getUserData(),
                'token' => $token
            ], 'User registered successfully');
        } else {
            Response::serverError('Unable to register user');
        }
    }
    
    // User login
    public function login() {
        // Get posted data
        $data = json_decode(file_get_contents("php://input"));
        
        // Validate required fields
        if (
            empty($data->email) ||
            empty($data->password)
        ) {
            Response::error('Missing required fields', 400);
        }
        
        // Create user object
        $user = new User($this->db);
        
        // Set user properties
        $user->email = $data->email;
        $user->password = $data->password;
        
        // Validate credentials
        if ($user->findByEmail($data->email)) {
            // Verify password
            if (password_verify($data->password, $user->password)) {
                // Generate JWT token
                $token = $this->jwtHandler->encode($user->getUserData());
                
                Response::success([
                    'user' => $user->getUserData(),
                    'token' => $token
                ], 'Login successful');
            } else {
                Response::error('Invalid credentials', 401);
            }
        } else {
            Response::error('Invalid credentials', 401);
        }
    }
    
    // Get user profile
    public function getProfile() {
        // Validate token
        $userData = $this->authMiddleware->validateToken();
        
        if (!$userData) {
            Response::unauthorized();
        }
        
        // Get user from database
        $user = new User($this->db);
        if ($user->findById($userData['id'])) {
            Response::success($user->getUserData(), 'Profile retrieved successfully');
        } else {
            Response::notFound('User not found');
        }
    }
    
    // Update user profile
    public function updateProfile() {
        // Validate token
        $userData = $this->authMiddleware->validateToken();
        
        if (!$userData) {
            Response::unauthorized();
        }
        
        // Get user from database
        $user = new User($this->db);
        if (!$user->findById($userData['id'])) {
            Response::notFound('User not found');
        }
        
        // Get posted data
        $data = json_decode(file_get_contents("php://input"));
        
        // Update user properties
        if (isset($data->name)) $user->name = $data->name;
        
        // Update user
        if ($user->update()) {
            Response::success($user->getUserData(), 'Profile updated successfully');
        } else {
            Response::serverError('Unable to update profile');
        }
    }
    
    // Update password
    public function updatePassword() {
        // Validate token
        $userData = $this->authMiddleware->validateToken();
        
        if (!$userData) {
            Response::unauthorized();
        }
        
        // Get user from database
        $user = new User($this->db);
        if (!$user->findById($userData['id'])) {
            Response::notFound('User not found');
        }
        
        // Get posted data
        $data = json_decode(file_get_contents("php://input"));
        
        // Validate required fields
        if (
            empty($data->currentPassword) ||
            empty($data->newPassword)
        ) {
            Response::error('Missing required fields', 400);
        }
        
        // Verify current password
        if (!password_verify($data->currentPassword, $user->password)) {
            Response::error('Current password is incorrect', 400);
        }
        
        // Update password
        $user->password = $data->newPassword;
        
        if ($user->updatePassword()) {
            Response::success(null, 'Password updated successfully');
        } else {
            Response::serverError('Unable to update password');
        }
    }
}