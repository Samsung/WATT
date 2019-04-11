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

#include "video_decode_instance.h"

#include <sys/mount.h>

#include <algorithm>
#include <fstream>
#include <sstream>
#include <string>

#include "nacl_io/nacl_io.h"
#include "ppapi/c/pp_errors.h"
#include "ppapi/cpp/graphics_3d.h"
#include "ppapi/cpp/message_loop.h"

#include "decoder.h"
//#include "log_ppbconsole.h"

// Use assert as a poor-man's CHECK, even in non-debug mode.
// Since <assert.h> redefines assert on every inclusion (it doesn't use
// include-guards), make sure this is the last file #include'd in this file.
#undef NDEBUG
#include <assert.h>

// Assert |context_| isn't holding any GL Errors.  Done as a macro instead of a
// function to preserve line number information in the failure message.
#define assertNoGLError() assert(!gles2_if_->GetError(context_->pp_resource()));

class LOGC_NF {
public:
  LOGC_NF(VideoDecodeInstance*) {}
  ~LOGC_NF() {
    //std::cout << std::endl;
  }
  template<class T> LOGC_NF& operator<<(const T& log) {
    //std::cout << log;
    return *this;
  }
};

namespace {

const int kSwitchVideoDecoderKey = 13;  // Enter
const int kLowerResolutionKey = 37;  // Left arrow
const int kHigherResolutionKey = 39;  // Right arrow
const int kFpsCountInterval = 50;

const std::string kVideoNames[] = { "180p",
                                    "360p",
                                    "720p",
                                    "1080p"
                                  };

VideoResolution ClipVideoResolutionRanges(int video_resolution) {
  return static_cast<VideoResolution>(std::max(std::min(video_resolution,
                                      static_cast<int>(kVideoResolutionMax)),
                                      static_cast<int>(kVideoResolutionMin)));
}

}  // namespace

VideoDecodeInstance::VideoDecodeInstance(PP_Instance instance, pp::Module*)
    : pp::Instance(instance),
      pp::Graphics3DClient(this),
      text_input_controller_(this),
      is_painting_(false),
      require_paint_(false),
      is_resetting_decoder_(false),
      num_frames_rendered_(0),
      first_frame_delivered_ticks_(-1),
      last_swap_request_ticks_(-1),
      previous_swap_request_ticks_(-1),
      swap_ticks_(0),
      callback_factory_(this) {
  core_if_ = static_cast<const PPB_Core*>(
      pp::Module::Get()->GetBrowserInterface(PPB_CORE_INTERFACE));
  gles2_if_ = static_cast<const PPB_OpenGLES2*>(
      pp::Module::Get()->GetBrowserInterface(PPB_OPENGLES2_INTERFACE));

  text_input_controller_.SetTextInputType(PP_TEXTINPUT_TYPE_NONE);

#ifdef __EMSCRIPTEN__
  video_data_.reset(new VideoData{kHardwareVideoDecoder, k720pVideo});
#else
  video_data_.reset(new VideoData{kHardwareVideoDecoder, kVideoResolutionMax});
#endif

  RequestInputEvents(PP_INPUTEVENT_CLASS_MOUSE);
  RequestFilteringInputEvents(PP_INPUTEVENT_CLASS_KEYBOARD);
}

VideoDecodeInstance::~VideoDecodeInstance() {
  if (!context_)
    return;

  PP_Resource graphics_3d = context_->pp_resource();
  if (shader_2d_.program)
    gles2_if_->DeleteProgram(graphics_3d, shader_2d_.program);
  if (shader_rectangle_arb_.program)
    gles2_if_->DeleteProgram(graphics_3d, shader_rectangle_arb_.program);
  if (shader_external_oes_.program)
    gles2_if_->DeleteProgram(graphics_3d, shader_external_oes_.program);
}

VideoDecodeInstance::MountVideoDir::MountVideoDir(const std::string& path,
                             const std::string& mountpoint)
    : mountpoint_(mountpoint) {
#ifdef __EMSCRIPTEN__
  result_ = 0;
#else
  result_ = mount(path.c_str(), mountpoint_.c_str(), "httpfs", 0, "");
#endif
}

VideoDecodeInstance::MountVideoDir::~MountVideoDir() {
  if (IsMounted())
    umount(mountpoint_.c_str());
}

void VideoDecodeInstance::Graphics3DContextLost() {
  // TODO(vrk/fischman): Properly reset after a lost graphics context.  In
  // particular need to delete context_ and re-create textures.
  // Probably have to recreate the decoder from scratch, because old textures
  // can still be outstanding in the decoder!
  assert(false && "Unexpectedly lost graphics context");
}

