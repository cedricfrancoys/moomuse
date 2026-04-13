<?php
/*
    This file is part of MooMuse <http://www.github.com/cedricfrancoys/moomuse>
    Some Rights Reserved
    Original author(s): Cedric FRANCOYS
    Licensed under GNU GPL 3 license <http://www.gnu.org/licenses/>
*/

use moomuse\Device;
use moomuse\Drive;

[$params, $providers] = eQual::announce([
    'description'   => 'Creates Device and Drive objects from available supports.',
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
    'devices_created' => 0,
    'devices_updated' => 0,
    'drives_created'  => 0,
    'drives_updated'  => 0
];

foreach(eQual::run('get', 'moomuse_drives') ?? [] as $drive) {
    if(empty($drive['uuid'])) {
        continue;
    }

    $name = $drive['name'] ?? $drive['path'] ?? 'unnamed drive';
    $path = isset($drive['path']) ? realpath($drive['path']) ?: $drive['path'] : null;
    $device_uuid = strtolower((string) $drive['uuid']);

    $device = Device::search(['uuid', '=', $device_uuid])->read(['id', 'uuid'])->first();

    if(!$device) {
        $device = Device::create([
                'uuid'       => $device_uuid,
            ])
            ->first();
        ++$result['devices_created'];
    }
    else {
        ++$result['devices_updated'];
    }

    $driveRecord = null;
    if($path) {
        $driveRecord = Drive::search([
                ['device_id', '=', $device['id']],
                ['mount_point', '=', $path]
            ])
            ->read(['id'])
            ->first();
    }

    $drive_values = [
        'name'          => $name,
        'volume_serial' => $drive['id'] ?? null,
        'device_id'     => $device['id'],
        'mount_point'   => $path,
        'type'          => $drive['type'] ?? null
    ];

    if($driveRecord) {
        Drive::id($driveRecord['id'])->update($drive_values);
        ++$result['drives_updated'];
        continue;
    }

    Drive::create($drive_values);
    ++$result['drives_created'];
}

$context->httpResponse()
    ->body($result)
    ->send();
