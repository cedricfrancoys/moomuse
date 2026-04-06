<?php

[$params, $providers] = eQual::announce([
    'description'   => 'Stream local file (buffered, supports HTTP range).',
    'params'        => [
        'path' => [
            'type'      => 'string',
            'required'  => true
        ]
    ],
    'access' => [
        'visibility' => 'public'
    ],
    'response' => [
        'accept-origin' => '*'
    ],
    'providers' => ['context', 'auth']
]);

['context' => $context] = $providers;

$path = $params['path'];

/**
 * Sécurité minimale
 */
if(!file_exists($path) || !is_file($path)) {
    throw new Exception("file_not_found", EQ_ERROR_UNKNOWN_OBJECT);
}

if(!is_readable($path)) {
    throw new Exception("file_not_readable", EQ_ERROR_NOT_ALLOWED);
}

/**
 * MIME simple
 */
function getMimeType($path) {
    $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
    return [
        'mp3'  => 'audio/mpeg',
        'mp4'  => 'audio/mp4',
        'm4a'  => 'audio/mp4',
        'aac'  => 'audio/aac',
        'wav'  => 'audio/wav',
        'flac' => 'audio/flac',
        'ogg'  => 'audio/ogg'
    ][$ext] ?? 'application/octet-stream';
}

$type = getMimeType($path);

/**
 * Infos fichier
 */
$size = filesize($path);
$start = 0;
$end = $size - 1;
$status = 200;

/**
 * Range parsing
 */
$http_range = $context->httpRequest()->header('Range');

if($http_range && preg_match('/bytes=(\d*)-(\d*)/', $http_range, $matches)) {

    $rStart = $matches[1];
    $rEnd   = $matches[2];

    if($rStart === '' && $rEnd !== '') {
        // ex: bytes=-500
        $start = max(0, $size - (int)$rEnd);
        $end   = $size - 1;
    }
    else {
        $start = ($rStart !== '') ? (int)$rStart : 0;
        $end   = ($rEnd !== '') ? (int)$rEnd : $end;
    }

    // clamp
    $start = max(0, $start);
    $end   = min($end, $size - 1);

    if ($start > $end) {
        $context->httpResponse()
            ->status(416)
            ->header('Content-Range', "bytes */$size")
            ->send();
        return;
    }

    $status = 206;
}

$length = $end - $start + 1;

/**
 * Lecture directe avec offset
 */
$data = file_get_contents($path, false, null, $start, $length);

if($data === false) {
    throw new Exception("file_read_error");
}

/**
 * Response
 */
$response = $context->httpResponse()
    ->status($status)
    ->header('Content-Type', $type)
    ->header('Accept-Ranges', 'bytes')
    ->header('Content-Length', $length);

if($status === 206) {
    $response->header('Content-Range', "bytes $start-$end/$size");
}

$response
    ->body($data, true)
    ->send();