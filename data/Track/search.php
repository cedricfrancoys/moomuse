<?php
/*
    This file is part of MooMuse <http://www.github.com/cedricfrancoys/moomuse>
    Some Rights Reserved
    Original author(s): Cedric FRANCOYS
    Licensed under GNU GPL 3 license <http://www.gnu.org/licenses/>
*/

use equal\text\TextTransformer;
use moomuse\Track;

[$params, $providers] = eQual::announce([
    'description'   => 'Track search for typeahead with backend-side ranking.',
    'params'        => [
        'limit' => [
            'type'      => 'integer',
            'default'   => 50
        ],
        'q' => [
            'type'      => 'string',
            'required'  => true
        ]
    ],
    'response' => [
        'content-type' => 'application/json'
    ],
    'access' => [
        'visibility' => 'public'
    ],
    'providers' => ['context', 'auth']
]);

$normalizeSearchText = function(?string $value): string {
    // Normalize text so matching ignores accents and casing differences.
    if(!$value) {
        return '';
    }

    return TextTransformer::normalize($value);
};

$splitQueryRaw = function(string $query): array {
    // Keep the raw user words to build backend domains with the original spacing.
    $query = trim(preg_replace('/\s+/', ' ', $query));
    if($query === '') {
        return [];
    }

    return array_values(array_filter(explode(' ', $query)));
};

$splitQuery = function(string $query) use ($normalizeSearchText): array {
    // Use normalized words for scoring to compare all fields consistently.
    $normalized_query = $normalizeSearchText($query);
    if($normalized_query === '') {
        return [];
    }

    return array_values(array_filter(explode(' ', $normalized_query)));
};

$buildPhraseEntries = function(array $parts): array {
    // Precompute contiguous phrases once to reward exact sequences cheaply.
    $phrase_entries = [];
    $seen_phrases = [];
    $full_phrase = trim(implode(' ', $parts));

    if($full_phrase !== '') {
        $phrase_entries[] = ['text' => $full_phrase, 'size' => count($parts)];
        $seen_phrases[$full_phrase] = true;
    }

    for($size = count($parts) - 1; $size >= 2; --$size) {
        for($start = 0; $start <= count($parts) - $size; ++$start) {
            $phrase = implode(' ', array_slice($parts, $start, $size));
            if(isset($seen_phrases[$phrase])) {
                continue;
            }

            $phrase_entries[] = ['text' => $phrase, 'size' => $size];
            $seen_phrases[$phrase] = true;
        }
    }

    return $phrase_entries;
};

$buildContainsCondition = function(string $field, string $value): array {
    return [$field, 'ilike', '%' . $value . '%'];
};

$buildAllWordsInFieldDomain = function(array $parts, array $fields) use ($buildContainsCondition): array {
    // Strong pass: every word must match inside one likely title field.
    $domain = [];

    foreach($fields as $field) {
        $domain[] = array_map(
            fn(string $part) => $buildContainsCondition($field, $part),
            $parts
        );
    }

    return $domain;
};

$buildPhraseDomain = function(array $phrases, array $fields) use ($buildContainsCondition): array {
    // Phrase lookups help obvious matches surface before broader searches.
    $domain = [];

    foreach($phrases as $phrase) {
        if($phrase === '') {
            continue;
        }

        foreach($fields as $field) {
            $domain[] = [$buildContainsCondition($field, $phrase)];
        }
    }

    return $domain;
};

$buildArtistHintDomain = function(array $parts, array $strict_fields, array $artist_fields) use ($buildContainsCondition): array {
    // Artist names are usually typed first or last, so we test both layouts.
    $domain = [];
    $count = count($parts);

    if($count < 2) {
        return $domain;
    }

    $max_artist_words = min(2, $count - 1);

    for($artist_word_count = 1; $artist_word_count <= $max_artist_words; ++$artist_word_count) {
        $prefix_artist = implode(' ', array_slice($parts, 0, $artist_word_count));
        $suffix_title = implode(' ', array_slice($parts, $artist_word_count));
        $prefix_title = implode(' ', array_slice($parts, 0, $count - $artist_word_count));
        $suffix_artist = implode(' ', array_slice($parts, $count - $artist_word_count));

        if($prefix_artist !== '' && $suffix_title !== '') {
            foreach($artist_fields as $artist_field) {
                foreach($strict_fields as $strict_field) {
                    $domain[] = [
                        $buildContainsCondition($artist_field, $prefix_artist),
                        $buildContainsCondition($strict_field, $suffix_title)
                    ];
                }
            }
        }

        if($prefix_title !== '' && $suffix_artist !== '') {
            foreach($strict_fields as $strict_field) {
                foreach($artist_fields as $artist_field) {
                    $domain[] = [
                        $buildContainsCondition($strict_field, $prefix_title),
                        $buildContainsCondition($artist_field, $suffix_artist)
                    ];
                }
            }
        }
    }

    return $domain;
};

