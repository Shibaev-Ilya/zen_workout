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

if (!preg_match('/^[a-z0-9_-]{3,64}$/', $login)) {
    jsonError('Login must be 3–64 chars: letters, digits, _ or -');
}

if (strlen($password) < 6) {
    jsonError('Password must be at least 6 characters');
}

$stmt = $pdo->prepare('SELECT id FROM sporttracker_users WHERE login = ?');
$stmt->execute([$login]);
if ($stmt->fetch()) {
    jsonError('Login already taken', 409);
}

$passwordHash = password_hash($password, PASSWORD_DEFAULT);
if ($passwordHash === false) {
    jsonError('Failed to hash password', 500);
}

$stmt = $pdo->prepare(
    'INSERT INTO sporttracker_users (login, password_hash) VALUES (?, ?) RETURNING id'
);
$stmt->execute([$login, $passwordHash]);
$row = $stmt->fetch();

if (!$row) {
    jsonError('Failed to create user', 500);
}

$userId = $row['id'];
$token = createUserJwt($userId, $login);

jsonResponse([
    'token' => $token,
    'login' => $login,
], 201);
