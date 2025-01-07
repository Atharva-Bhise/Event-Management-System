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
    //Create an array to hold the response data
    $response = [];
    // Get the raw POST data
    $jsonData = file_get_contents('php://input');
    
    // Decode the JSON data
    $formData = json_decode($jsonData, true);
    if ($formData !== null) {
            // Sanitize input
          
        pg_query($conn, "BEGIN");
        try {
            if(isset($formData['userName'])){
                $username = $formData['userName'];
                $userExistsQuery = "SELECT COUNT(*) FROM user_login WHERE LOWER(user_login_id) = LOWER($1);";
                    $userExistsResult = pg_query_params($conn, $userExistsQuery, [$username]);
                    if($userExistsResult){
                        $count = pg_fetch_result($userExistsResult, 0, 0);
                         if ($count > 0) {
                            // Rollback the transaction on if the Username Already exists.
                            pg_query($conn, "ROLLBACK");
                            echo json_encode(["status" => "exists", "message" => "Username already exists."]);
                            exit;
                        }else{
                            $userIdUpadateQuery = "UPDATE user_login
                                    SET user_login_id=$1
                                    WHERE user_id = $2;";
                            $userIdUpadateResult = pg_query_params($conn, $userIdUpadateQuery, [$username, $userId]);
                            if (!$userIdUpadateResult) {
                                throw new Exception("Error inserting into User_Login table: " . pg_last_error($conn));
                            }
                            pg_query($conn, "COMMIT");
                            array_push($response, ["status" => "success", "message" => "Username Changed Successfully"]);
                            //echo json_encode(["status" => "success", "message" => "Username Changed Successfully"]); 
                        }
                    }
            }
            if(isset($formData['fullName'])){
                $fullName = $formData['fullName'];
                            $userFullNameUpadateQuery = "UPDATE users
                                        SET user_name=$1
                                        WHERE user_id = $2;";
                                        
                            $userFullNameUpadateResult = pg_query_params($conn, $userFullNameUpadateQuery, [$fullName, $userId]);
                            if (!$userFullNameUpadateResult) {
                                throw new Exception("Error inserting into User_Login table: " . pg_last_error($conn));
                            }
                            pg_query($conn, "COMMIT");
                            array_push($response, ["status" => "success", "message" => "User's Full-Name Successfully"]);
                            //echo json_encode(["status" => "success", "message" => "User Full-Name Changed Successfully"]); 
            }
            if(isset($formData['email'])){
                $email = $formData['email'];
                            $userEmailUpadateQuery = "UPDATE users_emails
                                            SET user_email=$1
                                            WHERE user_id = $2;";
                          
                            $userEmailUpadateResult = pg_query_params($conn, $userEmailUpadateQuery, [$email, $userId]);
                            if (!$userEmailUpadateResult) {
                                throw new Exception("Error inserting into User_Login table: " . pg_last_error($conn));
                            }
                            pg_query($conn, "COMMIT");
                            array_push($response, ["status" => "success", "message" => "User's Email Successfully"]);
                            //echo json_encode(["status" => "success", "message" => "User Email Changed Successfully"]); 
            }
            if(isset($formData['currentPassword'])){
                $currentPassword = $formData['currentPassword'];
                            $currentPasswordQuery = "SELECT user_login_password FROM user_login
                                WHERE user_id = $1;";
                          
                            $currentPasswordResult = pg_query_params($conn, $currentPasswordQuery, [$userId]);
                            if ($currentPasswordResult) {
                                $row = pg_fetch_assoc($currentPasswordResult); 
                    
                                if ($row) {
                                    // Debugging: Check the result structure
                                     // This will show the available columns in the result
                    
                                    // Verify password
                                    
                                    if (password_verify($currentPassword, $row['user_login_password'])) {
                                        if(isset($formData['newPassword'])){
                                            $newPassword = $formData['newPassword'];
                                            $hashedPassword = password_hash($newPassword, PASSWORD_BCRYPT);
                                            $userPasswordUpadateQuery = "UPDATE user_login
                                                SET user_login_password=$1
                                                WHERE user_id = $2;";
                                            $userPasswordUpadateResult = pg_query_params($conn, $userPasswordUpadateQuery, [$hashedPassword, $userId]);
                                            if (!$userPasswordUpadateResult) {
                                                throw new Exception("Error inserting into User_Login table: " . pg_last_error($conn));
                                            }
                                                    //Insert into Users table
                                            $userInsertionQuery = "UPDATE users
                                                        SET user_password = $1 
                                                        WHERE user_id= $2;";
                                            $userResult = pg_query_params($conn, $userInsertionQuery, [$hashedPassword, $userId]);

                                                if (!$userResult) {
                                                    throw new Exception("Error inserting into Users table: " . pg_last_error($conn));
                                                }
                                            pg_query($conn, "COMMIT");
                                            array_push($response, ["status" => "success", "message" => "User's Password Successfully"]);
                                            //echo json_encode(["status" => "success", "message" => "User password Changed Successfully"]); 
                                        }else{
                                            array_push($response, ["status" => "failure", "message" => "Invalid New Password"]);
                                            //echo json_encode(["status" => "failure", "message" => "Invalid New Password"]);
                                        }
                                    } else {
                                        // Invalid credentials
                                        array_push($response, ["status" => "failure", "message" => "Invalid Current Password"]);
                                        //echo json_encode(["status" => "failure", "message" => "Invalid Current Password"]);
                                    }
                                } 
                            if (!$currentPasswordResult) {
                                throw new Exception("Error inserting into User_Login table: " . pg_last_error($conn));
                            }
                            //pg_query($conn, "COMMIT");
                            //echo json_encode(["status" => "success", "message" => "User New  Changed Successfully"]); 
                             }
        }            
        if(isset($formData['dob'])){
            $dob = $formData['dob'];
            $userDOBUpadateQuery = "UPDATE users
                        SET user_dob=$1
                        WHERE user_id = $2;";
                            $userDOBUpadateResult = pg_query_params($conn, $userDOBUpadateQuery, [$dob, $userId]);
                            if (!$userDOBUpadateResult) {
                                throw new Exception("Error inserting into User_Login table: " . pg_last_error($conn));
                            }
                            pg_query($conn, "COMMIT");
                            array_push($response, ["status" => "success", "message" => "User's DOB Successfully"]);
                            //echo json_encode(["status" => "success", "message" => "User DOB Changed Successfully"]);                         

        }
        if(isset($formData['address'])){
            $address = $formData['address'];
            $userAddressUpadateQuery = "UPDATE users
                        SET user_address=$1
                        WHERE user_id = $2;";
                            $userAddressUpadateResult = pg_query_params($conn, $userAddressUpadateQuery, [$address, $userId]);
                            if (!$userAddressUpadateResult) {
                                throw new Exception("Error inserting into User_Login table: " . pg_last_error($conn));
                            }
                            pg_query($conn, "COMMIT");
                            array_push($response, ["status" => "success", "message" => "User's Address Successfully"]);
                            //echo json_encode(["status" => "success", "message" => "User Address Changed Successfully"]);                         

        }
        if(isset($formData['city'])){
            $city = $formData['city'];
            $userCityUpadateQuery = "UPDATE users
                        SET user_city=$1
                        WHERE user_id = $2;";
                            $userCityUpadateResult = pg_query_params($conn, $userCityUpadateQuery, [$city, $userId]);
                            if (!$userCityUpadateResult) {
                                throw new Exception("Error inserting into User_Login table: " . pg_last_error($conn));
                            }
                            pg_query($conn, "COMMIT");
                            array_push($response, ["status" => "success", "message" => "User's City Successfully"]);
                            //echo json_encode(["status" => "success", "message" => "User City Changed Successfully"]);                         

        }
        if(isset($formData['phoneNo'])){
            $phoneNo = $formData['phoneNo'];
            $userPhoneNoUpadateQuery = "UPDATE users_phone_numbers
                        SET user_phone_no=$1
                        WHERE user_id=$2;";
                            $userPhoneNoUpadateResult = pg_query_params($conn, $userPhoneNoUpadateQuery, [$phoneNo, $userId]);
                            if (!$userPhoneNoUpadateResult) {
                                throw new Exception("Error inserting into User_Login table: " . pg_last_error($conn));
                            }
                            pg_query($conn, "COMMIT");
                            array_push($response, ["status" => "success", "message" => "User's Phone Number Successfully"]);
                            //echo json_encode(["status" => "success", "message" => "User Phone Number Changed Successfully"]);                         

        }
        echo json_encode($response); 
        } catch (Exception $e) {
            pg_query($conn, "ROLLBACK");
            echo json_encode(["status" => "error", "message" => "Error processing request."]);
            exit;
        }
    }
        
} else {
    echo json_encode(["status" => "error", "message" => "Invalid request method."]);
}

// Close the database connection
pg_close($conn);
?>