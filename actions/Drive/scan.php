<?php
/*
    This file is part of MooMuse <http://www.github.com/cedricfrancoys/moomuse>
    Some Rights Reserved
    Original author(s): Cedric FRANCOYS
    Licensed under GNU GPL 3 license <http://www.gnu.org/licenses/>
*/

use moomuse\Directory;
use moomuse\Drive;
use moomuse\Track;

[$params, $providers] = eQual::announce([
    'description'   => 'Scans all known drives and creates missing directories and tracks.',
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
    'directories_created'  => 0,
    'tracks_created'       => 0
];

$findDirectory = function(int $deviceId, string $path) {
    return Directory::search([['device_id', '=', $deviceId], ['path', '=', $path]])
        ->read(['id', 'path'])
        ->first();
};

$findTrack = function(int $directoryId, string $path) {
    return Track::search([['directory_id', '=', $directoryId], ['path', '=', $path]])
        ->read(['id'])
        ->first();
};

foreach(Drive::search()->read(['id', 'name', 'mount_point', 'device_id']) ?? [] as $drive) {
    $mountPoint = realpath($drive['mount_point']);

    if(!$mountPoint || !is_dir($mountPoint)) {
        continue;
    }

    $rootDirectory = $findDirectory($drive['device_id'], $mountPoint);

    if(!$rootDirectory) {
        $rootDirectory = Directory::create([
                'name'            => basename($mountPoint) ?: $drive['name'],
                'path'            => $mountPoint,
                'device_id'       => $drive['device_id'],
                'parent_id'       => null,
                'status'          => 'pending',
                'last_scanned_at' => null
            ])
            ->read(['id', 'path'])
            ->first(true);
        ++$result['directories_created'];
    }

    $directoriesResult = eQual::run('get', 'moomuse_directories', [
        'path'  => $mountPoint,
        'start' => 0,
        'limit' => 10000
    ]);

    foreach(($directoriesResult['directories'] ?? []) as $directory) {
        $directoryPath = realpath($directory['path']) ?: $directory['path'];

        if($findDirectory($drive['device_id'], $directoryPath)) {
            continue;
        }

        Directory::create([
                'name'            => $directory['name'],
                'path'            => $directoryPath,
                'device_id'       => $drive['device_id'],
                'parent_id'       => $rootDirectory['id'],
                'status'          => 'pending',
                'last_scanned_at' => null
            ])
            ->read(['id'])
            ->first(true);

        ++$result['directories_created'];
    }

    $filesResult = eQual::run('get', 'moomuse_files', [
        'path'  => $mountPoint,
        'start' => 0,
        'limit' => 10000
    ]);

    foreach(($filesResult['files'] ?? []) as $file) {
        $filePath = realpath($file['path']) ?: $file['path'];

        if($findTrack($rootDirectory['id'], $filePath)) {
            continue;
        }

        Track::create([
                'name'         => pathinfo($file['name'], PATHINFO_FILENAME),
                'device_id'    => $drive['device_id'],
                'directory_id' => $rootDirectory['id'],
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
