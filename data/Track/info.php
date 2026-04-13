<?php
/*
    This file is part of MooMuse <http://www.github.com/cedricfrancoys/moomuse>
    Some Rights Reserved
    Original author(s): Cedric FRANCOYS
    Licensed under GNU GPL 3 license <http://www.gnu.org/licenses/>
*/

[$params, $providers] = eQual::announce([
    'description'   => 'Proxy around model_read for Track reads in unauthenticated front contexts.',
    'params'        => [
        'id' => [
            'description'       => 'Unique identifier of the object to read.',
            'type'              => 'integer',
            'default'           => 0
        ],
        'ids' => [
            'description'       => 'List of unique identifiers of the objects to read.',
            'type'              => 'array',
            'default'           => []
        ],
        'fields' => [
            'description'       => 'Names of fields for which value is requested.',
            'type'              => 'array',
            'default'           => ['id', 'name']
        ],
        'lang' => [
            'description'       => 'Language in which to retrieve multilang fields.',
            'type'              => 'string',
            'default'           => constant('DEFAULT_LANG')
        ],
        'order' => [
            'description'       => 'Column to use for sorting results.',
            'type'              => 'string',
            'default'           => 'id'
        ],
        'sort' => [
            'description'       => 'Direction of the sorting.',
            'type'              => 'string',
            'default'           => 'asc'
        ]
    ],
    'constants'     => ['DEFAULT_LANG'],
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

if(empty($params['ids']) && !empty($params['id'])) {
    $params['ids'] = [$params['id']];
}

$auth->su();

$result = eQual::run('get', 'model_read', array_merge($params, [
    'entity' => 'moomuse\\Track'
]), true);

$context->httpResponse()
    ->body($result)
    ->send();
