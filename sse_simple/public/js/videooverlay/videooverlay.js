VideoOverlay = function (videoDomId) {

    var _this = this;
    this._videoId = null;
    this.$video = null;
    this.$overlayBound = null;
    this.$overlay = null;
    this._isFullscreen = false;
    this._currentUrlOrContent = null;
    this._cssBound = null;
    this._cssVideo = null;
    this._cssOverlay = null;
    this._cssOverlayFov = null;

    this._videoId = videoDomId;

    this.init = function () {
        _this.$video = jQuery("#" + _this._videoId);

        _this.$overlayBound = jQuery("#videoOverlayBound");
        _this.$overlay = jQuery("#videoOverlay");
        if (_this.$overlay) {
            _this.$overlay.remove();
        }
        if (_this.$overlayBound) {
            _this.$video.unwrap();
        }
        _this.escKeyPress(document);
        _this.escKeyPress(window);

        _this.escKeyPress(_this.$video);
    };

    this.escKeyPress = function (element) {
        $(element).keyup(function (e) {

            var isEscPress = false;
            var key = e.which || event.key || event.keyCode;

            if (key == 27 || key == 'Esc' || key == "Escape") {
                isEscPress = true;
            }
            if (isEscPress) {
                _this._isFullscreen = false;

                _this.requestFullscreen(false);
            }
        });
    };

    this.hideOverlay = function () {
        if (_this.$overlay) {
            _this._cssOverlay.display = "none";
            _this.$overlay.css(_this._cssOverlay);
        }
    };

    this.showOverlay = function () {
        if (_this.$overlay) {
            _this._cssOverlay.display = "block";
            _this.$overlay.css(_this._cssOverlay);
        }
    };

    this.changeOverlayPosition = function (data) {
        if (!data) return;
        if (!data.position) return;
        if (data.type != 'overlay') return;

        if (data.opacity) {
            _this._cssOverlay.opacity = data.opacity;
        }
        if (data.show == true || data.show == 'true' || data.show == 'on') {
            _this._cssOverlay.display = 'block';
        }
        else {
            _this._cssOverlay.display = 'none';
        }
        if (data.position == 'fullscreen') {
            _this._cssOverlay.top = 0;
            _this._cssOverlay.left = 0;
            _this._cssOverlay.right = 'auto';
            _this._cssOverlay.bottom = 'auto';
            _this._cssOverlay.width = '100%';
            _this._cssOverlay.height = '100%';
        }
        if (data.position == 'top') {
            _this._cssOverlay.top = 0;
            _this._cssOverlay.left = 0;
            _this._cssOverlay.right = 'auto';
            _this._cssOverlay.bottom = 'auto';
            _this._cssOverlay.width = '100%';
            _this._cssOverlay.height = '50%';
        }
        if (data.position == 'right') {
            _this._cssOverlay.top = 0;
            _this._cssOverlay.right = 0;
            _this._cssOverlay.left = 'auto';
            _this._cssOverlay.bottom = 'auto';
            _this._cssOverlay.width = '50%';
            _this._cssOverlay.height = '100%';
        }
        if (data.position == 'bottom') {
            _this._cssOverlay.bottom = 0;
            _this._cssOverlay.left = 0;
            _this._cssOverlay.top = 'auto';
            _this._cssOverlay.right = 'auto';
            _this._cssOverlay.width = '100%';
            _this._cssOverlay.height = '50%';
        }
        if (data.position == 'left') {
            _this._cssOverlay.top = 0;
            _this._cssOverlay.left = 0;
            _this._cssOverlay.right = 'auto';
            _this._cssOverlay.bottom = 'auto';
            _this._cssOverlay.width = '50%';
            _this._cssOverlay.height = '100%';
        }

        _this._cssOverlay.overflow = 'auto';
        if (data.method == 'IFRAME') {
            _this._cssOverlay.overflow = 'hidden';
        }

        _this.$overlay.css(_this._cssOverlay);

        if (_this._isFullscreen == true) {

            _this.overlayFullscreen(true);
        }

    };

    this.loadOverlayContent = function (urlOrContent, data, transformResponse) {
        if (data.type != 'overlay') return;

        if (urlOrContent) _this._currentUrlOrContent = urlOrContent;

        if (data.method == 'POST') {
            jQuery.post(
                _this._currentUrlOrContent,
                {
                    data: data
                },
                function (response) {

                    var transformed = response;
                    if (transformResponse) {
                        transformed = transformResponse(response);
                    }

                    _this.$overlay.html(transformed);
                }
            );
        }
        else if (data.method == 'GET') {
            jQuery.get(
                _this._currentUrlOrContent,
                function (response) {

                    var transformed = response;
                    if (transformResponse) {
                        transformed = transformResponse(response);
                    }

                    _this.$overlay.html(transformed);
                }
            );
        }
        else if (data.method == 'IMG') {
            var transformed = '';
            if (transformResponse) {
                transformed = transformResponse(data);
            }
            if (data.position == "top" || data.position == "bottom" || data.position == "fullscreen") {
                _this.$overlay.html("<img src='" + _this._currentUrlOrContent + "' style='height:100%'/>");
            } else {
                _this.$overlay.html("<img src='" + _this._currentUrlOrContent + "' style='width:100%'/>");
            }
        }
        else if (data.method == 'IFRAME') {
            _this.$overlay.html("<iframe src='" + _this._currentUrlOrContent + "' style='width:100%; height:100%'/>");

        }
        else {
            var transformed = '';
            if (transformResponse) {
                transformed = transformResponse(data);
            }
            _this.$overlay.html(_this._currentUrlOrContent);
        }

    };
    this.fullWidth = function (restore) {
        if (restore == true) {

            _this.$video.css(_this._cssVideo);

            _this.$overlayBound.css(_this._cssBound);

            _this.$overlay.css(_this._cssOverlay);
        }
        else {     
            _this.$video.css({ 
                position: "absolute",
                top: 0,
                left: 0,
                width: '100%',
                height: jQuery(document).height(),
                zIndex: 9999
            });

            _this.$overlayBound.css({
                position: "relative",
                width: '100%',
                height: jQuery(document).height(),
                border: "",
                zIndex: 999,
                overflow: 'hidden'
            });
        }
    };
    this.requestFullscreen = function (fullscreen) {
        if (fullscreen == null || fullscreen == "undefined") {
            fullscreen = _this._isFullscreen;
        }

        _this.domFullscreen(
            _this.$video,
            fullscreen,
            _this._cssVideo
        );
        _this.domFullscreen(
            _this.$overlayBound,
            fullscreen,
            _this._cssBound
        );

        _this.overlayFullscreen(fullscreen);

        _this._isFullscreen = fullscreen;

    };

    this.overlayFullscreen = function (fullscreen) {
        if (fullscreen == true) {

            _this._cssOverlayFov = { position: "fixed" };

            if (_this._cssOverlay.top)
                _this._cssOverlayFov.top = _this._cssOverlay.top;

            if (_this._cssOverlay.right)
                _this._cssOverlayFov.right = _this._cssOverlay.right;

            if (_this._cssOverlay.bottom)
                _this._cssOverlayFov.bottom = _this._cssOverlay.bottom;

            if (_this._cssOverlay.left)
                _this._cssOverlayFov.left = _this._cssOverlay.left;

            if (_this._cssOverlay.width)
                _this._cssOverlayFov.width = _this._cssOverlay.width;

            if (_this._cssOverlay.height)
                _this._cssOverlayFov.height = _this._cssOverlay.height;

            if (_this._cssOverlay.display)
                _this._cssOverlayFov.display = _this._cssOverlay.display;

            if (_this._cssOverlay.opacity)
                _this._cssOverlayFov.opacity = _this._cssOverlay.opacity;

            _this.$overlay.css(_this._cssOverlayFov);

        } else {
            _this.$overlay.css(_this._cssOverlay);
        }
    };

    this.initOverlay = function () {

        _this.$overlayBound = jQuery("#videoOverlayBound");
        _this.$overlay = jQuery("#videoOverlay");

        if (_this.$overlay && _this.$overlay.id == "videoOverlay") {
            _this.$overlay.remove();
        }
        if (_this.$overlayBound && _this.$overlayBound.id == 'videoOverlayBound') {
            _this.$video.unwrap();
        }

        _this.$video = jQuery("#" + _this._videoId);
        _this.$video.wrap("<div id='videoOverlayBound'></div>");
        _this.$video.before("<div id='videoOverlay'></div>");

        _this.$overlayBound = jQuery("#videoOverlayBound");
        _this.$overlay = jQuery("#videoOverlay");

        _this._cssVideo = {
            position: "absolute",
            top: 0,
            left: 0,
            width: _this.$video.width(),
            height: _this.$video.height(),
            zIndex: 9999
        };
        _this._cssBound = {
            position: "relative",
            width: _this.$video.width(),
            height: _this.$video.height(),
            border: "",
            zIndex: 999,
            overflow: 'hidden'
        };
        _this._cssOverlay = {
            position: "absolute",
            top: 0,
            right: 0,
            left: 'auto',
            bottom: 'auto',
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
        _this._cssOverlayFov = {
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

        _this.$video.css(_this._cssVideo);

        _this.$overlayBound.css(_this._cssBound);

        _this.$overlay.css(_this._cssOverlay);
    };

    this.removeOverlay = function () {
        _this.$overlayBound = jQuery("#videoOverlayBound");
        _this.$overlay = jQuery("#videoOverlay");

        if ($overlay) {
            _this.$overlay.remove();
        }
        if ($overlayBound) {
            _this.$video.unwrap();
        }
        _this.$video.attr("style", "");
        _this._cssVideo.position = "auto";
        _this.$video.css(_this._cssVideo);
    };

    this.elementFullScreen = function (element, isExitFullscreen) {
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
    };

    this.domFullscreen = function ($obj, fullscreen, cssOrigin) {
        if (fullscreen == true && _this._isFullscreen == false) {
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

            _this.elementFullScreen(document.documentElement);
            _this._isFullscreen = true;

        } else {
            $obj.css(cssOrigin);
            _this.elementFullScreen(document.documentElement, true);
            _this.$overlay.css(_this._cssOverlay);
            _this._isFullscreen = false;
        }
    }

    this.init(videoDomId);
    this.initOverlay();
    return this;
};