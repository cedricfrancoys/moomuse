<?php
/*
    This file is part of MooMuse <http://www.github.com/cedricfrancoys/moomuse>
    Some Rights Reserved
    Original author(s): Cedric FRANCOYS
    Licensed under GNU GPL 3 license <http://www.gnu.org/licenses/>
*/

use equal\text\TextTransformer;

[$params, $providers] = eQual::announce([
    'description'   => "Analyze audio file and extract best artist/title candidates.",
    'params'        => [
        'path' => [
            'type'     => 'string',
            'required' => true
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

$cleanNoise = function ($str) {
    if (!$str) {
        return '';
    }

    return trim(
        preg_replace(
            '/\s+/',
            ' ',
            preg_replace('/\[[a-zA-Z0-9_-]{8,}\]/', '', preg_replace('/[\(\[\{].*?[\)\]\}]/', '', $str))
        )
    );
};

$tokenize = fn($str) => !$str
    ? []
    : array_values(array_filter(preg_split('/[^a-z0-9]+/', strtolower(TextTransformer::toAscii($str)))));

$extractCandidates = function ($str) {
    if(!$str || !preg_match('/(.+?)\s*-\s*(.+)/', $str, $matches)) {
        return [];
    }

    return [[
        'artist' => trim($matches[1]),
        'title'  => trim($matches[2]),
    ]];
};

$removeArtistFromTitle = function ($artist, $title) use ($tokenize) {
    if (!$artist || !$title) {
        return $title;
    }

    $artistTokens = $tokenize($artist);
    $titleTokens  = $tokenize($title);

    if (!array_intersect($artistTokens, $titleTokens)) {
        return $title;
    }

    $newTitle = preg_replace('/^' . preg_quote($artist, '/') . '\s*-\s*/i', '', $title);

    if ($newTitle === $title) {
        $newTitle = trim(preg_replace('/' . preg_quote($artist, '/') . '/i', '', $title));
    }

    $newTitle = trim(preg_replace('/^\s*-\s*/', '', $newTitle));

    return $newTitle ?: $title;
};

$scoreCandidate = function ($candidate, $sources) use ($tokenize) {
    $score = 0;

    $artistTokens = $tokenize($candidate['artist']);
    $titleTokens  = $tokenize($candidate['title']);

    foreach($sources as $key => $src) {
        if (!$src) continue;

        $weight = match ($key) {
            'title', 'artist' => 3,
            'filename'        => 2,
            'path_parts'      => 2,
            default           => 1
        };

        foreach((array) $src as $value) {
            if(!$value) {
                continue;
            }

            $tokens = $tokenize($value);
            $artistMatch = count(array_intersect($artistTokens, $tokens));
            $titleMatch  = count(array_intersect($titleTokens, $tokens));

            $score += $artistMatch * 2 * $weight;
            $score += $titleMatch * $weight;
        }
    }

    return $score;
};

$normalizeArtwork = function (array $comments) {
    if (empty($comments['picture'][0])) {
        return null;
    }

    $picture = $comments['picture'][0];

    return [
        'mime' => $picture['image_mime'] ?? null,
        'data' => isset($picture['data']) ? base64_encode($picture['data']) : null
    ];
};

$normalizeGetID3 = function (array $info) use ($normalizeArtwork) {
    $comments = $info['comments'] ?? [];
    $get = fn($key) => $comments[$key][0] ?? null;

    return [
        'common' => [
            'title'        => $get('title'),
            'artist'       => $get('artist'),
            'album'        => $get('album'),
            'year'         => $get('year') ?? $get('date'),
            'genre'        => $get('genre'),
            'track'        => $get('track_number') ?? $get('track'),
            'disc'         => $get('disc_number'),
            'composer'     => $get('composer'),
            'album_artist' => $get('band') ?? $get('album_artist'),
            'comment'      => $get('comment'),
            'lyrics'       => $get('lyrics'),
            'language'     => $get('language'),
        ],

        'technical' => [
            'duration'     => $info['playtime_seconds'] ?? null,
            'bitrate'      => $info['audio']['bitrate'] ?? null,
            'sample_rate'  => $info['audio']['sample_rate'] ?? null,
            'channels'     => $info['audio']['channels'] ?? null,
            'codec'        => $info['audio']['codec'] ?? null,
            'format'       => $info['fileformat'] ?? null,
            'lossless'     => $info['audio']['lossless'] ?? null,
        ],

        'file' => [
            'filename'     => $info['filename'] ?? null,
            'filesize'     => $info['filesize'] ?? null,
            'mime_type'    => $info['mime_type'] ?? null,
            'encoding'     => $info['encoding'] ?? null,
        ],

        'image' => $normalizeArtwork($comments),

        'extra' => [
            'raw_tags' => $info['tags'] ?? null
        ]
    ];
};

$getID3 = new getID3();
$file = realpath($params['path']);

if(!$file || !is_file($file)) {
    throw new Exception("file_not_found", EQ_ERROR_INVALID_PARAM);
}

$info = $getID3->analyze($file);
getid3_lib::CopyTagsToComments($info);

$result = $normalizeGetID3($info);

$sources = [
    'title'         => $cleanNoise($result['common']['title'] ?? ''),
    'artist'        => $cleanNoise($result['common']['artist'] ?? ''),
    'filename'      => $cleanNoise(pathinfo($file, PATHINFO_FILENAME)),
    'path_parts'    => array_values(array_map(
            $cleanNoise,
            array_reverse(
                array_filter(
                    explode(DIRECTORY_SEPARATOR, dirname($file))
                )
            )
        ))
];

$candidates = [
    ...$extractCandidates($sources['title']),
    ...$extractCandidates($sources['filename'])
];

if($sources['artist'] && $sources['title']) {
    $candidates[] = [
        'artist' => $sources['artist'],
        'title'  => $sources['title']
    ];
}

foreach($candidates as &$candidate) {
    $candidate['title'] = $removeArtistFromTitle(
        $candidate['artist'],
        $candidate['title']
    );
}
unset($candidate);

// deduplicate
$candidates = array_values(array_map(
    fn($c) => json_decode($c, true),
    array_unique(array_map('json_encode', $candidates))
));

$best = null;
$best_score = -1;

foreach($candidates as $candidate) {
    $score = $scoreCandidate($candidate, $sources);

    if($score > $best_score) {
        $best_score = $score;
        $best = $candidate;
    }
}

$result['analysis'] = [
    'sources'    => $sources,
    'candidates' => $candidates,
    'best_match' => $best,
];

$context->httpResponse()
    ->body($result)
    ->send();
