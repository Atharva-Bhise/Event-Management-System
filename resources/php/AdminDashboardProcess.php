<?php
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");
header('Content-Type: application/json');
session_start();
if (!isset($_SESSION['login_status']) || $_SESSION['login_status'] === "loggedOff") {
    header("Location: ../html/adminLogin.html");
    exit;
}
$adminName = $_SESSION['admin_name'];
$lodId = $_SESSION['log_id'] ;
$adminId = $_SESSION['admin_id'];
$loginStatus = $_SESSION['login_status'];
ini_set('display_errors', 0); // Do not display errors in the browser
ini_set('log_errors', 1);    // Log errors to the server's error log
ini_set('error_log', 'php_error_log'); //PHP Errors are Stored in this path
error_reporting(E_ALL);      // Report all errors

// Database connection
$conn = pg_connect("host=localhost port=5432 dbname=EventManagementSystem user=postgres password=sqlPrutha");

if (!$conn) {
    echo json_encode(["status" => "error", "message" => "Unable to connect to the database."]);
    exit;
}

// Handling POST request
if ($_SERVER['REQUEST_METHOD'] === "POST") {
    

        // Get the raw POST data
        $jsonData = file_get_contents('php://input');
    
        // Decode the JSON data
        $logged = json_decode($jsonData, true);
        if ($logged !== null) {
            // Sanitize input
            $status = trim($logged['login_status']);    
            if ($status === "loggedOff") {
                $query = "UPDATE admin_logged
                        SET admin_loggedout_time = CURRENT_TIMESTAMP
                        WHERE log_id = $1;";
                $updationQueryResult = pg_query_params($conn, $query, [$lodId]);
                if($updationQueryResult){
                    $_SESSION['login_status'] = "loggedOff";
                    echo json_encode(["loggedStatus" => "logOff", "message" => "Logged out successfully."]);
                    session_unset();
                    session_destroy();
                    exit;
                }
            }
        }
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
// Close the database connection
pg_close($conn);
?>
