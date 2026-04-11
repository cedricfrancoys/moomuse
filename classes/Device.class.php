<?php
/*
    This file is part of MooMuse <http://www.github.com/cedricfrancoys/moomuse>
    Some Rights Reserved
    Original author(s): Cedric FRANCOYS
    Licensed under GNU GPL 3 license <http://www.gnu.org/licenses/>
*/
namespace moomuse;

use equal\orm\Model;

class Device extends Model {

    public static function getName() {
        return 'Device';
    }

    public static function getDescription() {
        return 'A Device object represents a physical storage device.';
    }

    public static function getColumns() {
        return [

            'name' => [
                'type'              => 'alias',
                'alias'             => 'uuid'
            ],

            'uuid' => [
                'type'              => 'string',
                'usage'             => 'text/plain:36',
                'description'       => 'Unique identifier for the device.',
                'help'              => 'The UUID of the physical device.'
            ],

            'status' => [
                'type'              => 'string',
                'selection'         => [
                    'pending',
                    'in_progress',
                    'scanned',
                    'error'
                ],
                'default'           => 'pending',
                'description'       => 'Scanning status of the device.',
                'help'              => 'Tracks whether the device has already been scanned.'
            ],

            'scanned_at' => [
                'type'              => 'datetime',
                'description'       => 'Date and time of the last completed device scan.',
                'help'              => 'Stores when the device hierarchy was last scanned.'
            ],

            'drives_ids' => [
                'type'              => 'one2many',
                'foreign_object'    => 'moomuse\Drive',
                'foreign_field'     => 'device_id',
                'description'       => 'Mounted drives attached to the device.',
                'help'              => 'Lists all current mount points exposing the same physical device.'
            ],

            'directories_ids' => [
                'type'              => 'one2many',
                'foreign_object'    => 'moomuse\Directory',
                'foreign_field'     => 'device_id',
                'description'       => 'Directories attached to the device.',
                'help'              => 'Lists all indexed directories belonging to the device.'
            ],

            'tracks_ids' => [
                'type'              => 'one2many',
                'foreign_object'    => 'moomuse\Track',
                'foreign_field'     => 'device_id',
                'description'       => 'Tracks attached to the device.',
                'help'              => 'Lists all indexed tracks belonging to the device.'
            ]

        ];
    }

    public function getIndexes(): array {
        return [
            ['uuid']
        ];
    }
}
