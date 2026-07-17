<?php

declare(strict_types=1);

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/auth.php';

$userId = authenticate($pdo);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->prepare(
        'SELECT name FROM sporttracker_custom_exercises WHERE user_id = ? ORDER BY name'
    );
    $stmt->execute([$userId]);
    $customExercises = $stmt->fetchAll(PDO::FETCH_COLUMN);

    jsonResponse(['customExercises' => $customExercises]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = getRequestBody();
    $name = $data['name'] ?? '';

    if (trim($name) === '') {
        jsonError('Name is required');
    }

    $stmt = $pdo->prepare(
        'INSERT INTO sporttracker_custom_exercises (user_id, name)
         VALUES (?, ?)
         ON CONFLICT (user_id, name) DO NOTHING'
    );
    $stmt->execute([$userId, trim($name)]);

    jsonResponse(['ok' => true]);
}

jsonError('Method not allowed', 405);