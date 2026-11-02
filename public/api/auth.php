<?php
/**
 * Minimal session auth: register, login, logout, me.
 * Passwords use PHP's password_hash (bcrypt/argon) and the session cookie is
 * HttpOnly + SameSite=Lax. Login attempts are throttled per email + IP.
 */
declare(strict_types=1);

require __DIR__ . '/db.php';

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($action === 'me' && $method === 'GET') {
    $uid = $_SESSION['uid'] ?? null;
    if (!$uid) {
        ok(['user' => null]);
    }
    $stmt = db()->prepare('SELECT id, email, name FROM users WHERE id = ?');
    $stmt->execute([(int) $uid]);
    $user = $stmt->fetch();
    ok(['user' => $user ? public_user($user) : null]);
}

if ($method !== 'POST') {
    fail(405, 'Use POST for this action.');
}

$body = request_json();

if ($action === 'register') {
    $email = strtolower(trim((string) ($body['email'] ?? '')));
    $password = (string) ($body['password'] ?? '');
    $name = trim((string) ($body['name'] ?? ''));

    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 190) {
        fail(422, 'Enter a valid email address.');
    }
    if (strlen($password) < 10) {
        fail(422, 'Use a password of at least 10 characters.');
    }
    if (strlen($name) > 80) {
        fail(422, 'Name is too long.');
    }

    $stmt = db()->prepare('SELECT id FROM users WHERE email = ?');
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        fail(409, 'An account already exists for this email.');
    }

    $hash = password_hash($password, PASSWORD_DEFAULT);
    $insert = db()->prepare('INSERT INTO users (email, password_hash, name, created_at) VALUES (?, ?, ?, NOW())');
    $insert->execute([$email, $hash, $name]);
    $id = (int) db()->lastInsertId();

    session_regenerate_id(true);
    $_SESSION['uid'] = $id;
    ok(['user' => ['id' => $id, 'email' => $email, 'name' => $name]]);
}

if ($action === 'login') {
    $email = strtolower(trim((string) ($body['email'] ?? '')));
    $password = (string) ($body['password'] ?? '');
    $ip = (string) ($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0');

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        fail(422, 'Enter a valid email address.');
    }

    $recent = db()->prepare(
        'SELECT COUNT(*) AS n FROM login_attempts WHERE (email = ? OR ip = ?) AND attempted_at > (NOW() - INTERVAL 15 MINUTE)'
    );
    $recent->execute([$email, $ip]);
    if ((int) ($recent->fetch()['n'] ?? 0) > 10) {
        fail(429, 'Too many attempts. Try again in 15 minutes.');
    }

    $stmt = db()->prepare('SELECT id, email, name, password_hash FROM users WHERE email = ?');
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, (string) $user['password_hash'])) {
        $log = db()->prepare('INSERT INTO login_attempts (email, ip, attempted_at) VALUES (?, ?, NOW())');
        $log->execute([$email, $ip]);
        fail(401, 'Email or password is incorrect.');
    }

    if (password_needs_rehash((string) $user['password_hash'], PASSWORD_DEFAULT)) {
        $refresh = db()->prepare('UPDATE users SET password_hash = ? WHERE id = ?');
        $refresh->execute([password_hash($password, PASSWORD_DEFAULT), (int) $user['id']]);
    }

    db()->prepare('DELETE FROM login_attempts WHERE email = ? OR ip = ?')->execute([$email, $ip]);
    session_regenerate_id(true);
    $_SESSION['uid'] = (int) $user['id'];
    ok(['user' => public_user($user)]);
}

if ($action === 'logout') {
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', [
            'expires' => time() - 42000,
            'path' => $params['path'],
            'secure' => (bool) $params['secure'],
            'httponly' => true,
            'samesite' => 'Lax',
        ]);
    }
    session_destroy();
    ok(['ok' => true]);
}

fail(404, 'Unknown auth action.');
