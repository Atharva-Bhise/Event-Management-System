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

if (!$data || !isset($data['service_name'])) {
    echo json_encode(["status" => "error", "message" => "Invalid input data"]);
    exit;
}

$serviceName = trim($data['service_name']);
$page = isset($data['page']) && is_numeric($data['page']) ? intval($data['page']) : 1;
$limit = 100;
$offset = max(0, ($page - 1) * $limit);

// List of common services
$commonServices = ["Venue", "Photography", "Food Catering", "Rentals", "Whole Event", "Decor/Florists"];


// Filtering logic
$filters = isset($data['filters']) && is_array($data['filters']) ? $data['filters'] : [];
$filterQuery = "";
$queryParams = [];

if (!empty($filters)) {
    $filterPlaceholders = [];
    foreach ($filters as $index => $filter) {
        $filterPlaceholders[] = "$" . (count($queryParams) + 1);
        $queryParams[] = $filter;
    }
    $filterQuery = "AND s.service_type IN (" . implode(", ", $filterPlaceholders) . ")";
}

// **SQL Query:**
if ($serviceName === "other") {
    $sql = "SELECT 
                s.service_id, 
                s.service_type, 
                s.service_description, 
                s.service_price,
                o.organizer_name, 
                COALESCE(oe.organizer_email, 'No Email') AS organizer_email,
                COALESCE(o.organizer_phone, 'No Phone') AS organizer_phone,
                e.event_name,
                STRING_AGG(DISTINCT ep.photo_path, ', ') AS photo_paths
            FROM Services s
            LEFT JOIN Events e ON s.event_id = e.event_id
            LEFT JOIN Organizer o ON e.event_organized_by = o.organizer_id
            LEFT JOIN Organizer_Emails oe ON o.organizer_id = oe.organizer_id
            LEFT JOIN Events_Photos ep ON e.event_id = ep.event_id
            WHERE s.service_type NOT IN ('venue', 'photography', 'food catering', 'rentals', 'whole event', 'decor/florists')
            $filterQuery
            GROUP BY s.service_id, s.service_type, s.service_description, s.service_price, 
                     o.organizer_name, oe.organizer_email, o.organizer_phone, e.event_name
            ORDER BY s.service_id
            LIMIT $1::bigint OFFSET $2::bigint";

    // Only include limit & offset as parameters
    $queryParams = [(int)$limit, (int)$offset];

} else {
    $sql = "SELECT 
                s.service_id, 
                s.service_type, 
                s.service_description, 
                s.service_price,
                o.organizer_name, 
                COALESCE(oe.organizer_email, 'No Email') AS organizer_email,
                COALESCE(o.organizer_phone, 'No Phone') AS organizer_phone,
                e.event_name,
                STRING_AGG(DISTINCT ep.photo_path, ', ') AS photo_paths
            FROM Services s
            LEFT JOIN Events e ON s.event_id = e.event_id
            LEFT JOIN Organizer o ON e.event_organized_by = o.organizer_id
            LEFT JOIN Organizer_Emails oe ON o.organizer_id = oe.organizer_id
            LEFT JOIN Events_Photos ep ON e.event_id = ep.event_id
            WHERE s.service_type = $1::text
            $filterQuery
            GROUP BY s.service_id, s.service_type, s.service_description, s.service_price, 
                     o.organizer_name, oe.organizer_email, o.organizer_phone, e.event_name
            ORDER BY s.service_id
            LIMIT $2::bigint OFFSET $3::bigint";

    // Add service name, limit, and offset as parameters
    $queryParams = [$serviceName, (int)$limit, (int)$offset];
}



$result = pg_query_params($conn, $sql, $queryParams);

if (!$result) {
    error_log("Query failed: " . pg_last_error($conn));
    echo json_encode(["status" => "error", "message" => "Database error occurred"]);
    exit;
}

// Fetch results
$services = pg_fetch_all($result) ?: [];

// Adjust photo paths
foreach ($services as &$service) {
    if (!empty($service['photo_paths'])) {
        $photoPaths = explode(', ', $service['photo_paths']);
        $service['photo_paths'] = array_map(function ($path) {
            return str_replace('/xampp/htdocs/', '/', $path);
        }, $photoPaths);
    } else {
        $service['photo_paths'] = [];
    }
}


$response = ["status" => "success", "data" => ["services" => $services]];
echo json_encode($response, JSON_HEX_APOS | JSON_HEX_QUOT);
exit;

pg_close($conn);
?>
