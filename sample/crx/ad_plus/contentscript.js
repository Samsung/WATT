var mobile = 0;

if(screen.availWidth == 360) {
  mobile = 1;
}

// Add page action
var port = chrome.runtime.connect({name: "contentscript"})
port.postMessage({contentscript: "Hello background!"})
port.onMessage.addListener(function(msg) {
  if (msg.background === 'Hello contentscript!') {
    console.log('from background : ' + msg.background)
  }
  if (msg.page_action === 'execute') {
    console.log('from background : ' + msg.page_action)

    if (document.getElementById('modal_div')) {
      var popup = document.getElementById('modal_div')
      document.getElementsByTagName('body')[0].removeChild(popup);
    }
    else {
      if(mobile == 1) {
        const DATA_HTML = '<div id="modal_div" style="display: block; position: fixed; z-index: 1; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; background-color: rgb(0,0,0); background-color: rgba(0,0,0,0.7);"> \
                      <div id="content_div" style="background-color:rgb(255, 255, 255); position:absolute; width: 250px; height: 300px; font-family:Sans-serif "> \
                        <div id="img_header" style="height: 30px; text-align: center;"> \
                            <img src="/opt/usr/home/owner/data/wrt/runtime_addon/ad_plus/header.png" style="width: 240px; height: 25px;"> \
                        </div> \
                        <div id="img_body" style="height: 250x; text-align: center;" > \
                          <img src="/opt/usr/home/owner/data/wrt/runtime_addon/ad_plus/body.png" style="width: 240px; height: 240px;"> \
                        </div> \
                        <div id="img_footer" style="height: 30px;font-size: 13px; line-height:20px; vertical-align: middle; text-align: center; "> \
                          <div style="float : left; margin-left : 10px"> \
                            Link to site : \
                            <a href="http://www.samsung.com/sec/">samsung</a> \
                          </div> \
                          <div id="point_div" style="float : right; margin-right : 10px; font-size: 10px; color:black"> \
                          </div> \
                        </div> \
                      </div> \
                   </div>';
//"
        document.body.insertAdjacentHTML('beforeend', DATA_HTML);

        var top_val = (screen.availHeight / 2) - 150;
        var left_val = (screen.availWidth / 2) - 125;
      }
      else {
        const DATA_HTML = '<div id="modal_div" style="display: block; position: fixed; z-index: 1; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; background-color: rgb(0,0,0); background-color: rgba(0,0,0,0.7);"> \
                      <div id="content_div" style="background-color:rgb(255, 255, 255); position:absolute; width: 800px; height: 800px; font-family:Sans-serif "> \
                        <div id="img_header" style="height: 90px; text-align: center;"> \
                            <img src="/opt/usr/home/owner/data/wrt/runtime_addon/ad_plus/header.png" style="width: 788px; height: 80px;"> \
                        </div> \
                        <div id="img_body" style="height: 590px; text-align: center;" > \
                          <img src="/opt/usr/home/owner/data/wrt/runtime_addon/ad_plus/body.png" style="width: 788px; height: 590px;"> \
                        </div> \
                        <div id="img_footer" style="height: 90px;font-size: 50px; line-height:90px; vertical-align: middle; text-align: center; "> \
                          <div style="float : left; margin-left : 10px"> \
                            Link to site : \
                            <a href="http://www.samsung.com/sec/">samsung</a> \
                          </div> \
                          <div id="point_div" style="float : right; margin-right : 10px;"> \
                          </div> \
                        </div> \
                      </div> \
                   </div>';
//"
        document.body.insertAdjacentHTML('beforeend', DATA_HTML);

        var top_val = (screen.availHeight / 2) - 400;
        var left_val = (screen.availWidth / 2) - 400;
      }

      var modal = document.getElementById('modal_div');
      document.getElementById('content_div').style.top = top_val+'px';
      document.getElementById('content_div').style.left = left_val+'px';

      chrome.storage.local.get('value', function(items) {
        var vt = document.createTextNode('point :' + items.value);
        document.getElementById('point_div').appendChild(vt);
      });

      modal.style.display = 'block';
    }
  }
})

