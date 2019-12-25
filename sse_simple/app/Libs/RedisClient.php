<?php
namespace App\Libs;
/**
 * Raw redis wrapper, all the commands are passed as-is
 * More information and usage examples could be found on https://github.com/ziogas/PHP-Redis-implementation
 *
 * Based on http://redis.io/topics/protocol
 */
class RedisClient
{
    //https://github.com/ziogas/PHP-Redis-implementation
    const INTEGER = ':';
    const INLINE = '+';
    const BULK = '$';
    const MULTIBULK = '*';
    const ERROR = '-';
    const NL = "\r\n";
    private $handle = false;
    private $host;
    private $port;
    private $silent_fail;
    private $commands = array();
    //Timeout for stream, 30 seconds
    private $timeout = 30;
    //Timeout for socket connection
    private $connect_timeout = 3;
    //Use this with extreme caution
    private $force_reconnect = false;
    //Error handling, debug info
    private $last_used_command = '';
    //Error handling function, use set_error_function method ()
    private $error_function = null;

    public function __construct($host = false, $port = false, $password = '', $defaultDb = 0, $silent_fail = false, $timeout = 60)
    {
        if ($host && $port) {
            $this->connect($host, $port, $silent_fail, $timeout);

            if (!is_null($password) && $password !== '') {
                $this->cmd('AUTH', $password)->set();
            }
            $this->cmd('SELECT', $defaultDb)->set();
        }
    }

