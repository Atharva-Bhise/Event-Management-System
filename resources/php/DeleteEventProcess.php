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

if (!isset($_SESSION['organizerId'])) {
    echo json_encode(["status" => "error", "message" => "Unauthorized request"]);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$eventId = $input['eventId'] ?? null;

if (!$conn) {
    error_log("Database connection failed: " . pg_last_error());
    echo json_encode(["status" => "error", "message" => "Database connection failed"]);
    exit;
}

pg_query($conn, "BEGIN");

try {
    // Fetch photo paths
    $fetchPhotosQuery = "SELECT photo_path FROM Events_Photos WHERE event_id = $1";
    $fetchPhotosResult = pg_query_params($conn, $fetchPhotosQuery, [$eventId]);

    if (!$fetchPhotosResult) {
        throw new Exception("Error fetching event photos: " . pg_last_error($conn));
    }

    // Delete photos from the uploads folder
    while ($row = pg_fetch_assoc($fetchPhotosResult)) {
        $photoPath = realpath(str_replace('/xampp/htdocs/uploads/', $fileUploadFolder, $row['photo_path']));
    
        error_log("Attempting to delete: " . $photoPath);
    
        if ($photoPath === false || !file_exists($photoPath)) {
            error_log("File not found: " . $photoPath);
            continue;
        }
    
        if (!is_writable($photoPath)) {
            error_log("File is not writable: " . $photoPath);
            chmod($photoPath, 0777);
        }
    
        if (!unlink($photoPath)) {
            throw new Exception("Failed to delete photo at path: " . $photoPath);
        } else {
            error_log("Successfully deleted: " . $photoPath);
        }
    }
    

    // Delete event photos
    $deletePhotosQuery = "DELETE FROM Events_Photos WHERE event_id = $1";
    $deletePhotosResult = pg_query_params($conn, $deletePhotosQuery, [$eventId]);

    if (!$deletePhotosResult) {
        throw new Exception("Error deleting event photos: " . pg_last_error($conn));
    }

    // Delete event services
    $deleteServicesQuery = "DELETE FROM Services WHERE event_id = $1";
    $deleteServicesResult = pg_query_params($conn, $deleteServicesQuery, [$eventId]);

    if (!$deleteServicesResult) {
        throw new Exception("Error deleting event services: " . pg_last_error($conn));
    }

    // Delete the event
    $deleteEventQuery = "DELETE FROM Events WHERE event_id = $1";
    $deleteEventResult = pg_query_params($conn, $deleteEventQuery, [$eventId]);

    if (!$deleteEventResult) {
        throw new Exception("Error deleting event: " . pg_last_error($conn));
    }

    pg_query($conn, "COMMIT");
    echo json_encode(["status" => "success", "message" => "Event deleted successfully!"]);
} catch (Exception $e) {
    pg_query($conn, "ROLLBACK");
    error_log("Delete Event Error: " . $e->getMessage());
    echo json_encode(["status" => "failure", "message" => "Failed to delete event."]);
    exit;
}

pg_close($conn);
?>
