<?php

declare(strict_types=1);

$host = getenv('SPORTTRACKER_DB_HOST') ?: 'localhost';
$port = getenv('SPORTTRACKER_DB_PORT') ?: '5432';
$dbname = getenv('SPORTTRACKER_DB_NAME') ?: 'sporttracker';
$user = getenv('SPORTTRACKER_DB_USER') ?: 'postgres';
$pass = getenv('SPORTTRACKER_DB_PASS') ?: '';

$dsn = "pgsql:host=$host;port=$port;dbname=$dbname";

try {
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}