    //Main method to establish connection
    public function connect($host = '127.0.0.1', $port = 6379, $silent_fail = false, $timeout = 60)
    {
        $this->host = $host;
        $this->port = $port;
        $this->silent_fail = $silent_fail;
        $this->timeout = $timeout;
        if ($silent_fail) {
            $this->handle = @fsockopen($host, $port, $errno, $errstr, $this->connect_timeout);
            if (!$this->handle) {
                $this->handle = false;
            }
        } else {
            $this->handle = fsockopen($host, $port, $errno, $errstr, $this->connect_timeout);
            if (!$this->handle) {
                die("Can not connect to redis: ". $host .":".$port);
            }
        }
        if (is_resource($this->handle)) {
            stream_set_timeout($this->handle, $this->timeout);
        }
    }
    public function reconnect()
    {
        $this->__destruct();
        $this->connect($this->host, $this->port, $this->silent_fail);
    }
    public function __destruct()
    {
        if (is_resource($this->handle)) {
            fclose($this->handle);
        }
    }
    //Returns all commands array
    public function commands()
    {
        return $this->commands;
    }
    //Used to push single command to queue
    public function cmd()
    {
        if (!$this->handle) {
            return $this;
        }
        $args = func_get_args();
        $rlen = count($args);
        $output = '*' . $rlen . self::NL;
        foreach ($args as $arg) {
            $output .= '$' . strlen($arg) . self::NL . $arg . self::NL;
        }
        $this->commands[] = $output;
        return $this;
    }
    //Used to push many commands at once, almost always for setting something
    public function set()
    {
        if (!$this->handle) {
            return false;
        }
        //Total size of commands
        $size = $this->exec();
        $response = array();
        for ($i = 0; $i < $size; $i++) {
            $response[] = $this->get_response();
        }
        if ($this->force_reconnect) {
            $this->reconnect();
        }
        return $response;
    }
    //Used to get command response
    public function get($line = false)
    {
        if (!$this->handle) {
            return false;
        }
        $return = false;
        if ($this->exec()) {
            $return = $this->get_response();
            if ($this->force_reconnect) {
                $this->reconnect();
            }
        }
        return $return;
    }
    //Used to get length of the returned array. Most useful with `Keys` command
    public function get_len()
    {
        if (!$this->handle) {
            return false;
        }
        $return = null;
        if ($this->exec()) {
            $char = fgetc($this->handle);
            if ($char == self::BULK) {
                $return = sizeof($this->bulk_response());
            } elseif ($char == self::MULTIBULK) {
                $return = sizeof($this->multibulk_response());
            }
            if ($this->force_reconnect) {
                $this->reconnect();
            }
        }
        return $return;
    }
    //Forces to reconnect after every get() or set(). Use this with extreme caution
    public function set_force_reconnect($flag)
    {
        $this->force_reconnect = $flag;
        return $this;
    }
    //Used to parse single command single response
    private function get_response()
    {
        $return = false;
        $char = fgetc($this->handle);
        switch ($char) {
            case self::INLINE:
                $return = $this->inline_response();
                break;
            case self::INTEGER:
                $return = $this->integer_response();
                break;
            case self::BULK:
                $return = $this->bulk_response();
                break;
            case self::MULTIBULK:
                $return = $this->multibulk_response();
                break;
            case self::ERROR:
                $return = $this->error_response();
                break;
        }
        return $return;
    }
    //For inline responses only
    private function inline_response()
    {
        return trim(fgets($this->handle));
    }
    //For integer responses only
    private function integer_response()
    {
        return ( int )trim(fgets($this->handle));
    }
    //For error responses only
    private function error_response()
    {
        $error = fgets($this->handle);
        if ($this->error_function) {
            call_user_func($this->error_function, $error . '(' . $this->last_used_command . ')');
        }
        return false;
    }
    //For bulk responses only
    private function bulk_response()
    {
        $return = trim(fgets($this->handle));
        if ($return === '-1') {
            $return = null;
        } else {
            $return = $this->read_bulk_response($return);
        }
        return $return;
    }
    //For multibulk responses only
    private function multibulk_response()
    {
        $size = trim(fgets($this->handle));
        $return = false;
        if ($size === '-1') {
            $return = null;
        } else {
            $return = array();
            for ($i = 0; $i < $size; $i++) {
                $return[] = $this->get_response();
            }
        }
        return $return;
    }
    //Sends command to the redis
    private function exec()
    {
        $size = sizeof($this->commands);
        if ($size < 1) {
            return null;
        }
        if ($this->error_function) {
            $this->last_used_command = str_replace(self::NL, '\\r\\n', implode(';', $this->commands));
        }
        $command = implode(self::NL, $this->commands) . self::NL;
        fwrite($this->handle, $command);
        $this->commands = array();
        return $size;
    }
    //Bulk response reader
    private function read_bulk_response($tmp)
    {
        $response = null;
        $read = 0;
        $size = ((strlen($tmp) > 1 && substr($tmp, 0, 1) === self::BULK) ? substr($tmp, 1) : $tmp);
        while ($read < $size) {
            $diff = $size - $read;
            $block_size = $diff > 8192 ? 8192 : $diff;
            $chunk = fread($this->handle, $block_size);
            if ($chunk !== false) {
                $chunkLen = strlen($chunk);
                $read += $chunkLen;
                $response .= $chunk;
            } else {
                fseek($this->handle, $read);
            }
        }
        fgets($this->handle);
        return $response;
    }
    public function set_error_function($func)
    {
        $this->error_function = $func;
    }

    /*beginregion custom function */

    public function SetCache($key, $stringValue, $expireInSeconds = null)
    {
        if (is_null($expireInSeconds)) {
            $this->cmd("SET", $key, $stringValue)->set();
        } else {
            $this->cmd("SET", $key, $stringValue)->cmd("EXPIRE", $key, $expireInSeconds)->set();
        }
    }

    public function GetCache($key)
    {
        return $this->cmd("GET", $key)->get();
    }

    public function StackPush($stackName, $value)
    {
        $this->cmd("LPUSH", $stackName, $value)->set();
    }

    public function StackPop($stackName)
    {
        return $this->cmd("LPOP", $stackName)->get();
    }

    public function Enqueue($queueName, $value)
    {
        $this->cmd("LPUSH", $queueName, $value)->set();
    }

    public function Dequeue($queueName)
    {
        return $this->cmd("RPOP", $queueName)->get();
    }

    public function HashSet($key, $field, $value,  $expireInSeconds = null)
    {
        if (is_null($expireInSeconds)) {
            $this->cmd("HSET", $key, $field, $value)->set();
        } else {
            $this->cmd("HSET", $key, $field, $value)->cmd("EXPIRE", $key, $expireInSeconds)->set();
        }
    }

