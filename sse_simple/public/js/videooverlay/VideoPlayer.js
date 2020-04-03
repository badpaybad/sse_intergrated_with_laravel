VideoPlayer = function (videoId, onFullScreenCallback) {
    var _this = this;

    this._videoId = null;
    this.$video = null;
    this._videoFullScreen = false;
    this._onFullScreenCallback = null;

    _this._videoId = videoId;
    _this._onFullScreenCallback = onFullScreenCallback;

    this.init = function () {

        _this.$video = document.getElementById(videoId);

        if( _this.$video.controls)
            _this.$video.controls = false;

        _this.play();

        _this.escKeyPress(document);
        _this.escKeyPress(window);
        _this.escKeyPress(_this.$video);
    };
    this.onFullScreen = function (fullscreen) {
        alert(fullscreen == true ? "fullscreen mode" : "normal mode");
        if (_this._onFullScreenCallback) {
            _this._onFullScreenCallback(fullscreen);
        }
    };
    this.play = function () {
        if (_this.$video.paused) {
            _this.$video.play();
        }
    };
    this.pause = function () {
        if (!_this.$video.paused) {
            _this.$video.pause();
        }
    };
    this.screenFull = function () {
        if (_this._videoFullScreen == true) return;

        _this._videoFullScreen = true;
        _this.domFullscreen(_this.$video, true, {
            position: "absolute",
            top: 0,
            width: 480,
            height: 360,
            left: 0,
            zIndex: 999
        });
    };
    this.screenNormal = function () {
        if (_this._videoFullScreen == false) return;

        _this._videoFullScreen = false;
        _this.domFullscreen(_this.$video, false, {
            position: "absolute",
            top: 0,
            width: 480,
            height: 360,
            left: 0,
            zIndex: 999
        });
    };
    this.domFullscreen = function ($obj, fullscreen, cssOrigin) {
        $obj = jQuery($obj);
        if (fullscreen) {
            $obj.css({
                position: "fixed",
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                width: "100%",
                height: "100%",
                zIndex: cssOrigin.zIndex
            });

            _this.onFullScreen(true);
        } else {
            $obj.css(cssOrigin);

            _this.onFullScreen(false);
        }
    };
    this.escKeyPress = function (element) {
        $(element).keyup(function (e) {

            var isEscPress = false;
            var key = e.which || event.key || event.keyCode;

            if (key == 27 || key == 'Esc' || key == "Escape") {
                isEscPress = true;
            }
            if (isEscPress) {
                _this.screenNormal();
                _this._videoFullScreen = false;
            }
        });
    }

    this.init();
    return this;
};
