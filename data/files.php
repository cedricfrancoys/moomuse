<?php
/*
    This file is part of MooMuse <http://www.github.com/cedricfrancoys/moomuse>
    Some Rights Reserved
    Original author(s): Cedric FRANCOYS
    Licensed under GNU GPL 3 license <http://www.gnu.org/licenses/>
*/

[$params, $providers] = eQual::announce([
    'description'   => "Lists media files (.mp*) in a directory.",
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

$isAudioExt = function(string $extension): bool {
    return in_array($extension, ['aac', 'flac', 'm4a', 'mp2', 'mp3', 'mp4', 'ogg', 'opus', 'wav', 'wma'], true);
};

if(strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
    if(!is_dir($basePath)) {
        throw new Exception("path_not_found", EQ_ERROR_INVALID_PARAM);
    }
}
else {
    $basePath = realpath($basePath);
    if ($basePath === false) {
        throw new Exception("path_not_found", EQ_ERROR_INVALID_PARAM);
    }
}

$files = [];
$iterator = new DirectoryIterator($basePath);

foreach($iterator as $item) {
    if($item->isDot() || !$item->isFile()) {
        continue;
    }

    $ext = strtolower($item->getExtension());
    // Allow browser-supported audio formats
    if(!$isAudioExt($ext)) {
        continue;
    }

    $files[] = [
        'name'      => $item->getFilename(),
        'path'      => $item->getPathname(),
        'type'      => 'file',
        'size'      => $item->getSize(),
        'extension' => $ext,
        'modified'  => $item->getMTime()
    ];
}

usort($files, fn($a, $b) => strnatcasecmp($a['name'], $b['name']));
$files = array_slice($files, $start, $limit);

$context->httpResponse()
    ->body([
        'base_path'  => $basePath,
        'count'      => count($files),
        'files'      => $files
    ])
    ->send();
