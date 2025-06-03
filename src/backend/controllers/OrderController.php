<?php
require_once __DIR__ . '/../models/Order.php';
require_once __DIR__ . '/../models/Cart.php';
require_once __DIR__ . '/../models/Product.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class OrderController {
    private $db;
    private $authMiddleware;
    
    public function __construct($db) {
        $this->db = $db;
        $this->authMiddleware = new AuthMiddleware();
    }
    
    // Get user orders
    public function getUserOrders() {
        // Validate token
        $userData = $this->authMiddleware->validateToken();
        
        if (!$userData) {
            Response::unauthorized();
        }
        
        // Create order object
        $order = new Order($this->db);
        $order->user_id = $userData['id'];
        
        // Get orders
        $result = $order->getUserOrders();
        
        $orders_arr = [];
        $orders_arr['data'] = [];
        
        while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
            // Get order items
            $order->id = $row['id'];
            $order->getOrderDetails();
            
            $order_item = [
                'id' => $row['id'],
                'userId' => $row['user_id'],
                'totalPrice' => $row['total_price'],
                'status' => $row['status'],
                'createdAt' => $row['created_at'],
                'items' => $order->items
            ];
            
            array_push($orders_arr['data'], $order_item);
        }
        
        $orders_arr['success'] = true;
        
        // Set response code - 200 OK
        Response::json($orders_arr);
    }
    
    // Get order details
    public function getOrderDetails($id) {
        // Validate token
        $userData = $this->authMiddleware->validateToken();
        
        if (!$userData) {
            Response::unauthorized();
        }
        
        // Create order object
        $order = new Order($this->db);
        $order->id = $id;
        
        // Get order details
        if ($order->getOrderDetails()) {
            // Check if the order belongs to the user or if the user is an admin
            if ($order->user_id != $userData['id'] && !$userData['isAdmin']) {
                Response::unauthorized('You are not authorized to view this order');
            }
            
            $order_arr = [
                'success' => true,
                'data' => [
                    'id' => $order->id,
                    'userId' => $order->user_id,
                    'totalPrice' => $order->total_price,
                    'status' => $order->status,
                    'createdAt' => $order->created_at,
                    'items' => $order->items
                ]
            ];
            
            // Set response code - 200 OK
            Response::json($order_arr);
        } else {
            Response::notFound('Order not found');
        }
    }
    
    // Create order from cart
    public function createOrder() {
        // Validate token
        $userData = $this->authMiddleware->validateToken();
        
        if (!$userData) {
            Response::unauthorized();
        }
        
        // Get posted data
        $data = json_decode(file_get_contents("php://input"));
        
        // Validate required fields
        if (
            empty($data->shippingAddress) ||
            empty($data->paymentMethod)
        ) {
            Response::error('Missing required fields', 400);
        }
        
        // Get cart items
        $cart = new Cart($this->db);
        $cart->user_id = $userData['id'];
        $result = $cart->getUserCart();
        
        $cart_items = [];
        $total_price = 0;
        
        while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
            $item = [
                'product_id' => $row['product_id'],
                'quantity' => $row['quantity'],
                'price' => $row['price']
            ];
            
            array_push($cart_items, $item);
            
            // Calculate total price
            $total_price += $row['price'] * $row['quantity'];
        }
        
        // Check if cart is not empty
        if (empty($cart_items)) {
            Response::error('Cart is empty', 400);
        }
        
        // Create order
        $order = new Order($this->db);
        $order->user_id = $userData['id'];
        $order->total_price = $total_price;
        $order->status = 'pending';
        $order->items = $cart_items;
        
        if ($order->create()) {
            // Clear the cart
            $cart->clearCart();
            
            // Get order details
            $order->getOrderDetails();
            
            $order_arr = [
                'success' => true,
                'data' => [
                    'id' => $order->id,
                    'userId' => $order->user_id,
                    'totalPrice' => $order->total_price,
                    'status' => $order->status,
                    'createdAt' => $order->created_at,
                    'items' => $order->items
                ],
                'message' => 'Order created successfully'
            ];
            
            // Set response code - 201 Created
            Response::json($order_arr, 201);
        } else {
            Response::serverError('Unable to create order');
        }
    }
    
    // Get all orders (admin only)
    public function getAllOrders() {
        // Validate admin token
        $userData = $this->authMiddleware->validateAdminToken();
        
        if (!$userData) {
            Response::unauthorized('Admin access required');
        }
        
        // Create order object
        $order = new Order($this->db);
        
        // Get all orders
        $result = $order->getAllOrders();
        
        $orders_arr = [];
        $orders_arr['data'] = [];
        
        while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
            $order_item = [
                'id' => $row['id'],
                'userId' => $row['user_id'],
                'userName' => $row['user_name'],
                'totalPrice' => $row['total_price'],
                'status' => $row['status'],
                'createdAt' => $row['created_at']
            ];
            
            array_push($orders_arr['data'], $order_item);
        }
        
        $orders_arr['success'] = true;
        
        // Set response code - 200 OK
        Response::json($orders_arr);
    }
    
    // Update order status (admin only)
    public function updateStatus($id) {
        // Validate admin token
        $userData = $this->authMiddleware->validateAdminToken();
        
        if (!$userData) {
            Response::unauthorized('Admin access required');
        }
        
        // Get posted data
        $data = json_decode(file_get_contents("php://input"));
        
        // Validate required fields
        if (empty($data->status)) {
            Response::error('Status is required', 400);
        }
        
        // Validate status value
        $allowed_statuses = ['pending', 'processing', 'shipped', 'delivered'];
        if (!in_array($data->status, $allowed_statuses)) {
            Response::error('Invalid status value', 400);
        }
        
        // Create order object
        $order = new Order($this->db);
        $order->id = $id;
        
        // Check if order exists
        if (!$order->getOrderDetails()) {
            Response::notFound('Order not found');
        }
        
        // Set new status
        $order->status = $data->status;
        
        // Update status
        if ($order->updateStatus()) {
            Response::success(null, 'Order status updated successfully');
        } else {
            Response::serverError('Unable to update order status');
        }
    }
}