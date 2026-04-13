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
    'description'   => 'Scans given directory and creates missing child directories and tracks.',
    'params'        => [
        'id' => [
            'type'              => 'many2one',
            'foreign_object'    => 'moomuse\Directory',
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

$isAudioExt = function(string $extension): bool {
    return in_array($extension, ['aac', 'flac', 'm4a', 'mp2', 'mp3', 'mp4', 'ogg', 'opus', 'wav', 'wma'], true);
};

$joinPath = function(string $basePath, string $relativePath): string {
    if($relativePath === '') {
        return $basePath;
    }

    return rtrim($basePath, DIRECTORY_SEPARATOR . '/\\') . DIRECTORY_SEPARATOR . str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $relativePath);
};

$normalizeRelativePath = function(string $absolutePath, string $mountPoint): string {
    $absolutePath = str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $absolutePath);
    $mountPoint = rtrim(str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $mountPoint), DIRECTORY_SEPARATOR);

    if($absolutePath === $mountPoint) {
        return '';
    }

    return ltrim(substr($absolutePath, strlen($mountPoint)), DIRECTORY_SEPARATOR);
};

$normalizeRelativeDirectoryPath = function(string $absolutePath, string $mountPoint) use ($normalizeRelativePath): string {
    $relativePath = $normalizeRelativePath($absolutePath, $mountPoint);

    if($relativePath === '') {
        return '';
    }

    return rtrim($relativePath, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR;
};

$directory = Directory::id($params['id'])->read(['id', 'name', 'full_path', 'device_id', 'drive_id'])->first();

if(!$directory) {
    throw new Exception('unknown_directory', EQ_ERROR_UNKNOWN_OBJECT);
}

$drive = Drive::id($directory['drive_id'])->read(['mount_point'])->first();

$directoriesResult = eQual::run('get', 'moomuse_directories', [
    'path'  => $directory['full_path'],
    'start' => 0,
    'limit' => 10000
]);

foreach(($directoriesResult['directories'] ?? []) as $child) {
    $childAbsolutePath = realpath($child['path']) ?: $child['path'];
    $childPath = $normalizeRelativeDirectoryPath($childAbsolutePath, $drive['mount_point']);

    if($findDirectory($directory['device_id'], $childPath)) {
        continue;
    }

    Directory::create([
        'name'            => $child['name'],
        'path'            => $childPath,
        'device_id'       => $directory['device_id'],
        'drive_id'        => $directory['drive_id'],
        'parent_id'       => $directory['id']
    ]);

    ++$result['directories_created'];
}

$filesResult = eQual::run('get', 'moomuse_files', [
    'path'  => $directory['full_path'],
    'start' => 0,
    'limit' => 10000
]);

foreach(($filesResult['files'] ?? []) as $file) {
    $extension = strtolower($file['extension'] ?? pathinfo($file['name'], PATHINFO_EXTENSION));

    if(!$isAudioExt($extension)) {
        continue;
    }

    $fileAbsolutePath = realpath($file['path']) ?: $file['path'];
    $filePath = $normalizeRelativePath($fileAbsolutePath, $drive['mount_point']);

    if($findTrack($directory['id'], $filePath)) {
        continue;
    }

    Track::create([
        'name'         => pathinfo($file['name'], PATHINFO_FILENAME),
        'device_id'    => $directory['device_id'],
        'drive_id'     => $directory['drive_id'],
        'directory_id' => $directory['id'],
        'path'         => $filePath,
        'filename'     => $file['name'],
        'extension'    => $extension,
        'size'         => $file['size'] ?? 0,
    ]);

    ++$result['tracks_created'];
}

Directory::id($directory['id'])
    ->update([
        'status'          => 'scanned',
        'last_scanned_at' => time()
    ]);


$context->httpResponse()
    ->body($result)
    ->send();
