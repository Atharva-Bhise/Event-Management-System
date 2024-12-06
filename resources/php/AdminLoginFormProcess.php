<?php
session_start();
header('Content-Type: application/json');
ini_set('display_errors', 0); // Do not display errors in the browser
ini_set('log_errors', 1);    // Log errors to the server's error log
ini_set('error_log', 'php_error_log'); //PHP Errors are Stored in this path
error_reporting(E_ALL);      // Report all errors
$conn = pg_connect("host=localhost port=5432 dbname=EventManagementSystem user=postgres password=postgreSQLPassword");


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
        $password = trim($formData['password'] ?? '');

        if (empty($username) || empty($password)) {
            echo json_encode(["status" => "error", "message" => "Username and password are required."]);
            exit;
        }

        // Query to validate user credentials
        $query = "SELECT admins.admin_id, admins.admin_name, admin_login.admin_login_password 
                  FROM admins
                  JOIN admin_login ON admins.admin_id = admin_login.admin_id 
                  WHERE admin_login.admin_username = $1";

        // Execute the query
        $result = pg_query_params($conn, $query, [$username]);

        if ($result) {
            $row = pg_fetch_assoc($result); 

            if ($row) {
                // Debugging: Check the result structure
                 // This will show the available columns in the result

                // Verify password
                if (password_verify($password, $row['admin_login_password'])) {
                    
                    $insertionQuery = "INSERT INTO admin_logged(admin_id)
                                VALUES ($1);";
                    $insertionQueryResult = pg_query_params($conn, $insertionQuery, [$row['admin_id']]);
                    if($insertionQueryResult){
                        // User found and password matched
                        $_SESSION['admin_name'] = $row['admin_name'];
                        $_SESSION['admin_id'] = $row['admin_id'];
                        $_SESSION['login_status'] = "loggedIn"; 
                        echo json_encode(["status" => "success", "message" => "Login successful."]);                  
                    }else{
                        echo json_encode(["status" => "error", "message" => "Failed to Login"]);
                    }    
                } else {
                    // Invalid credentials
                    echo json_encode(["status" => "failure", "message" => "Invalid username or password."]);
                }
            } else {
                // No user found
                echo json_encode(["status" => "failure", "message" => "Invalid username or password."]);
            }
        } else {
            // Query execution failed
            error_log("Query Error: " . pg_last_error($conn));
            echo json_encode(["status" => "error", "message" => "Error executing query."]);
        }
    } else {
        // Invalid JSON data
        echo json_encode(["status" => "error", "message" => "Invalid data received."]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Invalid request method."]);
}

// Close the database connection
pg_close($conn);
?>