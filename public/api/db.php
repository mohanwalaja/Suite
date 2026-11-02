<?php
/**
 * Shared bootstrap: JSON headers, CORS, session, PDO and small helpers.
 * All endpoints require this file.
 */
declare(strict_types=1);

$config = require __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: no-referrer');

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed = (string) $config['app_origin'];
if ($origin !== '' && $allowed !== '' && hash_equals($allowed, $origin)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Vary: Origin');
}
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
    || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
session_name((string) $config['session_name']);
session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'secure' => $https,
    'httponly' => true,
    'samesite' => 'Lax',
]);
session_start();

function fail(int $status, string $message): void
{
    http_response_code($status);
    echo json_encode(['error' => $message], JSON_UNESCAPED_SLASHES);
    exit;
}

function ok(array $payload): void
{
    echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function request_json(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || $raw === '') {
        return [];
    }
    if (strlen($raw) > 4 * 1024 * 1024) {
        fail(413, 'Request body is too large.');
    }
    $data = json_decode($raw, true);
    if (!is_array($data)) {
        fail(400, 'Request body must be a JSON object.');
    }
    return $data;
}

function db(): PDO
{
    static $pdo = null;
    global $config;
    if ($pdo instanceof PDO) {
        return $pdo;
    }
    if ((string) $config['db_user'] === '') {
        fail(503, 'Database is not configured. Set DB_USER and DB_PASS in the server environment.');
    }
    try {
        $pdo = new PDO(
            (string) $config['db_dsn'],
            (string) $config['db_user'],
            (string) $config['db_pass'],
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]
        );
    } catch (Throwable $error) {
        error_log('DB connection failed: ' . $error->getMessage());
        fail(503, 'Database is unavailable.');
    }
    return $pdo;
}

function current_user_id(): int
{
    $id = $_SESSION['uid'] ?? null;
    if (!is_int($id) && !(is_string($id) && ctype_digit($id))) {
        fail(401, 'Sign in is required.');
    }
    return (int) $id;
}

function public_user(array $row): array
{
    return [
        'id' => (int) $row['id'],
        'email' => (string) $row['email'],
        'name' => (string) ($row['name'] ?? ''),
    ];
}
