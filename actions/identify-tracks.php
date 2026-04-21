<?php
/*
    This file is part of MooMuse <http://www.github.com/cedricfrancoys/moomuse>
    Some Rights Reserved
    Original author(s): Cedric FRANCOYS
    Licensed under GNU GPL 3 license <http://www.gnu.org/licenses/>
*/

use moomuse\Track;

[$params, $providers] = eQual::announce([
    'description'   => 'Identifies pending tracks and guesses a candidate for each of them.',
    'params'        => [
        'limit' => [
            'type'              => 'integer',
            'default'           => 50
        ]
    ],
    'access' => [
        'visibility' => 'public'
    ],
    'response' => [
        'content-type'  => 'application/json',
        'charset'       => 'utf-8',
        'accept-origin' => '*'
    ],
    'providers' => ['context']
]);

['context' => $context] = $providers;

$result = [
    'tracks_processed' => 0,
    'tracks_failed'    => 0,
    'failed_ids'       => [],
    'processed_ids'    => [],
    'logs'             => []
];

$tracks = Track::search(
        [['status', '=', 'pending']],
        ['limit' => $params['limit']]
    )
    ->read(['id']);

$count = 0;

foreach($tracks as $id => $track) {
    if($count >= $params['limit']) {
        break;
    }

    ++$count;

    try {
        eQual::run('do', 'moomuse_Track_guess-candidate', ['id' => $id]);
        ++$result['tracks_processed'];
        $result['processed_ids'][] = $id;
    }
    catch(Exception $e) {
        ++$result['tracks_failed'];
        $result['logs'][] = "ERR - " . $e->getMessage();
        $result['failed_ids'][] = $id;
    }
}

$context->httpResponse()
    ->body($result)
    ->send();
