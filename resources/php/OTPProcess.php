<?php
session_start();
$username = $_SESSION['username'];
// Include PHPMailer classes
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'PHPMailer-master/src/PHPMailer.php';
require 'PHPMailer-master/src/SMTP.php';
require 'PHPMailer-master/src/Exception.php';
require 'C:/xampp/php/composer/vendor/autoload.php';

// Specify the path to your .env file in the project root
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../../');  // Move two directories up to the project root
$dotenv->load();
// Ensure JSON content type
header('Content-Type: application/json');

// Disable error display to prevent interference in JSON response
ini_set('display_errors', 0); // Do not display errors in the browser
ini_set('log_errors', 1);    // Log errors to the server's error log
ini_set('error_log', 'php_error_log'); //PHP Errors are Stored in this path
error_reporting(E_ALL);

// Database connection
$postgresqlPassword = $_ENV['POSTGRESQL_PASSWORD'];
$conn = pg_connect("host=localhost port=5432 dbname=EventManagementSystem user=postgres password=". $postgresqlPassword);
if (!$conn) {
    echo json_encode(["status" => "error", "message" => "Unable to connect to the database."]);
    exit;
}

// Handle POST requests
if ($_SERVER['REQUEST_METHOD'] === "POST") {
    $jsonData = file_get_contents('php://input');
    $inputData = json_decode($jsonData, true);

    // Check if OTP request or OTP validation
    if (isset($inputData['otp'])) {
        // OTP validation logic
        $inputOTP = (int) $inputData['otp'];

        // Example of validation logic
        if ($_SESSION['generated_otp'] === $inputOTP) {
            echo json_encode(["status" => "vaild", "message" => "OTP Matched"]);
        } else {
            echo json_encode(["status" => "invaild", "message" => "Invalid OTP. Refresh The Page To Re-Send The OTP"]);
        }
        unset($_SESSION['generated_otp']);
        exit;
    } else {
        // Generate and send OTP
        try {
            $query = "SELECT users_emails.user_id, users_emails.user_email
            FROM users_emails
            JOIN users ON users.user_id = users_emails.user_id
            JOIN user_login ON users.user_id = user_login.user_id
            WHERE user_login.user_login_id = $1;
            ";
            
            // Execute the query
            $EmailQueryResult = pg_query_params($conn, $query, [$username]);
            if ($EmailQueryResult) {
                $row = pg_fetch_assoc($EmailQueryResult); 
                if ($row) {
                    $_SESSION['userID'] = $row['user_id'];
                    $email = $row['user_email'];
                }else{
                    echo json_encode(["status" => "error", "message" => "Email not found."]);
                }
            }else{
                echo json_encode(["status" => "error", "message" => "Failed to retrieve email"]);
            }
            $otp = rand(100000, 999999); // Generate 6-digit OTP

            // Save OTP in session for validation
            $_SESSION['generated_otp'] = $otp;            // Send email using PHPMailer
            $mail = new PHPMailer(true);
            $mail->isSMTP();
            $mail->Host = 'smtp.gmail.com';
            $mail->SMTPAuth = true;
            $mail->Username = $_ENV['MAIL_USERNAME']; // From .env file
            $mail->Password = $_ENV['MAIL_APP_PASSWORD']; // Replace with your app-specific password

            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port = 587;

            $mail->setFrom($_ENV['MAIL_USERNAME'], 'Map The Events');
            $mail->addAddress($email); // Replace with actual recipient
            $mail->isHTML(true);
            $mail->Subject = 'OTP for Password Reset';
            $mail->Body = "<p>Dear User,</p>
                <p>Your OTP for password reset is: <strong>$otp</strong>.</p>
                <p>Please use it to reset your password for Map The Events.</p>";

            $mail->send();
            echo json_encode(["status" => "sent", "message" => "OTP sent successfully, To Your Email-ID: ", "emailID" => $email]);
        } catch (Exception $e) {
            error_log("Email error: " . $mail->ErrorInfo);
            echo json_encode(["status" => "error", "message" => "Failed to send OTP"]);
        }
    }
}
pg_close($conn);
?>
