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
        $this->sse->SendToChannel($channelName, json_encode(array(
            "channel" => $channelName
        , "datetime" => date('c'), "msg" => $msg,
        "show"=>true,
        "position"=>"top",
        "url"=>"/videooverlay",
        "transparent"=>"0.5"
    )));
        return json_encode(array("sucess" => 1));
    }

    public function videooverlay(Request $request)
    {
        $request = $request->all();
        $data = now();

        return view("videooverlay", compact('data'));
    }
}
