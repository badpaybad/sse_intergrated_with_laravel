<?php

namespace App\Libs;

use App\Libs\RedisClient;
use Carbon\Carbon;
use Dotenv\Parser;

use Kreait\Firebase\Factory;
use Kreait\Firebase\ServiceAccount;

class EventListenerHelperFireBase
{

    static $_my_env;
    static function looksLikeSetter($line)
    {
        return strpos($line, '=') !== false;
    }

    static function isComment($line)
    {
        $line = ltrim($line);

        return isset($line[0]) && $line[0] === '#';
    }

    public static function get_env($name, $defaultValue = null)
    {
        if (array_key_exists($name, self::$_my_env))
            return self::$_my_env[$name];

        return $defaultValue;
    }
    public static function load_env($filePath)
    {
        $autodetect = ini_get('auto_detect_line_endings');
        ini_set('auto_detect_line_endings', '1');
        $lines = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        ini_set('auto_detect_line_endings', $autodetect);

        foreach ($lines as $name) {
            if (!self::isComment($name) && self::looksLikeSetter($name)) {

                list($name, $value) = Parser::parse($name);

                self::$_my_env[$name] = $value;
            }
        }

        return self::$_my_env;
    }

    private $database;
    private $firebase;
    private $current_ref;

    public function __construct($google_service_account_json = "")
    {
        //how to get file google-service-account.json https://firebase-php.readthedocs.io/en/stable/setup.html
        if ($google_service_account_json == "") $google_service_account_json = __ROOT__ . '/google-service-account.json';
        $serviceAccount = ServiceAccount::fromJsonFile($google_service_account_json);

        $this->firebase = (new Factory)
            ->withServiceAccount($serviceAccount)
            ->create();

        $this->database = $this->firebase->getDatabase();
    }
    public function SendToChannel($channel, $dataInStringJson)
    {
        if (!isset($this->current_ref) || empty($this->current_ref)) {
            $this->current_ref = $this->database->getReference($channel);
        }

        $this->current_ref->push([
            'title' => $channel,
            'body' => $dataInStringJson
        ]);
        return true;
    }

    public function LoopSendStream($channel = null)
    {
        $maxSleep = 30;
        $maxCounter = 25;

        // set_time_limit(100);
        set_time_limit(0);
        //https://www.php.net/manual/en/function.ignore-user-abort.php

        @ini_set('output_buffering', 'off');
        @ini_set('zlib.output_compression', 0);

        while (@ob_end_flush());

        @ini_set('implicit_flush', 1);
        ob_implicit_flush(true);
        @ob_end_clean();

        ignore_user_abort(true);

        session_start();
        $_SESSION['latestRequestTime'] = time();
        session_write_close();

        header('Content-Type: text/event-stream;charset=UTF-8');
        header('Cache-Control: no-cache'); // recommended to prevent caching of event data.
        header('X-Accel-Buffering: no'); //Nginx: unbuffered responses suitable for Comet and HTTP streaming applications
        //header("Access-Control-Allow-Origin: *");

        if ($channel == null || empty($channel)) {
            $channel = @$_GET['c'];
        }

        if (empty($channel)) {
            echo "data: {\"nochannel\":\"" . "true" . "\"}\n\n";
            //ob_flush();
            flush();
            exit();
            return;
        }

        $channel = urldecode($channel);

        $lastEventId = floatval(isset($_SERVER["HTTP_LAST_EVENT_ID"]) ? $_SERVER["HTTP_LAST_EVENT_ID"] : 0);
        if ($lastEventId == 0) {
            $lastEventId = floatval(isset($_GET["lastEventId"]) ? $_GET["lastEventId"] : 0);
        }

        echo ":" . str_repeat(" ", 2048) . "\n"; // 2 kB padding for IE
        echo "retry: 20000\n";

        while (true) {
            try {

                if (connection_aborted()) {
                    exit();
                    return;
                }

                $this->current_ref = $this->database->getReference($channel);

                $msg = $this->current_ref->getValue();

                if (!empty($msg) && $msg != "") {

                    echo "data: " . $msg . "\n\n";
                } else {
                    echo ": heartbeat\n\n";
                }

                flush();
                $redis = null;
                $msg = null;
                unset($redis);
                unset($msg);
            } catch (\Exception $ex) {
                echo "data: ERROR:" . $ex . "\n\n";
                flush();
            }

            sleep(1);
        }
    }
}

/* 
//java script
  PushServer = {
            listenChannel: function(channel, onMessageReceived, onConnected, onOpen) {
                var source = new EventSource('/eventlistener.php?c=' + encodeURIComponent(channel));
                source.onopen = function(evt) {
                    if (onOpen) onOpen(evt);
                };
                source.onconnected = function(evt) {
                    if (onConnected) onConnected(evt);
                    console.log('connected');
                };
                source.onmessage = function(evt) {
                    onMessageReceived(evt.data);
                    console.log('onmessage');
                    console.log(evt);
                };
                source.onerror = function(evt) {
                    if (evt.currentTarget.readyState == 2 || source.readyState == 2) {
                        PushServer.listenChannel(channel, onMessageReceived, onConnected, onOpen);
                        console.log('reconnected');
                        console.log('onerror');
                        console.log(evt);
                    }
                };
            }
        };

        //blade
          var channelKey = "<?php echo(App\Libs\EventListenerHelper::BuildUserSessionChannel( Auth::user()->tenant_id, Auth::user()->id, Carbon::now()->timestamp)) ?>";

            PushServer.listenChannel(channelKey, function(msg) {

                toastr.success(msg);
            });
 */