void VideoDecodeInstance::DidChangeView(const pp::Rect& position,
                               const pp::Rect& /* clip_ignored */) {
  if (position.width() == 0 || position.height() == 0)
    return;
  if (plugin_size_.width()) {
    assert(position.size() == plugin_size_);
    return;
  }
  plugin_size_ = position.size();

  // Initialize graphics.
  InitGL();
}

bool VideoDecodeInstance::HandleInputEvent(const pp::InputEvent& event) {
  switch (event.GetType()) {
  case PP_INPUTEVENT_TYPE_MOUSEDOWN: {
#ifdef __EMSCRIPTEN__
    pp::MouseInputEvent mouse_event(event);
    if (mouse_event.GetButton() == PP_INPUTEVENT_MOUSEBUTTON_LEFT)
      SetVideoResolution(video_data_->GetVideoResolution() - 1);
    else
      SetVideoResolution(video_data_->GetVideoResolution() + 1);
#else
    SwitchVideoDecoder();
#endif
    break;
  }
  case PP_INPUTEVENT_TYPE_KEYDOWN: {
    pp::KeyboardInputEvent key_event(event);
    switch (key_event.GetKeyCode()) {
    case kSwitchVideoDecoderKey:
      SwitchVideoDecoder();
      break;
    case kLowerResolutionKey:
      SetVideoResolution(video_data_->GetVideoResolution() - 1);
      break;
    case kHigherResolutionKey:
      SetVideoResolution(video_data_->GetVideoResolution() + 1);
      break;
    }
    break;
  }
  default:
    break;
  }

  return true;
}

void VideoDecodeInstance::SetVideoResolution(int video_resolution) {
  auto new_video_resolution = ClipVideoResolutionRanges(video_resolution);
  if (new_video_resolution == video_data_->GetVideoResolution()) {
    LOGC_NF(this) << "No change of video resolution needed.";
    return;
  }

  if (is_resetting_decoder_)
    return;

  LOGC_NF(this) << "Loading video with resolution "
                << kVideoNames[new_video_resolution];

  video_data_.reset(new VideoData{video_data_->GetDecoderType(),
                                  new_video_resolution});

  ConfigureDecoder();
}

void VideoDecodeInstance::SwitchVideoDecoder() {
  if (is_resetting_decoder_)
    return;

  VideoDecoderType new_video_decoder_type;

  if (video_data_->GetDecoderType() == kHardwareVideoDecoder) {
    new_video_decoder_type = kSoftwareVideoDecoder;
  } else {
    new_video_decoder_type = kHardwareVideoDecoder;
  }

  video_data_->SetDecoderType(new_video_decoder_type);
  ConfigureDecoder();
}

void VideoDecodeInstance::ConfigureDecoder() {
  is_resetting_decoder_ = true;
  if (video_data_->IsMovieLoaded()) {
    ResetDecoder(PP_OK);
    return;
  }

  if (!mount_video_dir_->IsMounted()) {
    LOGC_NF(this) << "Video dir not mounted. Could not load video.";
    is_resetting_decoder_ = false;
    return;
  }

  auto start_decoder =
      callback_factory_.NewCallback(&VideoDecodeInstance::ResetDecoder);
#ifdef __EMSCRIPTEN__
  ReadMovieContent(start_decoder);
#else
  video_loading_thread_.reset(new std::thread([this, start_decoder]() {
                                  ReadMovieContent(start_decoder);
                              }));
#endif
  }

void VideoDecodeInstance::ResetDecoder(int32_t) {
  LOGC_NF(this) << "Starting " << (video_data_->GetDecoderType()
                                     == kHardwareVideoDecoder ?
                                     "Hardware" : "Software")
                << " Video Decoding with video: "
                << kVideoNames[video_data_->GetVideoResolution()];

  ResetTimers();
  while (!pending_pictures_.empty())
    pending_pictures_.pop();

  // Currently only one instance of Hardware Video Decoder is possible
  // to be run. We need to reset owned pointer first.
  video_decoder_.reset();
  video_decoder_.reset(new Decoder(this, *context_, video_data_));
  is_resetting_decoder_ = false;
}

