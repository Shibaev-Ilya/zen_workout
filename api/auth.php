<?php

declare(strict_types=1);

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/jwt.php';

function authenticate(PDO $pdo): string {
    $token = getBearerToken();
    if (!$token) {
        jsonError('Token required', 401);
    }

    $payload = jwtDecode($token);
    if (!$payload || empty($payload['sub'])) {
        jsonError('Invalid token', 401);
    }

    $userId = (string) $payload['sub'];

    $stmt = $pdo->prepare('SELECT id FROM sporttracker_users WHERE id = ?');
    $stmt->execute([$userId]);
    $row = $stmt->fetch();

    if (!$row) {
        jsonError('Invalid token', 401);
    }

    return $row['id'];
}
