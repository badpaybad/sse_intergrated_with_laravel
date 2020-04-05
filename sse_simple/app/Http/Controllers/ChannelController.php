<?php

namespace app\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Libs\EventListenerHelper;
use App\Libs\RedisClient;
use Illuminate\Http\Request;
use stdClass;
use Symfony\Component\Console\Input\Input;

class ChannelController extends Controller
{
    private $sse;
    private $redis;


    function __construct()
    {
        $this->sse = new EventListenerHelper(env('REDIS_HOST'), env('REDIS_PORT'), env('REDIS_PASSWORD'), env('REDIS_NOTI_DB'));
        $this->redis  = new RedisClient(env('REDIS_HOST'), env('REDIS_PORT'),  env('REDIS_PASSWORD'), env('REDIS_NOTI_DB'));
    }
    function getChannelName($channelName)
    {
        if (empty($channelName)) return 'Ý Linh idol';
        return $channelName;
    }
    function defaultChannelData($channelName)
    {
        $data = new stdClass;
        $data->channelName = $channelName;
        $embededId = "";
        $data->embeded = $this->addYoutubeJsIfNeed("<iframe id='video' width='320' height='240' src='https://www.youtube.com/embed/coZxG824aUE' frameborder='0' allow='accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture' webkitAllowFullScreen='yes' allowfullscreen='yes' mozallowfullscreen='yes' allowvr='yes'></iframe>", $embededId);
        $data->embededId=$embededId;
        $data->overlayData = $this->defaultOvelayData($channelName);
        return $data;
    }
    function addYoutubeJsIfNeed($embeded, &$embededId)
    {
        preg_match('/(?i)\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:\'".,<>?«»“”‘’]))/', $embeded, $output_array);
        if (empty($output_array) || count($output_array) == 0) return $embeded;
        $url = $output_array[0];
        $arrSegment = explode('/', $url);
        $embededId = $arrSegment[count($arrSegment) - 1];
        $idx = strpos($url, "?");
        if (strpos($embeded, 'enablejsapi') <= 0) {
            $urlNew = $url;
            if ($idx == false || $idx == 0) {
                $urlNew = $url . '?enablejsapi=1&controls=0&loop=1&start=1&rel=0&playlist='.$embededId;
            } else {
                $urlNew = $url . '&enablejsapi=1&controls=0&loop=1&start=1&rel=0&playlist='.$embededId;
            }
            $embeded = str_replace($url, $urlNew, $embeded);
        }
        $embeded = str_replace('"', "'", $embeded);
        if(strpos($embeded,"id='video'")<=0){
            $embeded = str_replace('<iframe', "<iframe id='video' ", $embeded);
        }
        //
        return $embeded;
    }
    function defaultOvelayData($channelName)
    {
        $overlayData = new stdClass;
        $overlayData->channel = $channelName;
        $overlayData->datetime = date('c');
        $overlayData->msg = '';
        $overlayData->show = 'on';
        $overlayData->position = 'left';
        $overlayData->url = '/uploads/public/ylinh.jpg';
        $overlayData->opacity = '0.75';
        $overlayData->method = 'IMG';
        $overlayData->type = 'overlay';
        $overlayData->color = 'black';
        return $overlayData;
    }
    public function index()
    {
        return view('index');
    }

    public function admin(Request $request)
    {
        $all = $request->all();
        $channelName = @$all["c"];
        $channelName = $this->getChannelName($channelName);

        $overlayData =  $this->redis->GetCache($channelName . ":overlaydata");
        if (empty($overlayData)) {
            $overlayData = $this->defaultOvelayData($channelName);
        } else {
            $overlayData = json_decode($overlayData);
        }

        $data = $this->redis->GetCache($channelName);

        if (empty($data)) {
            $data = $this->defaultChannelData($channelName);
        } else {
            $data = json_decode($data);
        }

        $data->overlayData = $overlayData;

        return view('channel.admin', compact('data'));
    }

    public function broadcast(Request $request)
    {
        $all = $request->all();
        $channelName = @$all["c"];
        $channelName = $this->getChannelName($channelName);

        $overlayData =  $this->redis->GetCache($channelName . ":overlaydata");
        if (empty($overlayData)) {
            $overlayData = $this->defaultOvelayData($channelName);
        } else {
            $overlayData = json_decode($overlayData);
        }

        $data = $this->redis->GetCache($channelName);
        if (empty($data)) {
            $data = $this->defaultChannelData($channelName);
        } else {
            $data = json_decode($data);
        }

        $data->overlayData = $overlayData;

        return view('channel.broadcast', compact('data'));
    }

    public function create(Request $request)
    {
        $all = $request->all();
        $channelName = $all["c"];
        $channelName = $this->getChannelName($channelName);

        $embeded = $all["embeded"];

        if (empty($channelName) || empty($embeded)) {
            return json_encode(["channelName" => "Not allow empty", "embeded" => "Not allow empty"]);
        }

        // $existed = $this->redis->GetCache($channelName);
        // if (!empty($existed)) {
        //     return $existed;
        // }
        $embededId="";
        $embeded = $this->addYoutubeJsIfNeed($embeded,$embededId);

        $channelData = json_encode(["channelName" => $channelName, "embeded" => $embeded,
        "embededId" => $embededId,
        'broadcastUrl' => 'channel/broadcast?c=' . $channelName]);
        $this->redis->SetCache($channelName, $channelData);

        return $channelData;
    }

    public function changeoverlaycontent(Request $request)
    {
        $request = $request->all();
        $channelName = @$request["c"];
        $channelName = $this->getChannelName($channelName);

        $show = $request["show"];
        $position = $request["position"];
        $url = $request["url"];
        $opacity = $request["opacity"];
        $method = $request["method"];
        $color = $request["color"];

        $overlayData = json_encode(array(
            "channel" => $channelName,
            "datetime" => date('c'),
            "msg" => '',
            "show" => $show,
            "position" => $position,
            "url" => $url,
            "opacity" => $opacity,
            'show' => $show,
            'method' => $method,
            'type' => 'overlay',
            'color'=>$color
        ));

        $this->redis->SetCache($channelName . ":overlaydata", $overlayData);

        $this->sse = new EventListenerHelper(env('REDIS_HOST'), env('REDIS_PORT'), env('REDIS_PASSWORD'), env('REDIS_NOTI_DB'));
        $this->sse->SendToChannel("sse:" . $channelName, $overlayData);

        return json_encode(array("sucess" => 1));
    }
}
