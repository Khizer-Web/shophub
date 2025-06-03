<?php
// Headers for CORS and JSON
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Include database and models
require_once 'config/Database.php';
require_once 'utils/Response.php';

// Get database connection
$database = new Database();
$db = $database->getConnection();

// Get request URI
$request_uri = $_SERVER['REQUEST_URI'];
$base_path = '/api';

// Remove base path from URI
$request_uri = substr($request_uri, strlen($base_path));

// Get request method
$request_method = $_SERVER['REQUEST_METHOD'];

// Parse URI parts
$uri_parts = explode('/', trim($request_uri, '/'));
$resource = $uri_parts[0] ?? '';
$id = $uri_parts[1] ?? null;
$action = $uri_parts[2] ?? null;

// Route request to appropriate controller
try {
    // Products routes
    if ($resource == 'products') {
        require_once 'controllers/ProductController.php';
        $controller = new ProductController($db);
        
        if ($request_method == 'GET') {
            // Get query parameters
            $category = $_GET['category'] ?? null;
            $search = $_GET['q'] ?? null;
            
            if ($search) {
                $controller->search($search);
            } else if ($category) {
                $controller->getByCategory($category);
            } else {
                $controller->getAll();
            }
        } else if ($request_method == 'POST') {
            $controller->create();
        } else {
            Response::error('Method not allowed', 405);
        }
    }
    // Single product routes
    else if ($resource == 'product' && $id) {
        require_once 'controllers/ProductController.php';
        $controller = new ProductController($db);
        
        if ($request_method == 'GET') {
            $controller->getOne($id);
        } else if ($request_method == 'PUT') {
            $controller->update($id);
        } else if ($request_method == 'DELETE') {
            $controller->delete($id);
        } else {
            Response::error('Method not allowed', 405);
        }
    }
    // User routes
    else if ($resource == 'user') {
        require_once 'controllers/UserController.php';
        $controller = new UserController($db);
        
        if ($id == 'register' && $request_method == 'POST') {
            $controller->register();
        } else if ($id == 'login' && $request_method == 'POST') {
            $controller->login();
        } else if ($id == 'profile') {
            if ($request_method == 'GET') {
                $controller->getProfile();
            } else if ($request_method == 'PUT') {
                $controller->updateProfile();
            } else {
                Response::error('Method not allowed', 405);
            }
        } else if ($id == 'password' && $request_method == 'PUT') {
            $controller->updatePassword();
        } else {
            Response::error('Endpoint not found', 404);
        }
    }
    // Cart routes
    else if ($resource == 'cart') {
        require_once 'controllers/CartController.php';
        $controller = new CartController($db);
        
        if ($request_method == 'GET') {
            $controller->getCart();
        } else if ($request_method == 'POST') {
            $controller->addItem();
        } else if ($request_method == 'DELETE' && !$id) {
            $controller->clearCart();
        } else if ($request_method == 'PUT' && $id) {
            $controller->updateItem($id);
        } else if ($request_method == 'DELETE' && $id) {
            $controller->removeItem($id);
        } else {
            Response::error('Method not allowed', 405);
        }
    }
    // Orders routes
    else if ($resource == 'orders') {
        require_once 'controllers/OrderController.php';
        $controller = new OrderController($db);
        
        if ($request_method == 'GET') {
            $controller->getUserOrders();
        } else if ($request_method == 'POST') {
            $controller->createOrder();
        } else {
            Response::error('Method not allowed', 405);
        }
    }
    // Single order routes
    else if ($resource == 'order' && $id) {
        require_once 'controllers/OrderController.php';
        $controller = new OrderController($db);
        
        if ($request_method == 'GET') {
            $controller->getOrderDetails($id);
        } else {
            Response::error('Method not allowed', 405);
        }
    }
    // Admin routes
    else if ($resource == 'admin') {
        if ($id == 'orders') {
            require_once 'controllers/OrderController.php';
            $controller = new OrderController($db);
            
            if ($request_method == 'GET') {
                $controller->getAllOrders();
            } else {
                Response::error('Method not allowed', 405);
            }
        }
        else if ($id == 'order' && $action) {
            require_once 'controllers/OrderController.php';
            $controller = new OrderController($db);
            
            if ($request_method == 'PUT') {
                $controller->updateStatus($action);
            } else {
                Response::error('Method not allowed', 405);
            }
        }
        else {
            Response::error('Endpoint not found', 404);
        }
    }
    // Default - endpoint not found
    else {
        Response::error('Endpoint not found', 404);
    }
} catch (Exception $e) {
    Response::serverError($e->getMessage());
}