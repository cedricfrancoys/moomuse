<?php
/*
    This file is part of MooMuse <http://www.github.com/cedricfrancoys/moomuse>
    Some Rights Reserved
    Original author(s): Cedric FRANCOYS
    Licensed under GNU GPL 3 license <http://www.gnu.org/licenses/>
*/

use equal\http\HttpRequest;
use moomuse\Track;

[$params, $providers] = eQual::announce([
    'description'   => "Analyze a track and persist its chromaprint.",
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
        'accept-origin' => '*'
    ],
    'providers' => ['context']
]);

['context' => $context] = $providers;

$track = Track::id($params['id'])
    ->read([
        'id',
        'chromaprint',
        'duration',
        'status',
    ])
    ->first();

if(!$track) {
    throw new Exception("unknown_track", EQ_ERROR_INVALID_PARAM);
}

if(!$track['chromaprint'] || strlen($track['chromaprint']) < 100) {
    throw new Exception("non_retrievable_chromaprint", EQ_ERROR_INVALID_PARAM);
}


/*
 Response example:

{
  "results": [
    {
      "id": "9a3121e5-7975-4094-a2ee-6f76dd1797be",
      "recordings": [
        {
          "artists": [
            {
              "id": "e88933fa-c884-4fd9-87b1-df82155dae1f",
              "name": "Fredericks Goldman Jones"
            }
          ],
          "duration": 297,
          "id": "0855a713-8e33-4b40-b435-a9c48b3f7bb0",
          "title": "C’est pas d’l’amour"
        },
        {
          "artists": [
            {
              "id": "e88933fa-c884-4fd9-87b1-df82155dae1f",
              "name": "Fredericks Goldman Jones"
            }
          ],
          "duration": 282,
          "id": "14595557-45b9-4e73-9ea8-3ddddb7668ae",
          "title": "À nos actes manqués"
        },
        {
          "artists": [
            {
              "id": "e88933fa-c884-4fd9-87b1-df82155dae1f",
              "name": "Fredericks Goldman Jones"
            }
          ],
          "duration": 297.666,
          "id": "3baa164b-8bdf-4906-9f69-26b7024f0a3c",
          "title": "C’est pas d’l’amour"
        }
      ],
      "score": 0.974255
    }
  ],
  "status": "ok"
}
*/


$apiKey = '4WI3OBxQOj';


$params = [
    'client'      => $apiKey,
    'duration'    => $track['duration'],
    'format'      => 'json',
    'meta'        => 'recordings',
    'fingerprint' => $track['chromaprint']
];

$url = 'https://api.acoustid.org/v2/lookup?' . http_build_query($params);


$http = new HttpRequest("GET $url");

$response = $http
    ->header('User-Agent', 'MooMuse/1.0 (contact: cedricfrancoys@gmail.com)')
    ->send();

$data = $response->body();
$status = $response->getStatusCode();

if($status < 200 || $status > 299) {
    trigger_error("APP::AccoustID API error: " . json_encode($data), EQ_REPORT_ERROR);
    throw new Exception("accoustid_api_error", EQ_ERROR_INVALID_PARAM);
}

if(!is_array($data) || ($data['status'] ?? null) !== 'ok') {
    throw new Exception("acoustid_invalid_response", EQ_ERROR_UNKNOWN);
}

/*
    $extref_accoust_id = $data['results'][0]['id'] ?? null;
    $extref_musicbrainz_id = $data['results'][0]['recordings'][0]['id'] ?? null;
    $artist = $data['results'][0]['recordings'][0]['artists'][0]['name'] ?? null;
    $title = $data['results'][0]['recordings'][0]['title'] ?? null;
*/
$context->httpResponse()
    ->body($data['results'] ?? [])
    ->send();
