<?php
/*
    This file is part of MooMuse <http://www.github.com/cedricfrancoys/moomuse>
    Some Rights Reserved
    Original author(s): Cedric FRANCOYS
    Licensed under GNU GPL 3 license <http://www.gnu.org/licenses/>
*/

use moomuse\Directory;
use moomuse\Drive;

[$params, $providers] = eQual::announce([
    'description'   => 'Scans given drive and creates missing directories and tracks.',
    'params'        => [
        'id' => [
            'type'              => 'many2one',
            'foreign_object'    => 'moomuse\Drive',
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

$result = [
    'directories_created'  => 0
];

$normalizeRelativePath = function(string $absolutePath, string $mountPoint): string {
    $absolutePath = str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $absolutePath);
    $mountPoint = rtrim(str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $mountPoint), DIRECTORY_SEPARATOR);

    if($absolutePath === $mountPoint) {
        return '';
    }

    $relativePath = ltrim(substr($absolutePath, strlen($mountPoint)), DIRECTORY_SEPARATOR);

    return $relativePath;
};

$normalizeRelativeDirectoryPath = function(string $absolutePath, string $mountPoint) use ($normalizeRelativePath): string {
    $relativePath = $normalizeRelativePath($absolutePath, $mountPoint);

    if($relativePath === '') {
        return '';
    }

    return rtrim($relativePath, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR;
};

$drive = Drive::id($params['id'])->read(['id', 'name', 'mount_point', 'device_id'])->first();

if(!$drive) {
    throw new Exception('unknown_drive', EQ_ERROR_INVALID_PARAM);
}

$mountPoint = realpath($drive['mount_point']);

if(!$mountPoint || !is_dir($mountPoint)) {
    throw new Exception('path_not_found', EQ_ERROR_INVALID_PARAM);
}

$rootDirectory = Directory::search([['device_id', '=', $drive['device_id']], ['path', '=', '']])
        ->read(['id', 'path'])
        ->first();

if(!$rootDirectory) {
    $rootDirectory = Directory::create([
            'name'            => basename($mountPoint) ?: $drive['name'],
            'path'            => '',
            'device_id'       => $drive['device_id'],
            'drive_id'        => $drive['id'],
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
    $directoryAbsolutePath = realpath($directory['path']) ?: $directory['path'];
    $directoryPath = $normalizeRelativeDirectoryPath($directoryAbsolutePath, $mountPoint);

    $existingDirectory = Directory::search([['device_id', '=', $drive['device_id']], ['path', '=', $directoryPath]])
        ->first();

    if($existingDirectory) {
        continue;
    }

    Directory::create([
            'name'            => $directory['name'],
            'path'            => $directoryPath,
            'device_id'       => $drive['device_id'],
            'drive_id'        => $drive['id'],
            'parent_id'       => $rootDirectory['id'],
            'status'          => 'pending',
            'last_scanned_at' => null
        ])
        ->read(['id'])
        ->first(true);

    ++$result['directories_created'];
}

Drive::id($params['id'])
    ->update([
        'status'            => 'scanned',
        'last_scanned_at'   => time()        
    ]);

$context->httpResponse()
    ->body($result)
    ->send();
