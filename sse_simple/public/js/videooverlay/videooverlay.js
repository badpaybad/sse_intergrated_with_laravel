VideoOverlay = {
    _videoId: null,
    $video: null,
    $overlayBound: null,
    $overlay: null,
    _isFullscreen: false,
    _currentUrl: null,
    _cssBound: null,
    _cssVideo: null,
    _cssOverlay: null,
    init: function (domId) {
        VideoOverlay._videoId = domId;
        VideoOverlay.$video = jQuery("#" + VideoOverlay._videoId);

        VideoOverlay.$overlayBound = jQuery("#videoOverlayBound");
        VideoOverlay.$overlay = jQuery("#videoOverlay");
        if (VideoOverlay.$overlay) {
            VideoOverlay.$overlay.remove();
        }
        if (VideoOverlay.$overlayBound) {
            VideoOverlay.$video.unwrap();
        }

        VideoOverlay.escKeyPress(document);
        VideoOverlay.escKeyPress(window);

        VideoOverlay.escKeyPress(VideoOverlay.$video);
    },
    escKeyPress: function (element) {
        $(element).keyup(function (e) {

            var isEscPress = false;
            var key = e.which || event.key || event.keyCode;

            if (key == 27 || key == 'Esc' || key == "Escape") {
                isEscPress = true;
            }
            if (isEscPress) {
                VideoOverlay._isFullscreen = false;
                VideoOverlay.$overlayBound = jQuery("#videoOverlayBound");
                VideoOverlay.$overlay = jQuery("#videoOverlay");
                if (VideoOverlay.$overlay) {
                    VideoOverlay.$overlay.remove();
                }
                if (VideoOverlay.$overlayBound) {
                    VideoOverlay.$video.unwrap();
                }
                VideoOverlay.showOverlay(false);
                VideoOverlay.loadOverlayContent(VideoOverlay._currentUrl);
            }
        });
    },
    hideOverlay: function () {
        if (VideoOverlay.$overlay) {
            VideoOverlay._cssOverlay.display = "none";
            VideoOverlay.$overlay.css(VideoOverlay._cssOverlay);
        }
    },
    showOverlay: function () {
        if (VideoOverlay.$overlay) {
            VideoOverlay._cssOverlay.display = "block";
            VideoOverlay.$overlay.css(VideoOverlay._cssOverlay);
        }
    },
    changeOverlayPosition: function (data) {
        if (!data) return;
        if (!data.position) return;

        if (data.opacity) {
            VideoOverlay._cssOverlay.opacity = data.opacity;
        }

        if (data.show || data.show == 'true') {
            VideoOverlay._cssOverlay.display = 'block';
        }
        else {
            VideoOverlay._cssOverlay.display = 'none';
        }

        if (data.position == 'top') {
            VideoOverlay._cssOverlay.top = 0;
            VideoOverlay._cssOverlay.left = 0;
            VideoOverlay._cssOverlay.width = '100%';
            VideoOverlay._cssOverlay.height = '50%';
        }
        if (data.position == 'right') {
            VideoOverlay._cssOverlay.top = 0;
            VideoOverlay._cssOverlay.right = 0;
            VideoOverlay._cssOverlay.width = '50%';
            VideoOverlay._cssOverlay.height = '100%';
        }
        if (data.position == 'bottom') {
            VideoOverlay._cssOverlay.bottom = 0;
            VideoOverlay._cssOverlay.left = 0;
            VideoOverlay._cssOverlay.width = '100%';
            VideoOverlay._cssOverlay.height = '50%';
        }
        if (data.position == 'left') {
            VideoOverlay._cssOverlay.top = 0;
            VideoOverlay._cssOverlay.left = 0;
            VideoOverlay._cssOverlay.width = '50%';
            VideoOverlay._cssOverlay.height = '100%';
        }
        VideoOverlay.$overlay.css(VideoOverlay._cssOverlay);

    },
    loadOverlayContent: function (url, data) {
        VideoOverlay._currentUrl = url;

        jQuery.post(
            VideoOverlay._currentUrl,
            {
                //csrf: '{{ csrf_token() }}',
                //c: channelName,
                data: data
            },
            function (response) {
                VideoOverlay.$overlay.html(
                    response +
                    ' <button onclick="VideoPlayer.screenNormal()">Normal screen</button>' +
                    "</div>"
                );
            }
        );
    },
    requestFullscreen: function (fullscreen) {
        if (fullscreen == null || fullscreen == "undefined") {
            fullscreen = VideoOverlay._isFullscreen;
        }

        VideoOverlay.domFullscreen(
            VideoOverlay.$video,
            fullscreen,
            VideoOverlay._cssVideo
        );
        VideoOverlay.domFullscreen(
            VideoOverlay.$overlayBound,
            fullscreen,
            VideoOverlay._cssBound
        );
    },
    initOverlay: function () {

        VideoOverlay.$overlayBound = jQuery("#videoOverlayBound");
        VideoOverlay.$overlay = jQuery("#videoOverlay");

        if (VideoOverlay.$overlay && VideoOverlay.$overlay.id == "videoOverlay") {
            VideoOverlay.$overlay.remove();
        }
        if (VideoOverlay.$overlayBound && VideoOverlay.$overlayBound.id == 'videoOverlayBound') {
            VideoOverlay.$video.unwrap();
        }

        VideoOverlay.$video = jQuery("#" + VideoOverlay._videoId);
        VideoOverlay.$video.wrap("<div id='videoOverlayBound'></div>");
        VideoOverlay.$video.before("<div id='videoOverlay'></div>");

        VideoOverlay._cssVideo = {
            position: "absolute",
            top: 0,
            left: 0,
            width: VideoOverlay.$video.width(),
            height: VideoOverlay.$video.height(),
            zIndex: 9999
        };
        VideoOverlay._cssBound = {
            position: "relative",
            width: VideoOverlay.$video.width(),
            height: VideoOverlay.$video.height(),
            border: "",
            zIndex: 999,
            overflow: 'visible'
        };
        VideoOverlay._cssOverlay = {
            position: "absolute",
            top: 0,
            right: 0,
            //float:'right',
            width: '50%',
            height: VideoOverlay.$video.height(),
            zIndex: 99999,
            opacity: "0.5",
            display: "block",
            backgroundColor: "red"
        };

        VideoOverlay.$video.css(VideoOverlay._cssVideo);

        VideoOverlay.$overlayBound = jQuery("#videoOverlayBound");
        VideoOverlay.$overlayBound.css(VideoOverlay._cssBound);

        VideoOverlay.$overlay = jQuery("#videoOverlay");
        VideoOverlay.$overlay.css(VideoOverlay._cssOverlay);

    },
    removeOverlay: function () {
        VideoOverlay.$overlayBound = jQuery("#videoOverlayBound");
        VideoOverlay.$overlay = jQuery("#videoOverlay");

        if ($overlay) {
            VideoOverlay.$overlay.remove();
        }
        if ($overlayBound) {
            VideoOverlay.$video.unwrap();
        }
        VideoOverlay.$video.attr("style", "");
        VideoOverlay._cssVideo.position = "auto";
        VideoOverlay.$video.css(VideoOverlay._cssVideo);
    },
    requestFullScreen: function (element, isExitFullscreen) {
        if (isExitFullscreen == true) {
            // Supports most browsers and their versions.
            var requestMethod =
                element.exitFullscreen ||
                element.webkitExitFullscreen ||
                element.mozExitFullscreen ||
                element.msExitFullscreen;

            if (requestMethod) {
                // Native full screen.
                requestMethod.call(element);
            } else if (typeof window.ActiveXObject !== "undefined") {
                // Older IE.
                var wscript = new ActiveXObject("WScript.Shell");
                if (wscript !== null) {
                    wscript.SendKeys("{F11}");
                }
            }

            jQuery.event.trigger({ type: "keypress", which: 27 });
        } else {
            // Supports most browsers and their versions.
            var requestMethod =
                element.requestFullScreen ||
                element.webkitRequestFullScreen ||
                element.mozRequestFullScreen ||
                element.msRequestFullScreen;

            if (requestMethod) {
                // Native full screen.
                requestMethod.call(element);
            } else if (typeof window.ActiveXObject !== "undefined") {
                // Older IE.
                var wscript = new ActiveXObject("WScript.Shell");
                if (wscript !== null) {
                    wscript.SendKeys("{F11}");
                }
            }
        }
    },
    domFullscreen: function ($obj, fullscreen, cssOrigin) {
        if (fullscreen == true && VideoOverlay._isFullscreen == false) {
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

            VideoOverlay.requestFullScreen(document.documentElement);
            VideoOverlay._isFullscreen = true;
        } else {
            $obj.css(cssOrigin);

            VideoOverlay._isFullscreen = false;

            VideoOverlay.requestFullScreen(document.documentElement, true);
        }
    }
};

