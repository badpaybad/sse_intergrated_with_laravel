<div>
    Here is overlay with channel id = {{$c}}
    <div>{!!json_encode($data)!!}</div>
    <div id='innerDivMsg'  onkeyup="txtMessage_onKeyup(this,event)"></div>
    <div>
    <input id="txtMessageReply"><button  onclick="txtMessage_sendMsg('txtMessageReply')">Send</button>
    </div>
<script>
    txtInner_sendMsg=function(txtMessageReply){
        var html= jQuery('#innerDivMsg').html();
        html+="<div>"+jQuery('#txtMessageReply').val()+"</div>"
        jQuery('#innerDivMsg').html(html);
    }
</script>
</div>