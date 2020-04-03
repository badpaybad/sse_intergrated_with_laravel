<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/
Route::get('/', "SampleController@index")->name("index");

Route::get('/channel', "ChannelController@index")->name("channel.index");
Route::post('/channel/create', "ChannelController@create")->name("channel.create");
Route::get('/channel/admin', "ChannelController@admin")->name("channel.admin");
Route::get('/channel/broadcast', "ChannelController@broadcast")->name("channel.broadcast");
Route::post('/channel/overlaycontent', "ChannelController@overlaycontent")->name("channel.overlaycontent");


Route::post('/sendMsg', "SampleController@sendMsg")->name("sendMsg");

Route::post('/videooverlay', "SampleController@videooverlay")->name("videooverlay");

Route::get('/fineuploader/index', "FineUploaderController@index")->name("fineuploader.index");
Route::post('/fineuploader/upload', "FineUploaderController@upload")->name("fineuploader.upload");
Route::delete('/fineuploader/delete', "FineUploaderController@delete")->name("fineuploader.delete");
