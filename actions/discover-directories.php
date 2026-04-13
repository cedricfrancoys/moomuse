<?php
/*
    This file is part of MooMuse <http://www.github.com/cedricfrancoys/moomuse>
    Some Rights Reserved
    Original author(s): Cedric FRANCOYS
    Licensed under GNU GPL 3 license <http://www.gnu.org/licenses/>
*/

use moomuse\Directory;

[$params, $providers] = eQual::announce([
    'description'   => 'Identifies pending directories and scans each of them.',
    'params'        => [
        'limit' => [
            'type'              => 'integer',
            'default'           => 100
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

$result = [
    'directories_scanned' => 0,
    'directories_failed'  => 0,
    'scanned_ids'         => [],
    'failed_ids'          => []
];

$directories = Directory::search([['status', '=', 'pending']])
    ->read(['id']);

$count = 0;

foreach($directories as $id => $directory) {
    if($count >= $params['limit']) {
        break;
    }

    ++$count;

    try {
        eQual::run('do', 'moomuse_Directory_scan', ['id' => $id]);
        ++$result['directories_scanned'];
        $result['scanned_ids'][] = $id;
    }
    catch(Exception $e) {
        ++$result['directories_failed'];
        $result['failed_ids'][] = $id;
    }
}

$context->httpResponse()
    ->body($result)
    ->send();
