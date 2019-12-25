# sse_intergrated_with_laravel
Pull code then all code sample in side folder sse_simple

### You have to know about Laravel framework 

- Laravel 6.x https://laravel.com/docs/6.x

### You have to use Redis server
- https://redis.io/
- Redis on window https://github.com/microsoftarchive/redis/releases or use linux subsystem on window to run

# check php server side code 
\sse_simple\app\Http\Controllers\SampleController.php

# check javascript usage SharedWorker
\sse_simple\resources\views\index.blade.php

### in js value of channelName should be the same to subscriberName and should not begin with number.
you can check code and remove for your case. function name GetThenRemoveSubscriberExpired

# last check this git for more sse with old version of Laravel
For old version Laravel because I use Dotenv\Parser; to parse file .env 
https://github.com/badpaybad/php_laravel_sse

