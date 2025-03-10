<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get the plain text password from the request
    $password = trim($_POST['password']);

    // Validate the password (e.g., check length, characters)
    if (strlen($password) < 8) {
        http_response_code(400);
        echo "Password must be at least 8 characters long.";
    } else {
        // Generate a hashed password using BCRYPT
        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

        // Return the hashed password
        echo $hashedPassword;
    }
} else {
    http_response_code(405);
    echo "Method not allowed.";
}
?>