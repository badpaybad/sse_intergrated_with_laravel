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
        <h1>{{$data->channelName}}</h1>
        <div>
            <div>
                {!!$data->embeded!!}
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
        <fieldset>
            <legend>Overlay config</legend>
            <div>
                <label><input type="checkbox" checked name="show"> show/hide </label>
            </div>
            <div>
                <label> <input type="text" value="0.75" style="width:30px" name="opacity"> opacity</label>
            </div>
            <div>
                <label><input type="radio" value="top" name="position"> top</label>
                <label><input type="radio" value="right" name="position" checked> right</label>
                <label><input type="radio" value="bottom" name="position"> bottom</label>
                <label><input type="radio" value="left" name="position"> left</label>
                <label><input type="radio" value="fullscreen" name="position"> fullscreen</label>
            </div>
            <div>
                <label>Url or Content inside: 
                    <textarea style="min-width:900px" name="urlOrContent">/uploads/public/ylinh.jpg</textarea> </label>
            </div>
            <div>
                UrlType:
            </div>
            <div>
                <label> <input type="radio" value="POST" name="method"> POST</label>
                <label> <input type="radio" value="GET" name="method"> GET</label>
                <label> <input type="radio" value="IMG" name="method" checked> IMG</label>
                <label> <input type="radio" value="HTML" name="method"> HTML</label>
            </div>
            <div>
                <button onclick="changeOverlayConfig()">Change</button>
            </div>
        </fieldset>

    </div>
    <script src="https://code.jquery.com/jquery-3.4.1.min.js"></script>
    <script>
        jQuery.ajaxSetup({
            headers: {
                'X-CSRF-TOKEN': '{{ csrf_token() }}'
            }
        });
    </script>
    <script src="/js/videooverlay/VideoOverlay.js"></script>
    <script src="/js/videooverlay/VideoPlayer.js"></script>
    <script src="/js/webpushnotification/WebWorkerWrapper.js"></script>
    <script>
        var _videoOverlay = new VideoOverlay('video');

        var urlOverlayConent = '/channel/overlaycontent?c={{$data->channelName}}'

        // _videoOverlay.loadOverlayContent('/videooverlay', null, function(response) {
        //     return response +
        //         '<div><button onclick="_videoPlayer.screenNormal()">Exit fullscreen</button></div>'
        // }); //load content inside overlay in page load

        var _videoPlayer = new VideoPlayer('video', function(fullscreen) {
            _videoOverlay.requestFullscreen(fullscreen);
        });
    </script>

    <script>
        var channelName = '{{$data->channelName}}'; //you channel to listener
        var typeOfWorker = typeof(SharedWorker) ? 'SharedWorker' : 'Worker';

        var subscriberName = '{{$data->channelName}}'; //should be the same to channelName and 1st character should not begin with number.
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

            console.log(e.data);
            
            _videoOverlay.loadOverlayContent(e.data.url, e.data, function(response) {
                return response +
                    '<div><button onclick="_videoPlayer.screenNormal()">Exit fullscreen</button></div>'
            });
        };

        myWorker.start();

        function changeOverlayConfig() {
            var show = $("input:checkbox[name ='show']").val();
            var opacity = $("input[name ='opacity']").val();
            var position = $("input:radio[name ='position']:checked").val();
            var urlOrContent = $("textarea[name ='urlOrContent']").val();
            var method = $("input:radio[name ='method']:checked").val();
            
            var url = '/channel/changeoverlaycontent';
            jQuery.post(url, {
                csrf: '{{ csrf_token() }}',
                c: channelName,
                show: show,
                opacity: opacity,
                position: position,
                url: urlOrContent,
                method: method,
            }, function(response) {
                // no need call other ajax call to reload new data into #messages
            }, "json");
        }

        function txtMessage_onKeyup(sender, e) {
            if (e.keyCode == 13) {
                // e.preventDefault();
                changeOverlayConfig();
            }
        }
    </script>

</body>

</html>