    public function HashGet($key, $field)
    {
        return $this->cmd("HGET", $key, $field)->get();
    }

    /**
     *Return in dictionary by redis key
     *@return eg: $temp=HasGetAll(keyName); echo $temp["field1"];
     */
    public function HashGetAll($key)
    {
        $data = $this->cmd("HGETALL", $key)->get();
        $dataLength = count($data) - 1;

        $dic = [];

        for ($i = 0; $i < $dataLength; $i = $i + 2) {
            $dic[$data[$i]] = $data[$i + 1];
        }

        return $dic;
    }

    /**
     *Return in array of value by redis key    
     */
    public function HashGetAllValue($key)
    {
        return $this->cmd("HVALS", $key)->get();
    }

    /**
     *Return in array of field name by redis key  
     */
    public function HashGetAllKey($key)
    {
        return $this->cmd("HKEYS", $key)->get();
    }
    public function DeleteKey($key)
    {
        return $this->cmd("DEL", $key)->set();
    }
    
    public function DeleteCache($key)
    {
        return $this->cmd("DEL", $key)->set();
    }
  
    public function ListAdd($listName, $item,  $expireInSeconds = null)
    {
        if (is_null($expireInSeconds)) {
            $this->cmd("RPUSH", $listName, $item)->set();
        } else {
            $this->cmd("RPUSH", $listName, $item)->cmd("EXPIRE", $listName, $expireInSeconds)->set();
        }
    }

    public function ListRemoveExisted($listName, $item)
    {
        $this->cmd("LREM", $listName,0, $item)->set();
    }

    public function ListRange($listName,$from=0,$to=null){
        if($to==null){
            $to =$this->cmd("LLEN", $listName)->get();
        }
        return $this->cmd("LRANGE",$listName, $from, $to)->get();
    }

    public function Existed($key)
    {
        return $this->cmd("EXISTS", $key)->get();
    }

    public function Publish($channelName, $message)
    {   
        return $this->cmd("PUBLISH", $channelName, $message)->set();
    }

    /**
     * if your function $onMessage  return true will loop forever to get next messsage. Should run in other process
     * @$onMessage : function($message){ }
     * @$onSubscribed : function($type,$channel,$isSuccess)
     */
    public function Subscribe($channelName, $onMessage, $onSubscribed = null)
    {
        if (!$this->handle) {
            $this->reconnect();
        }

        $continue = false;

        $response = [null];
        $this->cmd("SUBSCRIBE", $channelName);

        if ($this->exec()) {
            do {
                try {
                    if (!$this->handle) {
                        $this->reconnect();
                    }
                    
                    $response = $this->get_response();
                    for ($i = count($response); $i < 4; ++$i) {
                        $response[] = null;
                    }
                    if ($this->force_reconnect) {
                        $this->reconnect();
                    }
                } catch (\Exception $ex) {
                    $response = [null, null, null];
                }

                if ($response[0] === "subscribe") {
                    if (!is_null($onSubscribed)) {
                        call_user_func_array($onSubscribed, $response);
                    }
                    $continue = true;
                } else if ($response[0] === "message") {
                    $msg = array($response[2]);
                    $continue = call_user_func_array($onMessage, $msg);
                }

                if ($continue === false) {
                    $this->Unsubscribe($channelName);
                }

                usleep(1);
            } while ($continue === true);
        }
    }

    public function Unsubscribe($channelName)
    {
        $this->cmd("UNSUBSCRIBE", $channelName)->set();
    }

    /*endregion custome function */
}

/*
$redis = new RedisClient('127.0.0.1',6379);

$redis->SetCache('mykey','value of key'); 
$myname= $redis->GetCache('mykey');

$redis->Enqueue('queuename1','pos1'); 
$redis->Enqueue('queuename1','pos2'); 
$redis->Enqueue('queuename1','pos3'); 
$item = $redis->Dequeue('queuename1');
  
 */
?>