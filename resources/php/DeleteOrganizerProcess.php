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

if (!$data || !isset($data['organizerId']) || !isset($data['loginSrNo'])) {
    echo json_encode(["status" => "error", "message" => "Invalid input data"]);
    exit;
}

$organizerId = $data['organizerId'];
$loginSrNo = $data['loginSrNo'];

pg_query($conn, "BEGIN");

try {
    // Fetch event photos
    $photoQuery = "SELECT photo_path FROM Events_Photos WHERE event_id IN (SELECT event_id FROM Events WHERE event_organized_by = $1)";
    $photoResult = pg_query_params($conn, $photoQuery, [$organizerId]);

    if (!$photoResult) {
        throw new Exception("Error fetching event photos: " . pg_last_error($conn));
    }

   // Delete photos from the uploads folder
    while ($row = pg_fetch_assoc($photoResult)) {
        // Ensure `$fileUploadFolder` is defined and contains the correct directory path
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

    // Delete from Events_Photos table
    $deletePhotosQuery = "DELETE FROM Events_Photos WHERE event_id IN (SELECT event_id FROM Events WHERE event_organized_by = $1)";
    $result = pg_query_params($conn, $deletePhotosQuery, [$organizerId]);
    if (!$result) {
        throw new Exception("Delete photos query failed: " . pg_last_error($conn));
    }

    // Delete from Services table
    $deleteServicesQuery = "DELETE FROM Services WHERE event_id IN (SELECT event_id FROM Events WHERE event_organized_by = $1)";
    $result = pg_query_params($conn, $deleteServicesQuery, [$organizerId]);
    if (!$result) {
        throw new Exception("Delete services query failed: " . pg_last_error($conn));
    }

    // Delete from Events table
    $deleteEventsQuery = "DELETE FROM Events WHERE event_organized_by = $1";
    $result = pg_query_params($conn, $deleteEventsQuery, [$organizerId]);
    if (!$result) {
        throw new Exception("Delete events query failed: " . pg_last_error($conn));
    }

    // Delete from Organizer_Emails table
    $deleteEmailsQuery = "DELETE FROM Organizer_Emails WHERE organizer_id = $1";
    $result = pg_query_params($conn, $deleteEmailsQuery, [$organizerId]);
    if (!$result) {
        throw new Exception("Delete emails query failed: " . pg_last_error($conn));
    }

    // Delete from Organizer_Login table
    $deleteLoginQuery = "DELETE FROM Organizer_Login WHERE login_sr_no = $1";
    $result = pg_query_params($conn, $deleteLoginQuery, [$loginSrNo]);
    if (!$result) {
        throw new Exception("Delete login query failed: " . pg_last_error($conn));
    }

    // Delete from Organizer table
    $deleteOrganizerQuery = "DELETE FROM Organizer WHERE organizer_id = $1";
    $result = pg_query_params($conn, $deleteOrganizerQuery, [$organizerId]);
    if (!$result) {
        throw new Exception("Delete organizer query failed: " . pg_last_error($conn));
    }

    pg_query($conn, "COMMIT");
    echo json_encode(["status" => "success", "message" => "Organizer and Their Services Posts deleted successfully"]);
} catch (Exception $e) {
    pg_query($conn, "ROLLBACK");
    error_log("Delete Organizer Error: " . $e->getMessage());
    echo json_encode(["status" => "error", "message" => "Failed to delete organizer: " . $e->getMessage()]);
}

pg_close($conn);
?>
