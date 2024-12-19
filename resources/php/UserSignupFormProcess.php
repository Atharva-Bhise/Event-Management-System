<?php
header('Content-Type: application/json');
ini_set('display_errors', 0); // Do not display errors in the browser
ini_set('log_errors', 1);    // Log errors to the server's error log
ini_set('error_log', 'php_error_log'); //PHP Errors are Stored in this path
error_reporting(E_ALL);      // Report all errors
$conn = pg_connect("host=localhost port=5432 dbname=EventManagementSystem user=postgres password=postgreSQLPassword");
if($_SERVER['REQUEST_METHOD'] === "POST"){
         // Get the raw POST data
        $jsonData = file_get_contents('php://input');
        // Decode the JSON data
        $formData = json_decode($jsonData, true);
        
        // Check if data was decoded successfully
        if ($formData !== null) {
            $name = $formData['name'] ?? '';
            $email = $formData['email'] ?? '';
            $username = $formData['username'] ?? '';
            $phoneNo = $formData['phoneNo'] ?? '';
            $address = $formData['address'] ?? '';
            $city = $formData['city'] ?? '';
            $dob = $formData['dob'] ?? '';
            $gender = $formData['gender'] ?? '';
            $password = $formData['password'] ?? '';
            
            if (!$conn) {
                error_log("Database connection failed: " . pg_last_error());
                echo json_encode(["status" => "error", "message" => "Database connection failed."]);
                exit;
            }
            // Validate email format
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                echo json_encode(["status" => "invalid", "message" => "Invalid email format."]);
                exit;
            }
            // Start a transaction
            pg_query($conn, "BEGIN");

                try {
                    $hashedPassword = password_hash($password, PASSWORD_BCRYPT); //Encoded Password
                    $userExistsQuery = "SELECT COUNT(*) FROM user_login WHERE LOWER(user_login_id) = LOWER($1);";
                    $userExistsResult = pg_query_params($conn, $userExistsQuery, [$username]);
                    if($userExistsResult){
                        $count = pg_fetch_result($userExistsResult, 0, 0);
                         if ($count > 0) {
                            // Rollback the transaction on if the Username Already exists.
                            pg_query($conn, "ROLLBACK");
                            echo json_encode(["status" => "exists", "message" => "Username already exists."]);
                            exit;
                        }/*else{
                            echo json_encode(["status" => "available", "message" => "Username is available."]);
                        }*/
                    }
                    //Insert into Users table
                    $userInsertionQuery = "INSERT INTO users(user_name, user_password, user_address, user_city, user_dob, user_gender) 
                                        VALUES ($1, $2, $3, $4, $5, $6) RETURNING user_id;";
                    $userResult = pg_query_params($conn, $userInsertionQuery, [$name, $hashedPassword, $address, $city, $dob, $gender]);

                    if (!$userResult) {
                        throw new Exception("Error inserting into Users table: " . pg_last_error($conn));
                    }

                    // Retrieve the generated user_id
                    $userId = pg_fetch_result($userResult, 0, "user_id");

                    //Insert into User_Login table
                    $userLoginInsertionQuery = "INSERT INTO user_login(user_id, user_login_id, user_login_password) 
                                                VALUES ($1, $2, $3);";
                    $userLoginResult = pg_query_params($conn, $userLoginInsertionQuery, [$userId, $username, $hashedPassword]);

                    if (!$userLoginResult) {
                        throw new Exception("Error inserting into User_Login table: " . pg_last_error($conn));
                    }

                    //Insert into Users_Emails table
                    $userEmailInsertionQuery = "INSERT INTO users_emails(user_id, user_email) VALUES ($1, $2);";
                    $userEmailResult = pg_query_params($conn, $userEmailInsertionQuery, [$userId, $email]);

                    if (!$userEmailResult) {
                        throw new Exception("Error inserting into Users_Emails table: " . pg_last_error($conn));
                    }

                    //Insert into Users_Phone_numbers table
                    $userPhoneInsertionQuery = "INSERT INTO users_phone_numbers(user_id, user_phone_no) VALUES ($1, $2);";
                    $userPhoneResult = pg_query_params($conn, $userPhoneInsertionQuery, [$userId, $phoneNo]);

                    if (!$userPhoneResult) {
                        throw new Exception("Error inserting into Users_Phone_numbers table: " . pg_last_error($conn));
                    }

                    // Commit the transaction if all queries succeed
                    pg_query($conn, "COMMIT");
                    echo json_encode(["status" => "success", "message" => "Signup successful."]);                  

                } catch (Exception $e) {
                    // Rollback the transaction on any failure
                    pg_query($conn, "ROLLBACK");
                    error_log("Signup Error: " . $e->getMessage());
                    echo json_encode(["status" => "failure", "message" => "Signup Failed"]);
                }
            }else {
                echo json_encode(["status" => "error", "message" => "Invalid input data."]);
            }
}
pg_close($conn);
?>