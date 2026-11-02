<?php
/**
 * Project storage scoped to the signed-in user.
 *
 * Every query filters by user_id taken from the session — never from the client.
 * The design payload is stored as JSON and size-checked before it reaches MySQL.
 */
declare(strict_types=1);

require __DIR__ . '/db.php';

$uid = current_user_id();
$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($action === 'list' && $method === 'GET') {
    $stmt = db()->prepare(
        'SELECT id, name, design_json, created_at, updated_at
         FROM projects WHERE user_id = ? ORDER BY updated_at DESC LIMIT 200'
    );
    $stmt->execute([$uid]);
    $projects = [];
    foreach ($stmt->fetchAll() as $row) {
        $design = json_decode((string) $row['design_json'], true);
        $projects[] = [
            'id' => (string) $row['id'],
            'name' => (string) $row['name'],
            'design' => is_array($design) ? $design : null,
            'createdAt' => strtotime((string) $row['created_at']) * 1000,
            'updatedAt' => strtotime((string) $row['updated_at']) * 1000,
        ];
    }
    ok(['projects' => $projects]);
}

if ($method !== 'POST') {
    fail(405, 'Use POST for this action.');
}

$body = request_json();

if ($action === 'save') {
    global $config;
    $project = $body['project'] ?? null;
    if (!is_array($project)) {
        fail(422, 'A project object is required.');
    }
    $id = (string) ($project['id'] ?? '');
    $name = trim((string) ($project['name'] ?? 'Untitled poster'));
    $design = $project['design'] ?? null;

    if (!preg_match('/^[A-Za-z0-9_-]{4,64}$/', $id)) {
        fail(422, 'Invalid project id.');
    }
    if ($name === '' || strlen($name) > 120) {
        fail(422, 'Project name must be 1–120 characters.');
    }
    if (!is_array($design) || !isset($design['compositionId'], $design['formatId'], $design['content'])) {
        fail(422, 'Design payload is incomplete.');
    }

    $json = json_encode($design, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($json === false || strlen($json) > (int) $config['max_project_bytes']) {
        fail(413, 'Design payload is too large.');
    }

    $count = db()->prepare('SELECT COUNT(*) AS n FROM projects WHERE user_id = ?');
    $count->execute([$uid]);
    $existing = db()->prepare('SELECT user_id FROM projects WHERE id = ?');
    $existing->execute([$id]);
    $owner = $existing->fetch();

    if ($owner && (int) $owner['user_id'] !== $uid) {
        fail(403, 'That project belongs to another account.');
    }
    if (!$owner && (int) ($count->fetch()['n'] ?? 0) >= (int) $config['max_projects']) {
        fail(422, 'Project limit reached for this account.');
    }

    $stmt = db()->prepare(
        'INSERT INTO projects (id, user_id, name, design_json, created_at, updated_at)
         VALUES (?, ?, ?, ?, NOW(), NOW())
         ON DUPLICATE KEY UPDATE name = VALUES(name), design_json = VALUES(design_json), updated_at = NOW()'
    );
    $stmt->execute([$id, $uid, $name, $json]);
    ok(['ok' => true, 'id' => $id]);
}

if ($action === 'delete') {
    $id = (string) ($body['id'] ?? '');
    if (!preg_match('/^[A-Za-z0-9_-]{4,64}$/', $id)) {
        fail(422, 'Invalid project id.');
    }
    $stmt = db()->prepare('DELETE FROM projects WHERE id = ? AND user_id = ?');
    $stmt->execute([$id, $uid]);
    ok(['ok' => true, 'deleted' => $stmt->rowCount() > 0]);
}

fail(404, 'Unknown projects action.');
