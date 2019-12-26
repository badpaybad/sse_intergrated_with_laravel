self.importScripts('/js/webpushnotification/eventsourcereceiver.js');
var url = new URL(location);
const channel = url.searchParams.get('c');
const subscriber = url.searchParams.get('s');
const token = url.searchParams.get('token');

PushServer.init(token);

var connection = 0;

var _listMsg = [];

var _allPortOpenedByTap = [];

PushServer.addHandler(function (msg) {
  try {
    msg = JSON.parse(msg);

    _listMsg.push(msg);
  } catch (e) { }
}, channel, subscriber,token);

function pushToUi() {
  var msg = _listMsg.pop();

  if (msg) {
    for (var i = 0; i < _allPortOpenedByTap.length; i++) {
      try {
        var port = _allPortOpenedByTap[i];
        port.postMessage(msg);
      } catch (e) { }
    }
  }

  setTimeout(() => {
    pushToUi();
  }, 500);
}

self.onconnect = function (e) {
  var port = e.ports[0];
  _allPortOpenedByTap.push(port);

}

pushToUi();
