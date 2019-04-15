function VideoDecoder(mimeType, context, infoCallback, bufferCallback, pictureCallback, exitCallback) {
  if (!(this instanceof VideoDecoder))
    return new VideoDecoder(mimeType, context, infoCallback, bufferCallback, pictureCallback, exitCallback);

  var worker = new Worker('video_worker.js');
  var fast = false;
  var delivery = false;
  var videoStreamEnded = false;
  var textures = [];

  this.addVideoStream = function(data) {
    if (videoStreamEnded || !delivery) return;
    worker.postMessage(new Uint8Array(data));
    delivery = false;
    if (fast) {
      setTimeout(callBufferCallback, 0);
      return;
    }
  }

  this.endOfVideoStream = function() {
    videoStreamEnded = true;
    worker.postMessage([]);
  }

  this.close = function() {
    worker.terminate();
    worker = null;
    setTimeout(exitCallback, 0);
  }

  this.recycleTexture = function(texture) {
    var i = textures.indexOf(texture);
    if (i != -1)
      textures.splice(i, 1);
    context.deleteTexture(texture);
    context.flush();
  }

  var video = document.createElement('video');
  var mediaSource = new MediaSource();
  var sourceBuffer;
  var queue = [];
  var lastTime;
  var needMoreBuffer = true;
  var timer = null;
  var fps;
  var enoughBufferedTime = 5;

  video.src = window.URL.createObjectURL(mediaSource);
  video.addEventListener('loadeddata', function() {
    infoCallback(video.videoWidth, video.videoHeight);
    video.play();
    timer = setInterval(captureVideo, 1000 / fps);
  });

  function hasEnoughBuffer() {
    var buffered = video.buffered;
    return (buffered.length && lastTime && buffered.end(buffered.length - 1) - lastTime > enoughBufferedTime);
  }

  function callBufferCallback() {
    if (hasEnoughBuffer()) {
      needMoreBuffer = false;
      return;
    }
    needMoreBuffer = true;
    if (fast) delivery = true;
    bufferCallback();
  }

  function captureVideo() {
    if (video.ended) {
      clearInterval(timer);
      timer = null;
      sourceBuffer = null;
      mediaSource = null;
      video = null;
      return;
    }

    if (lastTime == video.currentTime) {
      var buffered = video.buffered;
      if (lastTime >= buffered.end(buffered.length - 1))
        console.error('video stopped');
      return;
    }
    lastTime = video.currentTime;

    var texture = context.createTexture();
    context.bindTexture(context.TEXTURE_2D, texture);
    context.texImage2D(context.TEXTURE_2D, 0, context.RGB, context.RGB, context.UNSIGNED_BYTE, video);
    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MAG_FILTER, context.LINEAR);
    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MIN_FILTER, context.LINEAR);
    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_S, context.CLAMP_TO_EDGE);
    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_T, context.CLAMP_TO_EDGE);
    context.bindTexture(context.TEXTURE_2D, null);
    textures.push(texture);
    pictureCallback(texture);

    if (!needMoreBuffer) callBufferCallback();
  }

  function addToSourceBuffer(data) {
    if (data) queue.push(data);

    if (!sourceBuffer) {
      if (mediaSource.readyState == 'open') {
        sourceBuffer = mediaSource.addSourceBuffer(mimeType);
        sourceBuffer.onerror = function(e) { console.error(e); };
        sourceBuffer.onupdateend = function() {
          if (sourceBuffer.updating) return;  // bug? sometimes updating is true.
          if (queue.length > 0)
            sourceBuffer.appendBuffer(new Uint8Array(queue.shift()));
          else if (!worker)
            mediaSource.endOfStream();
        };
        sourceBuffer.appendBuffer(new Uint8Array(queue.shift()));
      }
    } else if (!sourceBuffer.updating) {
      sourceBuffer.appendBuffer(new Uint8Array(queue.shift()));
    }
  }

  worker.onmessage = (e) => {
    if (e.data.type === 'fastDelivery') {
      if (fast) return;
      fast = true;
      delivery = true;
      callBufferCallback();
    } else if (e.data.type === 'delivery') {
      fast = false;
      delivery = true;
      callBufferCallback();
    } else if (e.data.type === 'data') {
      addToSourceBuffer(e.data.data);
    } else if (e.data.type === 'exit') {
      worker.terminate();
      worker = null;
      exitCallback();
    } else if (e.data.type === 'info') {
      fps = e.data.fps;
    }
  }
};
