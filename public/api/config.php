<?php
/**
 * Optional backend configuration.
 *
 * Copy the values you need into your host's environment (or edit this file on a
 * server that is not publicly readable). Nothing here is required for the
 * studio to work: the frontend uses browser storage unless VITE_API_BASE is set.
 *
 * SECURITY: never commit real credentials. Keep this file outside version
 * control on production and block direct access via public/api/.htaccess.
 */
declare(strict_types=1);

function envv(string $key, string $default = ''): string
{
    $value = getenv($key);
    if ($value === false || $value === '') {
        $value = $_SERVER[$key] ?? '';
    }
    return is_string($value) && $value !== '' ? $value : $default;
}

return [
    // MySQL / MariaDB connection (PDO).
    'db_dsn' => envv('DB_DSN', 'mysql:host=localhost;dbname=astrosivam_studio;charset=utf8mb4'),
    'db_user' => envv('DB_USER', ''),
    'db_pass' => envv('DB_PASS', ''),

    // Restrict browser access to your studio origin, e.g. https://studio.astrosivam.com
    'app_origin' => envv('APP_ORIGIN', ''),

    // Session cookie name. Use a unique value per deployment.
    'session_name' => envv('SESSION_NAME', 'astrosivam_studio'),

    // Optional image provider. Leave AI_PROVIDER=none to keep generation off.
    // Supported: none | openai | stability
    'ai_provider' => strtolower(envv('AI_PROVIDER', 'none')),
    'ai_key' => envv('AI_API_KEY', ''),
    'ai_model' => envv('AI_MODEL', 'gpt-image-1'),

    // Optional shared token required by generate.php (defence in depth for
    // deployments that expose the proxy before sessions exist).
    'ai_proxy_token' => envv('AI_PROXY_TOKEN', ''),

    // Hard limits.
    'max_projects' => 200,
    'max_project_bytes' => 2 * 1024 * 1024,
];
