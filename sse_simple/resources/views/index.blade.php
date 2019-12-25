<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name='csrf' content="{{ csrf_token() }}">
    <title>Laravel</title>

    <!-- Fonts -->
    <link href="https://fonts.googleapis.com/css?family=Nunito:200,600" rel="stylesheet">

</head>

<body>
    <div class="flex-center position-ref full-height">
        <h1>Simple SSE</h1>
        <fieldset>
            <legend>Your message(s)</legend>
            <div id="messages">
            </div>
            <div>
                <input id="txtMessage"><button id="btnMessage" onclick="sendMsg()">Send</button>
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
    <script>
        var channelName = 'test';
        var subscriberName = 'test'
        const swUrl = '{{ asset("js/webpushnotification/notificationwebworker.js") }}?c=' + channelName + '&s=' + subscriberName;

        var myWorker = new SharedWorker(swUrl);
        myWorker.port.onmessage = function(e) {
            console.log(e);
            //todo: do with your logic
            var msgs = jQuery("#messages").html();
            msgs = msgs + '<div>' +JSON.stringify( e.data) + '</div>';
            jQuery("#messages").html(msgs);
        };

        myWorker.port.start();

        function sendMsg() {
            var url = '/sendMsg';
            jQuery.post(url, {
                csrf: '{{ csrf_token() }}',
                c: channelName ,
                msg: jQuery('#txtMessage').val()
            }, function(response) {
                // no need call other ajax call to reload new data into #messages
            }, "json");
        }
    </script>

</body>

</html>