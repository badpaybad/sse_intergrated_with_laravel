WebWorkerCustom = function(urlJsHanle, typeOfWorker) {
    this.typeOfWorker = "Worker";
    this.urlJsHanle = urlJsHanle;

    if (typeOfWorker) this.typeOfWorker = typeOfWorker;

    this._currentWorker = null;
    this._isSharedWorker = false;
    this._allPortOpenedByTap = [];

    if (typeof(SharedWorker) && this.typeOfWorker == "SharedWorker") {
        this._isSharedWorker = true;
    } else {
        this._isSharedWorker = false;
    }

    if (this._isSharedWorker) {
        this._currentWorker = new SharedWorker(this.urlJsHanle);
        this._currentWorker.port.start();
    } else {
        this._currentWorker = new Worker(this.urlJsHanle);
    }

    this.onconnect = function(e) {
        var port = e.ports[0];
        _allPortOpenedByTap.push(port);
    };

    this.onmessage = function(e) {
        if (this._isSharedWorker) {
            this._currentWorker.port.onmessage = function(e) {
                console.log(e);
                //todo: do with your logic
                var msgs = jQuery("#messages").html();
                msgs = msgs + "<div>" + JSON.stringify(e.data) + "</div>";
                jQuery("#messages").html(msgs + "<div>");

                VideoOverlay.changeOverlayPosition(e.data);

                VideoOverlay.loadOverlayContent(e.data.url);
            };
        } else {
            this._currentWorker.onmessage = function(e) {
                console.log(e);
                //todo: do with your logic
                var msgs = jQuery("#messages").html();
                msgs = msgs + "<div>" + JSON.stringify(e.data) + "</div>";
                jQuery("#messages").html(msgs + "<div>");

                VideoOverlay.changeOverlayPosition(e.data);

                VideoOverlay.loadOverlayContent(e.data.url);
            };
        }
    };

    this.postMessage = function() {
        if (this._isSharedWorker) {
            for (var i = 0; i < this._allPortOpenedByTap.length; i++) {
                try {
                    var port = this._allPortOpenedByTap[i];
                    port.postMessage(msg);
                } catch (e) {}
            }
        } else {
            postMessage(msg);
        }
    };
};
