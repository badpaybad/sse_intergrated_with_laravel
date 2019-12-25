<?php

define('__ROOT__', dirname(dirname(__FILE__)));
require_once __ROOT__ . '/vendor/autoload.php';

use App\Libs\EventListenerHelper;

$myEnvs=EventListenerHelper::load_env(__ROOT__.'/.env');

//$dotenv = new \Dotenv\Dotenv(__ROOT__);
//$dotenv->getEnvironmentVariableNames();
//$dotenv->load();

define('__REDISHOST__', EventListenerHelper::get_env('REDIS_HOST'));
define('__REDISPORT__', EventListenerHelper::get_env('REDIS_PORT'));
define('__REDISPWD__', EventListenerHelper::get_env('REDIS_PASSWORD'));
define('__REDISDB__', EventListenerHelper::get_env('REDIS_NOTI_DB'));

//var_dump(__REDISHOST__, __REDISPORT__, __REDISPWD__, __REDISDB__);return;

$sse = new EventListenerHelper(__REDISHOST__, __REDISPORT__, __REDISPWD__, __REDISDB__);

$sse->LoopSendStream();
