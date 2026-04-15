<?php
/*
    This file is part of the eQual framework <http://www.github.com/equalframework/equal>
    Some Rights Reserved, eQual framework, 2010-2024
    Original author(s): Cédric FRANCOYS
    Licensed under GNU GPL 3 license <http://www.gnu.org/licenses/>
*/
use core\Task;

[$params, $providers] = eQual::announce([
    'description'   => "Run a batch of scheduled task. Expected to be run with CLI `$ ./equal.run --do=cron_run`",
    'params'        => [
        'id' => [
            'type'              => 'many2one',
            'foreign_object'    => Task::class,
            'required'          => false
        ]
    ],
    'access' => [
        'visibility'   => 'public'
    ],
    'response'      => [
        'content-type'  => 'application/json',
        'charset'       => 'utf-8',
        'accept-origin' => '*'
    ],
    'providers'     => ['context', 'cron', 'access']
]);

/**
 * @var \equal\php\Context                  $context
 * @var \equal\cron\Scheduler               $cron
 */
list($context, $cron) = [$providers['context'], $providers['cron']];


// run the scheduled tasks that require it
$ids = $params['id'] ? [$params['id']] : [];
$cron->run($ids);

$context->httpResponse()
        ->status(204)
        ->send();
