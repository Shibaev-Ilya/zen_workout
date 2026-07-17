<?php

declare(strict_types=1);

function getJwtSecret(): string {
    $secret = getenv('SPORTTRACKER_JWT_SECRET');
    if (is_string($secret) && $secret !== '') {
        return $secret;
    }
    // Смените в проде через SPORTTRACKER_JWT_SECRET
    return 'sporttracker-dev-secret-change-me';
}

function base64UrlEncode(string $data): string {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64UrlDecode(string $data): string {
    $remainder = strlen($data) % 4;
    if ($remainder) {
        $data .= str_repeat('=', 4 - $remainder);
    }
    return base64_decode(strtr($data, '-_', '+/'), true) ?: '';
}

function jwtEncode(array $payload, ?string $secret = null): string {
    $secret = $secret ?? getJwtSecret();
    $header = ['typ' => 'JWT', 'alg' => 'HS256'];
    $segments = [
        base64UrlEncode(json_encode($header, JSON_UNESCAPED_UNICODE)),
        base64UrlEncode(json_encode($payload, JSON_UNESCAPED_UNICODE)),
    ];
    $signingInput = implode('.', $segments);
    $signature = hash_hmac('sha256', $signingInput, $secret, true);
    $segments[] = base64UrlEncode($signature);
    return implode('.', $segments);
}

function jwtDecode(string $token, ?string $secret = null): ?array {
    $secret = $secret ?? getJwtSecret();
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        return null;
    }

    [$headerB64, $payloadB64, $signatureB64] = $parts;
    $expected = base64UrlEncode(
        hash_hmac('sha256', "$headerB64.$payloadB64", $secret, true)
    );

    if (!hash_equals($expected, $signatureB64)) {
        return null;
    }

    $payloadJson = base64UrlDecode($payloadB64);
    $payload = json_decode($payloadJson, true);
    if (!is_array($payload)) {
        return null;
    }

    if (isset($payload['exp']) && time() >= (int) $payload['exp']) {
        return null;
    }

    return $payload;
}

/** JWT на 30 дней */
function createUserJwt(string $userId, string $login): string {
    $now = time();
    return jwtEncode([
        'sub' => $userId,
        'login' => $login,
        'iat' => $now,
        'exp' => $now + 60 * 60 * 24 * 30,
    ]);
}
