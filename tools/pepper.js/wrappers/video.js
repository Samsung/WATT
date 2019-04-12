(function() {

  var ppvideo = {
    PP_VIDEO_CREATE: 0,
    PP_VIDEO_INITIALIZE: 1,
    PP_VIDEO_READY: 2,
    PP_VIDEO_FINALIZE: 3,

    PP_VIDEOPROFILE_H264BASELINE: 0,
    PP_VIDEOPROFILE_H264MAIN: 1,
    PP_VIDEOPROFILE_H264EXTENDED: 2,
    PP_VIDEOPROFILE_H264HIGH: 3,
    PP_VIDEOPROFILE_H264HIGH10PROFILE: 4,
    PP_VIDEOPROFILE_H264HIGH422PROFILE: 5,
    PP_VIDEOPROFILE_H264HIGH444PREDICTIVEPROFILE: 6,
    PP_VIDEOPROFILE_H264SCALABLEBASELINE: 7,
    PP_VIDEOPROFILE_H264SCALABLEHIGH: 8,
    PP_VIDEOPROFILE_H264STEREOHIGH: 9,
    PP_VIDEOPROFILE_H264MULTIVIEWHIGH: 10,
    PP_VIDEOPROFILE_VP8_ANY: 11,
    PP_VIDEOPROFILE_VP9_ANY: 12,
    PP_VIDEOPROFILE_MAX: 12,

    // Maximum number of concurrent decodes which can be pending.
    kMaximumPendingDecodes: 8,

    // Minimum size of shared-memory buffers (100 KB). Make them large since we
    // try to reuse them.
    kMinimumBitstreamBufferSize: 100 << 10,

    // Maximum size of shared-memory buffers (4 MB). This should be enough even
    // for 4K video at reasonable compression levels.
    kMaximumBitstreamBufferSize: 4 << 20,

    // The maximum number of pictures that the client can pass in for
    // min_picture_count, just as a sanity check on the argument.
    // This should match the constant of the same name in test_video_decoder.cc.
    kMaximumPictureCount: 100
  };

  var VideoDecoder_Create = function(instance) {
    return resources.register(VIDEO_RESOURCE, {
      state: ppvideo.PP_VIDEO_CREATE,
      decoder: null,
      rect: {
        point: { x: 0, y: 0 },
        size: { width: 0, height: 0 },
      },
      pictures: [],
      decodeCallback: null,
      picture_ptr: null,
      pictureCallback: null,
      flushCallback: null,
      resetCallback: null
    });
  }

  var VideoDecoder_IsVideoDecoder = function(resource) {
    return resources.is(resource, VIDEO_RESOURCE);
  }

  var getMIMEType = function(profile) {
    switch(profile) {
    case ppvideo.PP_VIDEOPROFILE_H264BASELINE:
      return 'video/mp4; codecs="avc1.42000A"';
    case ppvideo.PP_VIDEOPROFILE_H264MAIN:
      return 'video/mp4; codecs="avc1.4D000A"';
    case ppvideo.PP_VIDEOPROFILE_H264EXTENDED:
      return 'video/mp4; codecs="avc1.58000A"';
    case ppvideo.PP_VIDEOPROFILE_H264HIGH:
      return 'video/mp4; codecs="avc1.64000A"';
    case ppvideo.PP_VIDEOPROFILE_H264HIGH10PROFILE:
      return 'video/mp4; codecs="avc1.6E000A"';
    case ppvideo.PP_VIDEOPROFILE_H264HIGH422PROFILE:
      return 'video/mp4; codecs="avc1.7A000A"';
    case ppvideo.PP_VIDEOPROFILE_H264HIGH444PREDICTIVEPROFILE:
      return 'video/mp4; codecs="avc1.F4000A"';
    case ppvideo.PP_VIDEOPROFILE_H264SCALABLEBASELINE:
      return 'video/mp4; codecs="avc1.53000A"';
    case ppvideo.PP_VIDEOPROFILE_H264SCALABLEHIGH:
      return 'video/mp4; codecs="avc1.56000A"';
    case ppvideo.PP_VIDEOPROFILE_H264STEREOHIGH:
      return 'video/mp4; codecs="avc1.80000A"';
    case ppvideo.PP_VIDEOPROFILE_H264MULTIVIEWHIGH:
      return 'video/mp4; codecs="avc1.76000A"';
    case ppvideo.PP_VIDEOPROFILE_VP8_ANY:
      return 'video/webm; codecs="vorbis,vp8"';
    case ppvideo.PP_VIDEOPROFILE_VP9_ANY:
      return 'video/webm; codecs="vorbis,vp9"';
    }
  }

  var VideoDecoder_Initialize0_2 = function(video_decoder, graphics3d_context, profile, acceleration, callback_ptr) {
    return VideoDecoder_Initialize(video_decoder, graphics3d_context, profile, acceleration, 0, callback_ptr);
  }

  var VideoDecoder_Initialize = function(video_decoder, graphics3d_context, profile, acceleration, min_picture_count, callback_ptr) {
    var decoder = resources.resolve(video_decoder, VIDEO_RESOURCE);
    if (decoder.state === ppvideo.PP_VIDEO_INITIALIZE)
      return ppapi.PP_ERROR_INPROGRESS;
    if (decoder.state !== ppvideo.PP_VIDEO_CREATE)
      return ppapi.PP_ERROR_FAILED;
    if (profile < 0 || profile > ppvideo.PP_VIDEOPROFILE_MAX)
      return ppapi.PP_ERROR_BADARGUMENT;
    if (min_picture_count > ppvideo.kMaximumPictureCount)
      return ppapi.PP_ERROR_BADARGUMENT;
    var context = resources.resolve(graphics3d_context, GRAPHICS_3D_RESOURCE);
    if (context === undefined)
      return ppapi.PP_ERROR_BADRESOURCE;

    decoder.state = ppvideo.PP_VIDEO_INITIALIZE;
    decoder.decodeCallback = glue.getCompletionCallback(callback_ptr);

    decoder.decoder = new VideoDecoder(getMIMEType(profile), context.ctx,
      function(width, height) {
        decoder.rect.size.width = width;
        decoder.rect.size.height = height;
      }, function(buffer) {
        decoder.state = ppvideo.PP_VIDEO_READY;
        var callback = decoder.decodeCallback;
        if (callback) {
          decoder.decodeCallback = null;
          callback(ppapi.PP_OK);
        }
      }, function(texture) {
        decoder.pictures.push(texture);
        if (decoder.pictureCallback) {
          writePicture(decoder);
          var callback = decoder.pictureCallback;
          decoder.pictureCallback = null;
          callback(ppapi.PP_OK);
        }
      }, function() {
        decoder.state = PP_VIDEO_FINALIZE;
        if (decoder.pictureCallback) {
          var callback = decoder.pictureCallback;
          decoder.pictureCallback = null;
          callback(ppapi.PP_ERROR_ABORTED);
        }
        var callback = decoder.flushCallback;
        if (callback)
          decoder.flushCallback = null;
        else {
          callback = decoder.resetCallback;
          decoder.resetCallback = null;
        }
        callback(ppapi.PP_OK);
    });

    return ppapi.PP_OK_COMPLETIONPENDING;
  };

  var VideoDecoder_Decode = function(video_decoder, decode_id, size, buffer_ptr, callback_ptr) {
    var decoder = resources.resolve(video_decoder, VIDEO_RESOURCE);
    if (decoder.decodeCallback)
      return ppapi.PP_ERROR_INPROGRESS;
    else if (decoder.state != ppvideo.PP_VIDEO_READY || decoder.flushCallback)
      return ppapi.PP_ERROR_FAILED;

    decoder.decodeCallback = glue.getCompletionCallback(callback_ptr);
    decoder.decoder.addVideoStream(HEAPU8.subarray(buffer_ptr, buffer_ptr + size));
    return ppapi.PP_OK_COMPLETIONPENDING;
  };

  var writePicture = function(decoder) {
    var picture_ptr = decoder.picture_ptr;
    decoder.picture_ptr = null;
    var picture = decoder.pictures.shift();
    setValue(picture_ptr, 0, 'i32');
    setValue(picture_ptr+4, resources.register(TEXTURE_RESOURCE, {native: picture}), 'i32');
    setValue(picture_ptr+8, WebGLRenderingContext.TEXTURE_2D, 'i32');
    glue.setSize(decoder.rect.size, picture+12);
    glue.setRect(decoder.rect, picture+20);
  };

  var VideoDecoder_GetPicture = function(video_decoder, picture_ptr, callback_ptr) {
    var decoder = resources.resolve(video_decoder, VIDEO_RESOURCE);
    if (decoder.pictureCallback)
      return ppapi.PP_ERROR_INPROGRESS;
    else if (decoder.state != ppvideo.PP_VIDEO_READY)
      return ppapi.PP_ERROR_FAILED;

    decoder.picture_ptr = picture_ptr;
    if (decoder.pictures.length) {
      writePicture(decoder);
      return ppapi.PP_OK;
    }

    decoder.pictureCallback = glue.getCompletionCallback(callback_ptr);
  };

  var VideoDecoder_RecyclePicture = function(video_decoder, picture_ptr) {
    var decoder = resources.resolve(video_decoder, VIDEO_RESOURCE);
    var texture = resources.resolve(getValue(picture_ptr+4, 'i32'), TEXTURE_RESOURCE);
    decoder.decoder.recycleTexture(texture.native);
  };

  var VideoDecoder_Flush = function(video_decoder, callback_ptr) {
    var decoder = resources.resolve(video_decoder, VIDEO_RESOURCE);
    if (decoder.flushCallback)
      return ppapi.PP_ERROR_INPROGRESS;
    else if (decoder.state != ppvideo.PP_VIDEO_READY)
      return ppapi.PP_ERROR_FAILED;

    decoder.flushCallback = glue.getCompletionCallback(callback_ptr);
    decoder.decoder.endOfVideoStream();
  };

  var VideoDecoder_Reset = function(video_decoder, callback_ptr) {
    var decoder = resources.resolve(video_decoder, VIDEO_RESOURCE);
    if (decoder.resetCallback)
      return ppapi.PP_ERROR_INPROGRESS;
    else if (decoder.flushCallback || decoder.state != ppvideo.PP_VIDEO_READY)
      return ppapi.PP_ERROR_FAILED;

    decoder.state = ppvideo.PP_VIDEO_FINALIZE;
    decoder.resetCallback = glue.getCompletionCallback(callback_ptr);
    decoder.decoder.close();
  };

  registerInterface("PPB_VideoDecoder;1.1", [
    VideoDecoder_Create,
    VideoDecoder_IsVideoDecoder,
    VideoDecoder_Initialize,
    VideoDecoder_Decode,
    VideoDecoder_GetPicture,
    VideoDecoder_RecyclePicture,
    VideoDecoder_Flush,
    VideoDecoder_Reset
  ]);

  registerInterface("PPB_VideoDecoder;1.0", [
    VideoDecoder_Create,
    VideoDecoder_IsVideoDecoder,
    VideoDecoder_Initialize,
    VideoDecoder_Decode,
    VideoDecoder_GetPicture,
    VideoDecoder_RecyclePicture,
    VideoDecoder_Flush,
    VideoDecoder_Reset
  ]);

})();