void VideoDecodeInstance::PaintPicture(const PP_VideoPicture& picture) {
  if (first_frame_delivered_ticks_ == -1)
    first_frame_delivered_ticks_ = core_if_->GetTimeTicks();

  assert(first_frame_delivered_ticks_ != -1);

  if (previous_swap_request_ticks_ == -1)
    previous_swap_request_ticks_ = core_if_->GetTimeTicks();

  assert(previous_swap_request_ticks_ != -1);

  pending_pictures_.push(PendingPicture(picture));
  if (!is_painting_)
    PaintNextPicture();
  else
    require_paint_ = true;
}

void VideoDecodeInstance::PaintNextPicture() {
  assert(!is_painting_);
  is_painting_ = true;
  require_paint_ = false;

  const PendingPicture& next = pending_pictures_.front();
  const PP_VideoPicture& picture = next.picture;

  PP_Resource graphics_3d = context_->pp_resource();
  if (picture.texture_target == GL_TEXTURE_2D) {
    Create2DProgramOnce();
    gles2_if_->UseProgram(graphics_3d, shader_2d_.program);
    gles2_if_->Uniform2f(
        graphics_3d, shader_2d_.texcoord_scale_location, 1.0, 1.0);
  } else if (picture.texture_target == GL_TEXTURE_RECTANGLE_ARB) {
    CreateRectangleARBProgramOnce();
    gles2_if_->UseProgram(graphics_3d, shader_rectangle_arb_.program);
    gles2_if_->Uniform2f(graphics_3d,
                         shader_rectangle_arb_.texcoord_scale_location,
                         picture.texture_size.width,
                         picture.texture_size.height);
  } else {
    assert(picture.texture_target == GL_TEXTURE_EXTERNAL_OES);
    CreateExternalOESProgramOnce();
    gles2_if_->UseProgram(graphics_3d, shader_external_oes_.program);
    gles2_if_->Uniform2f(
        graphics_3d, shader_external_oes_.texcoord_scale_location, 1.0, 1.0);
  }

  gles2_if_->Viewport(graphics_3d, 0, 0, plugin_size_.width(),
                      plugin_size_.height());
  gles2_if_->ActiveTexture(graphics_3d, GL_TEXTURE0);
  gles2_if_->BindTexture(
      graphics_3d, picture.texture_target, picture.texture_id);
  gles2_if_->DrawArrays(graphics_3d, GL_TRIANGLE_STRIP, 0, 4);

  gles2_if_->UseProgram(graphics_3d, 0);

  last_swap_request_ticks_ = core_if_->GetTimeTicks();
  context_->SwapBuffers(
      callback_factory_.NewCallback(&VideoDecodeInstance::PaintFinished));
}

void VideoDecodeInstance::PaintFinished(int32_t result) {
  assert(result == PP_OK);
  swap_ticks_ += core_if_->GetTimeTicks() - last_swap_request_ticks_;
  is_painting_ = false;
  ++num_frames_rendered_;
  if (num_frames_rendered_ % kFpsCountInterval == 0
      && !is_resetting_decoder_) {
    double elapsed = core_if_->GetTimeTicks() - first_frame_delivered_ticks_;
    double elapsed_previous = core_if_->GetTimeTicks() -
                              previous_swap_request_ticks_;
    double fps = (elapsed > 0) ? num_frames_rendered_ / elapsed : 1000;
    double fps_current = (elapsed_previous > 0) ?
                          kFpsCountInterval / elapsed_previous : 1000;
    LOGC_NF(this) << (video_data_->GetDecoderType()
                        == kHardwareVideoDecoder
                          ? "HARDWARE" : "SOFTWARE")
                  << " VIDEO DECODER ("
                  << kVideoNames[video_data_->GetVideoResolution()]
                  << "). FPS: " << fps_current << " (for last "
                  << kFpsCountInterval
                  << " frames). Average FPS: " << fps;
    std::stringstream ss;
    ss << "Decoder: "
       << (video_data_->GetDecoderType() == kHardwareVideoDecoder
              ? "HARDWARE" : "SOFTWARE") << std::endl;
    ss << "Resolution: " << kVideoNames[video_data_->GetVideoResolution()]
       << std::endl;
    ss << "Frames rendered: " << num_frames_rendered_ << std::endl;
    ss << "Current FPS: " << fps_current << std::endl;
    ss << "Average FPS: " << fps;
    PostMessage(pp::Var(ss.str()));
    previous_swap_request_ticks_ = core_if_->GetTimeTicks();
  }

  // If the decoders were reset, this will be empty.
  if (pending_pictures_.empty())
    return;

  const PendingPicture& next = pending_pictures_.front();
  const PP_VideoPicture& picture = next.picture;
  video_decoder_->RecyclePicture(picture);
  pending_pictures_.pop();

  // Keep painting as long as we have pictures.
  if (!pending_pictures_.empty())
    PaintNextPicture();

  if (require_paint_)
    PaintNextPicture();
}

