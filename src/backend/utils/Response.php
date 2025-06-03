<?php
class Response {
    public static function json($data, $status_code = 200) {
        http_response_code($status_code);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }
    
    public static function success($data = null, $message = 'Success') {
        $response = [
            'success' => true,
            'message' => $message
        ];
        
        if ($data !== null) {
            $response['data'] = $data;
        }
        
        self::json($response);
    }
    
    public static function error($message = 'An error occurred', $status_code = 400) {
        $response = [
            'success' => false,
            'error' => $message
        ];
        
        self::json($response, $status_code);
    }
    
    public static function unauthorized($message = 'Unauthorized') {
        self::error($message, 401);
    }
    
    public static function notFound($message = 'Resource not found') {
        self::error($message, 404);
    }
    
    public static function serverError($message = 'Internal server error') {
        self::error($message, 500);
    }
}