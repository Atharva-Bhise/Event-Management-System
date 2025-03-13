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

// Example parameter
$user_city = $_POST['user_city'] ?? null;

$sql = "SELECT u.user_id, u.user_name, string_agg(DISTINCT up.user_phone_no, ', ') AS user_phone, ul.login_sr_no, ul.user_login_id, ul.user_login_password, string_agg(DISTINCT ue.user_email, ', ') AS user_email, u.user_address, u.user_city, u.user_dob, u.user_gender
        FROM Users u
        LEFT JOIN Users_Phone_numbers up ON u.user_id = up.user_id
        LEFT JOIN User_Login ul ON u.user_id = ul.user_id
        LEFT JOIN Users_Emails ue ON u.user_id = ue.user_id
        WHERE ($1::text IS NULL OR u.user_city = $1)
        GROUP BY u.user_id, ul.login_sr_no, ul.user_login_id, ul.user_login_password";

$result = pg_query_params($conn, $sql, [$user_city]);

if (!$result) {
    error_log("Query failed: " . pg_last_error($conn));
    echo json_encode(["status" => "error", "message" => "Query failed"]);
    exit;
}

$users = pg_fetch_all($result);

echo json_encode($users);

pg_close($conn);
?>