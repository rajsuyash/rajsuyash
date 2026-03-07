<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://rajsuyash.com');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || empty($input['email'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Email required']);
    exit;
}

$email = filter_var(trim($input['email']), FILTER_VALIDATE_EMAIL);
if (!$email) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid email']);
    exit;
}

$source = in_array($input['source'] ?? '', ['topbar', 'leadmagnet']) ? $input['source'] : 'unknown';
$timestamp = date('Y-m-d H:i:s');
$ip = $_SERVER['REMOTE_ADDR'] ?? '';

// Store in CSV (backup)
$dataDir = dirname(__DIR__) . '/email-subscribers';
if (!is_dir($dataDir)) {
    mkdir($dataDir, 0750, true);
}

$csvFile = $dataDir . '/subscribers.csv';

if (!file_exists($csvFile)) {
    file_put_contents($csvFile, "email,source,timestamp,ip\n");
}

$existing = file_get_contents($csvFile);
$isNew = strpos($existing, $email . ',') === false;

if ($isNew) {
    $line = implode(',', [$email, $source, $timestamp, $ip]) . "\n";
    file_put_contents($csvFile, $line, FILE_APPEND | LOCK_EX);
    
    // Also save to Google Sheets
    $webhookUrl = 'https://script.google.com/macros/s/AKfycbwxWb0u5Dbm1xyKJemPsYDIljmIkJf22TNfqGgE86GhIknUT_ET1BzLnJsTrsQUwVySzw/exec';
    $webhookData = json_encode([
        'type' => 'email_subscriber',
        'email' => $email,
        'source' => $source,
        'timestamp' => $timestamp
    ]);
    
    $ch = curl_init($webhookUrl);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $webhookData);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 5);
    curl_exec($ch);
    curl_close($ch);
}

// Send the playbook email
sendPlaybookEmail($email);

echo json_encode(['status' => 'ok', 'message' => $isNew ? 'Subscribed' : 'Already subscribed']);


function sendPlaybookEmail(string $toEmail): void
{
    $fromName = 'Suyash Raj';
    $fromEmail = 'grow@rajsuyash.com';
    $subject = 'Your AI Automation Playbook is here';
    $playbookUrl = 'https://rajsuyash.com/playbook.html';
    $bookingUrl = 'https://rajsuyash.com/qualify';

    $htmlBody = <<<HTML
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background-color:#f7f5f2; font-family:-apple-system, 'Segoe UI', Helvetica, Arial, sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f5f2; padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%;">

    <tr>
        <td style="background-color:#0d0d0d; padding:40px 40px 30px; border-radius:12px 12px 0 0; text-align:center;">
            <p style="margin:0 0 16px; font-size:13px; font-weight:600; letter-spacing:2px; text-transform:uppercase; color:#ff4d4d;">YOUR PLAYBOOK IS READY</p>
            <h1 style="margin:0; font-size:28px; font-weight:300; line-height:1.2; color:#f7f5f2; font-family:Georgia, serif;">The AI Automation<br>Playbook for SMBs</h1>
        </td>
    </tr>

    <tr>
        <td style="background-color:#ffffff; padding:40px;">
            <p style="margin:0 0 20px; font-size:16px; line-height:1.7; color:#2a2a2a;">Hey there,</p>
            <p style="margin:0 0 20px; font-size:16px; line-height:1.7; color:#2a2a2a;">Thanks for grabbing the playbook. Here's what's inside:</p>

            <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                <tr>
                    <td style="padding:12px 16px; background:#f7f5f2; border-radius:8px; border-left:3px solid #ff4d4d;">
                        <p style="margin:0 0 8px; font-size:15px; color:#0d0d0d;"><strong>&#8594; Prioritization Matrix</strong> — Know exactly what to automate first</p>
                        <p style="margin:0 0 8px; font-size:15px; color:#0d0d0d;"><strong>&#8594; 5 N8N Workflows</strong> — Copy-paste automation blueprints</p>
                        <p style="margin:0; font-size:15px; color:#0d0d0d;"><strong>&#8594; ROI Calculator</strong> — Justify every automation with hard numbers</p>
                    </td>
                </tr>
            </table>

            <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
                <tr>
                    <td align="center">
                        <a href="{$playbookUrl}" style="display:inline-block; padding:14px 32px; background-color:#ff4d4d; color:#ffffff; font-size:16px; font-weight:600; text-decoration:none; border-radius:6px;">Read the Playbook</a>
                    </td>
                </tr>
            </table>

            <p style="margin:0 0 20px; font-size:16px; line-height:1.7; color:#2a2a2a;">Want us to <strong>build and deploy these automations for you</strong>? Let's chat.</p>

            <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
                <tr>
                    <td align="center">
                        <a href="{$bookingUrl}" style="display:inline-block; padding:12px 28px; background-color:#0d0d0d; color:#ffffff; font-size:15px; font-weight:500; text-decoration:none; border-radius:6px;">Book a Free Discovery Call</a>
                    </td>
                </tr>
            </table>

            <p style="margin:0; font-size:16px; line-height:1.7; color:#2a2a2a;">Talk soon,<br><strong>Suyash Raj</strong><br><span style="color:#8a8a8a; font-size:14px;">AI Automation Agency</span></p>
        </td>
    </tr>

    <tr>
        <td style="background-color:#f0ede8; padding:24px 40px; border-radius:0 0 12px 12px; text-align:center;">
            <p style="margin:0 0 8px; font-size:13px; color:#8a8a8a;">
                <a href="https://rajsuyash.com" style="color:#8a8a8a; text-decoration:none;">rajsuyash.com</a>
            </p>
            <p style="margin:0; font-size:12px; color:#aaa;">You're receiving this because you signed up at rajsuyash.com.</p>
        </td>
    </tr>

</table>
</td></tr>
</table>

</body>
</html>
HTML;

    $textBody = "Your AI Automation Playbook is ready!\n\nRead it here: {$playbookUrl}\n\nWant us to build this for you?\nBook a free call: {$bookingUrl}\n\n— Suyash Raj\nrajsuyash.com";

    $boundary = md5(uniqid(time()));

    $headers = implode("\r\n", [
        "From: {$fromName} <{$fromEmail}>",
        "Reply-To: {$fromEmail}",
        "MIME-Version: 1.0",
        "Content-Type: multipart/alternative; boundary=\"{$boundary}\"",
    ]);

    $body = "--{$boundary}\r\n"
        . "Content-Type: text/plain; charset=UTF-8\r\n"
        . "Content-Transfer-Encoding: 8bit\r\n\r\n"
        . $textBody . "\r\n\r\n"
        . "--{$boundary}\r\n"
        . "Content-Type: text/html; charset=UTF-8\r\n"
        . "Content-Transfer-Encoding: 8bit\r\n\r\n"
        . $htmlBody . "\r\n\r\n"
        . "--{$boundary}--";

    @mail($toEmail, $subject, $body, $headers);
}
