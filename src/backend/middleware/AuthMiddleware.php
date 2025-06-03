<?php
require_once __DIR__ . '/../utils/JwtHandler.php';

class AuthMiddleware {
    protected $jwtHandler;
    
    public function __construct() {
        $this->jwtHandler = new JwtHandler();
    }
    
    public function validateToken() {
        // Get authorization header
        $headers = getallheaders();
        $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';
        
        // Check if auth header exists and has correct format
        if (empty($authHeader) || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            return null;
        }
        
        $token = $matches[1];
        
        // Decode and validate the token
        $payload = $this->jwtHandler->decode($token);
        
        if (!$payload) {
            return null;
        }
        
        return isset($payload['data']) ? $payload['data'] : null;
    }
    
    public function validateAdminToken() {
        $userData = $this->validateToken();
        
        if (!$userData) {
            return null;
        }
        
        // Check if the user is an admin
        if (!isset($userData['isAdmin']) || !$userData['isAdmin']) {
            return null;
        }
        
        return $userData;
    }
}