<?php

declare(strict_types=1);

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/auth.php';

$userId = authenticate($pdo);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->prepare(
        'SELECT id, exercises, duration, completed_at
         FROM sporttracker_trainings
         WHERE user_id = ?
         ORDER BY completed_at DESC'
    );
    $stmt->execute([$userId]);
    $trainings = $stmt->fetchAll();

    $history = array_map(function (array $row): array {
        return [
            'id' => $row['id'],
            'exercises' => json_decode($row['exercises'], true),
            'duration' => (int) $row['duration'],
            'completedAt' => $row['completed_at'],
        ];
    }, $trainings);

    $stmt = $pdo->prepare(
        'SELECT name FROM sporttracker_custom_exercises WHERE user_id = ? ORDER BY name'
    );
    $stmt->execute([$userId]);
    $customExercises = $stmt->fetchAll(PDO::FETCH_COLUMN);

    jsonResponse([
        'history' => $history,
        'customExercises' => $customExercises,
    ]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = getRequestBody();

    $trainingId = $data['id'] ?? null;
    $exercises = $data['exercises'] ?? null;
    $duration = $data['duration'] ?? null;
    $completedAt = $data['completedAt'] ?? null;

    if (!$trainingId || !$exercises || !is_numeric($duration) || !$completedAt) {
        jsonError('Missing required fields: id, exercises, duration, completedAt');
    }

    $stmt = $pdo->prepare(
        'INSERT INTO sporttracker_trainings (id, user_id, exercises, duration, completed_at)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT (id) DO NOTHING'
    );
    $stmt->execute([
        $trainingId,
        $userId,
        json_encode($exercises, JSON_UNESCAPED_UNICODE),
        (int) $duration,
        $completedAt,
    ]);

    $stmt = $pdo->prepare(
        'SELECT id, exercises, duration, completed_at
         FROM sporttracker_trainings
         WHERE user_id = ?
         ORDER BY completed_at DESC'
    );
    $stmt->execute([$userId]);
    $trainings = $stmt->fetchAll();

    $history = array_map(function (array $row): array {
        return [
            'id' => $row['id'],
            'exercises' => json_decode($row['exercises'], true),
            'duration' => (int) $row['duration'],
            'completedAt' => $row['completed_at'],
        ];
    }, $trainings);

    jsonResponse(['history' => $history]);
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $data = getRequestBody();
    $trainingId = $data['id'] ?? $_GET['id'] ?? null;

    if (!$trainingId) {
        jsonError('Missing required field: id');
    }

    $stmt = $pdo->prepare(
        'DELETE FROM sporttracker_trainings WHERE id = ? AND user_id = ?'
    );
    $stmt->execute([$trainingId, $userId]);

    if ($stmt->rowCount() === 0) {
        jsonError('Training not found', 404);
    }

    $stmt = $pdo->prepare(
        'SELECT id, exercises, duration, completed_at
         FROM sporttracker_trainings
         WHERE user_id = ?
         ORDER BY completed_at DESC'
    );
    $stmt->execute([$userId]);
    $trainings = $stmt->fetchAll();

    $history = array_map(function (array $row): array {
        return [
            'id' => $row['id'],
            'exercises' => json_decode($row['exercises'], true),
            'duration' => (int) $row['duration'],
            'completedAt' => $row['completed_at'],
        ];
    }, $trainings);

    jsonResponse(['history' => $history]);
}

jsonError('Method not allowed', 405);