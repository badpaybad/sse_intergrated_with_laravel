self.importScripts('/js/webpushnotification/eventsourcereceiver.js');
var url = new URL(location);
var channel = url.searchParams.get('c');    
var subscriber = url.searchParams.get('s'); 
var typeOfWorker = url.searchParams.get('t');

subscriber=new Date().getTime();
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
console.log(123);
  if (msg) {    
    if(typeOfWorker=='SharedWorker'){
      for (var i = 0; i < _allPortOpenedByTap.length; i++) {
        try {
          var port = _allPortOpenedByTap[i];
          port.postMessage(msg);
        } catch (e) { }
      }
    }else{
      postMessage(msg);
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
