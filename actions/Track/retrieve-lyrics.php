<?php
/*
    This file is part of MooMuse <http://www.github.com/cedricfrancoys/moomuse>
    Some Rights Reserved
    Original author(s): Cedric FRANCOYS
    Licensed under GNU GPL 3 license <http://www.gnu.org/licenses/>
*/

use equal\http\HttpRequest;
use equal\text\TextTransformer;
use moomuse\Track;

[$params, $providers] = eQual::announce([
    'description'   => "Retrieve lyrics for a track from Genius.",
    'params'        => [
        'id' => [
            'type'              => 'many2one',
            'foreign_object'    => 'moomuse\Track',
            'required'          => true
        ]
    ],
    'access' => [
        'visibility' => 'public'
    ],
    'response' => [
        'content-type'  => 'application/json',
        'charset'       => 'utf-8',
        'accept-origin' => '*'
    ],
    'providers' => ['context']
]);

['context' => $context] = $providers;

$track = Track::id($params['id'])
    ->read([
        'id',
        'name',
        'artist',
        'title'
    ])
    ->first();

if(!$track) {
    throw new Exception("unknown_track", EQ_ERROR_INVALID_PARAM);
}

$cleaned_artist = TextTransformer::normalize($track['artist'] ?? '');
$cleaned_title = TextTransformer::normalize($track['title'] ?? '');

$query = str_replace(' ', '%20', implode(' ', [
    $cleaned_artist,
    $cleaned_title
]), $query);;

if($query === '') {
    throw new Exception("missing_track_metadata", EQ_ERROR_INVALID_PARAM);
}

$tokenResponse = (new HttpRequest('POST https://api.genius.com/oauth/token'))
    ->header('Content-Type', 'application/json')
    ->body([
        'client_id' => 'ETSntojfWEfvxZ9Ozt1eAYzXcBOrfEirC_dAOHWUTOe9M8fn80qYPtCW0FiUUJOH',
        'client_secret' => 'z97fx4RQ3d84ypBmEafrM5TqaPmgG2uzqoYUWUwrx8GU4zm-xlE5tdUB7AVym2axSdX3cd6hX9OLkfwk6tuqiw',
        'grant_type' => 'client_credentials'
    ])
    ->send();

$tokenData = $tokenResponse->body();
$token = trim((string) ($tokenData['access_token'] ?? ''));

if($tokenResponse->getStatusCode() < 200 || $tokenResponse->getStatusCode() > 299 || $token === '') {
    throw new Exception("lyrics_token_failed", EQ_ERROR_UNKNOWN);
}


$search_url = "https://api.genius.com/search?q={$query}";
$searchResponse = (new HttpRequest("GET $search_url"))
    ->header('User-Agent', 'MooMuse/1.0 (lyrics lookup)')
    ->header('Authorization', "Bearer {$token}")
    ->send();

$searchData = $searchResponse->body();

if($searchResponse->getStatusCode() < 200 || $searchResponse->getStatusCode() > 299 || !is_array($searchData)) {
    throw new Exception("lyrics_search_failed", EQ_ERROR_UNKNOWN);
}

$bestHit = $searchData['response']['hits'][0]['result'] ?? null;

if(!$bestHit || empty($bestHit['id'])) {
    throw new Exception("lyrics_not_found", EQ_ERROR_UNKNOWN);
}

if(strpos(TextTransformer::normalize($bestHit['artist_names']), $cleaned_artist) === false) {
    throw new Exception("non_matching_artist", EQ_ERROR_UNKNOWN);
}

$songResponse = (new HttpRequest("GET https://api.genius.com/songs/{$bestHit['id']}"))
    ->header('User-Agent', 'MooMuse/1.0 (lyrics lookup)')
    ->header('Authorization', "Bearer {$token}")
    ->send();

$songData = $songResponse->body();


$extractLyrics = static function(string $html): ?string {

    $start = strpos($html, 'class="LyricsHeader__Container');
    $end = strpos($html, 'class="LyricsFooter__Container');

    $html = substr($html, $start, $end - $start);

    $html = preg_replace('/class="LyricsHeader__Container[^>]*>/si', '', $html);    
    $html = preg_replace('/<button\b.*?<\/button>/si', '', $html);
    $html = preg_replace('/<div\b[^>]*class="Dropdown__Container.*?<\/div>/si', '', $html);
    $html = preg_replace('/<div\b[^>]*class="LyricsHeader__GroupContainer.*?<\/div>/si', '', $html);
    $html = preg_replace('/<div\b[^>]*class="SongBioPreview__Container.*?<\/div>/si', '', $html);

    
    $lyrics = preg_replace('/<br\s*\/?>/i', "\n", $html);
    $lyrics = preg_replace('/<\/p>/i', "\n", $lyrics);
    $lyrics = preg_replace('/<\/div>/i', "\n", $lyrics);
    $lyrics = html_entity_decode($lyrics, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    $lyrics = mb_convert_encoding($lyrics, 'UTF-8', 'UTF-8');
    $lyrics = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $lyrics);
    $lyrics = strip_tags($lyrics);
    $lyrics = str_replace([
        '[Chorus]','[Refrain]',
        '[Post-Chorus]',
        '[Verse 1]', '[Couplet 1]', 
        '[Verse 2]', '[Couplet 2]', 
        '[Verse 3]', '[Couplet 3]', 
        '[Verse 4]', '[Couplet 4]', 
        '[Verse 5]', '[Couplet 5]', 
        '[Pre-Chorus]',
        '[Outro]'
        ], '', $lyrics);
    $lyrics = preg_replace("/\r\n|\r/", "\n", $lyrics);
    $lyrics = preg_replace("/\n{3,}/", "\n\n", $lyrics);
    $lyrics = preg_replace('/[ \t]+/', ' ', $lyrics);
    $lyrics = preg_replace('/ *\n */', "\n", $lyrics);
    $lyrics = trim((string) $lyrics);

    return ($lyrics !== '') ? $lyrics : null;
};

$url = $songData['response']['song']['url'] ?? '';

$lyricsResponse = (new HttpRequest("GET $url"))
    ->send();

$html = (string) $lyricsResponse->getBody(true);
$lyrics = $extractLyrics($html);

$context->httpResponse()
    ->body([
        'lyrics' => $lyrics,
        'search_url' => $search_url,
        'match' => [
            'id' => $bestHit['id'],
            'title' => $bestHit['title'] ?? null,
            'artist' => $bestHit['primary_artist']['name'] ?? ($bestHit['artist_names'] ?? null),
            'url' => $bestHit['url'] ?? null
        ]
    ])
    ->send();
