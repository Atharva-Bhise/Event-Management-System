<?php
header('Content-Type: application/json');
ini_set('display_errors', 0); // Do not display errors in the browser
ini_set('log_errors', 1);    // Log errors to the server's error log
ini_set('error_log', 'php_error_log'); //PHP Errors are Stored in this path
error_reporting(E_ALL);      // Report all errors

$conn = pg_connect("host=localhost port=5432 dbname=EventManagementSystem user=postgres password=cloud");

if($_SERVER['REQUEST_METHOD'] === "POST"){
    ob_start(); // Start output buffering
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
           
            if(!$conn){
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
                    $organizerExistsQuery = "SELECT COUNT(*) FROM organizer_login WHERE LOWER(organizer_login_id) = LOWER($1);";
                    $organizerExistsResult = pg_query_params($conn, $organizerExistsQuery, [$username]);
                    if($organizerExistsResult){
                        $count = pg_fetch_result($organizerExistsResult, 0, 0);
                         if ($count > 0) {
                            // Rollback the transaction on if the Username Already exists.
                            pg_query($conn, "ROLLBACK");

                            echo json_encode(["status" => "exists", "message" => "Username already exists."]);
                            exit;
                        }/*else{
                            echo json_encode(["status" => "available", "message" => "Username is available."]);
                        }*/
                    }
                    //Insert into Organizer table
                    $organizerInsertionQuery = "INSERT INTO organizer(
                                organizer_name, organizer_phone, organizer_login_password, 
                                organizer_address, organizer_city, organizer_dob, organizer_gender)
                                VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING organizer_id;";
                    $organizerResult = pg_query_params($conn, $organizerInsertionQuery, [$name, $phoneNo, $hashedPassword, $address, $city, $dob, $gender]);

                    if (!$organizerResult) {
                        throw new Exception("Error inserting into organizer table: " . pg_last_error($conn));
                    }

                    // Retrieve the generated organizer_id
                    $organizerId = pg_fetch_result($organizerResult, 0, "organizer_id");

                    //Insert into organizer_login table
                    $organizerLoginInsertionQuery = "INSERT INTO organizer_login(
                            organizer_id, organizer_login_id, organizer_login_password)
                            VALUES ($1, $2, $3);";
                    $organizerLoginResult = pg_query_params($conn, $organizerLoginInsertionQuery, [$organizerId, $username, $hashedPassword]);

                    if (!$organizerLoginResult) {
                        throw new Exception("Error inserting into organizer_Login table: " . pg_last_error($conn));
                    }

                    //Insert into organizer_emails table
                    $organizerEmailInsertionQuery = "INSERT INTO organizer_emails(
                                        organizer_id, organizer_email)
                                        VALUES ($1, $2);";
                    $organizerEmailResult = pg_query_params($conn, $organizerEmailInsertionQuery, [$organizerId, $email]);

                    if (!$organizerEmailResult) {
                        throw new Exception("Error inserting into organizer_Emails table: " . pg_last_error($conn));
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