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
$fileUploadFolder = rtrim($_ENV['FILE_UPLOAD_FOLDER'], '/') . '/';
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

if (!$data || !isset($data['userId']) || !isset($data['loginSrNo'])) {
    echo json_encode(["status" => "error", "message" => "Invalid input data"]);
    exit;
}

$userId = $data['userId'];
$loginSrNo = $data['loginSrNo'];

pg_query($conn, "BEGIN");

try {
    // Delete from Users_Phone_numbers table
    $deletePhonesQuery = "DELETE FROM Users_Phone_numbers WHERE user_id = $1";
    $result = pg_query_params($conn, $deletePhonesQuery, [$userId]);
    if (!$result) {
        throw new Exception("Delete phones query failed: " . pg_last_error($conn));
    }

    // Delete from Users_Emails table
    $deleteEmailsQuery = "DELETE FROM Users_Emails WHERE user_id = $1";
    $result = pg_query_params($conn, $deleteEmailsQuery, [$userId]);
    if (!$result) {
        throw new Exception("Delete emails query failed: " . pg_last_error($conn));
    }

    // Delete from User_Login table
    $deleteLoginQuery = "DELETE FROM User_Login WHERE login_sr_no = $1";
    $result = pg_query_params($conn, $deleteLoginQuery, [$loginSrNo]);
    if (!$result) {
        throw new Exception("Delete login query failed: " . pg_last_error($conn));
    }

    // Delete from Users table
    $deleteUserQuery = "DELETE FROM Users WHERE user_id = $1";
    $result = pg_query_params($conn, $deleteUserQuery, [$userId]);
    if (!$result) {
        throw new Exception("Delete user query failed: " . pg_last_error($conn));
    }

    pg_query($conn, "COMMIT");
    echo json_encode(["status" => "success", "message" => "User and their associated data deleted successfully"]);
} catch (Exception $e) {
    pg_query($conn, "ROLLBACK");
    error_log("Delete User Error: " . $e->getMessage());
    echo json_encode(["status" => "error", "message" => "Failed to delete user: " . $e->getMessage()]);
}

pg_close($conn);
?>