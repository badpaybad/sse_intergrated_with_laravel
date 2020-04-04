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

        <h1>{{$data->channelName}}
            <a href="/channel/broadcast?c={{$data->channelName}}" target="_blank"> Link to invite</a>
        </h1>

        <div>
            <div>
                {!!$data->embeded!!}
            </div>
            <div>
                <button onclick="_videoPlayer.screenFull()">Fullscreen</button>
                <button onclick="_videoPlayer.play()">Play</button>
                <button onclick="_videoPlayer.pause()">Pause</button>
                <button onclick="_videoPlayer.stop()">Stop</button>
            </div>
            <div>
                <button onclick="_videoOverlay.hideOverlay()">Hide overlay</button>
                <button onclick="_videoOverlay.showOverlay();">Show overlay</button>
                <button onclick="_videoOverlay.fullWidth(true);_videoPlayer.fullWidth(true)">Normal width overlay</button>
                <button onclick="_videoOverlay.fullWidth();_videoPlayer.fullWidth()">Full width overlay</button>
            </div>
        </div>


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
    <script src="https://www.youtube.com/iframe_api"></script>
    <textarea style="display: none" id='dataChannel'>
    {!!json_encode($data)!!}
    </textarea>
    <script>
        var _videoOverlay = new VideoOverlay('video');

        var dataChannel = JSON.parse(jQuery('#dataChannel').val());

        _videoOverlay.changeOverlayPosition(dataChannel.overlayData);

        _videoOverlay.loadOverlayContent(dataChannel.overlayData.url, dataChannel.overlayData, function(response) {
            return response +
                '<div><button onclick="_videoPlayer.screenNormal()">Exit fullscreen</button></div>'
        });


        var __youtubePlayer = null;

        var _videoPlayer = new VideoPlayer('video', function(fullscreen) {
            _videoOverlay.requestFullscreen(fullscreen);
        }, __youtubePlayer);

        function onYouTubeIframeAPIReady() {
            __youtubePlayer = new YT.Player('video', {
                playerVars: {
                    'autoplay': 0,
                    'controls': 0
                },
                events: {
                    'onReady': function(e) {},
                    'onStateChange': function(e) {}
                }
            });
            _videoPlayer.setYoutubePlayer(__youtubePlayer);
        }
    </script>

    <script>
        var notiChannelName = 'sse:{{$data->channelName}}'; //you channel to listener
        var typeOfWorker = typeof(SharedWorker) ? 'SharedWorker' : 'Worker';

        var subscriberName = '{{$data->channelName}}'; //should be the same to channelName and 1st character should not begin with number.

        const swUrl = '{{ asset("js/webpushnotification/notificationwebworker.js") }}?t=' + typeOfWorker +
            '&c=' + encodeURIComponent(notiChannelName) + '&s=' + encodeURIComponent(subscriberName) +
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

            if (!show || show == 'undefined') show = false;

            var url = '/channel/changeoverlaycontent';
            jQuery.post(url, {
                csrf: '{{ csrf_token() }}',
                c: '{{$data->channelName}}',
                show: show,
                opacity: opacity,
                position: position,
                url: urlOrContent,
                method: method,
            }, function(response) {

            }, "json");
        }

        function txtMessage_onKeyup(sender, e) {
            if (e.keyCode == 13) {
                // e.preventDefault();
                changeOverlayConfig();
            }
        }

        function createChannel() {
            var channelName = $("input[name ='channelName']").val();
            var embeded = $("textarea[name ='embeded']").val();
            var cfrm = confirm('Create channel?');
            if (!cfrm) return;
            var url = '/channel/create';
            jQuery.post(url, {
                csrf: '{{ csrf_token() }}',
                c: channelName,
                embeded: embeded
            }, function(response) {
                $created = response;
                if (typeof(response) == 'string') {
                    $created = JSON.parse(response);
                }
                window.location = '/channel/admin?c=' + encodeURI($created.channelName);
            }, "json");
        }
    </script>

</body>

</html>