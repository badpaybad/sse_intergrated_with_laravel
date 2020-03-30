VideoOverlay = {
    _rootId: null,
    $video: null,
    $overlayBound: null,
    $overlay: null,
    init: function (domId) {
        VideoOverlay._rootId = domId;
        VideoOverlay.$video = jQuery('#' + domId);
    },
    showOverlay: function (url, fullscreen, msgs) {

        VideoOverlay.$overlayBound = jQuery('#videoOverlayBound');
        VideoOverlay.$overlay = jQuery('#videoOverlay');

        if (VideoOverlay.$overlay) {
            VideoOverlay.$overlay.remove();
        }
        if (VideoOverlay.$overlayBound) {
            VideoOverlay.$video.unwrap();
        }

        VideoOverlay.$video.attr('style', 'position:absolute!important; top:0; left:0; width:480px; height:360px;z-index:9999');

        VideoOverlay.$video.wrap("<div id='videoOverlayBound' style='position:relative!important;width:480px; height:360px;border:solid 1px black; z-index:999'></div>")

        VideoOverlay.$video.before("<div id='videoOverlay' style='position:absolute!important;top:0;left:0; width:400px; height:100px;z-index:99999; border: 1px solid red;'>loading ...</div>");

        VideoOverlay.$overlayBound = jQuery('#videoOverlayBound');
        VideoOverlay.$overlay = jQuery('#videoOverlay');

        jQuery.post(url, {
            //csrf: '{{ csrf_token() }}',
            //c: channelName,
            data: msgs
        }, function (response) {
            VideoOverlay.$overlay.html(response + ' <button onclick="VideoPlayer.screenNormal()">Normal screen</button>' + '</div>');

            VideoOverlay.domFullscreen(VideoOverlay.$overlayBound, fullscreen, {
                position: 'relative',
                top: 0,
                width: 480,
                height: 360,
                left: 0,
                zIndex: 999
            });
            // VideoOverlay.domFullscreen( VideoOverlay.$overlay,fullscreen);        
            VideoOverlay.domFullscreen(VideoOverlay.$video, fullscreen, {
                position: 'absolute',
                top: 0,
                width: 480,
                height: 360,
                left: 0,
                zIndex: 9999
            });
        });
    },
    removeOverlay: function () {
        VideoOverlay.$overlayBound = jQuery('#videoOverlayBound');
        VideoOverlay.$overlay = jQuery('#videoOverlay');

        if ($overlay) {
            VideoOverlay.$overlay.remove();
        }
        if ($overlayBound) {
            VideoOverlay.$video.unwrap();
        }
        VideoOverlay.$video.attr('style', '');
    },

    domFullscreen: function ($obj, fullscreen, cssOrigin) {

        if (fullscreen) {
            $obj.css({
                position: 'fixed',
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                width:'100%',
                height:'100%',
                zIndex: cssOrigin.zIndex
            });
            // if ($obj.requestFullScreen) {
            //     $obj.requestFullScreen();
            // } else if ($obj.webkitRequestFullScreen) {
            //     $obj.webkitRequestFullScreen();
            // } else if ($obj.mozRequestFullScreen) {
            //     $obj.mozRequestFullScreen();
            // }
        } else {
            $obj.css(cssOrigin);
            // if ($obj.requestFullScreen) {
            //     $obj.exitFullscreen();
            // } else if ($obj.webkitRequestFullScreen) {
            //     $obj.webkitExitFullscreen();
            // } else if ($obj.mozRequestFullScreen) {
            //     $obj.mozExitFullscreen();
            // }
        }

    }
}

VideoPlayer = {
    _videoId: null,
    $video: null,
    _videoFullScreen: false,
    _onFullScreenCallback: null,
    init: function (videoId, onFullScreen) {
        VideoPlayer._videoId = videoId;
        VideoPlayer.$video = document.getElementById(videoId);
        VideoPlayer.$video.controls = false;
        VideoPlayer.$video.addEventListener('webkitfullscreenchange', VideoPlayer.onFullScreen);
        VideoPlayer.$video.addEventListener('mozfullscreenchange', VideoPlayer.onFullScreen);
        VideoPlayer.$video.addEventListener('fullscreenchange', VideoPlayer.onFullScreen);
        VideoPlayer._onFullScreen = onFullScreen;
        VideoPlayer.play();
    },
    onFullScreen: function (fullscreen) {
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
        var vid = VideoPlayer.$video;
        if (vid._videoFullScreen == true) return;

        VideoPlayer.domFullscreen(vid, true, {
            position: 'absolute',
            top: 0,
            width: 480,
            height: 360,
            left: 0,
            zIndex: 999
        });

        vid._videoFullScreen = true;
    },
    screenNormal: function () {
        var vid = VideoPlayer.$video;
        if (vid._videoFullScreen == false) return;

        VideoPlayer.domFullscreen(vid, false, {
            position: 'absolute',
            top: 0,
            width: 480,
            height: 360,
            left: 0,
            zIndex: 999
        });
        vid._videoFullScreen = false;
    }
    ,
    domFullscreen: function ($obj, fullscreen, cssOrigin) {
        $obj=jQuery($obj);
        if (fullscreen) {
            $obj.css({
                position: 'fixed',
                top: 0,
                right: 0,
                bottom: 0,
                left: 0, 
                width:'100%',
                height:'100%',
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
}