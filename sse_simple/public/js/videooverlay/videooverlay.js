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
    _cssOverlayFov: null,
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

                VideoOverlay.requestFullscreen(false);
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
        if (data.position == 'fullscreen') {
            VideoOverlay._cssOverlay.top = 0;
            VideoOverlay._cssOverlay.left = 0;
            VideoOverlay._cssOverlay.width = '100%';
            VideoOverlay._cssOverlay.height = '100%';
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

        if (VideoOverlay._isFullscreen == true) {

            VideoOverlay.overlayFullscreen(true);
        }

    },
    loadOverlayContent: function (url, data) {
        if (url) VideoOverlay._currentUrl = url;

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
                    ' <button onclick="VideoPlayer.screenNormal()">Exit fullscreen</button>' +
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

        VideoOverlay.overlayFullscreen(fullscreen);

        VideoOverlay._isFullscreen = fullscreen;

    },
    overlayFullscreen: function (fullscreen) {
        if (fullscreen == true) {

            VideoOverlay._cssOverlayFov = { position: "fixed" };

            if (VideoOverlay._cssOverlay.top)
                VideoOverlay._cssOverlayFov.top = VideoOverlay._cssOverlay.top;

            if (VideoOverlay._cssOverlay.right)
                VideoOverlay._cssOverlayFov.right = VideoOverlay._cssOverlay.right;

            if (VideoOverlay._cssOverlay.bottom)
                VideoOverlay._cssOverlayFov.bottom = VideoOverlay._cssOverlay.bottom;

            if (VideoOverlay._cssOverlay.left)
                VideoOverlay._cssOverlayFov.left = VideoOverlay._cssOverlay.left;

            if (VideoOverlay._cssOverlay.width)
                VideoOverlay._cssOverlayFov.width = VideoOverlay._cssOverlay.width;

            if (VideoOverlay._cssOverlay.height)
                VideoOverlay._cssOverlayFov.height = VideoOverlay._cssOverlay.height;

            if (VideoOverlay._cssOverlay.display)
                VideoOverlay._cssOverlayFov.display = VideoOverlay._cssOverlay.display;

            if (VideoOverlay._cssOverlay.opacity)
                VideoOverlay._cssOverlayFov.opacity = VideoOverlay._cssOverlay.opacity;

            VideoOverlay.$overlay.css(VideoOverlay._cssOverlayFov);

        } else {
            VideoOverlay.$overlay.css(VideoOverlay._cssOverlay);
        }
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

        VideoOverlay.$overlayBound = jQuery("#videoOverlayBound");
        VideoOverlay.$overlay = jQuery("#videoOverlay");

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
            overflow: 'hidden'
        };
        VideoOverlay._cssOverlay = {
            position: "absolute",
            top: 0,
            right: 0,
            //float:'right',
            width: '50%',
            height: '100%',
            zIndex: 99999,
            opacity: "0.5",
            display: "block",
            backgroundColor: "black",
            overflow: 'auto',
            border: "",
            color: '#cccccc'
        };
        VideoOverlay._cssOverlayFov = {
            position: "fixed",
            top: 0,
            right: 0,
            //float:'right',
            width: '50%',
            height: '100%',
            zIndex: 99999,
            opacity: "0.5",
            display: "block",
            backgroundColor: "black",
            overflow: 'auto',
            border: "",
            color: '#cccccc'
        };
        VideoOverlay.$video.css(VideoOverlay._cssVideo);

        VideoOverlay.$overlayBound.css(VideoOverlay._cssBound);

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
    elementFullScreen: function (element, isExitFullscreen) {
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

            VideoOverlay.elementFullScreen(document.documentElement);
            VideoOverlay._isFullscreen = true;

        } else {
            $obj.css(cssOrigin);
            VideoOverlay.elementFullScreen(document.documentElement, true);
            VideoOverlay.$overlay.css(VideoOverlay._cssOverlay);
            VideoOverlay._isFullscreen = false;
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
