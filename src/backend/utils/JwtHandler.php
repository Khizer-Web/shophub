<?php
class JwtHandler {
    private $secret_key = "your_secret_key_here"; // Change this in production
    private $issued_at;
    private $expiry_time;
    
    public function __construct() {
        // Set the time when token was issued
        $this->issued_at = time();
        
        // Set expiry time (24 hours)
        $this->expiry_time = $this->issued_at + (60 * 60 * 24);
    }
    
    // Encode data to create a JWT token
    public function encode($data) {
        $header = [
            "alg" => "HS256",
            "typ" => "JWT"
        ];
        
        $payload = [
            "iss" => "localhost", // issuer
            "aud" => "localhost", // audience
            "iat" => $this->issued_at, // issued time
            "exp" => $this->expiry_time, // expiration time
            "data" => $data // user data
        ];
        
        $header_encoded = $this->base64UrlEncode(json_encode($header));
        $payload_encoded = $this->base64UrlEncode(json_encode($payload));
        
        $signature = hash_hmac(
            'sha256',
            "$header_encoded.$payload_encoded",
            $this->secret_key,
            true
        );
        
        $signature_encoded = $this->base64UrlEncode($signature);
        
        return "$header_encoded.$payload_encoded.$signature_encoded";
    }
    
    // Decode JWT token
    public function decode($jwt_token) {
        $parts = explode('.', $jwt_token);
        
        // Check token format
        if (count($parts) != 3) {
            return false;
        }
        
        list($header_encoded, $payload_encoded, $signature_encoded) = $parts;
        
        // Verify signature
        $signature = $this->base64UrlDecode($signature_encoded);
        $expected_signature = hash_hmac(
            'sha256',
            "$header_encoded.$payload_encoded",
            $this->secret_key,
            true
        );
        
        if (!hash_equals($expected_signature, $signature)) {
            return false;
        }
        
        // Decode payload
        $payload = json_decode($this->base64UrlDecode($payload_encoded), true);
        
        // Check expiration
        if (isset($payload['exp']) && $payload['exp'] < time()) {
            return false;
        }
        
        return $payload;
    }
    
    // URL safe base64 encode
    private function base64UrlEncode($text) {
        return str_replace(
            ['+', '/', '='],
            ['-', '_', ''],
            base64_encode($text)
        );
    }
    
    // URL safe base64 decode
    private function base64UrlDecode($text) {
        $base64 = str_replace(
            ['-', '_'],
            ['+', '/'],
            $text
        );
        
        return base64_decode($base64);
    }
}