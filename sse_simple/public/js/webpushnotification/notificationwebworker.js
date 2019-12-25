self.importScripts('/js/webpushnotification/eventsourcereceiver.js');
var url=new URL(location);
const channel = url.searchParams.get('c');    
const subscriber = url.searchParams.get('s');

console.log(channel);
console.log(subscriber);

PushServer.init();

var connection =0;

var _listMsg=[];

var _allPortOpenedByTap=[];

PushServer.addHandler(function(msg) {                
  try{
    msg= JSON.parse(msg);  

    _listMsg.push(msg);  
  }catch(e){}  
},channel, subscriber );  

function pushToUi(){
  var msg=_listMsg.pop();

  if(msg) {
    for(var i=0;i<_allPortOpenedByTap.length;i++){
      try{
        var port =_allPortOpenedByTap[i];
        port.postMessage(msg);
      }catch(e){}      
    }    
  }

  setTimeout(() => {
    pushToUi();
  }, 500);
}

self.onconnect = function(e) {  
  var port = e.ports[0];
  _allPortOpenedByTap.push(port);
 
}

pushToUi();

  // PushServer.addHandler(function(msg) {                
  //   msg= JSON.parse(msg);  
  
  //   postMessage(msg);

  // },channel, subscriber );  

// if(sessionStorage==null || sessionStorage==undefined)
// {

//   var isreg=sessionStorage.getItem(key);

//   if(isreg==true){
  
   
//   }else{
    
//     sessionStorage.setItem(key, true);
  
//     PushServer.init();
  
//     PushServer.addHandler(function(msg) {                
//       msg= JSON.parse(msg);  
    
//       var arr= sessionStorage.getItem(key+"_value");
//       if(arr==null || !arr || arr== 'undefined') arr=[];
  
//       arr.push(msg);
    
//       sessionStorage.setItem(key+"_value",arr);
  
//     },channel, subscriber );   
//   }
  
//   function sendToUi(){
  
//     var arr= sessionStorage.getItem(key+"_value");
  
//     if(arr)  {
//       var uiMsg= arr.pop();
//       postMessage(uiMsg);      
//       sessionStorage.setItem(key+"_value",arr);
//     }
  
//     setTimeout(sendToUi(),1000);
//   }
  
//   sendToUi();
// }