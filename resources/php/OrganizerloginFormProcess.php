<?php
$conn = pg_connect("host=localhost port=5432 dbname=EventManagementSystem user=postgres password=cloud");


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
        $query = "SELECT organizer.organizer_name 
                  FROM organizer
                  JOIN organizer_login ON organizer.organizer_id = organizer_login.organizer_id 
                  WHERE organizer_login.organizer_login_id = $1 AND organizer_login.organizer_login_password = $2";

        // Execute the query
        $result = pg_query_params($conn, $query, [$username, $password]);

        if ($result) {
            $row = pg_fetch_row($result);

            if ($row) {
                // User found
                echo "Hello, Organizer: " . htmlspecialchars($row[0]) . "<br>";
            } else {
                // Invalid credentials
                echo "Invalid username or password.";
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
