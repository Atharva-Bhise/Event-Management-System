<?php
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

if (!isset($_SESSION['username']) || !isset($_SESSION['userId']) || $_SESSION['userLoggedIn'] === false) {
    header("Location: ../html/landing.html");
    exit;
}
$userName = $_SESSION['username'];
$userId = $_SESSION['userId'];
$loginStatus = $_SESSION['userLoggedIn'];
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
          
        if ($loginStatus === false) {
           $_SESSION['userLoggedIn'] = false;
            echo json_encode(["loggedStatus" => "logOff", "message" => "Logged out successfully."]);
            session_unset();
            session_destroy();
           exit;
        }
       
    }
        
    if ($loginStatus === true) {
        $query = "SELECT user_login.user_login_id, users.user_name, users_emails.user_email, users.user_dob,   
		users.user_address, users.user_city, users_phone_numbers.user_phone_no
        FROM users
        JOIN 
            Users_Emails ON users_emails.user_id = users.user_id
        JOIN 
            User_Login ON user_login.user_id = users.user_id
        JOIN 
            Users_Phone_numbers  ON users_phone_numbers.user_id = users.user_id
        WHERE 
            users.user_id = $1;";
        // Execute the query
        $result = pg_query_params($conn, $query, [$userId]);

        if ($result) {
            $row = pg_fetch_assoc($result);

            if ($row) {
                echo json_encode(["status" => "success",
                "userName" => $row['user_login_id'], 
                "userFullName" => $row['user_name'], 
                "userEmail" => $row['user_email'], 
                "userDOB" => $row['user_dob'],
                "userAddress" => $row['user_address'], 
                "userCity" => $row['user_city'],
                "userPhoneNo" => $row['user_phone_no']]);
            } else {
                // No user found
                echo json_encode(["status" => "failure", "message" => "Invalid Username"]);
            }
        } else {
            // Query execution failed
            error_log("Query Error: " . pg_last_error($conn));
            echo json_encode(["status" => "error", "message" => "Error executing query."]);
        }
    } 

} else {
    echo json_encode(["status" => "error", "message" => "Invalid request method."]);
}

// Close the database connection
pg_close($conn);
?>