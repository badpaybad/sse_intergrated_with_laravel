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

    public function index()
    {
        return view('index');
    }

    public function admin(Request $request)
    {
        $all = $request->all();
        $channelName = $all["c"];
        $data= $this->redis->GetCache($channelName);
        if(empty($data)){
            $data=new stdClass;
            $data->channelName="default";
            $data->embeded="<iframe id='video' width='480' height='360' src='https://www.youtube.com/embed/coZxG824aUE' frameborder='0' allow='accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture' webkitAllowFullScreen='yes' allowfullscreen='yes' mozallowfullscreen='yes' allowvr='yes'></iframe>";
     
        }
        return view('channel.admin',compact('data'));
    }

    public function create(Request $request)
    {
        $all = $request->all();
        $channelName = $all["channelName"];
        $embeded = $all["embeded"];

        if(empty($channelName)|| empty($embeded)){
            return json_encode(["channelName"=>"Not allow empty","embeded" => "Not allow empty"]);
        }

        $channelData = json_encode(["channelName" => $channelName, "embeded" => $embeded]);
        $this->redis->SetCache($channelName, $channelData);

        return $channelData;
    }

    public function broadcast(Request $request)
    {
        $all = $request->all();
        $channelName = $all["c"];
        $data= $this->redis->GetCache($channelName);
        if(empty($data)){
            $data=new stdClass;
            $data->channelName="default";
            $data->embeded="<iframe id='video' width='480' height='360' src='https://www.youtube.com/embed/coZxG824aUE' frameborder='0' allow='accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture' webkitAllowFullScreen='yes' allowfullscreen='yes' mozallowfullscreen='yes' allowvr='yes'></iframe>";
        }
        return view('channel.broadcast',compact('data'));
    }
    public function overlaycontent(Request $request){
        $overlayData= $this->redis->GetCache($channelName.":overlaydata");

        if(!empty($overlayData)){
            $overlayData= json_decode($overlayData);
        }
    }
    public function changeoverlaycontent(Request $request)
    {
        $request = $request->all();
        $channelName = $request["c"];        
        $show = $request["show"];
        $position = $request["position"];
        $url = $request["url"];
        $opacity = $request["opacity"];
        $method = $request["method"];
      

        $this->sse = new EventListenerHelper(env('REDIS_HOST'), env('REDIS_PORT'), env('REDIS_PASSWORD'), env('REDIS_NOTI_DB'));

        $this->sse->SendToChannel($channelName, json_encode(array(
            "channel" => $channelName, "datetime" => date('c'), "msg" => '',
            "show" => $show,
            "position" =>$position,
            "url" => $url,
            "opacity" => $opacity,
            'show' => $show,
            'method'=>$method
        )));
        return json_encode(array("sucess" => 1));
    }

    public function videooverlay(Request $request)
    {
        $request = $request->all();
        $data = @$request["data"];
        $c = @$request["c"];

        return view("videooverlay", compact('data', 'c'));
    }
}