void VideoDecodeInstance::InitGL() {
  assert(plugin_size_.width() && plugin_size_.height());
  is_painting_ = false;

  assert(!context_);
  int32_t context_attributes[] = {
      PP_GRAPHICS3DATTRIB_ALPHA_SIZE,     8,
      PP_GRAPHICS3DATTRIB_BLUE_SIZE,      8,
      PP_GRAPHICS3DATTRIB_GREEN_SIZE,     8,
      PP_GRAPHICS3DATTRIB_RED_SIZE,       8,
      PP_GRAPHICS3DATTRIB_DEPTH_SIZE,     0,
      PP_GRAPHICS3DATTRIB_STENCIL_SIZE,   0,
      PP_GRAPHICS3DATTRIB_SAMPLES,        0,
      PP_GRAPHICS3DATTRIB_SAMPLE_BUFFERS, 0,
      PP_GRAPHICS3DATTRIB_WIDTH,          plugin_size_.width(),
      PP_GRAPHICS3DATTRIB_HEIGHT,         plugin_size_.height(),
      PP_GRAPHICS3DATTRIB_NONE,
  };
  context_.reset(new pp::Graphics3D(this, context_attributes));
  assert(!context_->is_null());
  assert(BindGraphics(*context_));

  // Clear color bit.
  gles2_if_->ClearColor(context_->pp_resource(), 1, 0, 0, 1);
  gles2_if_->Clear(context_->pp_resource(), GL_COLOR_BUFFER_BIT);

  assertNoGLError();

  CreateGLObjects();
}

void VideoDecodeInstance::CreateGLObjects() {
  // Assign vertex positions and texture coordinates to buffers for use in
  // shader program.
  static const float kVertices[] = {
      -1, -1, -1, 1, 1, -1, 1, 1,  // Position coordinates.
      0,  1,  0,  0, 1, 1,  1, 0,  // Texture coordinates.
  };

  GLuint buffer;
  gles2_if_->GenBuffers(context_->pp_resource(), 1, &buffer);
  gles2_if_->BindBuffer(context_->pp_resource(), GL_ARRAY_BUFFER, buffer);

  gles2_if_->BufferData(context_->pp_resource(),
                        GL_ARRAY_BUFFER,
                        sizeof(kVertices),
                        kVertices,
                        GL_STATIC_DRAW);
  assertNoGLError();
}

static const char kVertexShader[] =
    "varying vec2 v_texCoord;            \n"
    "attribute vec4 a_position;          \n"
    "attribute vec2 a_texCoord;          \n"
    "uniform vec2 v_scale;               \n"
    "void main()                         \n"
    "{                                   \n"
    "    v_texCoord = v_scale * a_texCoord; \n"
    "    gl_Position = a_position;       \n"
    "}";

void VideoDecodeInstance::Create2DProgramOnce() {
  if (shader_2d_.program)
    return;
  static const char kFragmentShader2D[] =
      "precision mediump float;            \n"
      "varying vec2 v_texCoord;            \n"
      "uniform sampler2D s_texture;        \n"
      "void main()                         \n"
      "{"
      "    gl_FragColor = texture2D(s_texture, v_texCoord); \n"
      "}";
  shader_2d_ = CreateProgram(kVertexShader, kFragmentShader2D);
  assertNoGLError();
}

void VideoDecodeInstance::CreateRectangleARBProgramOnce() {
  if (shader_rectangle_arb_.program)
    return;
  static const char kFragmentShaderRectangle[] =
      "#extension GL_ARB_texture_rectangle : require\n"
      "precision mediump float;            \n"
      "varying vec2 v_texCoord;            \n"
      "uniform sampler2DRect s_texture;    \n"
      "void main()                         \n"
      "{"
      "    gl_FragColor = texture2DRect(s_texture, v_texCoord).rgba; \n"
      "}";
  shader_rectangle_arb_ =
      CreateProgram(kVertexShader, kFragmentShaderRectangle);
  assertNoGLError();
}

void VideoDecodeInstance::CreateExternalOESProgramOnce() {
  if (shader_external_oes_.program)
    return;
  static const char kFragmentShaderExternal[] =
      "#extension GL_OES_EGL_image_external : require\n"
      "precision mediump float;            \n"
      "varying vec2 v_texCoord;            \n"
      "uniform samplerExternalOES s_texture; \n"
      "void main()                         \n"
      "{"
      "    gl_FragColor = texture2D(s_texture, v_texCoord); \n"
      "}";
  shader_external_oes_ = CreateProgram(kVertexShader, kFragmentShaderExternal);
  assertNoGLError();
}

