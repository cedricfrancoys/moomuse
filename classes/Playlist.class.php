<?php
/*
    This file is part of MooMuse <http://www.github.com/cedricfrancoys/moomuse>
    Some Rights Reserved
    Original author(s): Cedric FRANCOYS
    Licensed under GNU GPL 3 license <http://www.gnu.org/licenses/>
*/
namespace moomuse;

use equal\orm\Model;

class Playlist extends Model {

    public static function getName() {
        return 'Playlist';
    }

    public static function getDescription() {
        return 'A Playlist object holds a collection of media items.';
    }

    public static function getColumns() {
        return [

            'name' => [
                'type'              => 'string',
                'description'       => 'Display name used to refer to the playlist.',
                'help'              => 'The name of the playlist.'
            ],

            'tracks_ids' => [
                'type'              => 'many2many',
                'foreign_object'    => 'moomuse\Track',
                'foreign_field'     => 'playlists_ids',
                'rel_table'         => 'moomuse_rel_track_playlist',
                'rel_foreign_key'   => 'track_id',
                'rel_local_key'     => 'playlist_id',            
                'description'       => 'Tracks included in the playlist.'
            ],

        ];
    }

    
}
