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

if (!$data || !isset($data['event_name'])) {
    echo json_encode(["status" => "error", "message" => "Invalid input data"]);
    exit;
}

$eventName = trim($data['event_name']);
$page = isset($data['page']) && is_numeric($data['page']) ? intval($data['page']) : 1;
$limit = 100;
$offset = max(0, ($page - 1) * $limit);

// Filtering logic
$filters = isset($data['filters']) && is_array($data['filters']) ? $data['filters'] : [];
$filterQuery = "";
$filterValues = [];
$queryParams = [$eventName];

if (!empty($filters)) {
    $filterPlaceholders = [];
    foreach ($filters as $index => $filter) {
        $filterPlaceholders[] = "$" . ($index + 2);
        $filterValues[] = $filter;
    }
    $filterQuery = "AND s.service_type IN (" . implode(", ", $filterPlaceholders) . ")";
}

// Dynamically set the placeholders for LIMIT and OFFSET
$limitPlaceholder = "$" . (count($filterValues) + 2);
$offsetPlaceholder = "$" . (count($filterValues) + 3);

if ($eventName === "other") {
    $sql = "SELECT e.event_id, e.event_name, o.organizer_name, 
           COALESCE(oe.organizer_email, 'No Email') AS organizer_email,
           COALESCE(o.organizer_phone, 'No Phone') AS organizer_phone,
           STRING_AGG(DISTINCT s.service_type || '(' || s.service_description || '): ' || s.service_price, ', ') AS service_details,
           STRING_AGG(DISTINCT ep.photo_path, ', ') AS photo_paths
    FROM Events e
    LEFT JOIN Organizer o ON e.event_organized_by = o.organizer_id
    LEFT JOIN Organizer_Emails oe ON o.organizer_id = oe.organizer_id
    LEFT JOIN Services s ON e.event_id = s.event_id
    LEFT JOIN Events_Photos ep ON e.event_id = ep.event_id
    WHERE e.event_name NOT IN ('Birthday', 'Wedding', 'Anniversary', 'Baby Shower', 'Concert')
    $filterQuery
    GROUP BY e.event_id, e.event_name, o.organizer_name, oe.organizer_email, o.organizer_phone
    ORDER BY e.event_id
    LIMIT $1::bigint OFFSET $2::bigint";

    // When eventName is "other", don't add it to queryParams
    $queryParams = [(int)$limit, (int)$offset];

} else {
    // Updated SQL Query with Aggregation & Organizer Email
    $sql = "SELECT e.event_id, e.event_name, o.organizer_name, 
        COALESCE(oe.organizer_email, 'No Email') AS organizer_email,
        COALESCE(o.organizer_phone, 'No Phone') AS organizer_phone,
        STRING_AGG(DISTINCT s.service_type || '(' || s.service_description || '): ' || s.service_price, ', ') AS service_details,
        STRING_AGG(DISTINCT ep.photo_path, ', ') AS photo_paths
    FROM Events e
    LEFT JOIN Organizer o ON e.event_organized_by = o.organizer_id
    LEFT JOIN Organizer_Emails oe ON o.organizer_id = oe.organizer_id
    LEFT JOIN Services s ON e.event_id = s.event_id
    LEFT JOIN Events_Photos ep ON e.event_id = ep.event_id
    WHERE e.event_name = $1::text
    $filterQuery
    GROUP BY e.event_id, e.event_name, o.organizer_name, oe.organizer_email, o.organizer_phone
    ORDER BY e.event_id
    LIMIT $2::bigint OFFSET $3::bigint";

    // Only add $eventName if it's being used in the query
    $queryParams = [$eventName, (int)$limit, (int)$offset];
}

$result = pg_query_params($conn, $sql, $queryParams);

if (!$result) {
    error_log("Query failed: " . pg_last_error($conn));
    echo json_encode(["status" => "error", "message" => "Database error occurred"]);
    exit;
}

// Fetch results
$events = pg_fetch_all($result) ?: [];

// Adjust photo paths
foreach ($events as &$event) {
    if (!empty($event['photo_paths'])) {
        $photoPaths = explode(', ', $event['photo_paths']);
        $event['photo_paths'] = array_map(function ($path) {
            return str_replace('/xampp/htdocs/', '/', $path);
        }, $photoPaths);
    } else {
        $event['photo_paths'] = [];
    }
}

$response = ["status" => "success", "data" => ["events" => $events]];
echo json_encode($response, JSON_HEX_APOS | JSON_HEX_QUOT);
exit;  // Ensure no extra output

pg_close($conn);
?>
