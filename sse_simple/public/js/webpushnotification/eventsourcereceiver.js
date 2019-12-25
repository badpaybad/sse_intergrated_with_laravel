PushServer = {
    __subscribers: [],
    __handlers: [],
    __currentEs:null,
    __mainChannel:[],
    init: function() {
        PushServer.__handlers = [];
        PushServer.__subscribers = [];
    },
    addHandler: function(handleNotification, mainChannel, subscriberName) {

        var channelKey = mainChannel + "_" + subscriberName;

        PushServer.__mainChannel[mainChannel]=mainChannel;

        PushServer.__subscribers[channelKey] = channelKey;

        PushServer.__handlers[channelKey] = handleNotification;

        console.log("Subscribe: " + channelKey);

        PushServer.listenChannel(channelKey, function(msg) {
            // handleNotification(msg);
            PushServer.__handlers[channelKey](msg);
        });

    },

    removeHandler: function(subscriberName) {

        PushServer.__subscribers = PushServer.__subscribers.filter(function(item, k) {
            return k !== subscriberName
        });
        PushServer.__handlers = PushServer.__subscribers.filter(function(item, k) {
            return k !== subscriberName
        });        
    },

    listenChannel: function(channel, onMessageReceived, onConnected, onOpen) {
        PushServer.__currentEs = new EventSource('/eventlistener.php?c=' + encodeURIComponent(channel)
        +'&token='+encodeURIComponent('<?php echo Auth::getSession()->getId()?>'));
        PushServer.__currentEs.onopen = function(evt) {
            if (onOpen) onOpen(evt);
        };
        PushServer.__currentEs.onconnected = function(evt) {
            if (onConnected) onConnected(evt);
            // console.log('connected');
        };
        PushServer.__currentEs.onmessage = function(evt) {

            onMessageReceived(evt.data);

            // var obj = evt.data;

            // for (var k in PushServer.__handlers) {
            //     PushServer.__handlers[k](obj);
            // }
            //console.log('onmessage');
        };
        PushServer.__currentEs.onerror = function(evt) {
            if (evt.currentTarget.readyState == 2 || PushServer.__currentEs.readyState == 2) {
                PushServer.listenChannel(channel, onMessageReceived, onConnected, onOpen);
                console.log('reconnected');
                console.log('onerror');
                console.log(evt);
            }
        };
    }
};
