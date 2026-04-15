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

            'drive_id' => [
                'type'              => 'many2one',
                'foreign_object'    => 'moomuse\Drive',
                'description'       => 'Drive to which the track belongs.',
                'help'              => 'References the mount point currently used to access this track.'
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
                'description'       => 'Relative normalized path of the audio file.',
                'help'              => 'The relative path used to locate the track on the device.'
            ],

            'full_path' => [
                'type'              => 'computed',
                'result_type'       => 'string',
                'usage'             => 'text/plain.small',
                'function'          => 'calcFullPath',
                'description'       => 'Relative normalized path of the audio file.',
                'help'              => 'The relative path used to locate the track on the device.'
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
                    'candidate',
                    'unknown',
                    'ambiguous',
                    'identified',
                    'error'
                ],
                'default'           => 'pending',
                'description'       => 'Analysis status of the track.',
                'help'              => 'Tracks whether the audio metadata has already been analyzed.'
            ],

            'title' => [
                'type'              => 'string',
                'description'       => 'Official title of the track.'
            ],

            'artist' => [
                'type'              => 'string',
                'description'       => 'Artist of the track.'
            ],

            'album' => [
                'type'              => 'string',
                'description'       => 'Album of the track.',
            ],

            'year' => [
                'type'              => 'integer',
                'description'       => 'Year of release of the track.'
            ],

            'duration' => [
                'type'              => 'integer',
                'description'       => 'Duration of the track in seconds.'
            ],

            'last_analyzed_at' => [
                'type'              => 'datetime',
                'description'       => 'Date and time of the last completed track analysis.',
                'help'              => 'Stores when the track metadata was last analyzed.'
            ],

            'chromaprint' => [
                'type'              => 'string',
                'usage'             => 'text/plain:7000',
                'description'       => 'Chromaprint fingerprint of the track.',
            ],

            'extref_accoust_id' => [
                'type'              => 'string',
                'usage'             => 'text/plain:36',
                'description'       => 'AccoustID identifier UUIDv4 of the track.',
                'example'           => 'f3b2c9a4-6d2e-4f91-bb4a-7c9e8c1d2e3f'
            ],

            'extref_mb_track_id' => [
                'type'              => 'string',
                'usage'             => 'text/plain:36',
                'description'       => 'Musicbrainz identifier UUIDv4 of the track.',
                'example'           => 'f3b2c9a4-6d2e-4f91-bb4a-7c9e8c1d2e3f'
            ],
            

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

    public function getUnique(): array { 
        return [
            ['device_id', 'drive_id', 'path']
        ];
    }

    public function getIndexes(): array {
        return [
            ['device_id'],
            ['drive_id'],
            ['directory_id'],
            ['path']
        ];
    }

}
