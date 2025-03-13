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

if (!isset($data['user_id']) || empty($data['user_id']) || !is_numeric($data['user_id'])) {
    echo json_encode(["status" => "error", "message" => "Invalid or missing user_id"]);
    exit;
}

$userId = (int) $data['user_id'];
$updates = [];
$loginUpdates = [];
$emailUpdates = [];

// Process the incoming data
foreach ($data as $key => $value) {
    if ($key === 'user_id' || empty($value)) {
        continue;
    }

    if ($key === 'user_login_password' || $key === 'user_password') {
        if (strlen($value) < 8) {
            echo json_encode(["status" => "error", "message" => "Password must be at least 8 characters"]);
            exit;
        }
        $hashedPassword = password_hash($value, PASSWORD_BCRYPT);
        $updates['user_password'] = $hashedPassword;
        $loginUpdates['user_login_password'] = $hashedPassword;
    } elseif ($key === 'user_login_id') {
        $loginUpdates[$key] = $value;
    } elseif ($key === 'user_email') {
        if (!filter_var($value, FILTER_VALIDATE_EMAIL)) {
            echo json_encode(["status" => "error", "message" => "Invalid email format"]);
            exit;
        }
        $emailUpdates[$key] = $value;
    } else {
        $updates[$key] = $value;
    }
}

// Exit early if no valid updates
if (empty($updates) && empty($loginUpdates) && empty($emailUpdates)) {
    echo json_encode(["status" => "empty", "message" => "No valid fields to update"]);
    exit;
}

pg_query($conn, "BEGIN");

try {
    // Update Users Table
    if (!empty($updates)) {
        $fields = array_keys($updates);
        $placeholders = array_map(function($index) use ($fields) {
            return "$fields[$index] = $" . ($index + 1);
        }, array_keys($fields));
        $updateQuery = "UPDATE Users SET " . implode(', ', $placeholders) . " WHERE user_id = $" . (count($fields) + 1);

        $result = pg_query_params($conn, $updateQuery, array_merge(array_values($updates), [$userId]));
        if (!$result) {
            throw new Exception("Users update failed: " . pg_last_error($conn));
        }
    }

    // Update User_Login Table
    if (!empty($loginUpdates)) {
        $fields = array_keys($loginUpdates);
        $placeholders = array_map(function($index) use ($fields) {
            return "$fields[$index] = $" . ($index + 1);
        }, array_keys($fields));
        $loginUpdateQuery = "UPDATE User_Login SET " . implode(', ', $placeholders) . " WHERE user_id = $" . (count($fields) + 1);

        $result = pg_query_params($conn, $loginUpdateQuery, array_merge(array_values($loginUpdates), [$userId]));
        if (!$result) {
            throw new Exception("User_Login update failed: " . pg_last_error($conn));
        }
    }

    // Update Users_Emails Table
    if (!empty($emailUpdates)) {
        $fields = array_keys($emailUpdates);
        $placeholders = array_map(fn($index) => "$fields[$index] = $" . ($index + 1), array_keys($fields));
        $emailUpdateQuery = "UPDATE Users_Emails SET " . implode(', ', $placeholders) . " WHERE user_id = $" . (count($fields) + 1);

        $result = pg_query_params($conn, $emailUpdateQuery, array_merge(array_values($emailUpdates), [$userId]));
        if (!$result) {
            throw new Exception("Users_Emails update failed: " . pg_last_error($conn));
        }
    }

    pg_query($conn, "COMMIT");
    echo json_encode(["status" => "success", "message" => "User details updated successfully"]);
} catch (Exception $e) {
    pg_query($conn, "ROLLBACK");
    error_log($e->getMessage());
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}

pg_close($conn);
?>