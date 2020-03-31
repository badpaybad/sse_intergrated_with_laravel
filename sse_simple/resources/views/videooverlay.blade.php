<div>
    Here is overlay
    {{$data}}
    <div id='innerDivMsg'></div>
    <div>
    <input id="txtMessageReply"><button  onclick="txtInner_sendMsg('txtMessageReply')">Send</button>
    </div>
<script>
    txtInner_sendMsg=function(txtMessageReply){
        var html= jQuery('#innerDivMsg').html();
        html+="<div>"+jQuery('#txtMessageReply').val()+"</div>"
        jQuery('#innerDivMsg').html(html);
    }
</script>
</div>