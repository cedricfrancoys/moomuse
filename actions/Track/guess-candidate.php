<?php
/*
    This file is part of MooMuse <http://www.github.com/cedricfrancoys/moomuse>
    Some Rights Reserved
    Original author(s): Cedric FRANCOYS
    Licensed under GNU GPL 3 license <http://www.gnu.org/licenses/>
*/

use moomuse\Track;

[$params, $providers] = eQual::announce([
    'description'   => "Analyze a track and persist the best title/artist candidate.",
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

if(!in_array($track['status'], ['pending', 'candidate', 'unknown'], true)) {
    throw new Exception("non_candidate_track_status", EQ_ERROR_INVALID_PARAM);
}

$file = realpath($track['full_path'] ?? '');

if(!$file || !is_file($file)) {
    throw new Exception("file_not_found", EQ_ERROR_INVALID_PARAM);
}

try {
    $result = eQual::run('get', 'moomuse_fileinfo', [
            'path' => $file
        ]);

    $bestMatch = $result['analysis']['best_match'] ?? null;

    $values = [
        'last_analyzed_at' => time()
    ];

    if($bestMatch) {
        $values['title'] = $bestMatch['title'] ?? null;
        $values['artist'] = $bestMatch['artist'] ?? null;
        $values['album'] = $bestMatch['album'] ?? null;
        $values['status'] = 'candidate';
    }
    else {
        $values['status'] = 'unknown';
    }

    Track::id($track['id'])->update($values);
}
catch(Exception $e) {
    Track::id($track['id'])->update([
        'status' => 'error'
    ]); 
    throw $e;
}

$context->httpResponse()
    ->status(204)
    ->send();
