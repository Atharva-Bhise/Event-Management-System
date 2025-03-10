<?php
session_start();
require 'C:/xampp/php/composer/vendor/autoload.php';

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../../');
$dotenv->load();

header('Content-Type: application/json');
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', 'php_error_log');
error_reporting(E_ALL);

$postgresqlPassword = $_ENV['POSTGRESQL_PASSWORD'];
$conn = pg_connect("host=localhost port=5432 dbname=EventManagementSystem user=postgres password=" . $postgresqlPassword);

if ($_SERVER['REQUEST_METHOD'] !== "POST") {
    echo json_encode(["status" => "error", "message" => "Invalid request"]);
    exit;
}

if (!$conn) {
    error_log("Database connection failed: " . pg_last_error());
    echo json_encode(["status" => "error", "message" => "Database connection failed"]);
    exit;
}

// Get the raw POST data
$jsonData = file_get_contents('php://input');
$data = json_decode($jsonData, true);

if (!$data) {
    echo json_encode(["status" => "error", "message" => "Invalid input data"]);
    exit;
}

$organizerId = $data['organizer_id'];
$updates = [];
$loginUpdates = [];
$emailUpdates = [];

// Process the incoming data
foreach ($data as $key => $value) {
    if ($key !== 'organizer_id' && !empty($value)) {
        if ($key === 'organizer_login_password') {
            $hashedPassword = password_hash($value, PASSWORD_BCRYPT);
            $updates[$key] = $hashedPassword;      // Update in Organizer table
            $loginUpdates[$key] = $hashedPassword; // Update in Organizer_Login table
        } elseif (in_array($key, ['organizer_login_id'])) {
            $loginUpdates[$key] = $value;
        } elseif ($key === 'organizer_email') {
            $emailUpdates[$key] = $value;
        } else {
            $updates[$key] = $value;
        }
    }
}

// Exit if no valid updates are present
if (empty($updates) && empty($loginUpdates) && empty($emailUpdates)) {
    echo json_encode(["status" => "empty", "message" => "No valid fields to update"]);
    exit;
}

pg_query($conn, "BEGIN");

try {
    // Update Organizer Table
    if (!empty($updates)) {
        $updateQuery = "UPDATE Organizer SET " . implode(', ', array_map(
            fn($key, $index) => "$key = $" . ($index + 1),
            array_keys($updates),
            range(0, count($updates) - 1)
        )) . " WHERE organizer_id = $" . (count($updates) + 1);

        $result = pg_query_params($conn, $updateQuery, array_merge(array_values($updates), [$organizerId]));
        if (!$result) {
            throw new Exception("Update query failed: " . pg_last_error($conn));
        }
    }

    // Update Organizer_Login Table
    if (!empty($loginUpdates)) {
        $loginUpdateQuery = "UPDATE Organizer_Login SET " . implode(', ', array_map(
            fn($key, $index) => "$key = $" . ($index + 1),
            array_keys($loginUpdates),
            range(0, count($loginUpdates) - 1)
        )) . " WHERE organizer_id = $" . (count($loginUpdates) + 1);

        $result = pg_query_params($conn, $loginUpdateQuery, array_merge(array_values($loginUpdates), [$organizerId]));
        if (!$result) {
            throw new Exception("Login update query failed: " . pg_last_error($conn));
        }
    }

    // Update Organizer_Emails Table
    if (!empty($emailUpdates)) {
        $emailUpdateQuery = "UPDATE Organizer_Emails SET " . implode(', ', array_map(
            fn($key, $index) => "$key = $" . ($index + 1),
            array_keys($emailUpdates),
            range(0, count($emailUpdates) - 1)
        )) . " WHERE organizer_id = $" . (count($emailUpdates) + 1);

        $result = pg_query_params($conn, $emailUpdateQuery, array_merge(array_values($emailUpdates), [$organizerId]));
        if (!$result) {
            throw new Exception("Email update query failed: " . pg_last_error($conn));
        }
    }

    pg_query($conn, "COMMIT");
    echo json_encode(["status" => "success", "message" => "Organizer details updated successfully"]);
} catch (Exception $e) {
    pg_query($conn, "ROLLBACK");
    error_log($e->getMessage());
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}

pg_close($conn);
?>
