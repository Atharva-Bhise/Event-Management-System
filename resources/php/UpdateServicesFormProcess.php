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

if (!isset($_SESSION['organizerId'])) {
    echo json_encode(["status" => "error", "message" => "Unauthorized request"]);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$eventId = $input['eventId'] ?? null; // This is actually the event_id
$services = $input['data'] ?? [];

if (!$conn) {
    error_log("Database connection failed: " . pg_last_error());
    echo json_encode(["status" => "error", "message" => "Database connection failed"]);
    exit;
}

pg_query($conn, "BEGIN");

try {
    foreach ($services as $service) {
        // Ensure service_price is a valid numeric value
        $servicePrice = preg_replace('/[^0-9.]/', '', $service['column1']);
        
        $updateQuery = "UPDATE Services SET service_type = $1, service_price = $2, service_description = $3 WHERE service_id = $4 AND event_id = $5";
        $updateResult = pg_query_params($conn, $updateQuery, [$service['column0'], $servicePrice, $service['column2'], $service['serviceId'], $eventId]);

        if (!$updateResult) {
            throw new Exception("Error updating Services table: " . pg_last_error($conn));
        }
    }

    pg_query($conn, "COMMIT");
    echo json_encode(["status" => "success", "message" => "Services updated successfully!"]);
} catch (Exception $e) {
    pg_query($conn, "ROLLBACK");
    error_log("Update Service Error: " . $e->getMessage());
    echo json_encode(["status" => "failure", "message" => "Failed to update services."]);
    exit;
}
pg_close($conn);
?>