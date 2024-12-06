<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hash Password Generator</title>
</head>
<body>
    <h2>Hash Password Generator</h2>
    <form method="POST" action="">
        <label for="password">Enter Password:</label>
        <input type="text" id="password" name="password" required>
        <br><br>
        <button type="submit">Generate Hash</button>
    </form>

    <?php
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Get the plain text password from the form input
        $password = trim($_POST['password']);

        // Validate the password (e.g., check length, characters)
        if (strlen($password) < 8) {
            echo "<p style='color: red;'>Password must be at least 8 characters long.</p>";
        } else {
            // Generate a hashed password using BCRYPT
            $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

            // Display the hashed password
            echo "<h3>Generated Hashed Password:</h3>";
            echo "<p style='font-family: monospace;'>" . htmlspecialchars($hashedPassword) . "</p>";
        }
    }
    ?>
</body>
</html>
