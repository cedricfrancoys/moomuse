<?php
/*
    This file is part of MooMuse <http://www.github.com/cedricfrancoys/moomuse>
    Some Rights Reserved
    Original author(s): Cedric FRANCOYS
    Licensed under GNU GPL 3 license <http://www.gnu.org/licenses/>
*/

use equal\orm\Domain;
use equal\orm\DomainCondition;
use moomuse\Track;

[$params, $providers] = eQual::announce([
    'description'   => 'Proxy around model_collect for Track collections in unauthenticated front contexts.',
    'params'        => [
        'entity' =>  [
            'description'   => 'Full name of the entity to collect.',
            'type'          => 'string',
            'usage'         => 'orm/entity',
            'default'       => 'moomuse\\Track'
        ],
        'fields' =>  [
            'description'   => 'Requested fields.',
            'type'          => 'array',
            'default'       => ['id', 'name']
        ],
        'lang' =>  [
            'description'   => 'Language in which multilang fields have to be returned.',
            'type'          => 'string',
            'default'       => constant('DEFAULT_LANG')
        ],
        'domain' => [
            'description'   => 'Criterias that results have to match.',
            'type'          => 'array',
            'default'       => []
        ],
        'order' => [
            'description'   => 'Column(s) to use for sorting results.',
            'type'          => 'string',
            'default'       => 'id'
        ],
        'sort' => [
            'description'   => 'The direction (asc or desc).',
            'type'          => 'string',
            'default'       => 'asc'
        ],
        'start' => [
            'description'   => 'The row from which results have to start.',
            'type'          => 'integer',
            'default'       => 0
        ],
        'limit' => [
            'description'   => 'The maximum number of results.',
            'type'          => 'integer',
            'min'           => 1,
            'max'           => 2500,
            'default'       => 25
        ],
        'nolimit' => [
            'description'   => 'Explicit request for ignoring limit and return all matching objects.',
            'type'          => 'boolean',
            'default'       => false
        ]
    ],
    'constants'     => ['DEFAULT_LANG', 'EQ_ROOT_USER_ID'],
    'response'      => [
        'content-type'  => 'application/json',
        'charset'       => 'utf-8',
        'accept-origin' => '*'
    ],
    'access' => [
        'visibility'        => 'public'
    ],
    'providers'     => ['context', 'auth']
]);

['context' => $context, 'auth' => $auth] = $providers;

$auth->su();

$result = eQual::run('get', 'model_collect', $params, true);

$context->httpResponse()
    ->body($result)
    ->send();
