<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=0, minimal-ui">
    <meta name='csrf' content="{{ csrf_token() }}">
    <title>Laravel</title>
    <style>
        :-webkit-full-screen body,
        :-moz-full-screen body,
        :-ms-fullscreen body {
            /* properties */
            width: 100vw;
            height: 100vh;
        }

        :full-screen body {
            /*pre-spec */
            /* properties */
            width: 100vw;
            height: 100vh;
        }

        :fullscreen body {
            /* spec */
            /* properties */
            width: 100vw;
            height: 100vh;
        }

        /* deeper elements */

        :-webkit-full-screen body {
            width: 100vw;
            height: 100vh;
        }

        /* styling the backdrop*/

        ::backdrop,
        ::-ms-backdrop {
            /* Custom styles */
        }

        button {
            margin: 5px;
        }
    </style>
</head>

<body>
    <div class="flex-center position-ref full-height">
        <h1>Simple SSE</h1>
        <div>
            <div>
                <!-- <video id="video1">
                    <source src="https://file-examples.com/wp-content/uploads/2017/04/file_example_MP4_480_1_5MG.mp4" type="video/mp4">
                    <audio src="https://file-examples.com/wp-content/uploads/2017/04/file_example_MP4_480_1_5MG.mp4"></audio>
                </video> -->
                <iframe id="video" width="480" height="360" src="https://www.youtube.com/embed/coZxG824aUE" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" webkitAllowFullScreen="yes" allowfullscreen="yes" mozallowfullscreen="yes" allowvr="yes"></iframe>

            </div>
            <div>
                <button onclick="_videoPlayer.screenFull()">Fullscreen</button>
                <button onclick="_videoPlayer.play()">Play</button>
                <button onclick="_videoPlayer.pause()">Pause</button>
            </div>
            <div>
                <button onclick="_videoOverlay.hideOverlay()">Hide overlay</button>
                <button onclick="_videoOverlay.showOverlay();">Show overlay</button>
            </div>
        </div>
        <div>
            <fieldset>
                <legend>Your message(s)</legend>
                <div id="messages"></div>
                <div>
                    <i>Send message to load content over video</i><br>
                    <input id="txtMessage" onkeyup="txtMessage_onKeyup(this,event)"><button id="btnMessage" onclick="txtMessage_sendMsg('txtMessage')">Send</button>
                </div>
            </fieldset>
        </div>
        <div style="clear:both;"></div>
    </div>
    <script src="https://code.jquery.com/jquery-3.4.1.min.js"></script>

    <script src="/js/videooverlay/VideoOverlay.js"></script>
    <script src="/js/videooverlay/VideoPlayer.js"></script>
    <script src="/js/webpushnotification/WebWorkerWrapper.js"></script>
    <script>
        var _videoOverlay = new VideoOverlay('video');

        _videoOverlay.loadOverlayContent('/videooverlay', null, function(response) {
            return response +
                '<div><button onclick="_videoPlayer.screenNormal()">Exit fullscreen</button></div>'
        }); //load content inside overlay in page load

        var _videoPlayer = new VideoPlayer('video', function(fullscreen) {
            _videoOverlay.requestFullscreen(fullscreen);
        });
    </script>
    <script>
        jQuery.ajaxSetup({
            headers: {
                'X-CSRF-TOKEN': '{{ csrf_token() }}'
            }
        });
    </script>
    <script>
        var channelName = 'test'; //you channel to listener
        var typeOfWorker = typeof(SharedWorker) ? 'SharedWorker' : 'Worker';

        var subscriberName = 'test'; //should be the same to channelName and 1st character should not begin with number.
        const swUrl = '{{ asset("js/webpushnotification/notificationwebworker.js") }}?t=' + typeOfWorker + '&c=' + channelName + '&s=' + subscriberName +
            '&token=' + encodeURIComponent('<?php echo \Auth::getSession()->getId() ?>');

        var myWorker = new WebWorkerWrapper(swUrl, typeOfWorker);

        myWorker.onmessage = function(e) {
            console.log(e);
            //todo: do with your logic
            var msgs = jQuery("#messages").html();
            msgs = msgs + '<div>' + JSON.stringify(e.data) + '</div>';
            jQuery("#messages").html(msgs + '<div>');

            _videoOverlay.changeOverlayPosition(e.data);

            _videoOverlay.loadOverlayContent(e.data.url, e.data, function(response) {
                return response +
                    '<div><button onclick="_videoPlayer.screenNormal()">Exit fullscreen</button></div>'
            });
        };

        myWorker.start();

        function txtMessage_sendMsg(txtMessage) {
            //call to server side to post msg to other
            var url = '/sendMsg';
            jQuery.post(url, {
                csrf: '{{ csrf_token() }}',
                c: channelName,
                msg: jQuery('#' + txtMessage).val()
            }, function(response) {
                // no need call other ajax call to reload new data into #messages
            }, "json");
        }

        function txtMessage_onKeyup(sender, e) {
            if (e.keyCode == 13) {
                // e.preventDefault();
                txtMessage_sendMsg(sender.id);
            }
        }
    </script>

</body>

</html>