<?php
session_start();
// Validate session variables
if (!isset($_SESSION['username']) || !isset($_SESSION['userID'])) {
    echo json_encode(["status" => "error", "message" => "Session expired. Please log in again."]);
    exit;
}
$username = $_SESSION['username'];
$userId = $_SESSION['userID'];
header('Content-Type: application/json');
ini_set('display_errors', 0); // Do not display errors in the browser
ini_set('log_errors', 1);    // Log errors to the server's error log
ini_set('error_log', 'php_error_log'); //PHP Errors are Stored in this path
error_reporting(E_ALL);      // Report all errors
$conn = pg_connect("host=localhost port=5432 dbname=EventManagementSystem user=postgres password=ab18");
if($_SERVER['REQUEST_METHOD'] === "POST"){
         // Get the raw POST data
        $jsonData = file_get_contents('php://input');
        // Decode the JSON data
        $formData = json_decode($jsonData, true);
        
        // Check if data was decoded successfully
        if ($formData !== null) {
            $password = $formData['password'] ?? '';
            
            if (!$conn) {
                error_log("Database connection failed: " . pg_last_error());
                echo json_encode(["status" => "error", "message" => "Database connection failed."]);
                exit;
            }
            // Start a transaction
            pg_query($conn, "BEGIN");

                try {
                    $hashedPassword = password_hash($password, PASSWORD_BCRYPT); //Encoded Password
    
                    //Insert into Users table
                    $userInsertionQuery = "UPDATE users
                            SET user_password = $1 
                            WHERE user_id= $2;";
                    $userResult = pg_query_params($conn, $userInsertionQuery, [$hashedPassword, $userId]);

                    if (!$userResult) {
                        throw new Exception("Error inserting into Users table: " . pg_last_error($conn));
                    }

                    //Insert into User_Login table
                    $userLoginInsertionQuery = "UPDATE user_login
                            SET user_login_password = $1
                            WHERE user_id = $2;";
                    $userLoginResult = pg_query_params($conn, $userLoginInsertionQuery, [$hashedPassword, $userId]);

                    if (!$userLoginResult) {
                        throw new Exception("Error inserting into User_Login table: " . pg_last_error($conn));
                    }

                    // Commit the transaction if all queries succeed
                    pg_query($conn, "COMMIT");
                    echo json_encode(["status" => "success", "message" => "Password Changed Successfully"]);     
                    session_unset();
                    session_destroy();  
                    exit;           
                } catch (Exception $e) {
                    // Rollback the transaction on any failure
                    pg_query($conn, "ROLLBACK");
                    error_log("Signup Error: " . $e->getMessage());
                    echo json_encode(["status" => "failure", "message" => "Failed To Change The Password"]);
                }
            }else {
                echo json_encode(["status" => "error", "message" => "Invalid input data."]);
            }
}
pg_close($conn);
?>