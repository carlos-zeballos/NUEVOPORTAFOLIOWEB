<?php
// Recibe las solicitudes de los formularios de zebware.org y las envía por correo.
// Requiere PHP 7.2+ y la función mail() habilitada (estándar en cPanel).

const LEAD_TO = 'carlos.fernando.zeballos@gmail.com';
// Debe ser un buzón del mismo dominio del hosting para que Gmail no lo marque como spam.
const LEAD_FROM = 'no-reply@zebware.org';
const ALLOWED_HOSTS = ['zebware.org', 'www.zebware.org'];
const RATE_LIMIT = 5;
const RATE_WINDOW = 600;
const MIN_ELAPSED_MS = 2500;

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function reply($status, $ok)
{
    http_response_code($status);
    echo json_encode(['ok' => $ok]);
    exit;
}

function request_host($url)
{
    $host = parse_url((string) $url, PHP_URL_HOST);
    return is_string($host) ? strtolower($host) : '';
}

function field($name, $max, $multiline = false)
{
    $value = isset($_POST[$name]) && is_string($_POST[$name]) ? $_POST[$name] : '';
    if (!preg_match('//u', $value)) return '';
    $value = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $value);
    $value = $multiline ? str_replace("\r\n", "\n", $value) : preg_replace('/[\r\n\t]+/', ' ', $value);
    $value = trim($value);
    return function_exists('mb_substr') ? mb_substr($value, 0, $max, 'UTF-8') : substr($value, 0, $max);
}

function rate_limited($ip)
{
    $file = rtrim(sys_get_temp_dir(), '/') . '/zebware-lead-' . hash('sha256', $ip);
    $now = time();
    $hits = [];
    if (is_file($file)) {
        $stored = json_decode((string) @file_get_contents($file), true);
        if (is_array($stored)) {
            foreach ($stored as $time) {
                if (is_int($time) && $now - $time < RATE_WINDOW) $hits[] = $time;
            }
        }
    }
    if (count($hits) >= RATE_LIMIT) return true;
    $hits[] = $now;
    @file_put_contents($file, json_encode($hits), LOCK_EX);
    return false;
}

function encode_header($text)
{
    return '=?UTF-8?B?' . base64_encode($text) . '?=';
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    reply(405, false);
}

$origin = request_host($_SERVER['HTTP_ORIGIN'] ?? ($_SERVER['HTTP_REFERER'] ?? ''));
if (!in_array($origin, ALLOWED_HOSTS, true)) reply(403, false);

if ((int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 20000) reply(413, false);

// Bots: campo trampa lleno o envío demasiado rápido. Se responde "ok" para no darles pistas.
$elapsed = (int) ($_POST['elapsed'] ?? 0);
if (field('website', 200) !== '' || $elapsed < MIN_ELAPSED_MS) reply(200, true);

$lead = [
    'Nombre' => field('name', 100),
    'Contacto' => field('contact', 150),
    'Negocio o marca' => field('business', 120),
    'Servicio' => field('service', 120),
    'Plan' => field('plan', 200),
    'Plazo' => field('timing', 80),
    'Mensaje' => field('message', 3000, true),
];
$page = field('page', 200);

if ($lead['Nombre'] === '') reply(422, false);

$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
if (rate_limited($ip)) reply(429, false);

$lines = [];
foreach ($lead as $label => $value) {
    if ($value === '') continue;
    $lines[] = $label === 'Mensaje' ? "\n$label:\n$value" : "$label: $value";
}
$lines[] = '';
$lines[] = '---';
$lines[] = 'Página: https://zebware.org' . ($page !== '' && $page[0] === '/' ? $page : '/');
$lines[] = 'Fecha: ' . gmdate('Y-m-d H:i') . ' UTC';

$subject = 'Nueva solicitud web: ' . ($lead['Servicio'] !== '' ? $lead['Servicio'] : 'Contacto') . ' — ' . $lead['Nombre'];

$headers = [
    'From: ' . encode_header('Zebware Web') . ' <' . LEAD_FROM . '>',
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    'X-Mailer: zebware.org',
];
$replyTo = filter_var($lead['Contacto'], FILTER_VALIDATE_EMAIL);
if ($replyTo !== false) $headers[] = 'Reply-To: ' . $replyTo;

$sent = @mail(LEAD_TO, encode_header($subject), implode("\n", $lines), implode("\r\n", $headers), '-f' . LEAD_FROM);

reply($sent ? 200 : 500, (bool) $sent);
