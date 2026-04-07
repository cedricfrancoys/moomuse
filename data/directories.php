<?php
/*
    This file is part of MooMuse <http://www.github.com/cedricfrancoys/moomuse>
    Some Rights Reserved
    Original author(s): Cedric FRANCOYS
    Licensed under GNU GPL 3 license <http://www.gnu.org/licenses/>
*/

[$params, $providers] = eQual::announce([
    'description'   => "Lists directories in a path.",
    'params'        => [
        'path' => [
            'type'          => 'string',
            'required'      => true
        ],
        'start' => [
            'type'          => 'integer',
            'default'       => 0
        ],
        'limit' => [
            'type'          => 'integer',
            'default'       => 100
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

['context' => $providers['context']];

$basePath = trim($params['path'], '"\'');
$limit = $params['limit'];
$start = $params['start'];

if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
    if (!is_dir($basePath)) {
        throw new Exception("path_not_found", EQ_ERROR_INVALID_PARAM);
    }
}
else {
    $basePath = realpath($basePath);
    if ($basePath === false) {
        throw new Exception("path_not_found", EQ_ERROR_INVALID_PARAM);
    }
}

$directories = [];
$iterator = new DirectoryIterator($basePath);

foreach ($iterator as $item) {
    if ($item->isDot() || !$item->isDir()) {
        continue;
    }

    $directories[] = [
        'name' => $item->getFilename(),
        'path' => $item->getPathname(),
        'type' => 'directory'
    ];
}

usort($directories, fn($a, $b) => strnatcasecmp($a['name'], $b['name']));
$directories = array_slice($directories, $start, $limit);

$context->httpResponse()
    ->body([
        'base_path'   => $basePath,
        'count'       => count($directories),
        'directories' => $directories
    ])
    ->send();
