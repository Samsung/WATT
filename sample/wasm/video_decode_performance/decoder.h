/*
 * Copyright (c) 2017 Samsung Electronics, Visual Display Division.
 * All Rights Reserved.
 *
 * @author  Michal Jurkiewicz <m.jurkiewicz@samsung.com>
 *
 * This source code is written basing on the Chromium source code.
 *
 * Copyright (c) 2014 The Chromium Authors. All rights reserved.
 *
 * Use of this source code is governed by a BSD-style license that can be
 * found in the Chromium-LICENSE file.
 */

#ifndef VIDEO_DECODE_PERFORMANCE_DECODER_H_
#define VIDEO_DECODE_PERFORMANCE_DECODER_H_


#include "ppapi/cpp/video_decoder.h"
#include "ppapi/utility/completion_callback_factory.h"

#include "video_data.h"

class VideoDecodeInstance;

class Decoder {
 public:
  Decoder(VideoDecodeInstance* instance, const pp::Graphics3D& graphics_3d,
          std::shared_ptr<VideoData> video_data);

  void RecyclePicture(const PP_VideoPicture& picture);

  PP_TimeTicks GetAverageLatency() {
    return num_pictures_ ? total_latency_ / num_pictures_ : 0;
  }

 private:
  void InitializeDone(int32_t result);
  void Start();
  void DecodeNextFrame();
  void DecodeDone(int32_t result);
  void PictureReady(int32_t result, PP_VideoPicture picture);
  void FlushDone(int32_t result);
  void ResetDone(int32_t result);

  VideoDecodeInstance* instance_;

  std::shared_ptr<VideoData> video_data_;
  std::unique_ptr<pp::VideoDecoder> decoder_;
  pp::CompletionCallbackFactory<Decoder> callback_factory_;

  size_t encoded_data_next_pos_to_decode_;
  int next_picture_id_;

  pp::Core* core_;
  static const int kMaxDecodeDelay = 128;
  PP_TimeTicks decode_time_[kMaxDecodeDelay];
  PP_TimeTicks total_latency_;
  int num_pictures_;
};

#endif /* VIDEO_DECODE_PERFORMANCE_DECODER_H_ */
