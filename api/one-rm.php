<?php

declare(strict_types=1);

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/auth.php';

$userId = authenticate($pdo);

function fetchOneRmList(PDO $pdo, string $userId): array {
    $stmt = $pdo->prepare(
        'SELECT id, exercise_name, one_rm, updated_at
         FROM sporttracker_one_rm
         WHERE user_id = ?
         ORDER BY exercise_name'
    );
    $stmt->execute([$userId]);
    $rows = $stmt->fetchAll();

    return array_map(static function (array $row): array {
        return [
            'id' => $row['id'],
            'exerciseName' => $row['exercise_name'],
            'oneRm' => (float) $row['one_rm'],
            'updatedAt' => $row['updated_at'],
        ];
    }, $rows);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    jsonResponse(['oneRm' => fetchOneRmList($pdo, $userId)]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = getRequestBody();
    $exerciseName = isset($data['exerciseName']) ? trim((string) $data['exerciseName']) : '';
    $oneRm = $data['oneRm'] ?? null;

    if ($exerciseName === '') {
        jsonError('Missing required field: exerciseName');
    }

    if (!is_numeric($oneRm) || (float) $oneRm <= 0) {
        jsonError('oneRm must be a positive number');
    }

    $oneRmValue = round((float) $oneRm, 2);

    $stmt = $pdo->prepare(
        'INSERT INTO sporttracker_one_rm (user_id, exercise_name, one_rm, updated_at)
         VALUES (?, ?, ?, NOW())
         ON CONFLICT (user_id, exercise_name)
         DO UPDATE SET one_rm = EXCLUDED.one_rm, updated_at = NOW()'
    );
    $stmt->execute([$userId, $exerciseName, $oneRmValue]);

    jsonResponse(['oneRm' => fetchOneRmList($pdo, $userId)]);
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $data = getRequestBody();
    $id = $data['id'] ?? null;

    if (!$id) {
        jsonError('Missing required field: id');
    }

    $stmt = $pdo->prepare(
        'DELETE FROM sporttracker_one_rm WHERE id = ? AND user_id = ?'
    );
    $stmt->execute([$id, $userId]);

    if ($stmt->rowCount() === 0) {
        jsonError('Record not found', 404);
    }

    jsonResponse(['oneRm' => fetchOneRmList($pdo, $userId)]);
}

jsonError('Method not allowed', 405);
