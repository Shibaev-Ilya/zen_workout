<?php

declare(strict_types=1);

function jsonResponse(mixed $data, int $status = 200): void {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function jsonError(string $message, int $status = 400): void {
    jsonResponse(['error' => $message], $status);
}

function getRequestBody(): array {
    $body = file_get_contents('php://input');
    $data = json_decode($body, true);
    if (!is_array($data)) {
        jsonError('Invalid JSON body', 400);
    }
    return $data;
}

function getBearerToken(): ?string {
    $header = $_SERVER['HTTP_AUTHORIZATION']
        ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
        ?? '';

    if (preg_match('/^Bearer\s+(.+)$/i', $header, $matches)) {
        return $matches[1];
    }

    if (function_exists('getallheaders')) {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        if (preg_match('/^Bearer\s+(.+)$/i', $authHeader, $matches)) {
            return $matches[1];
        }
    }

    return $_GET['token'] ?? null;
}