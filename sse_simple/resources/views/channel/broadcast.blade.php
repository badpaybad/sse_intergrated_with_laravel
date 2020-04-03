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
        <div><label>channelName:<br><input name='channelName' value="{{$data->channelName}}"></label></div>
        <div>Youtube embeded live stream:
            <a href='/uploads/public/copy_embeded_youtube.PNG' target="_blank">Right click and copy, check image</a><br>
            <textarea style="min-width:900px" name='embeded'>{!!$data->embeded!!}</textarea>
        </div>
        <div>
            <button onclick="createChannel()">Create channel</button>
        </div>
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
        var notiChannelName = 'sse:{{$data->channelName}}'; //you channel to listener
        var typeOfWorker = typeof(SharedWorker) ? 'SharedWorker' : 'Worker';

        var subscriberName = '{{$data->channelName}}'; //should be the same to channelName and 1st character should not begin with number.
   
        const swUrl = '{{ asset("js/webpushnotification/notificationwebworker.js") }}?t=' + typeOfWorker 
        + '&c=' + encodeURIComponent(notiChannelName) + '&s=' + encodeURIComponent(subscriberName )+
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

            if(!show || show=='undefined') show=false;

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
                if(typeof(response)=='string'){
                    $created=JSON.parse(response);
                }
                window.location = '/channel/admin?c=' + encodeURI($created.channelName);
            }, "json");
        }
    </script>

</body>

</html>