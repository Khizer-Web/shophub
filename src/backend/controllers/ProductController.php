<?php
require_once __DIR__ . '/../models/Product.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class ProductController {
    private $db;
    private $authMiddleware;
    
    public function __construct($db) {
        $this->db = $db;
        $this->authMiddleware = new AuthMiddleware();
    }
    
    // Get all products
    public function getAll() {
        $product = new Product($this->db);
        $result = $product->read();
        
        $products_arr = [];
        $products_arr['data'] = [];
        
        while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
            extract($row);
            
            $product_item = [
                'id' => $id,
                'title' => $title,
                'description' => $description,
                'price' => $price,
                'image' => $image,
                'stock' => $stock,
                'category' => $category
            ];
            
            array_push($products_arr['data'], $product_item);
        }
        
        $products_arr['success'] = true;
        
        // Set response code - 200 OK
        Response::json($products_arr);
    }
    
    // Get products by category
    public function getByCategory($category) {
        $product = new Product($this->db);
        $result = $product->readByCategory($category);
        
        $products_arr = [];
        $products_arr['data'] = [];
        
        while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
            extract($row);
            
            $product_item = [
                'id' => $id,
                'title' => $title,
                'description' => $description,
                'price' => $price,
                'image' => $image,
                'stock' => $stock,
                'category' => $category
            ];
            
            array_push($products_arr['data'], $product_item);
        }
        
        $products_arr['success'] = true;
        
        // Set response code - 200 OK
        Response::json($products_arr);
    }
    
    // Get single product
    public function getOne($id) {
        $product = new Product($this->db);
        $product->id = $id;
        
        // Get product
        if ($product->readOne()) {
            $product_arr = [
                'success' => true,
                'data' => [
                    'id' => $product->id,
                    'title' => $product->title,
                    'description' => $product->description,
                    'price' => $product->price,
                    'image' => $product->image,
                    'stock' => $product->stock,
                    'category' => $product->category
                ]
            ];
            
            // Set response code - 200 OK
            Response::json($product_arr);
        } else {
            // Set response code - 404 Not found
            Response::notFound('Product not found');
        }
    }
    
    // Create product (admin only)
    public function create() {
        // Check admin authentication
        $userData = $this->authMiddleware->validateAdminToken();
        
        if (!$userData) {
            Response::unauthorized('Admin access required');
        }
        
        // Get posted data
        $data = json_decode(file_get_contents("php://input"));
        
        // Validate required fields
        if (
            empty($data->title) ||
            empty($data->description) ||
            empty($data->price) ||
            empty($data->stock) ||
            empty($data->category)
        ) {
            Response::error('Missing required fields', 400);
        }
        
        // Create product object
        $product = new Product($this->db);
        
        // Set product property values
        $product->title = $data->title;
        $product->description = $data->description;
        $product->price = $data->price;
        $product->image = $data->image ?? '';
        $product->stock = $data->stock;
        $product->category = $data->category;
        
        // Create product
        if ($product->create()) {
            Response::success([
                'id' => $product->id,
                'title' => $product->title,
                'description' => $product->description,
                'price' => $product->price,
                'image' => $product->image,
                'stock' => $product->stock,
                'category' => $product->category
            ], 'Product created successfully');
        } else {
            Response::serverError('Unable to create product');
        }
    }
    
    // Update product (admin only)
    public function update($id) {
        // Check admin authentication
        $userData = $this->authMiddleware->validateAdminToken();
        
        if (!$userData) {
            Response::unauthorized('Admin access required');
        }
        
        // Get posted data
        $data = json_decode(file_get_contents("php://input"));
        
        // Create product object
        $product = new Product($this->db);
        
        // Set ID to be updated
        $product->id = $id;
        
        // Check if product exists
        if (!$product->readOne()) {
            Response::notFound('Product not found');
        }
        
        // Set product property values
        if (isset($data->title)) $product->title = $data->title;
        if (isset($data->description)) $product->description = $data->description;
        if (isset($data->price)) $product->price = $data->price;
        if (isset($data->image)) $product->image = $data->image;
        if (isset($data->stock)) $product->stock = $data->stock;
        if (isset($data->category)) $product->category = $data->category;
        
        // Update product
        if ($product->update()) {
            Response::success([
                'id' => $product->id,
                'title' => $product->title,
                'description' => $product->description,
                'price' => $product->price,
                'image' => $product->image,
                'stock' => $product->stock,
                'category' => $product->category
            ], 'Product updated successfully');
        } else {
            Response::serverError('Unable to update product');
        }
    }
    
    // Delete product (admin only)
    public function delete($id) {
        // Check admin authentication
        $userData = $this->authMiddleware->validateAdminToken();
        
        if (!$userData) {
            Response::unauthorized('Admin access required');
        }
        
        // Create product object
        $product = new Product($this->db);
        
        // Set ID to be deleted
        $product->id = $id;
        
        // Check if product exists
        if (!$product->readOne()) {
            Response::notFound('Product not found');
        }
        
        // Delete product
        if ($product->delete()) {
            Response::success(null, 'Product deleted successfully');
        } else {
            Response::serverError('Unable to delete product');
        }
    }
    
    // Search products
    public function search($keywords) {
        $product = new Product($this->db);
        $result = $product->search($keywords);
        
        $products_arr = [];
        $products_arr['data'] = [];
        
        while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
            extract($row);
            
            $product_item = [
                'id' => $id,
                'title' => $title,
                'description' => $description,
                'price' => $price,
                'image' => $image,
                'stock' => $stock,
                'category' => $category
            ];
            
            array_push($products_arr['data'], $product_item);
        }
        
        $products_arr['success'] = true;
        
        // Set response code - 200 OK
        Response::json($products_arr);
    }
}