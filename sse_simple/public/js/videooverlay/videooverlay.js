VideoOverlay = {
    _videoId: null,
    $video: null,
    $overlayBound: null,
    $overlay: null,
    _isFullscreen: false,
    init: function(domId) {
        VideoOverlay._videoId = domId;
        VideoOverlay.$video = jQuery("#" + VideoOverlay._videoId);
    },
    hideOverlay:function(){
        VideoOverlay.$overlay = jQuery("#videoOverlay");
        if (VideoOverlay.$overlay) {
            cssOverlayOriginHide={
                position: "relative",
                width: 480,
                height: 360,
                border: "solid 1px black",
                zIndex: 999,
                display:'none'
            };
            VideoOverlay.$overlay.css(cssOverlayOriginHide);
        }
    },
    showOverlay: function(url, fullscreen) {

        if(fullscreen==null || fullscreen=='undefined'){
            fullscreen= VideoOverlay._isFullscreen;            
        }

        VideoOverlay.$overlayBound = jQuery("#videoOverlayBound");
        VideoOverlay.$overlay = jQuery("#videoOverlay");
        VideoOverlay.$video = jQuery("#" + VideoOverlay._videoId);

        if (VideoOverlay.$overlay) {
            VideoOverlay.$overlay.remove();
        }
        if (VideoOverlay.$overlayBound) {
            VideoOverlay.$video.unwrap();
        }
       
        VideoOverlay.$video.wrap("<div id='videoOverlayBound'></div>");
        VideoOverlay.$video.before("<div id='videoOverlay'>loading ...</div>");

        cssVideoOrigin={
            position: "absolute",
            top: 0,
            left: 0,
            width: 480,
            height: 360,
            zIndex: 9999
        };
        cssOverlayBoundOrigin={
            position: "relative",
            width: 480,
            height: 360,
            border: "solid 1px black",
            zIndex: 999,
            display:'block'
        };
        cssOvelayOrignin={
            position: "absolute",
            top: 0,
            left: 0,
            width: 400,
            height: 100,
            zIndex: 99999,
            border: "1px solid red",            
            opacity:'0.5',
            backgroundColor:'red'
        };

        VideoOverlay.$video.css(cssVideoOrigin);

        VideoOverlay.$overlayBound = jQuery("#videoOverlayBound");
        VideoOverlay.$overlayBound.css(cssOverlayBoundOrigin);

        VideoOverlay.$overlay = jQuery("#videoOverlay");
        VideoOverlay.$overlay.css(cssOvelayOrignin);       
                
        VideoOverlay.domFullscreen(VideoOverlay.$video, fullscreen, cssVideoOrigin);
        VideoOverlay.domFullscreen(VideoOverlay.$overlayBound, fullscreen, cssOverlayBoundOrigin);

        jQuery.post(
            url,
            {
                //csrf: '{{ csrf_token() }}',
                //c: channelName,
                // data: msgs
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
    },
    onFullScreen: function(fullscreen) {
        alert(fullscreen==true?"fullscreen mode":"normal mode");
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
            // if ($obj.requestFullScreen) {
            //     $obj.requestFullScreen();
            // } else if ($obj.webkitRequestFullScreen) {
            //     $obj.webkitRequestFullScreen();
            // } else if ($obj.mozRequestFullScreen) {
            //     $obj.mozRequestFullScreen();
            // }
            VideoPlayer.onFullScreen(true);
        } else {
            $obj.css(cssOrigin);
            // if ($obj.requestFullScreen) {
            //     $obj.exitFullscreen();
            // } else if ($obj.webkitRequestFullScreen) {
            //     $obj.webkitExitFullscreen();
            // } else if ($obj.mozRequestFullScreen) {
            //     $obj.mozExitFullscreen();
            // }

            VideoPlayer.onFullScreen(false);
        }
    }
};
