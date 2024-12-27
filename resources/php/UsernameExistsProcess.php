<?php
//To check if the username exists in the database after clicking on the forgot password button
session_start();
//Importing autoload.php
require 'C:/xampp/php/composer/vendor/autoload.php';

// Specify the path to your .env file in the project root
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../../');  // Move two directories up to the project root
$dotenv->load();
header('Content-Type: application/json');
ini_set('display_errors', 0); // Do not display errors in the browser
ini_set('log_errors', 1);    // Log errors to the server's error log
ini_set('error_log', 'php_error_log'); //PHP Errors are Stored in this path
error_reporting(E_ALL);      // Report all errors

//Use $_ENV Super Global Variable for Password
$postgresqlPassword = $_ENV['POSTGRESQL_PASSWORD'];
$conn = pg_connect("host=localhost port=5432 dbname=EventManagementSystem user=postgres password=". $postgresqlPassword);


if (!$conn) {
    echo json_encode(["status" => "error", "message" => "Unable to connect to the database."]);
    exit;
}
if ($_SERVER['REQUEST_METHOD'] === "POST") {
    // Get the raw POST data
    $jsonData = file_get_contents('php://input');
    
    // Decode the JSON data
    $formData = json_decode($jsonData, true);

    if ($formData !== null) {
        // Sanitize input
        $username = trim($formData['username'] ?? '');
    if(!empty($username)){
        $userExistsQuery = "SELECT user_login.user_login_id 
              FROM user_login
              WHERE user_login.user_login_id = $1";
        // Execute the query
    $userExistsResult = pg_query_params($conn, $userExistsQuery, [$username]);

    if ($userExistsResult) {
        $row = pg_fetch_assoc($userExistsResult); 

        if ($row) {
                echo json_encode(["status" => "exists", "message" => "Username Found"]); 
                $_SESSION['username'] = $username; 
                exit;           
            } else {
                // Invalid credentials
                echo json_encode(["status" => "notExists", "message" => "Username NOT Found"]);
                exit;
            }
        }
        }
    }
}

?>