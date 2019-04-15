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

#ifndef VIDEO_DECODE_PERFORMANCE_VIDEO_DECODE_INSTANCE_H_
#define VIDEO_DECODE_PERFORMANCE_VIDEO_DECODE_INSTANCE_H_

#include <GLES2/gl2.h>
#include <GLES2/gl2ext.h>

#include <memory>
#include <queue>
#include <thread>

#include "ppapi/c/pp_codecs.h"
#include "ppapi/c/pp_time.h"

#include "ppapi/cpp/graphics_3d_client.h"
#include "ppapi/cpp/input_event.h"
#include "ppapi/cpp/instance.h"
#include "ppapi/cpp/module.h"
#include "ppapi/c/ppb_opengles2.h"
#include "ppapi/cpp/size.h"
#include "ppapi/cpp/rect.h"
#include "ppapi/cpp/text_input_controller.h"
#include "ppapi/utility/completion_callback_factory.h"

#include "video_data.h"

class Decoder;

class VideoDecodeInstance : public pp::Instance,
                                       public pp::Graphics3DClient {
 public:
  VideoDecodeInstance(PP_Instance instance, pp::Module* module);
  ~VideoDecodeInstance() override;

  // pp::Instance implementation.
  void DidChangeView(const pp::Rect& position,
                     const pp::Rect& clip_ignored) override;
  bool HandleInputEvent(const pp::InputEvent& event) override;
  bool Init(uint32_t, const char**, const char**) override;

  // pp::Graphics3DClient implementation.
  void Graphics3DContextLost() override;

  void PaintPicture(const PP_VideoPicture& picture);
  void ResetTimers();

 private:
  struct Shader {
    Shader() : program(0), texcoord_scale_location(0) {}
    ~Shader() {}

    GLuint program;
    GLint texcoord_scale_location;
  };

  struct ThreadDeleter {
    void operator()(std::thread* x) const {
      if (x && x->joinable())
        x->join();
      delete x;
    }
  };

  struct PendingPicture {
    explicit PendingPicture(const PP_VideoPicture& picture)
        : picture(picture) {}

    PP_VideoPicture picture;
  };

  class MountVideoDir {
   public:
    MountVideoDir(const std::string& path, const std::string& mountpoint);
    ~MountVideoDir();
    bool IsMounted() const { return result_ == 0; }
   private:
    std::string mountpoint_;
    int result_;
  };

  void ConfigureDecoder();
  void ResetDecoder(int32_t);

  // GL-related functions.
  void InitGL();
  void CreateGLObjects();
  void Create2DProgramOnce();
  void CreateRectangleARBProgramOnce();
  void CreateExternalOESProgramOnce();
  Shader CreateProgram(const char* vertex_shader, const char* fragment_shader);
  void CreateShader(GLuint program, GLenum type, const char* source, int size);
  void PaintNextPicture();
  void PaintFinished(int32_t result);

  void ReadMovieContent(pp::CompletionCallback);

  void SwitchVideoDecoder();
  void SetVideoResolution(int video_resolution);

  pp::Size plugin_size_;
  pp::TextInputController text_input_controller_;
  bool is_painting_;
  bool require_paint_;
  bool is_resetting_decoder_;
  std::unique_ptr<std::thread, ThreadDeleter> video_loading_thread_;
  // This field needs to be initialized after nacl_io_init_ppapi method
  std::unique_ptr<MountVideoDir> mount_video_dir_;

  // When decode outpaces render, we queue up decoded pictures for later
  // painting.
  typedef std::queue<PendingPicture> PendingPictureQueue;
  PendingPictureQueue pending_pictures_;

  int num_frames_rendered_;
  PP_TimeTicks first_frame_delivered_ticks_;
  PP_TimeTicks last_swap_request_ticks_;
  PP_TimeTicks previous_swap_request_ticks_;
  PP_TimeTicks swap_ticks_;
  pp::CompletionCallbackFactory<VideoDecodeInstance> callback_factory_;

  // Unowned pointers.
  const PPB_Core* core_if_;
  const PPB_OpenGLES2* gles2_if_;

  // Owned data.
  std::unique_ptr<pp::Graphics3D> context_;
  std::unique_ptr<Decoder> video_decoder_;
  std::shared_ptr<VideoData> video_data_;

  // Shader program to draw GL_TEXTURE_2D target.
  Shader shader_2d_;
  // Shader program to draw GL_TEXTURE_RECTANGLE_ARB target.
  Shader shader_rectangle_arb_;
  // Shader program to draw GL_TEXTURE_EXTERNAL_OES target.
  Shader shader_external_oes_;
};

#endif  // VIDEO_DECODE_PERFORMANCE_VIDEO_DECODE_INSTANCE_H_
