# server send event _intergrated_with_laravel
Pull code then all code sample in side folder sse_simple
- javascript to recieved data from server (function onmessage) \sse_simple\resources\views\index.blade.php 
- php how to push data to web browser \sse_simple\app\Http\Controllers\SampleController.php
- Diagram to show how it work
https://docs.google.com/drawings/d/1DvaYDm2OtOsw7py2K1JDAOB4aKPhH5lan_KnT8_L7MY/edit

### You have to know about Laravel framework 

- Laravel 6.x https://laravel.com/docs/6.x

### You have to use Redis server
- https://redis.io/
- Redis on window https://github.com/microsoftarchive/redis/releases or use linux subsystem on window to run

# check php server side code 
\sse_simple\app\Http\Controllers\SampleController.php

### folder public in laravel 
\sse_simple\public\eventlistener.php 
- as an enpoint url for js EventSource connect 
- run standalone 
- not under request life cycle of Laravel

# check javascript usage SharedWorker
\sse_simple\resources\views\index.blade.php

### in js value of channelName should be the same to subscriberName and should not begin with number.
you can check code and remove for your case. function name GetThenRemoveSubscriberExpired

### SSE 
\sse_simple\public\js\webpushnotification\eventsourcereceiver.js

### SharedWorker
\sse_simple\public\js\webpushnotification\notificationwebworker.js

# last check this git for more sse with old version of Laravel
For old version Laravel because I use Dotenv\Parser; to parse file .env 
https://github.com/badpaybad/php_laravel_sse
- there are some line code changed in EventListenerHelper.php