$buildMissingOneWordDomain = function(array $parts, array $fields) use ($buildAllWordsInFieldDomain): array {
    // Long queries stay tolerant by allowing one missing or misspelled word.
    $domain = [];

    if(count($parts) < 4) {
        return $domain;
    }

    for($excluded_index = 0; $excluded_index < count($parts); ++$excluded_index) {
        $subset = $parts;
        unset($subset[$excluded_index]);
        $subset = array_values($subset);
        $domain = array_merge($domain, $buildAllWordsInFieldDomain($subset, $fields));
    }

    return $domain;
};

$buildLooseDomain = function(array $parts, array $fields) use ($buildContainsCondition): array {
    // Broad fallback pass used only after stronger hypotheses.
    $domain = [];

    foreach($parts as $part) {
        foreach($fields as $field) {
            $domain[] = [$buildContainsCondition($field, $part)];
        }
    }

    return $domain;
};

$buildSearchStages = function(
    array $raw_parts,
    array $strict_fields,
    array $artist_fields,
    array $all_fields,
    int $limit
) use (
    $buildPhraseEntries,
    $buildPhraseDomain,
    $buildAllWordsInFieldDomain,
    $buildArtistHintDomain,
    $buildMissingOneWordDomain,
    $buildLooseDomain
): array {
    // Search stages go from precise to permissive to limit useless database work.
    $raw_phrase_entries = $buildPhraseEntries($raw_parts);
    $full_raw_phrase = $raw_phrase_entries[0]['text'] ?? '';
    $strong_phrases = array_column(array_slice($raw_phrase_entries, 0, 6), 'text');
    $loose_parts = $raw_parts;

    usort($loose_parts, fn(string $left, string $right): int => strlen($right) <=> strlen($left));
    $loose_parts = array_slice($loose_parts, 0, min(3, count($loose_parts)));

    $candidate_limit_strong = max($limit, 15);
    $candidate_limit_loose = max($limit * 2, 30);

    return [
        [
            'domain' => $buildPhraseDomain([$full_raw_phrase], $strict_fields),
            'limit' => $candidate_limit_strong
        ],
        [
            'domain' => $buildAllWordsInFieldDomain($raw_parts, $strict_fields),
            'limit' => $candidate_limit_strong
        ],
        [
            'domain' => $buildArtistHintDomain($raw_parts, $strict_fields, $artist_fields),
            'limit' => $candidate_limit_strong
        ],
        [
            'domain' => $buildPhraseDomain(array_slice($strong_phrases, 1), $strict_fields),
            'limit' => $candidate_limit_strong
        ],
        [
            'domain' => $buildMissingOneWordDomain($raw_parts, $strict_fields),
            'limit' => $candidate_limit_strong
        ],
        [
            'domain' => $buildLooseDomain($loose_parts, $all_fields),
            'limit' => $candidate_limit_loose
        ],
        [
            'domain' => $buildLooseDomain($raw_parts, $all_fields),
            'limit' => $candidate_limit_loose
        ]
    ];
};

$scoreSearchMatch = function(array $track, array $parts, array $phrase_entries, array $artist_hint_entries) use ($normalizeSearchText): int {
    // Rank candidates by phrase continuity, word coverage and artist placement hints.
    if(empty($parts)) {
        return 0;
    }

    $full_query = implode(' ', $parts);
    $fields = [
        'name' => ['value' => $normalizeSearchText($track['name'] ?? ''), 'weight' => 140, 'phrase_bonus' => 220],
        'title' => ['value' => $normalizeSearchText($track['title'] ?? ''), 'weight' => 120, 'phrase_bonus' => 180],
        'artist' => ['value' => $normalizeSearchText($track['artist'] ?? ''), 'weight' => 100, 'phrase_bonus' => 160],
        'album' => ['value' => $normalizeSearchText($track['album'] ?? ''), 'weight' => 70, 'phrase_bonus' => 110]
    ];

    $score = 0;
    $matched_parts = [];
    $matched_field_count = 0;

    foreach($fields as $field_name => $field) {
        $value = $field['value'];
        if($value === '') {
            continue;
        }

        $field_matched = false;

        if($full_query !== '' && strpos($value, $full_query) !== false) {
            $score += $field['phrase_bonus'] * 3;
            $field_matched = true;
        }

        if($full_query !== '' && $value === $full_query) {
            $score += $field['phrase_bonus'] * 5;
            $field_matched = true;
        }

        if($full_query !== '' && (str_starts_with($value, $full_query) || str_ends_with($value, $full_query))) {
            $score += $field['phrase_bonus'] * 2;
            $field_matched = true;
        }

        foreach($parts as $part) {
            if(strpos($value, $part) !== false) {
                $score += $field['weight'];
                $matched_parts[$part] = true;
                $field_matched = true;
            }
        }

        foreach($phrase_entries as $phrase_entry) {
            if(strpos($value, $phrase_entry['text']) !== false) {
                $score += $field['weight'] * $phrase_entry['size'] * $phrase_entry['size'] * 8;
                $field_matched = true;
                break;
            }
        }

        if($field_name === 'artist') {
            foreach($artist_hint_entries as $artist_hint_entry) {
                if(strpos($value, $artist_hint_entry['text']) !== false) {
                    $score += 260 + ($artist_hint_entry['size'] * 80);
                    $field_matched = true;
                    break;
                }
            }
        }

        if($field_matched) {
            ++$matched_field_count;
        }
    }

    $score += count($matched_parts) * 220;
    if(count($matched_parts) === count($parts)) {
        $score += 600;
    }
    $score += $matched_field_count * 40;

    return $score;
};

