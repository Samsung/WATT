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

#ifndef VIDEO_DECODE_PERFORMANCE_VIDEO_DATA_H_
#define VIDEO_DECODE_PERFORMANCE_VIDEO_DATA_H_

#include <vector>

typedef enum {
  kHardwareVideoDecoder = 0,
  kSoftwareVideoDecoder,
} VideoDecoderType;

typedef enum {
  kVideoResolutionMin = 0,
  k180pVideo = kVideoResolutionMin,
  k360pVideo,
  k720pVideo,
  k1080pVideo,
  kVideoResolutionMax = k1080pVideo,
  kVideoResolutionsSize
} VideoResolution;

class VideoData {
 public:
  VideoData(VideoDecoderType decoder_type, VideoResolution video_resolution);

  void SetDecoderType(VideoDecoderType);
  void SetVideoData(std::vector<char>&& video_data);
  bool IsMovieLoaded() const { return !video_data_.empty(); }
  const std::vector<char>& GetVideoData() const { return video_data_; }
  VideoDecoderType GetDecoderType() const { return decoder_type_; }
  VideoResolution GetVideoResolution() const { return video_resolution_; }
 private:
  std::vector<char> video_data_;
  VideoDecoderType decoder_type_;
  VideoResolution video_resolution_;
};

#endif  // VIDEO_DECODE_PERFORMANCE_VIDEO_DATA_H_
