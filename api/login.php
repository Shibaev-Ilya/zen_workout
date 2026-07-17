<?php

declare(strict_types=1);

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/jwt.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError('Method not allowed', 405);
}

$data = getRequestBody();
$login = isset($data['login']) ? trim((string) $data['login']) : '';
$password = isset($data['password']) ? (string) $data['password'] : '';

if ($login === '' || $password === '') {
    jsonError('Missing required fields: login, password');
}

$login = mb_strtolower($login);

$stmt = $pdo->prepare(
    'SELECT id, login, password_hash FROM sporttracker_users WHERE login = ?'
);
$stmt->execute([$login]);
$row = $stmt->fetch();

if (!$row || !password_verify($password, $row['password_hash'])) {
    jsonError('Invalid login or password', 401);
}

$token = createUserJwt($row['id'], $row['login']);

jsonResponse([
    'token' => $token,
    'login' => $row['login'],
]);