$sortTracksByScore = function(array $tracks, array $parts, array $phrase_entries, array $artist_hint_entries) use ($scoreSearchMatch): array {
    // Keep one shared ordering rule for intermediate and final candidate lists.
    foreach($tracks as &$track) {
        $track['_score'] = $scoreSearchMatch($track, $parts, $phrase_entries, $artist_hint_entries);
    }
    unset($track);

    usort($tracks, function(array $left, array $right): int {
        $score_comparison = ($right['_score'] ?? 0) <=> ($left['_score'] ?? 0);
        if($score_comparison !== 0) {
            return $score_comparison;
        }

        return strcasecmp((string) ($left['title'] ?? $left['name'] ?? ''), (string) ($right['title'] ?? $right['name'] ?? ''));
    });

    return $tracks;
};

$shouldStopCollection = function(array $tracks, int $high_score_threshold): bool {
    // Stop querying once the current best match is already convincing enough.
    if(empty($tracks)) {
        return false;
    }

    return (int) ($tracks[0]['_score'] ?? 0) >= $high_score_threshold;
};

$collectTracks = function(array $domain, int $limit) {
    // Fetch only the fields needed for scoring and frontend rendering.
    if(empty($domain) || $limit <= 0) {
        return [];
    }

    return Track::search($domain, ['limit' => $limit])
        ->read(['id', 'name', 'path', 'artist', 'title', 'album'])
        ->get(true);
};

['context' => $context, 'auth' => $auth] = $providers;

$auth->su();

$parts = array_slice($splitQuery($params['q']), 0, 8);
$raw_parts = array_slice($splitQueryRaw($params['q']), 0, 8);
$limit = max(1, min((int) $params['limit'], 200));

// Configure the likely search zones used by the staged backend passes.
$strict_fields = ['name', 'title'];
$artist_fields = ['artist'];

$all_fields = ['name', 'title', 'artist', 'album'];

$artist_hint_entries = [];
$artist_hint_seen = [];

$candidate_target = max($limit * 2, 30);
$candidate_hard_cap = max($limit * 3, 60);
$high_score_threshold = 900 + max(0, count($parts) - 3) * 120;

$candidates = [];

$phrase_entries = $buildPhraseEntries($parts);

// Build the staged search plan once so the main loop stays linear and readable.
$stages = $buildSearchStages($raw_parts, $strict_fields, $artist_fields, $all_fields, $limit);

// Reuse the query edges as possible artist names during ranking.
if(count($parts) > 1) {
    $max_artist_words = min(2, count($parts) - 1);
    for($artist_word_count = 1; $artist_word_count <= $max_artist_words; ++$artist_word_count) {
        $prefix_artist = implode(' ', array_slice($parts, 0, $artist_word_count));
        $suffix_artist = implode(' ', array_slice($parts, count($parts) - $artist_word_count));

        if($prefix_artist !== '' && !isset($artist_hint_seen[$prefix_artist])) {
            $artist_hint_entries[] = ['text' => $prefix_artist, 'size' => $artist_word_count];
            $artist_hint_seen[$prefix_artist] = true;
        }

        if($suffix_artist !== '' && !isset($artist_hint_seen[$suffix_artist])) {
            $artist_hint_entries[] = ['text' => $suffix_artist, 'size' => $artist_word_count];
            $artist_hint_seen[$suffix_artist] = true;
        }
    }
}

// Collect candidates progressively and stop early when the best hit is already strong.
foreach($stages as $stage_index => $stage) {
    if(empty($stage['domain']) || count($candidates) >= $candidate_hard_cap) {
        continue;
    }

    foreach($collectTracks($stage['domain'], $stage['limit']) as $track) {
        $track_id = (int) ($track['id'] ?? 0);
        if($track_id <= 0) {
            continue;
        }

        $candidates[$track_id] = $track;
    }

    $ranked_candidates = $sortTracksByScore(array_values($candidates), $parts, $phrase_entries, $artist_hint_entries);

    if($shouldStopCollection($ranked_candidates, $high_score_threshold)) {
        break;
    }

    if($stage_index < 5 && count($candidates) >= $candidate_target) {
        break;
    }
}

// Return only the best scored tracks requested by the frontend.
$tracks = $sortTracksByScore(array_values($candidates), $parts, $phrase_entries, $artist_hint_entries);

$result = array_slice($tracks, 0, $limit);

$context->httpResponse()
    ->header('X-Total-Count', count($tracks))
    ->body($result)
    ->send();
