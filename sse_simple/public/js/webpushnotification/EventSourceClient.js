EventSourceClient = function (token) {
    var _this = this;
    this.__subscribers = [];
    this.__handlers = [];
    this.__currentEs = null;
    this.__mainChannel = [];
    this.__token = null;
    _this.__token = token;

    this.init = function () {
        _this.__handlers = [];
        _this.__subscribers = [];
    };

    this.addHandler = function (handleNotification, mainChannel, subscriberName) {

        var channelKey = mainChannel + "_" + subscriberName;

        _this.__mainChannel[mainChannel] = mainChannel;

        _this.__subscribers[channelKey] = channelKey;

        _this.__handlers[channelKey] = handleNotification;

        console.log("Subscribe: " + channelKey);

        _this.listenChannel(channelKey, function (msg) {
            // handleNotification(msg);
            _this.__handlers[channelKey](msg);
        });

    };

    this.removeHandler = function (subscriberName) {

        _this.__subscribers = _this.__subscribers.filter(function (item, k) {
            return k !== subscriberName
        });
        _this.__handlers = _this.__subscribers.filter(function (item, k) {
            return k !== subscriberName
        });
    };

    this.listenChannel = function (channel, onMessageReceived, onConnected, onOpen) {
        _this.__currentEs = new EventSource('/eventlistener.php?c=' + encodeURIComponent(channel)
            + '&token=' + encodeURIComponent(_this.__token));
        _this.__currentEs.onopen = function (evt) {
            if (onOpen) onOpen(evt);
        };
        _this.__currentEs.onconnected = function (evt) {
            if (onConnected) onConnected(evt);
            // console.log('connected');
        };
        _this.__currentEs.onmessage = function (evt) {

            onMessageReceived(evt.data);

            // var obj = evt.data;

            // for (var k in _this.__handlers) {
            //     _this.__handlers[k](obj);
            // }
            //console.log('onmessage');
        };
        _this.__currentEs.onerror = function (evt) {
            if (evt.currentTarget.readyState == 2 || _this.__currentEs.readyState == 2) {
                _this.listenChannel(channel, onMessageReceived, onConnected, onOpen);
                console.log('reconnected');
                console.log('onerror');
                console.log(evt);
            }
        };
    }

    this.init();
    return this;
};
