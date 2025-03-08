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

if (!$conn) {
    echo json_encode(["status" => "error", "message" => "Database connection failed"]);
    exit;
}

try {
    // Fetch events and services posted by the organizer
    $query = "
        SELECT e.event_id, e.event_name, e.event_manager, e.event_date, 
        -- Aggregate photos as JSON array
        COALESCE(
            (SELECT json_agg(photo_json)
            FROM (
                SELECT ep.photo_id, ep.photo_path, ep.photo_description
                FROM Events_Photos ep
                WHERE ep.event_id = e.event_id
            ) AS photo_json
            ), '[]'
        ) AS event_photos,

        -- Aggregate services as JSON array
        COALESCE(
            (SELECT json_agg(service_json)
            FROM (
                SELECT s.service_id, s.service_type, s.service_price, s.service_description
                FROM Services s
                WHERE s.event_id = e.event_id
            ) AS service_json
            ), '[]'
        ) AS event_services

        FROM Events e  
        WHERE e.event_organized_by = $1
        GROUP BY e.event_id, e.event_name, e.event_manager, e.event_date;
    ";
    
    $result = pg_query_params($conn, $query, [$_SESSION['organizerId']]);

    if (!$result) {
        throw new Exception("Query failed: " . pg_last_error($conn));
    }

    $services = [];

    while ($row = pg_fetch_assoc($result)) {
        $eventId = $row['event_id'];

        // Initialize event structure
        if (!isset($services[$eventId])) {
            $services[$eventId] = [
                'eventName' => $row['event_name'],
                'services' => [],
                'photos' => []  // Photos should be at the event level, not inside services
            ];
        }

        // Decode JSON-encoded services from PostgreSQL
        $eventServices = json_decode($row['event_services'], true);
        if (!is_array($eventServices)) {
            $eventServices = []; // Ensure it's an array
        }

        foreach ($eventServices as $service) {
            $serviceId = $service['service_id'];

            // Store services under event
            $services[$eventId]['services'][$serviceId] = [
                'serviceType' => $service['service_type'],
                'servicePrice' => $service['service_price'],
                'serviceDescription' => $service['service_description']
            ];
        }

        // Decode JSON-encoded photos from PostgreSQL
        $eventPhotos = json_decode($row['event_photos'], true);
        if (!is_array($eventPhotos)) {
            $eventPhotos = []; // Ensure it's an array
        }

        foreach ($eventPhotos as $photo) {
            $services[$eventId]['photos'][] = [
                'photoPath' => $photo['photo_path'],
                'photoDescription' => $photo['photo_description']
            ];
        }
    }

    echo json_encode(["status" => "success", "data" => $services]);
} catch (Exception $e) {
    error_log("Fetch Services Error: " . $e->getMessage());
    echo json_encode(["status" => "failure", "message" => "Failed to fetch services"]);
}

pg_close($conn);
?>
