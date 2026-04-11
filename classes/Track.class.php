<?php
/*
    This file is part of MooMuse <http://www.github.com/cedricfrancoys/moomuse>
    Some Rights Reserved
    Original author(s): Cedric FRANCOYS
    Licensed under GNU GPL 3 license <http://www.gnu.org/licenses/>
*/
namespace moomuse;

use equal\orm\Model;

class Track extends Model {

    public static function getName() {
        return 'Track';
    }

    public static function getDescription() {
        return 'A Track object represents a single audio file.';
    }

    public static function getColumns() {
        return [

            'name' => [
                'type'              => 'string',
                'description'       => 'Display name used to refer to the track.',
                'help'              => 'The name of the track.'
            ],

            'device_id' => [
                'type'              => 'many2one',
                'foreign_object'    => 'moomuse\Device',
                'required'          => true,
                'description'       => 'Device to which the track belongs.',
                'help'              => 'References the root device owning this track.'
            ],

            'directory_id' => [
                'type'              => 'many2one',
                'foreign_object'    => 'moomuse\Directory',
                'required'          => true,
                'description'       => 'Directory containing the track.',
                'help'              => 'References the folder in which the track was found.'
            ],

            'path' => [
                'type'              => 'string',
                'usage'             => 'text/plain.small',
                'description'       => 'Absolute normalized path of the audio file.',
                'help'              => 'The full path used to locate the track on disk.'
            ],

            'filename' => [
                'type'              => 'string',
                'description'       => 'Raw file name of the track.',
                'help'              => 'Stores the file name including its extension.'
            ],

            'extension' => [
                'type'              => 'string',
                'description'       => 'File extension of the track.',
                'help'              => 'Stores the detected file extension.'
            ],

            'size' => [
                'type'              => 'integer',
                'description'       => 'File size of the track in bytes.',
                'help'              => 'Stores the current file size.'
            ],

            'playlists_ids' => [
                'type'              => 'many2many',
                'foreign_object'    => 'moomuse\Playlist',
                'foreign_field'     => 'tracks_ids',
                'rel_table'         => 'moomuse_rel_track_playlist',
                'rel_foreign_key'   => 'playlist_id',
                'rel_local_key'     => 'track_id',            
                'description'       => 'Playlists containing the track.',
                'help'              => 'References playlists when the track is linked to one.'
            ],

            'status' => [
                'type'              => 'string',
                'selection'         => [
                    'pending',
                    'analyzed',
                    'error'
                ],
                'default'           => 'pending',
                'description'       => 'Analysis status of the track.',
                'help'              => 'Tracks whether the audio metadata has already been analyzed.'
            ],

            'analyzed_at' => [
                'type'              => 'datetime',
                'description'       => 'Date and time of the last completed track analysis.',
                'help'              => 'Stores when the track metadata was last analyzed.'
            ]

        ];
    }

    public function getIndexes(): array {
        return [
            ['device_id'],
            ['directory_id'],
            ['path']
        ];
    }
}
