<?php

namespace app\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Libs\EventListenerHelper;
use Illuminate\Http\Request;
use Symfony\Component\Console\Input\Input;

class SampleController extends Controller
{
    private $sse;

    public function index()
    {
        return view('index');
    }

    public function sendMsg(Request $request)
    {
        $request = $request->all();
        $channelName = $request["c"];
        $msg = $request["msg"];
        $this->sse = new EventListenerHelper(env('REDIS_HOST'), env('REDIS_PORT'), env('REDIS_PASSWORD'), env('REDIS_NOTI_DB'));

        $positsion=['top','right','bottom','left','fullscreen'];
        $url=["/videooverlay?c=1","/videooverlay?c=2","/videooverlay?c=3","/videooverlay?c=4"];
        $show=[true, false];
        $opacity=["0.5","0.75","1"];

        $this->sse->SendToChannel($channelName, json_encode(array(
            "channel" => $channelName
        , "datetime" => date('c'), "msg" => $msg,
        "show"=>true,
        "position"=> $positsion[rand(0,4)],
        "url"=> $url[rand(0,3)],
        "opacity"=>$opacity[rand(0,2)],
        'show'=>true
    )));
        return json_encode(array("sucess" => 1));
    }

    public function videooverlay(Request $request)
    {
        $request = $request->all();
        $data = @$request["data"];
        $c = @$request["c"];

        return view("videooverlay", compact('data','c'));
    }
}
