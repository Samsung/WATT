importScripts('mux.js');

var
  g_muxer,
  inputFinished = false,
  debugInfo = false,
  lastFPS = 0,
  g_out_queue = [],
  g_last_init_segment = [];

init();

self.onmessage = function(e) {
  if (inputFinished)
    return;
  if (e.data.length <= 0)
    inputFinished = true;
  else
    g_muxer.push(e.data);
}

function init() {
  g_muxer = new muxjs.mp4.Transmuxer({remux: false});
  g_muxer.init();

  g_muxer.on('data', chunk => {
    let sameSegment = areSameArrays(g_last_init_segment, chunk.initSegment);
    if (lastFPS != chunk.info.fps) {
      if (debugInfo)
        console.log('Stream FPS has changed from ' + lastFPS + ' to ' + chunk.info.fps);
      postMessage({type:'info', fps: chunk.info.fps});
      lastFPS = chunk.info.fps;
    }
    g_last_init_segment = chunk.initSegment;
    if (!sameSegment) {
      if (debugInfo)
        console.log('New chunk received - width: ' + chunk.info.width + ',  height: ' + chunk.info.height);
      g_out_queue.push(chunk.initSegment);
    }
    if (chunk.data.length > 0) {
      g_out_queue.push(chunk.data);
      deliver_output();
    }
    else {
      console.warn('chunk.data is empty');
    }
  });
  postMessage({type:'fastDelivery'});
}

function areSameArrays(a1, a2) {
  if (a1.length != a2.length)
    return false;

  for (let i =0; i< a1.length; i++)
    if (a1[i] != a2[i])
      return false;

  return true;
}

function deliver_output() {
  if (g_out_queue.length <= 0)
    return;

  postMessage({type:'data', data:g_out_queue.shift()});

  if (g_out_queue.length > 0)
    setTimeout(deliver_output,1);
}
