
VideoPlayer = function (videoId, onFullScreenCallback, youtubePlayer) {
    var _this = this;
    this._youtube = youtubePlayer;
    this._videoId = null;
    this.$video = null;
    this._videoFullScreen = false;
    this._onFullScreenCallback = null;
    this._css=null;
    _this._videoId = videoId;
    _this._onFullScreenCallback = onFullScreenCallback;

    this.setYoutubePlayer = function (player) {
        _this._youtube = player;
        //_this.youtubeLog();
    }
    this.youtubeLog=function(){
        setTimeout(function(){
            console.log(_this._youtube.getCurrentTime());
            _this.youtubeLog();
        },1000);
    }

    this.init = function () {

        _this.$video = document.getElementById(videoId);

        _this.css={
            width: jQuery(_this.$video).width(),
            height: jQuery(_this.$video).height()
        }

        if (_this.$video.controls)
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
        if (_this._youtube) {
            _this._youtube.playVideo();
        }
        if (_this.$video.paused) {
            _this.$video.play();
        }
    };
    this.pause = function () {
        if (_this._youtube) {
            _this._youtube.pauseVideo();
        }
        if (!_this.$video.paused) {
            _this.$video.pause();
        }
    };
    this.stop = function () {
        if (_this._youtube) {       
             _this._youtube.seekTo(1);
            // _this._youtube.playVideo();
            //_this._youtube.pauseVideo();
            _this._youtube.stopVideo();
        }
        if (!_this.$video) {
            _this.$video.stop();
        }
    };
    this.fullWidth=function(restore){
        if(restore==true){
            jQuery(_this.$video).css(_this.css);
          
        }else{
            var cssFullWidth={
                width: '100%',
                height: '100%'
            }
            jQuery(_this.$video).css(cssFullWidth);
        }
    }
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
