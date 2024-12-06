<?php
session_start();
$adminName = $_SESSION['admin_name'];
$adminId = $_SESSION['admin_id'];
$loginStatus = $_SESSION['login_status'];
header('Content-Type: application/json');
ini_set('display_errors', 0); // Do not display errors in the browser
ini_set('log_errors', 1);    // Log errors to the server's error log
ini_set('error_log', 'php_error_log'); //PHP Errors are Stored in this path
error_reporting(E_ALL);      // Report all errors

// Database connection
$conn = pg_connect("host=localhost port=5432 dbname=EventManagementSystem user=postgres password=postgreSQLPassword");

if (!$conn) {
    echo json_encode(["status" => "error", "message" => "Unable to connect to the database."]);
    exit;
}

// Handling POST request
if ($_SERVER['REQUEST_METHOD'] === "POST") {
    
    // Query to get user count
    $userCountQuery = "SELECT count(user_id) FROM users;";
    $result = pg_query($conn, $userCountQuery);
    
    if ($result) {
        $row = pg_fetch_assoc($result); 

        if ($row) {
            echo json_encode(["status" => "success", "adminName" => $adminName, "userCount" => $row['count']]);                  
        } else {
            echo json_encode(["status" => "error", "message" => "No user found."]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to execute query."]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Invalid request method."]);
}
?>
