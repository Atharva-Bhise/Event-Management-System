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

$eventName = $_POST['eventName'] ?? null;
$eventDate = $_POST['eventDate'] ?? null;



if (!$conn) {
    error_log("Database connection failed: " . pg_last_error());
    echo json_encode(["status" => "error", "message" => "Database connection failed"]);
    exit;
}

pg_query($conn, "BEGIN");

try {
    // Fetch Organizer Name
    $organizerQuery = "SELECT organizer_name FROM Organizer WHERE organizer_id = $1";
    $organizerResult = pg_query_params($conn, $organizerQuery, [$_SESSION['organizerId']]);
    $eventManager = pg_fetch_result($organizerResult, 0, 'organizer_name');

    // Insert into Events table
    $eventInsertQuery = "INSERT INTO Events (event_name, event_manager, event_organized_by, event_date)
                         VALUES ($1, $2, $3, $4) RETURNING event_id;";
    $eventResult = pg_query_params($conn, $eventInsertQuery, [$eventName, $eventManager, $_SESSION['organizerId'], $eventDate]);
    $eventId = pg_fetch_result($eventResult, 0, "event_id");

    // Insert services
    foreach ($_POST['services'] as $index => $service) {
        $serviceInsertQuery = "INSERT INTO Services (event_id, service_type, service_price, service_description)
                               VALUES ($1, $2, $3, $4);";
        pg_query_params($conn, $serviceInsertQuery, [$eventId, $service['name'], $service['price'], $service['description']]);
    }

    $uploadDir = $_ENV['FILE_UPLOAD_FOLDER'];

    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0777, true); // Create uploads directory if missing
    }
    
    if (!empty($_FILES['upload']['name'][0])) {
        foreach ($_FILES['upload']['tmp_name'] as $key => $tmpName) {
            if ($_FILES['upload']['error'][$key] === UPLOAD_ERR_OK) {
                $fileName = time() . "_" . basename($_FILES['upload']['name'][$key]); //  Unique filename
                $filePath = $uploadDir . $fileName;
                $webPath = '/xampp/htdocs/uploads/' . $fileName; //  Accessible URL path
    
                if (is_uploaded_file($tmpName)) { //  Additional check
                    if (move_uploaded_file($tmpName, $filePath)) {
                        error_log("File uploaded successfully: " . $filePath);
                        $photoInsertQuery = "INSERT INTO Events_Photos (event_id, photo_path, photo_description)
                                             VALUES ($1, $2, $3);";
                        pg_query_params($conn, $photoInsertQuery, [$eventId, $webPath, $_POST['description'][$key] ?? '']);
                    } else {
                        error_log("Failed to move file: " . $filePath);
                    }
                } else {
                    error_log("Not a valid uploaded file: " . $tmpName);
                }
            } else {
                error_log("Upload error: " . $_FILES['upload']['error'][$key]);
            }
        }
    }
    

    pg_query($conn, "COMMIT");
    echo json_encode(["status" => "success", "message" => "Service posted successfully!"]);
} catch (Exception $e) {
    pg_query($conn, "ROLLBACK");
    error_log("Post Service Error: " . $e->getMessage());
    echo json_encode(["status" => "failure", "message" => "Failed to post service."]);
}
pg_close($conn);
?>
