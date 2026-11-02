<?php
/**
 * Optional image-generation proxy.
 *
 * The browser never sees an API key. This endpoint forwards the prompt to a
 * paid provider and returns either a data URL or a remote URL. When no provider
 * is configured it returns 503 with a clear message — the studio falls back to
 * its own vector artwork and never fabricates a result.
 *
 * Supported providers:
 *   openai    — POST https://api.openai.com/v1/images/generations
 *   stability — POST https://api.stability.ai/v2beta/stable-image/generate/core
 */
declare(strict_types=1);

require __DIR__ . '/db.php';

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    fail(405, 'Use POST.');
}

$body = request_json();
$prompt = trim((string) ($body['prompt'] ?? ''));
$width = (int) ($body['width'] ?? 1024);
$height = (int) ($body['height'] ?? 1024);

if ($prompt === '' || mb_strlen($prompt) > 1200) {
    fail(422, 'Prompt must be 1–1200 characters.');
}
if ($width < 256 || $width > 1536 || $height < 256 || $height > 1536) {
    fail(422, 'Requested image size is out of range.');
}

$provider = (string) $config['ai_provider'];
$key = (string) $config['ai_key'];

if ($provider === '' || $provider === 'none' || $key === '') {
    fail(503, 'No image provider is configured. The studio will use its built-in vector artwork.');
}

$token = (string) $config['ai_proxy_token'];
if ($token !== '') {
    $sent = $_SERVER['HTTP_X_PROXY_TOKEN'] ?? '';
    if (!is_string($sent) || !hash_equals($token, $sent)) {
        fail(401, 'Proxy token missing or invalid.');
    }
}

// Simple per-IP throttle: 12 generations per hour.
$ip = (string) ($_SERVER['REMOTE_ADDR'] ?? 'unknown');
$bucket = sys_get_temp_dir() . '/astrosivam-ai-' . hash('sha256', $ip) . '.json';
$now = time();
$history = [];
if (is_file($bucket)) {
    $decoded = json_decode((string) file_get_contents($bucket), true);
    if (is_array($decoded)) {
        $history = array_values(array_filter($decoded, static fn ($t) => is_int($t) && $t > $now - 3600));
    }
}
if (count($history) >= 12) {
    fail(429, 'Image generation limit reached for this hour.');
}
$history[] = $now;
@file_put_contents($bucket, json_encode($history), LOCK_EX);

$aspect = $width > $height * 1.25 ? '1536x1024' : ($height > $width * 1.25 ? '1024x1536' : '1024x1024');

function curl_json(string $url, array $payload, string $key): array
{
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 120,
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . $key,
            'Content-Type: application/json',
        ],
        CURLOPT_POSTFIELDS => json_encode($payload),
    ]);
    $response = curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    if ($response === false) {
        fail(502, 'Provider request failed: ' . $error);
    }
    $decoded = json_decode((string) $response, true);
    if ($status < 200 || $status >= 300) {
        $message = is_array($decoded) ? (string) ($decoded['error']['message'] ?? 'Provider rejected the request.') : 'Provider rejected the request.';
        fail(502, 'Provider error: ' . substr($message, 0, 240));
    }
    if (!is_array($decoded)) {
        fail(502, 'Provider returned an unexpected response.');
    }
    return $decoded;
}

if ($provider === 'openai') {
    $model = (string) $config['ai_model'];
    $payload = [
        'model' => $model,
        'prompt' => $prompt,
        'n' => 1,
        'size' => $aspect,
    ];
    // DALL·E accepts response_format; gpt-image-1 always returns base64.
    if (strpos($model, 'dall-e') !== false) {
        $payload['response_format'] = 'b64_json';
    }
    $data = curl_json('https://api.openai.com/v1/images/generations', $payload, $key);
    $item = $data['data'][0] ?? null;
    if (!is_array($item)) {
        fail(502, 'Provider returned no image.');
    }
    if (!empty($item['b64_json'])) {
        ok([
            'image' => 'data:image/png;base64,' . $item['b64_json'],
            'provider' => 'openai',
            'model' => $model,
        ]);
    }
    if (!empty($item['url'])) {
        ok(['url' => (string) $item['url'], 'provider' => 'openai', 'model' => $model]);
    }
    fail(502, 'Provider response contained no image data.');
}

if ($provider === 'stability') {
    $ch = curl_init('https://api.stability.ai/v2beta/stable-image/generate/core');
    $fields = [
        'prompt' => $prompt,
        'aspect_ratio' => $aspect === '1536x1024' ? '3:2' : ($aspect === '1024x1536' ? '2:3' : '1:1'),
        'output_format' => 'png',
    ];
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 120,
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . $key,
            'Accept: image/*',
        ],
        CURLOPT_POSTFIELDS => $fields,
    ]);
    $binary = curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $type = (string) curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
    curl_close($ch);
    if ($status < 200 || $status >= 300 || $binary === false) {
        fail(502, 'Stability rejected the request.');
    }
    $mime = strpos($type, 'image/') === 0 ? $type : 'image/png';
    ok([
        'image' => 'data:' . $mime . ';base64,' . base64_encode((string) $binary),
        'provider' => 'stability',
        'model' => 'core',
    ]);
}

fail(501, 'Unsupported provider configuration.');
