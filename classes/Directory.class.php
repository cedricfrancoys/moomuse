<?php
/*
    This file is part of MooMuse <http://www.github.com/cedricfrancoys/moomuse>
    Some Rights Reserved
    Original author(s): Cedric FRANCOYS
    Licensed under GNU GPL 3 license <http://www.gnu.org/licenses/>
*/
namespace moomuse;

use equal\orm\Model;

class Directory extends Model {

    public static function getName() {
        return 'Directory';
    }

    public static function getDescription() {
        return 'A Directory object represents a scanned folder belonging to a device.';
    }

    public static function getColumns() {
        return [

            'name' => [
                'type'              => 'string',
                'description'       => 'Display name of the directory.',
                'help'              => 'The folder name.'
            ],

            'path' => [
                'type'              => 'string',
                'usage'             => 'text/plain.small',
                'description'       => 'Relative normalized path of the directory.',
                'help'              => 'The relative path used to locate the directory on the device.'
            ],

            'full_path' => [
                'type'              => 'computed',
                'result_type'       => 'string',
                'usage'             => 'text/plain.small',
                'function'          => 'calcFullPath',
                'description'       => 'Relative normalized path of the audio file.',
                'help'              => 'The relative path used to locate the track on the device.'
            ],

            'device_id' => [
                'type'              => 'many2one',
                'foreign_object'    => 'moomuse\Device',
                'required'          => true,
                'description'       => 'Device to which the directory belongs.',
                'help'              => 'References the root device owning this directory.'
            ],

            'drive_id' => [
                'type'              => 'many2one',
                'foreign_object'    => 'moomuse\Drive',
                'description'       => 'Drive to which the directory belongs.',
                'help'              => 'References the mount point currently used to access this directory.'
            ],

            'parent_id' => [
                'type'              => 'many2one',
                'foreign_object'    => 'moomuse\Directory',
                'description'       => 'Parent directory in the hierarchy.',
                'help'              => 'References the parent folder when the directory is nested.'
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
                'foreign_field'     => 'parent_id',
                'description'       => 'Child directories contained in this directory.',
                'help'              => 'Lists the subdirectories discovered during scanning.'
            ],

            'tracks_ids' => [
                'type'              => 'one2many',
                'foreign_object'    => 'moomuse\Track',
                'foreign_field'     => 'directory_id',
                'description'       => 'Tracks contained in this directory.',
                'help'              => 'Lists the audio files discovered in the directory.'
            ]

        ];
    }

    protected static function calcFullPath($self) {
        $result = [];
        $self->read(['drive_id' => ['mount_point'], 'path']);
        foreach($self as $id => $track) {
            $mountPoint = $track['drive_id']['mount_point'] ?? null;
            $result[$id] = $mountPoint ? rtrim($mountPoint, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . ltrim($track['path'], DIRECTORY_SEPARATOR) : null;
        }
        return $result;
    }

    public function getIndexes(): array {
        return [
            ['device_id'],
            ['drive_id'],
            ['parent_id'],
            ['path']
        ];
    }
}
