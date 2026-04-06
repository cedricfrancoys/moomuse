<?php

[$params, $providers] = eQual::announce([
    'description'   => "Lists media files (.mp*) in a directory (optimized partial sort).",
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

$bufferLimit = $limit * 3; // 🔑 clé du partial sort

// validation path
if(strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
    if(!is_dir($basePath)) {
        throw new Exception("path_not_found", EQ_ERROR_INVALID_PARAM);
    }
} 
else {
    $basePath = realpath($basePath);
    if($basePath === false) {
        throw new Exception("path_not_found", EQ_ERROR_INVALID_PARAM);
    }
}

$files = [];
$directories = [];

$iterator = new DirectoryIterator($basePath);

foreach ($iterator as $item) {

    if ($item->isDot()) continue;

    $name = $item->getFilename();
    $fullPath = $item->getPathname();

    if ($item->isDir()) {
        $directories[] = [
            'name' => $name,
            'path' => $fullPath,
            'type' => 'directory'
        ];
    }
    elseif ($item->isFile()) {

        $ext = strtolower($item->getExtension());

        // filtre rapide sans regex
        if (!str_starts_with($ext, 'mp')) continue;

        $files[] = [
            'name'      => $name,
            'path'      => $fullPath,
            'type'      => 'file',
            'size'      => $item->getSize(),
            'extension' => $ext,
            'modified'  => $item->getMTime()
        ];

        // 🔑 stop early dès qu'on a assez de matière
        if (count($files) >= $bufferLimit) {
            break;
        }
    }
}

//
// 🔑 TRI PARTIEL
//
usort($files, fn($a, $b) => strnatcasecmp($a['name'], $b['name']));
usort($directories, fn($a, $b) => strnatcasecmp($a['name'], $b['name']));

//
// 🔑 SLICE FINAL (résultat cohérent pour le front)
//
$files = array_slice($files, $start, $limit);
$directories = array_slice($directories, $start, $limit);

$context->httpResponse()
    ->body([
        'base_path'  => $basePath,
        'count'      => count($files),
        'files'      => $files,
        'directories'=> $directories
    ])
    ->send();