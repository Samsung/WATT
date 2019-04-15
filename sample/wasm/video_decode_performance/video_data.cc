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

#include "video_data.h"

VideoData::VideoData(VideoDecoderType decoder_type,
                                       VideoResolution video_resolution)
    : decoder_type_(decoder_type),
      video_resolution_(video_resolution) {
}

void VideoData::SetDecoderType(VideoDecoderType decoder_type) {
  decoder_type_ = decoder_type;
}

void VideoData::SetVideoData(std::vector<char>&& video_data) {
  video_data_ = std::move(video_data);
}
