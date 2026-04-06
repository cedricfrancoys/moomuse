<?php
/*
    This file is part of MooMuse <http://www.github.com/cedricfrancoys/moomuse>
    Some Rights Reserved
    Original author(s): Cédric FRANCOYS
    Licensed under GNU GPL 3 license <http://www.gnu.org/licenses/>
*/

[$params, $providers] = eQual::announce([
    'description'   => "Returns the list of available drives on the current system.",
    'params'        => [],
    'access' => [
        'visibility'        => 'public'
    ],
    'response'      => [
        'content-type'  => 'application/json',
        'accept-origin' => '*'
    ],
    'providers'     => ['context']
]);

/**
 * @var \equal\php\Context $context
 */
['context' => $context] = $providers;

/**
 * Methods
 */

$getWindowsDrives = function() {
    $drives = [];

    foreach (range('A', 'Z') as $letter) {
        $path = $letter . ':/';

        if (is_dir($path)) {
            $drives[] = [
                'name'  => $letter,
                'path'  => $path,
                'type'  => 'drive',
                'total' => @disk_total_space($path),
                'free'  => @disk_free_space($path)
            ];
        }
    }

    return $drives;
};

$getUnixMounts = function() {
    $drives = [];

    // Lecture des mounts système
    if (file_exists('/proc/mounts')) {
        $lines = file('/proc/mounts');

        foreach ($lines as $line) {
            $parts = explode(' ', $line);
            if (count($parts) < 2) continue;

            [$device, $mountpoint] = $parts;

            // Filtrer mounts système peu utiles
            if (!is_dir($mountpoint)) continue;
            if (strpos($mountpoint, '/proc') === 0) continue;
            if (strpos($mountpoint, '/sys') === 0) continue;
            if (strpos($mountpoint, '/dev') === 0) continue;

            $drives[] = [
                'device' => $device,
                'name'   => basename($mountpoint) ?: '/',
                'path'   => $mountpoint,
                'type'   => 'mount',
                'total'  => @disk_total_space($mountpoint),
                'free'   => @disk_free_space($mountpoint)
            ];
        }
    }

    // fallback simple si /proc non dispo
    if (!count($drives)) {
        foreach (array_merge(glob('/mnt/*'), glob('/media/*'), glob('/Volumes/*')) as $mount) {
            if (is_dir($mount)) {
                $drives[] = [
                    'name'  => basename($mount),
                    'path'  => $mount,
                    'type'  => 'mount',
                    'total' => @disk_total_space($mount),
                    'free'  => @disk_free_space($mount)
                ];
            }
        }
    }

    // root toujours présent
    $drives[] = [
        'name'  => '/',
        'path'  => '/',
        'type'  => 'system',
        'total' => @disk_total_space('/'),
        'free'  => @disk_free_space('/')
    ];

    return $drives;
};

/**
 * Action
 */

$isWindows = strtoupper(substr(PHP_OS, 0, 3)) === 'WIN';

$drives = $isWindows
    ? $getWindowsDrives()
    : $getUnixMounts();

$context->httpResponse()
    ->header('Content-Type', 'application/json')
    ->body(json_encode([
        'os'     => PHP_OS,
        'drives' => $drives
    ]), true)
    ->send();