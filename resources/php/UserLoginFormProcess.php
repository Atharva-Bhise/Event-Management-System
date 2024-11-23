<?php
$conn = pg_connect("host=localhost port=5432 dbname=EventManagementSystem user=postgres password=ab18");

if (!$conn) {
    die("Error: Unable to connect to the database.");
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
            echo "Error: Username and password must not be empty.";
            exit;
        }

        // Query to validate user credentials
        $query = "SELECT users.user_name, user_login.user_login_password 
                  FROM users
                  JOIN user_login ON users.user_id = user_login.user_id 
                  WHERE user_login.user_login_id = $1";

        // Execute the query
        $result = pg_query_params($conn, $query, [$username]);

        if ($result) {
            $row = pg_fetch_assoc($result); 

            if ($row) {
                // Debugging: Check the result structure
                 // This will show the available columns in the result

                // Verify password
                if ($password === $row['user_login_password']) {
                    // User found and password matched
                    print json_encode(["user" => $row['user_name'], "status" => "success", "message" => "Login successful."]);                  
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
            echo "Error executing query: " . pg_last_error($conn);
        }
    } else {
        // Invalid JSON data
        echo "Error: Invalid data received.";
    }
} else {
    echo "Error: Invalid request method.";
}

// Close the database connection
pg_close($conn);
?>
