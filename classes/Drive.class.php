<?php
/*
    This file is part of MooMuse <http://www.github.com/cedricfrancoys/moomuse>
    Some Rights Reserved
    Original author(s): Cedric FRANCOYS
    Licensed under GNU GPL 3 license <http://www.gnu.org/licenses/>
*/
namespace moomuse;

use equal\orm\Model;

class Drive extends Model {

    public static function getName() {
        return 'Drive';
    }

    public static function getDescription() {
        return 'A Drive object represents a mount point exposing a device.';
    }

    public static function getColumns() {
        return [

            'name' => [
                'type'              => 'string',
                'description'       => 'Display name of the drive.',
                'help'              => 'Stores the current mount name or drive letter.'
            ],

            'device_id' => [
                'type'              => 'many2one',
                'foreign_object'    => 'moomuse\Device',
                'required'          => true,
                'description'       => 'Device exposed by this mount point.',
                'help'              => 'References the physical device associated with this drive.'
            ],

            'volume_serial' => [
                'type'              => 'string',
                'description'       => 'Filesystem volume identifier reported by the operating system.',
                'help'              => 'Stores the short volume identifier when available.'
            ],

            'mount_point' => [
                'type'              => 'string',
                'usage'             => 'text/plain.short',
                'description'       => 'Absolute mount path of the drive.',
                'help'              => 'Stores the path used to access this mount point.'
            ],

            'type' => [
                'type'              => 'string',
                'description'       => 'Type of drive or mount point.',
                'help'              => 'Stores the mount classification returned by the discovery controller.'
            ],

            'status' => [
                'type'              => 'string',
                'selection'         => [
                    'pending',
                    'scanned'
                ],
                'default'           => 'pending',
                'description'       => 'Scanning status of the directory.',
                'help'              => 'Tracks whether the directory content has already been scanned.'
            ],

            'last_scanned_at' => [
                'type'              => 'datetime',
                'description'       => 'Date and time of the last completed directory scan.',
                'help'              => 'Stores when the directory content was last scanned.'
            ],

            'directories_ids' => [
                'type'              => 'one2many',
                'foreign_object'    => 'moomuse\Directory',
                'foreign_field'     => 'drive_id',
                'description'       => 'Directories attached to this drive.',
                'help'              => 'Lists the indexed directories that belong to this mount point.'
            ],

            'tracks_ids' => [
                'type'              => 'one2many',
                'foreign_object'    => 'moomuse\Track',
                'foreign_field'     => 'drive_id',
                'description'       => 'Tracks attached to this drive.',
                'help'              => 'Lists the indexed tracks that belong to this mount point.'
            ]
        ];
    }

    public function getIndexes(): array {
        return [
            ['device_id', 'mount_point']
        ];
    }
}
