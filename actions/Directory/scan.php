<?php
/*
    This file is part of MooMuse <http://www.github.com/cedricfrancoys/moomuse>
    Some Rights Reserved
    Original author(s): Cedric FRANCOYS
    Licensed under GNU GPL 3 license <http://www.gnu.org/licenses/>
*/

use moomuse\Directory;
use moomuse\Track;

[$params, $providers] = eQual::announce([
    'description'   => 'Scans all known directories and creates missing child directories and tracks.',
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
    'directories_created' => 0,
    'tracks_created'      => 0
];

$findDirectory = function(int $deviceId, string $path) {
    return Directory::search([['device_id', '=', $deviceId], ['path', '=', $path]])
        ->read(['id'])
        ->first();
};

$findTrack = function(int $directoryId, string $path) {
    return Track::search([['directory_id', '=', $directoryId], ['path', '=', $path]])
        ->read(['id'])
        ->first();
};

foreach(Directory::search()->read(['id', 'name', 'path', 'device_id'])->get() ?? [] as $directory) {
    $path = realpath($directory['path']);

    if(!$path || !is_dir($path)) {
        Directory::id($directory['id'])->update(['status' => 'error']);
        continue;
    }

    Directory::id($directory['id'])->update(['status' => 'in_progress']);

    $directoriesResult = eQual::run('get', 'moomuse_directories', [
        'path'  => $path,
        'start' => 0,
        'limit' => 10000
    ]);

    foreach(($directoriesResult['directories'] ?? []) as $child) {
        $childPath = realpath($child['path']) ?: $child['path'];

        if($findDirectory($directory['device_id'], $childPath)) {
            continue;
        }

        Directory::create([
            'name'            => $child['name'],
            'path'            => $childPath,
            'device_id'       => $directory['device_id'],
            'parent_id'       => $directory['id']
        ])
        ->read(['id'])
        ->first(true);

        ++$result['directories_created'];
    }

    $filesResult = eQual::run('get', 'moomuse_files', [
        'path'  => $path,
        'start' => 0,
        'limit' => 10000
    ]);

    foreach(($filesResult['files'] ?? []) as $file) {
        $filePath = realpath($file['path']) ?: $file['path'];

        if($findTrack($directory['id'], $filePath)) {
            continue;
        }

        Track::create([
            'name'         => pathinfo($file['name'], PATHINFO_FILENAME),
            'device_id'    => $directory['device_id'],
            'directory_id' => $directory['id'],
            'path'         => $filePath,
            'filename'     => $file['name'],
            'extension'    => strtolower($file['extension'] ?? pathinfo($file['name'], PATHINFO_EXTENSION)),
            'size'         => $file['size'] ?? 0,
            'status'       => 'pending',
            'analyzed_at'  => null
        ])
        ->read(['id'])
        ->first(true);

        ++$result['tracks_created'];
    }

}

$context->httpResponse()
    ->body($result)
    ->send();