// Play AD
document.body.onload = function() {
var app_id = location.href.split('/');
console.log('app_id : ' + app_id);
if (app_id[app_id.length - 2] === 'launcher' ||
    app_id[app_id.length - 2] === 'installer' ||
    app_id[app_id.length - 2] === 'extensions_settings' ||
    app_id[app_id.length - 4] === 'NVPDzvckj9') {
  console.log('Except for installer and settings.');
} else {
  var cnt = 5;
  var flag = 0;

  const BG_HTML = '<div id="bg_div" style="display: block; position: fixed; z-index: 1; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; background-color: rgb(0,0,0);"> \
                </div>'
  //"              
  var adv_div = document.createElement('div');

  var video = document.createElement('video');
  video.src = '/opt/usr/home/owner/data/wrt/runtime_addon/ad_plus/adv2.mp4';
  video.type = 'video/mp4';
  video.autoplay = 'true';


  console.log('screen.availHeight : ', screen.availHeight);
  console.log('screen.availWidth : ', screen.availWidth);

  var video_style = document.createAttribute("style");
  video_style.nodeValue = 'position: absolute; top:0px; left:0px; width:'+screen.availWidth+'px; height:'+screen.availHeight+'px; z-index:1; color:white; font-size:30px; font-weight:bold';
  video.setAttributeNode(video_style);

  adv_div.appendChild(video);

  var text_div = document.createElement('div');
  text_div.id = 'text';
  var text_style = document.createAttribute('style');
  if(mobile == 1) {
    text_style.nodeValue = 'position: absolute; top:'+(screen.availHeight - 50)+'px; left:'+(screen.availWidth - 150)+'px; width:150px; height:50px; z-index:3; color:white; font-size:15px; font-weight:bold';
  }
  else {
    text_style.nodeValue = 'position: absolute; top:'+(screen.availHeight - 100)+'px; left:'+(screen.availWidth - 250)+'px; width:200px; height:50px; z-index:3; color:white; font-size:20px; font-weight:bold';
  }

  text_div.setAttributeNode(text_style);
  var text = document.createTextNode(cnt + ' 초 후에 SKIP 가능');
  text_div.appendChild(text);

  var skip_div = document.createElement('div');
  var skip_style = document.createAttribute("style");
  if(mobile == 1) {
    skip_style.nodeValue = 'background-color:rgba(0, 0, 0, .3); text-align: center; position: absolute; top:'+(screen.availHeight - 50)+'px; left:'+(screen.availWidth - 100)+'px; width:100px; height:33px; z-index:5; color:white; font-size:20px; font-weight:bold';
  }
  else {
    skip_style.nodeValue = 'background-color:rgba(0, 0, 0, .3); text-align: center; position: absolute; top:'+(screen.availHeight - 100)+'px; left:'+(screen.availWidth - 250)+'px; width:100px; height:33px; z-index:5; color:white; font-size:30px; font-weight:bold';
  }
  skip_div.setAttributeNode(skip_style);
  skip_div.innerHTML = 'SKIP';

  var text_div1 = document.createElement('div');
  text_div1.id = 'text1';
  var text_style = document.createAttribute('style');
  text_style.nodeValue = 'position: absolute; top:10px; left:10px; width:300px; height:50px; z-index:3; color:white; font-size:20px; font-weight:bold';
  text_div1.setAttributeNode(text_style);
  var text1 = document.createTextNode('광고 영상이 재생 중입니다.');
  text_div1.appendChild(text1);

  const IMG_HTML = '<div id="img_div" class="animated infinite pulse" style="position: absolute; z-index:4; width:256px; height: 256px; text-align: center; color:white; font-size:15px; font-weight:bold" > \
                   <img src="/opt/usr/home/owner/data/wrt/runtime_addon/ad_plus/icon64.png"> \
                   </div>';
//"

  skip_div.onclick = function() {
    console.log('clicked skip ');
    document.getElementsByTagName('body')[0].removeChild(bg_div);
    document.getElementsByTagName('body')[0].removeChild(skip_div);
    document.getElementsByTagName('body')[0].removeChild(adv_div);
    document.getElementsByTagName('body')[0].removeChild(text_div1);
    document.getElementsByTagName('body')[0].removeChild(img_div);
    clearInterval(timer);
  };

  document.body.insertAdjacentHTML('beforeend', BG_HTML);

  document.getElementsByTagName('body')[0].appendChild(adv_div);
  document.getElementsByTagName('body')[0].appendChild(text_div);
  document.getElementsByTagName('body')[0].appendChild(text_div1);



  console.log('PWRT , setInterval start ');
  

  var timer = setInterval(function() {
    cnt--;
	
    console.log('ended :' + video.ended);

    if(video.ended == true) {
      document.getElementsByTagName('body')[0].removeChild(bg_div);
      document.getElementsByTagName('body')[0].removeChild(adv_div);
      document.getElementsByTagName('body')[0].removeChild(skip_div);
      document.getElementsByTagName('body')[0].removeChild(text_div1);
      document.getElementsByTagName('body')[0].removeChild(img_div);
      clearInterval(timer);
    }

    if(cnt < 1 && flag == 0) {
      flag = 1;
      document.getElementsByTagName('body')[0].removeChild(text_div);
      document.getElementsByTagName('body')[0].appendChild(skip_div);

      chrome.storage.local.get('value', function(items) {
        var value = 0;

        console.log('get value :', items);

        if(items.value) {
          value = items.value;
          console.log('items.value :', items.value);
        }

        value = value + 100;

        chrome.storage.local.set({'value': value}, function() {
          console.log('saved value : ', value);
        });

        document.body.insertAdjacentHTML('beforeend', IMG_HTML);

        if(mobile) {
          document.getElementById('img_div').style.top = (screen.availHeight - 150)+'px';
          document.getElementById('img_div').style.left = (screen.availWidth - 200)+'px';
          document.getElementById('img_div').style.width = 200 +'px';
          document.getElementById('img_div').style.height = 200 +'px';
        }
        else {
          document.getElementById('img_div').style.top = (screen.availHeight - 164 - 10)+'px';
          document.getElementById('img_div').style.left = (screen.availWidth - 314 - 10)+'px';
        }

        var pt = document.createTextNode(value + ' point');
        document.getElementById('img_div').appendChild(pt);
      });
    }
    else if(flag == 0) {
      document.getElementById('text').innerHTML = cnt + ' 초 후에 SKIP 가능';
    }
  }, 1000);  


console.log('PWRT , setInterval end ');


  
}
}
;


