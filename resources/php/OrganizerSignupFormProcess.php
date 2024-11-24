<?php
<<<<<<< HEAD
$conn = pg_connect("host=localhost port=5432 dbname=EventManagementSystem user=postgres password=ab18");
=======
$conn = pg_connect("host=localhost port=5432 dbname=EventManagementSystem user=postgres password=postgreSQLPassword");
>>>>>>> b9d2f5b4052b2578a8e3d233f3cfc84874514882
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
                    //Insert into Organizer table
                    $organizerInsertionQuery = "INSERT INTO organizer(
                                organizer_name, organizer_phone, organizer_password, 
                                organizer_address, organizer_city, organizer_dob, organizer_gender)
                                VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING organizer_id;";
                    $organizerResult = pg_query_params($conn, $organizerInsertionQuery, [$name, $phoneNo, $password, $address, $city, $dob, $gender]);

                    if (!$organizerResult) {
                        throw new Exception("Error inserting into Users table: " . pg_last_error($conn));
                    }

                    // Retrieve the generated organizer_id
                    $organizerId = pg_fetch_result($organizerResult, 0, "organizer_id");

                    //Insert into organizer_login table
                    $organizerLoginInsertionQuery = "INSERT INTO organizer_login(
                            organizer_id, organizer_login_id, organizer_login_password)
                            VALUES ($1, $2, $3);";
                    $organizerLoginResult = pg_query_params($conn, $organizerLoginInsertionQuery, [$organizerId, $username, $password]);

                    if (!$organizerLoginResult) {
                        throw new Exception("Error inserting into User_Login table: " . pg_last_error($conn));
                    }

                    //Insert into organizer_emails table
                    $organizerEmailInsertionQuery = "INSERT INTO organizer_emails(
                                        organizer_id, organizer_email)
                                        VALUES ($1, $2);";
                    $organizerEmailResult = pg_query_params($conn, $organizerEmailInsertionQuery, [$organizerId, $email]);

                    if (!$organizerEmailResult) {
                        throw new Exception("Error inserting into Users_Emails table: " . pg_last_error($conn));
                    }

                    // Commit the transaction if all queries succeed
                    pg_query($conn, "COMMIT");
                    echo "Organizer registration successful!";
                } catch (Exception $e) {
                    // Rollback the transaction on any failure
                    pg_query($conn, "ROLLBACK");
                    echo $e->getMessage();
                }

        } else {
            echo "Error decoding JSON data!";
        }
        
        

    }
    pg_close($conn);
?>