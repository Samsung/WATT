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

#include "decoder.h"

#include <assert.h>

#include "ppapi/cpp/module.h"
//#include "log_ppbconsole.h"

#include "video_decode_instance.h"

namespace {

#if defined USE_VP8_TESTDATA_INSTEAD_OF_H264
// VP8 is stored in an IVF container.
// Helpful description: http://wiki.multimedia.cx/index.php?title=IVF

void GetNextFrame(size_t* start_pos, size_t* end_pos,
                  const std::vector<char>& video_data) {
  size_t current_pos = *start_pos;
  if (current_pos == 0)
    current_pos = 32;  // Skip stream header.
  uint32_t frame_size = video_data[current_pos] +
      (video_data[current_pos + 1] << 8) +
      (video_data[current_pos + 2] << 16) +
      (video_data[current_pos + 3] << 24);
  current_pos += 12;  // Skip frame header.
  *start_pos = current_pos;
  *end_pos = current_pos + frame_size;
}
#else  // !USE_VP8_TESTDATA_INSTEAD_OF_H264
// Returns true if the current position is at the start of a NAL unit.
bool LookingAtNAL(const char* encoded, size_t pos, size_t size) {
  // H264 frames start with 0, 0, 0, 1 in our test data.
  return pos + 3 < size &&
         encoded[pos] == 0 && encoded[pos + 1] == 0 &&
         encoded[pos + 2] == 0 && encoded[pos + 3] == 1;
}

void GetNextFrame(size_t* start_pos, size_t* end_pos,
                  const std::vector<char>& video_data) {
  bool result = LookingAtNAL(video_data.data(), *start_pos, video_data.size());
  assert(result);
  *end_pos = *start_pos;
  *end_pos += 4;
  while (*end_pos < video_data.size() &&
         !LookingAtNAL(video_data.data(), *end_pos, video_data.size())) {
    ++*end_pos;
  }
}
#endif  // USE_VP8_TESTDATA_INSTEAD_OF_H264

}  // namespace

Decoder::Decoder(VideoDecodeInstance* instance,
                 const pp::Graphics3D& graphics_3d,
                 std::shared_ptr<VideoData> video_data)
    : instance_(instance),
      video_data_(video_data),
      decoder_(new pp::VideoDecoder(instance)),
      callback_factory_(this),
      encoded_data_next_pos_to_decode_(0),
      next_picture_id_(0),
      total_latency_(0.0),
      num_pictures_(0) {
  core_ = pp::Module::Get()->core();

#if defined USE_VP8_TESTDATA_INSTEAD_OF_H264
  const PP_VideoProfile kBitstreamProfile = PP_VIDEOPROFILE_VP8_ANY;
#else
  const PP_VideoProfile kBitstreamProfile = PP_VIDEOPROFILE_H264MAIN;
#endif

  assert(!decoder_->is_null());
  decoder_->Initialize(graphics_3d,
                       kBitstreamProfile,
                       (video_data_->GetDecoderType()
                           == kHardwareVideoDecoder
                           ? PP_HARDWAREACCELERATION_ONLY
                           : PP_HARDWAREACCELERATION_NONE),
                       0,
                       callback_factory_.NewCallback(&Decoder::InitializeDone));
}

void Decoder::InitializeDone(int32_t result) {
  assert(decoder_);
  if (result != PP_OK)
    return;
  Start();
}

void Decoder::Start() {
  assert(decoder_);

  encoded_data_next_pos_to_decode_ = 0;

  // Register callback to get the first picture. We call GetPicture again in
  // PictureReady to continuously receive pictures as they're decoded.
  decoder_->GetPicture(
      callback_factory_.NewCallbackWithOutput(&Decoder::PictureReady));

  // Start the decode loop.
  DecodeNextFrame();
}

void Decoder::RecyclePicture(const PP_VideoPicture& picture) {
  assert(decoder_);
  decoder_->RecyclePicture(picture);
}

void Decoder::DecodeNextFrame() {
  assert(decoder_);
  if (encoded_data_next_pos_to_decode_
      <= video_data_->GetVideoData().size()) {

    // Find the start of the next frame.
    size_t start_pos = encoded_data_next_pos_to_decode_ %
                       video_data_->GetVideoData().size();
    size_t end_pos;
    GetNextFrame(&start_pos, &end_pos, video_data_->GetVideoData());
    encoded_data_next_pos_to_decode_ = end_pos;
    // Decode the frame. On completion, DecodeDone will call DecodeNextFrame
    // to implement a decode loop.
    uint32_t size = static_cast<uint32_t>(end_pos - start_pos);
    decode_time_[next_picture_id_ % kMaxDecodeDelay] = core_->GetTimeTicks();
    decoder_->Decode(next_picture_id_++,
                     size,
                     video_data_->GetVideoData().data() + start_pos,
                     callback_factory_.NewCallback(&Decoder::DecodeDone));
  }
}

void Decoder::DecodeDone(int32_t result) {
  assert(decoder_);
  // Break out of the decode loop on abort.
  if (result == PP_ERROR_ABORTED)
    return;
  assert(result == PP_OK);
  DecodeNextFrame();
}

void Decoder::PictureReady(int32_t result, PP_VideoPicture picture) {
  assert(decoder_);
  // Break out of the get picture loop on abort.
  if (result == PP_ERROR_ABORTED)
    return;
  assert(result == PP_OK);

  num_pictures_++;
  PP_TimeTicks latency = core_->GetTimeTicks() -
                         decode_time_[picture.decode_id % kMaxDecodeDelay];
  total_latency_ += latency;

  decoder_->GetPicture(
      callback_factory_.NewCallbackWithOutput(&Decoder::PictureReady));
  instance_->PaintPicture(picture);
}
