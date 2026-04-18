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
        'extref_musicbrainz_id',
        'status'
    ])
    ->first();

if(!$track) {
    throw new Exception("unknown_track", EQ_ERROR_INVALID_PARAM);
}

if(!$track['extref_musicbrainz_id']) {
    throw new Exception("non_retrievable_musicbrainz_id", EQ_ERROR_INVALID_PARAM);
}


    


/*

https://musicbrainz.org/ws/2/recording/0855a713-8e33-4b40-b435-a9c48b3f7bb0?inc=artist-credits+releases&fmt=json

 Response example:

{
  "id": "0855a713-8e33-4b40-b435-a9c48b3f7bb0",
  "title": "C’est pas d’l’amour",
  "artist-credit": [
    {
      "artist": {
        "type": "Group",
        "id": "e88933fa-c884-4fd9-87b1-df82155dae1f",
        "type-id": "e431f5f6-b5d2-343d-8b36-72607fffb74b",
        "sort-name": "Fredericks Goldman Jones",
        "country": "FR",
        "disambiguation": "",
        "name": "Fredericks Goldman Jones"
      },
      "name": "Fredericks Goldman Jones",
      "joinphrase": ""
    }
  ],
  "length": 297666,
  "releases": [
    {
      "packaging-id": "119eba76-b343-3e02-a292-f0f00644bb9b",
      "quality": "normal",
      "date": "2012-11-16",
      "text-representation": {
        "script": "Latn",
        "language": "fra"
      },
      "artist-credit": [
        {
          "joinphrase": "",
          "name": "Jean‐Jacques Goldman",
          "artist": {
            "id": "0b3819e6-3fa1-4a50-a84c-f2a62643185d",
            "type-id": "b6e035f4-3ce9-331c-97df-83397230b0df",
            "sort-name": "Goldman, Jean‐Jacques",
            "name": "Jean‐Jacques Goldman",
            "country": "FR",
            "disambiguation": "",
            "type": "Person"
          }
        }
      ],
      "id": "bd8cdd29-48f9-4b4c-a0e4-15857a55d74f",
      "packaging": "None",
      "disambiguation": "",
      "release-events": [
        {
          "area": {
            "disambiguation": "",
            "name": "[Worldwide]",
            "sort-name": "[Worldwide]",
            "iso-3166-1-codes": [
              "XW"
            ],
            "type-id": null,
            "id": "525d4e18-3d00-31b9-a58b-a146a916de8f",
            "type": null
          },
          "date": "2012-11-16"
        }
      ],
      "status-id": "4e304316-386d-3409-af2e-78857eec5cfe",
      "barcode": "886443782426",
      "country": "XW",
      "title": "La Collection : 1990 / 2001",
      "status": "Official"
    },
    {
      "status": "Official",
      "title": "La Collection : 1990 / 2001",
      "country": "FR",
      "barcode": "887254778721",
      "status-id": "4e304316-386d-3409-af2e-78857eec5cfe",
      "release-events": [
        {
          "date": "2012",
          "area": {
            "type-id": null,
            "id": "08310658-51eb-3801-80de-5a0739207115",
            "name": "France",
            "disambiguation": "",
            "sort-name": "France",
            "iso-3166-1-codes": [
              "FR"
            ],
            "type": null
          }
        }
      ],
      "disambiguation": "",
      "packaging": "Box",
      "id": "939a350a-5743-466a-94fb-f523dfcfd1a5",
      "artist-credit": [
        {
          "joinphrase": "",
          "artist": {
            "id": "0b3819e6-3fa1-4a50-a84c-f2a62643185d",
            "type-id": "b6e035f4-3ce9-331c-97df-83397230b0df",
            "sort-name": "Goldman, Jean‐Jacques",
            "country": "FR",
            "disambiguation": "",
            "name": "Jean‐Jacques Goldman",
            "type": "Person"
          },
          "name": "Jean‐Jacques Goldman"
        }
      ],
      "text-representation": {
        "script": "Latn",
        "language": "fra"
      },
      "date": "2012",
      "quality": "normal",
      "packaging-id": "c1668fc7-8944-4a00-bc3e-46e8d861d211"
    }
  ],
  "video": false,
  "disambiguation": "",
  "first-release-date": "2012-11-16"
}*/



$url = "https://musicbrainz.org/ws/2/recording/{$track['extref_musicbrainz_id']}?inc=artist-credits+releases&fmt=json";


$http = new HttpRequest("GET $url");

$response = $http
    ->header('User-Agent', 'MooMuse/1.0 (contact: cedricfrancoys@gmail.com)')
    ->send();

$data = $response->body();
$status = $response->getStatusCode();

if($status < 200 || $status > 299) {
    trigger_error("APP::MusicBrainz API error: " . json_encode($data), EQ_REPORT_ERROR);
    throw new Exception("musicbrainz_api_error", EQ_ERROR_INVALID_PARAM);
}


if(!is_array($data)) {
    throw new Exception("musicbrainz_invalid_response", EQ_ERROR_UNKNOWN);
}

$context->httpResponse()
    ->body($data)
    ->send();
