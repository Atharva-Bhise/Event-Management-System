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

// Database connection
$postgresqlPassword = $_ENV['POSTGRESQL_PASSWORD'];
$conn = pg_connect("host=localhost port=5432 dbname=EventManagementSystem user=postgres password=" . $postgresqlPassword);

if (!$conn) {
    error_log("Database connection failed: " . pg_last_error());
    echo json_encode(["status" => "error", "message" => "Database connection failed"]);
    exit;
}

// Ensure request is POST
if ($_SERVER['REQUEST_METHOD'] !== "POST") {
    echo json_encode(["status" => "error", "message" => "Invalid request method"]);
    exit;
}

// SQL Query to fetch all gallery photos
$sql = "SELECT ep.photo_path, ep.photo_description, e.event_name, o.organizer_name
        FROM Events_Photos ep
        LEFT JOIN Events e ON ep.event_id = e.event_id
        LEFT JOIN Organizer o ON e.event_organized_by = o.organizer_id
        ORDER BY ep.photo_id DESC";

$result = pg_query($conn, $sql);

if (!$result) {
    error_log("Query failed: " . pg_last_error($conn));
    echo json_encode(["status" => "error", "message" => "Database error occurred"]);
    exit;
}

// Fetch all records
$galleryData = pg_fetch_all($result) ?: [];

// ✅ Adjust photo paths
foreach ($galleryData as &$photo) {
    if (!empty($photo['photo_path'])) {
        // Remove "/xampp/htdocs" and ensure path starts with "/uploads/"
        $photo['photo_paths'] = str_replace('/xampp/htdocs', '', $photo['photo_path']);

        // Ensure all slashes are formatted correctly
        $photo['photo_paths'] = str_replace('\\', '/', $photo['photo_paths']);
    }
    unset($photo['photo_path']); // Remove old key
}

// ✅ Encode JSON with UNESCAPED_SLASHES to preserve \/ format
$response = ["status" => "success", "data" => ["gallery" => $galleryData]];
echo json_encode($response, JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_SLASHES);
exit;

pg_close($conn);
?>