VideoPlayer = {
    _videoId: null,
    $video: null,
    _videoFullScreen: false,
    _onFullScreenCallback: null,
    init: function (videoId, onFullScreenCallback) {
        VideoPlayer._videoId = videoId;
        VideoPlayer.$video = document.getElementById(videoId);
        VideoPlayer.$video.controls = false;

        VideoPlayer._onFullScreenCallback = onFullScreenCallback;
        VideoPlayer.play();

        VideoPlayer.escKeyPress(document);
        VideoPlayer.escKeyPress(window);
        VideoPlayer.escKeyPress(VideoPlayer.$video);
    },
    onFullScreen: function (fullscreen) {
        alert(fullscreen == true ? "fullscreen mode" : "normal mode");
        if (VideoPlayer._onFullScreenCallback) {
            VideoPlayer._onFullScreenCallback(fullscreen);
        }
    },
    play: function () {
        var vid = VideoPlayer.$video;
        if (vid.paused) {
            vid.play();
        }
    },
    pause: function () {
        var vid = VideoPlayer.$video;
        if (!vid.paused) {
            vid.pause();
        }
    },
    screenFull: function () {
        if (VideoPlayer._videoFullScreen == true) return;

        VideoPlayer._videoFullScreen = true;
        VideoPlayer.domFullscreen(VideoPlayer.$video, true, {
            position: "absolute",
            top: 0,
            width: 480,
            height: 360,
            left: 0,
            zIndex: 999
        });
    },
    screenNormal: function () {
        if (VideoPlayer._videoFullScreen == false) return;

        VideoPlayer._videoFullScreen = false;
        VideoPlayer.domFullscreen(VideoPlayer.$video, false, {
            position: "absolute",
            top: 0,
            width: 480,
            height: 360,
            left: 0,
            zIndex: 999
        });
    },
    domFullscreen: function ($obj, fullscreen, cssOrigin) {
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

            VideoPlayer.onFullScreen(true);
        } else {
            $obj.css(cssOrigin);

            VideoPlayer.onFullScreen(false);
        }
    },
    escKeyPress: function (element) {
        $(element).keyup(function (e) {

            var isEscPress = false;
            var key = e.which || event.key || event.keyCode;

            if (key == 27 || key == 'Esc' || key == "Escape") {
                isEscPress = true;
            }
            if (isEscPress) {
                VideoPlayer.screenNormal();
                VideoPlayer._videoFullScreen = false;
            }
        });
    }
};
