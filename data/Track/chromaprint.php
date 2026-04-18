<?php
/*
    This file is part of MooMuse <http://www.github.com/cedricfrancoys/moomuse>
    Some Rights Reserved
    Original author(s): Cedric FRANCOYS
    Licensed under GNU GPL 3 license <http://www.gnu.org/licenses/>
*/

use equal\http\HttpRequest;
use moomuse\Track;

[$params, $providers] = eQual::announce([
    'description'   => "Analyze a track and persist its chromaprint.",
    'params'        => [
        'id' => [
            'type'              => 'many2one',
            'foreign_object'    => 'moomuse\Track',
            'required'          => true
        ]
    ],
    'access' => [
        'visibility' => 'public'
    ],
    'response' => [
        'content-type'  => 'application/json',
        'accept-origin' => '*'
    ],
    'providers' => ['context']
]);

['context' => $context] = $providers;

$track = Track::id($params['id'])
    ->read([
        'id',
        'status',
        'full_path'
    ])
    ->first();

if(!$track) {
    throw new Exception("unknown_track", EQ_ERROR_INVALID_PARAM);
}

if(!$track['full_path']) {
    throw new Exception("non_retrievable_full_path_", EQ_ERROR_INVALID_PARAM);
}

if(!file_exists($track['full_path'])) {
    throw new Exception("file_not_found", EQ_ERROR_INVALID_PARAM);
}

$cmd = escapeshellarg(EQ_BASEDIR . DIRECTORY_SEPARATOR . 'fpcalc.exe')
    . ' -json '
    . escapeshellarg($track['full_path'])
    . ' 2>&1';

exec($cmd, $output, $exit_code);

if($exit_code !== 0) {
    trigger_error("APP::fpcalc_failed (exit {$exit_code}): " . implode("\n", $output), EQ_REPORT_WARNING); 
    throw new Exception('fpcalc_failed', EQ_ERROR_UNKNOWN);
}

$json = implode("\n", $output);
$data = json_decode($json, true);

if(!is_array($data) || empty($data['fingerprint'])) {
    throw new Exception('invalid_fpcalc_json_output', EQ_ERROR_UNKNOWN);
}

$result = [
        'duration'    => (int) ($data['duration'] ?? 0),
        'fingerprint' => $data['fingerprint'] ?? null
    ];

    
$context->httpResponse()
    ->body($result)
    ->send();
