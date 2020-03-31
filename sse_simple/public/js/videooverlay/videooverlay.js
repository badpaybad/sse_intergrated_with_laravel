VideoOverlay = {
    _videoId: null,
    $video: null,
    $overlayBound: null,
    $overlay: null,
    _isFullscreen: false,
    _currentUrl: null,
    init: function(domId) {
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
    escKeyPress: function(element) {
        $(element).keyup(function(e) {
            
            var isEscPress = false;
            var key = e.which || event.key || event.keyCode;
            
            if (key == 27 ||  key == 'Esc' || key == "Escape") {
                isEscPress = true;
            }
            if (isEscPress) {
                VideoOverlay._isFullscreen=false;
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
    hideOverlay: function() {
        VideoOverlay.$overlay = jQuery("#videoOverlay");
        if (VideoOverlay.$overlay) {
            cssOverlayOriginHide = {
                position: "relative",
                width: 480,
                height: 360,
                border: "solid 1px black",
                zIndex: 999,
                display: "none"
            };
            VideoOverlay.$overlay.css(cssOverlayOriginHide);
        }
    },
    loadOverlayContent: function(url,msgs) {
        VideoOverlay._currentUrl = url;

        jQuery.post(
            VideoOverlay._currentUrl,
            {
                //csrf: '{{ csrf_token() }}',
                //c: channelName,
                 data: msgs
            },
            function(response) {
                VideoOverlay.$overlay.html(
                    response +
                        ' <button onclick="VideoPlayer.screenNormal()">Normal screen</button>' +
                        "</div>"
                );
            }
        );
    },
    setOverlayPosition:function(css){
        cssOvelayOrignin = {
            position: "absolute",
            top: 0,
            left: 0,
            width: 400,
            height: 360,
            zIndex: 99999,
            border: "1px solid red",
            opacity: "0.5",
            display: "block",
            backgroundColor: "red"
        };

        VideoOverlay.$overlay = jQuery("#videoOverlay");
        VideoOverlay.$overlay.css(cssOvelayOrignin);

    },
    showOverlay: function(fullscreen) {
        if (fullscreen == null || fullscreen == "undefined") {
            fullscreen = VideoOverlay._isFullscreen;
        }

        VideoOverlay.$video = jQuery("#" + VideoOverlay._videoId);

        VideoOverlay.$video.wrap("<div id='videoOverlayBound'></div>");
        VideoOverlay.$video.before("<div id='videoOverlay'></div>");

        cssVideoOrigin = {
            position: "absolute",
            top: 0,
            left: 0,
            width: 480,
            height: 360,
            zIndex: 9999
        };
        cssOverlayBoundOrigin = {
            position: "relative",
            width: 480,
            height: 360,
            border: "solid 1px black",
            zIndex: 999
        };
        cssOvelayOrignin = {
            position: "absolute",
            top: 0,
            left: 0,
            width: 240,
            height: 360,
            zIndex: 99999,
            border: "1px solid red",
            opacity: "0.5",
            display: "block",
            backgroundColor: "red"
        };

        VideoOverlay.$video.css(cssVideoOrigin);

        VideoOverlay.$overlayBound = jQuery("#videoOverlayBound");
        VideoOverlay.$overlayBound.css(cssOverlayBoundOrigin);

        VideoOverlay.$overlay = jQuery("#videoOverlay");
        VideoOverlay.$overlay.css(cssOvelayOrignin);

        VideoOverlay.domFullscreen(
            VideoOverlay.$video,
            fullscreen,
            cssVideoOrigin
        );
        VideoOverlay.domFullscreen(
            VideoOverlay.$overlayBound,
            fullscreen,
            cssOverlayBoundOrigin
        );
    },
    removeOverlay: function() {
        VideoOverlay.$overlayBound = jQuery("#videoOverlayBound");
        VideoOverlay.$overlay = jQuery("#videoOverlay");

        if ($overlay) {
            VideoOverlay.$overlay.remove();
        }
        if ($overlayBound) {
            VideoOverlay.$video.unwrap();
        }
        VideoOverlay.$video.attr("style", "");
    },
    requestFullScreen: function(element, isExitFullscreen) {
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
    domFullscreen: function($obj, fullscreen, cssOrigin) {
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
    init: function(videoId, onFullScreenCallback) {
        VideoPlayer._videoId = videoId;
        VideoPlayer.$video = document.getElementById(videoId);
        VideoPlayer.$video.controls = false;

        VideoPlayer._onFullScreenCallback = onFullScreenCallback;
        VideoPlayer.play();
        
        VideoPlayer.escKeyPress(document);
        VideoPlayer.escKeyPress(window);
        VideoPlayer.escKeyPress(VideoPlayer.$video);
    },
    onFullScreen: function(fullscreen) {
        alert(fullscreen == true ? "fullscreen mode" : "normal mode");
        if (VideoPlayer._onFullScreenCallback) {
            VideoPlayer._onFullScreenCallback(fullscreen);
        }
    },
    play: function() {
        var vid = VideoPlayer.$video;
        if (vid.paused) {
            vid.play();
        }
    },
    pause: function() {
        var vid = VideoPlayer.$video;
        if (!vid.paused) {
            vid.pause();
        }
    },
    screenFull: function() {
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
    screenNormal: function() {
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
    domFullscreen: function($obj, fullscreen, cssOrigin) {
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
    escKeyPress: function(element) {
        $(element).keyup(function(e) {
            
            var isEscPress = false;
            var key = e.which || event.key || event.keyCode;
            
            if (key == 27 ||  key == 'Esc' || key == "Escape") {
                isEscPress = true;
            }
            if (isEscPress) {
                VideoPlayer.screenNormal();
                VideoPlayer._videoFullScreen=false;              
            }
        });
    }
};
