<?php

namespace app\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Libs\EventListenerHelper;
use Illuminate\Http\Request;
use Symfony\Component\Console\Input\Input;

class FineUploaderController extends Controller
{
    private $sse;

    public function index()
    {
        return view('fineuploader');
    }

    public function upload(Request $request)
    {        
        $qquuid = $request->file('qquuid');        
        $qqfilename = $request->file('qqfilename');        
        $qqtotalfilesize = $request->file('qqtotalfilesize');
        $file = $request->file('qqfile');

        $destinationPath = 'uploads/public/';
        
        $originalFile = $file->getClientOriginalName();

        $file->move($destinationPath, $originalFile);

        //save file info to db then get id eg: rand
        $fileid = rand();

        return json_encode(["file_path" => $destinationPath.$originalFile, "success" => true, "file_id" => $fileid]);
    }

    public function delete(Request $request)
    {
        dd($request->all());
    }
}
