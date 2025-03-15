<?php
session_start();

// Include PHPMailer classes
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'PHPMailer-master/src/PHPMailer.php';
require 'PHPMailer-master/src/SMTP.php';
require 'PHPMailer-master/src/Exception.php';
require 'C:/xampp/php/composer/vendor/autoload.php';

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../../');
$dotenv->load();

// Ensure JSON response format
header('Content-Type: application/json');
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', 'php_error_log');
error_reporting(E_ALL);

// Database connection
$postgresqlPassword = $_ENV['POSTGRESQL_PASSWORD'];
$conn = pg_connect("host=localhost port=5432 dbname=EventManagementSystem user=postgres password=" . $postgresqlPassword);

if (!$conn) {
    echo json_encode(["status" => "error", "message" => "Database connection failed"]);
    exit;
}

// Ensure request is POST
if ($_SERVER['REQUEST_METHOD'] !== "POST") {
    echo json_encode(["status" => "error", "message" => "Invalid request method"]);
    exit;
}

// Get JSON data from the request
$jsonData = file_get_contents('php://input');
$inputData = json_decode($jsonData, true);

// Validate required fields
if (!isset($inputData['name'], $inputData['email'], $inputData['phone'],  $inputData['feedback'])) {
    echo json_encode(["status" => "error", "message" => "Missing required fields"]);
    exit;
}

$name = $inputData['name'];
$senderEmail = $inputData['email'];
$phone = $inputData['phone'];
$message = nl2br($inputData['feedback']); // Convert new lines to <br>

// **Fetch ALL Admin Emails from Database**
$query = "SELECT admin_email FROM admins";
$result = pg_query($conn, $query);

if (!$result || pg_num_rows($result) === 0) {
    echo json_encode(["status" => "error", "message" => "No admin emails found"]);
    exit;
}

// Store all admin emails in an array
$adminEmails = [];
while ($row = pg_fetch_assoc($result)) {
    $adminEmails[] = $row['admin_email'];
}

try {
    // Setup PHPMailer
    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = $_ENV['MAIL_USERNAME']; 
    $mail->Password = $_ENV['MAIL_APP_PASSWORD']; 
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;

    // Set sender details
    $mail->setFrom($_ENV['MAIL_USERNAME'], 'Map The Events');

    // **Add all admins as recipients**
    foreach ($adminEmails as $adminEmail) {
        $mail->addAddress($adminEmail);
    }

    // Email Content
    $mail->isHTML(true);
    $mail->Subject = "Feedback/Query from $name";
    $mail->Body = "
        <h3>New Feedback / Query Received</h3>
        <p><strong>From:</strong> $name ($senderEmail)</p>
        <p><strong>Phone:</strong> $phone</p>
        <p><strong>Message:</strong></p>
        <p>$message</p>
        <hr>
        <p><em>Sent via Map The Events contact form</em></p>
    ";

    $mail->send();
    echo json_encode(["status" => "success", "message" => "Email sent successfully to all admins"]);
} catch (Exception $e) {
    error_log("Email error: " . $mail->ErrorInfo);
    echo json_encode(["status" => "error", "message" => "Failed to send email"]);
}

pg_close($conn);
?>