VideoDecodeInstance::Shader VideoDecodeInstance::CreateProgram(
    const char* vertex_shader,
    const char* fragment_shader) {
  Shader shader;

  // Create shader program.
  shader.program = gles2_if_->CreateProgram(context_->pp_resource());
  CreateShader(
      shader.program, GL_VERTEX_SHADER, vertex_shader, strlen(vertex_shader));
  CreateShader(shader.program,
               GL_FRAGMENT_SHADER,
               fragment_shader,
               strlen(fragment_shader));
  gles2_if_->LinkProgram(context_->pp_resource(), shader.program);
  gles2_if_->UseProgram(context_->pp_resource(), shader.program);
  gles2_if_->Uniform1i(
      context_->pp_resource(),
      gles2_if_->GetUniformLocation(
          context_->pp_resource(), shader.program, "s_texture"),
      0);
  assertNoGLError();

  shader.texcoord_scale_location = gles2_if_->GetUniformLocation(
      context_->pp_resource(), shader.program, "v_scale");

  GLint pos_location = gles2_if_->GetAttribLocation(
      context_->pp_resource(), shader.program, "a_position");
  GLint tc_location = gles2_if_->GetAttribLocation(
      context_->pp_resource(), shader.program, "a_texCoord");
  assertNoGLError();

  gles2_if_->EnableVertexAttribArray(context_->pp_resource(), pos_location);
  gles2_if_->VertexAttribPointer(
      context_->pp_resource(), pos_location, 2, GL_FLOAT, GL_FALSE, 0, 0);
  gles2_if_->EnableVertexAttribArray(context_->pp_resource(), tc_location);
  gles2_if_->VertexAttribPointer(
      context_->pp_resource(),
      tc_location,
      2,
      GL_FLOAT,
      GL_FALSE,
      0,
      static_cast<float*>(0) + 8);  // Skip position coordinates.

  gles2_if_->UseProgram(context_->pp_resource(), 0);
  assertNoGLError();
  return shader;
}

void VideoDecodeInstance::CreateShader(GLuint program,
                              GLenum type,
                              const char* source,
                              int size) {
  GLuint shader = gles2_if_->CreateShader(context_->pp_resource(), type);
  gles2_if_->ShaderSource(context_->pp_resource(), shader, 1, &source, &size);
  gles2_if_->CompileShader(context_->pp_resource(), shader);
  gles2_if_->AttachShader(context_->pp_resource(), program, shader);
  gles2_if_->DeleteShader(context_->pp_resource(), shader);
}

void VideoDecodeInstance::ReadMovieContent(
    pp::CompletionCallback start_decoder) {
  std::string video_path
    = "/h264/" + kVideoNames[video_data_->GetVideoResolution()] +
      ".h264";
  std::ifstream t(video_path);
#ifdef __EMSCRIPTEN__
  std::vector<char> content{std::istreambuf_iterator<char>(t), {}};
  video_data_->SetVideoData(std::forward<std::vector<char>>(content));
  core_if_->CallOnMainThread(0, start_decoder.pp_completion_callback(), PP_OK);
#else
  video_data_->SetVideoData(
      std::vector<char>{std::istreambuf_iterator<char>(t), {}});
  pp::MessageLoop::GetForMainThread().PostWork(start_decoder, PP_OK);
#endif
}

bool VideoDecodeInstance::Init(uint32_t, const char**, const char**) {
#ifndef __EMSCRIPTEN__
  nacl_io_init_ppapi(pp_instance(),
                     pp::Module::Get()->get_browser_interface());
#endif
  mount_video_dir_.reset(new MountVideoDir{"h264", "/h264"});
  ConfigureDecoder();
  return true;
}

void VideoDecodeInstance::ResetTimers() {
  num_frames_rendered_ = 0;
  swap_ticks_ = 0;
  first_frame_delivered_ticks_ = -1;
  previous_swap_request_ticks_ = -1;
}

// This object is the global object representing this plugin library as long
// as it is loaded.
class MyModule : public pp::Module {
 public:
  MyModule() : pp::Module() {}
  ~MyModule() override {}

  pp::Instance* CreateInstance(PP_Instance instance) override {
    return new VideoDecodeInstance(instance, this);
  }
};

namespace pp {
// Factory function for your specialization of the Module object.
Module* CreateModule() {
  return new MyModule();
}
}  // namespace pp
