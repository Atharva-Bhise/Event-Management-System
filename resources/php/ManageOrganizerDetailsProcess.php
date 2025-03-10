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
$organizer_city = $_POST['organizer_city'] ?? null;

$sql = "SELECT o.organizer_id, o.organizer_name, o.organizer_phone, ol.login_sr_no, ol.organizer_login_id, o.organizer_login_password, oe.organizer_email, o.organizer_address, o.organizer_city, o.organizer_dob, o.organizer_gender
        FROM Organizer o
        LEFT JOIN Organizer_Login ol ON o.organizer_id = ol.organizer_id
        LEFT JOIN Organizer_Emails oe ON o.organizer_id = oe.organizer_id
        WHERE ($1::text IS NULL OR o.organizer_city = $1)";

$result = pg_query_params($conn, $sql, [$organizer_city]);

if (!$result) {
    error_log("Query failed: " . pg_last_error($conn));
    echo json_encode(["status" => "error", "message" => "Query failed"]);
    exit;
}

$organizers = pg_fetch_all($result);

echo json_encode($organizers);

pg_close($conn);
?>