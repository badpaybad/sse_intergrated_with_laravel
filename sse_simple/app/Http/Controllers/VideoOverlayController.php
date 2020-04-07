<?php

namespace app\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Libs\EventListenerHelper;
use App\Libs\RedisClient;
use Illuminate\Http\Request;
use stdClass;
use Symfony\Component\Console\Input\Input;

class VideoOverlayController extends Controller
{
    private $sse;
    private $redis;


    function __construct()
    {
        $this->redis  = new RedisClient(env('REDIS_HOST'), env('REDIS_PORT'),  env('REDIS_PASSWORD'), env('REDIS_NOTI_DB'));
    }
   
    function register(Request $request){
        $all = $request->all();
        $device_type=@$all["device_type"];
        $device_token=@$all["device_token"];
        $channel=@$all["channel"];
        $data=@$all["data"];
        $partner_code=@$all["partner_code"];
        
        if(empty($device_type)) $device_type="channel: Not allow empty lol";
        if(empty($device_token)) $device_token="channel: Not allow empty lol";
        if(empty($channel)) $channel="channel: Not allow empty lol";
        if(empty($data)) $data= json_decode(json_encode(["video_title"=>"title video","video_description"=>"description video","video_id"=>"id"]));
        if(empty($partner_code)) $partner_code="channel: Not allow empty lol";

        return json_encode([
            "code"=>1,
            "message"=>"success",
            "data"=>$this->defaultOvelayData($channel)
        ]);
    }

    function defaultOvelayData($channelName)
    {
        $overlayData = new stdClass;
        $overlayData->channel = $channelName;
        $overlayData->datetime = date('c');
        $overlayData->msg = '';
        $overlayData->show = true;
        $overlayData->position = 'left';
        $overlayData->url = '/uploads/public/ylinh.jpg';
        $overlayData->opacity = '0.75';
        $overlayData->method = 'IFRAME';
        $overlayData->type = 'overlay';
        $overlayData->color = '#000000';
        return $overlayData;
    }
}
