<?php
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
            
            if(!$conn){
                die("Connection failed: " . pg_last_error());
            }
            // Start a transaction
            pg_query($conn, "BEGIN");

                try {
                    //Insert into Users table
                    $userInsertionQuery = "INSERT INTO users(user_name, user_password, user_address, user_city, user_dob, user_gender) 
                                        VALUES ($1, $2, $3, $4, $5, $6) RETURNING user_id;";
                    $userResult = pg_query_params($conn, $userInsertionQuery, [$name, $password, $address, $city, $dob, $gender]);

                    if (!$userResult) {
                        throw new Exception("Error inserting into Users table: " . pg_last_error($conn));
                    }

                    // Retrieve the generated user_id
                    $userId = pg_fetch_result($userResult, 0, "user_id");

                    //Insert into User_Login table
                    $userLoginInsertionQuery = "INSERT INTO user_login(user_id, user_login_id, user_login_password) 
                                                VALUES ($1, $2, $3);";
                    $userLoginResult = pg_query_params($conn, $userLoginInsertionQuery, [$userId, $username, $password]);

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
                    echo json_encode(["error" => "$e->getMessage()"]);
                }

        } else {
            echo json_encode(["error" => "Error decoding JSON data!"]);
        }
        
        

    }
    pg_close($conn);
?>