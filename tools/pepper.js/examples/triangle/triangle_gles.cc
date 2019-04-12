#include <cstdio>
#include <string>
#include <math.h>
#include <stdlib.h>
#include "ppapi/cpp/instance.h"
#include "ppapi/cpp/module.h"
#include "ppapi/cpp/text_input_controller.h"
#include "ppapi/cpp/view.h"
#include "ppapi/cpp/var.h"
#include "ppapi/cpp/graphics_3d.h"

#include "ppapi/utility/completion_callback_factory.h"

#include "ppapi/lib/gl/gles2/gl2ext_ppapi.h"
#include <GLES2/gl2.h>

class MatrixHelper {
 public:
  static void Frustum(GLfloat* mat, GLfloat left, GLfloat right, GLfloat bottom,
                      GLfloat top, GLfloat znear, GLfloat zfar) {
    float temp, temp2, temp3, temp4;
    temp = 2.0f * znear;
    temp2 = right - left;
    temp3 = top - bottom;
    temp4 = zfar - znear;
    mat[0] = temp / temp2;
    mat[1] = 0.0f;
    mat[2] = 0.0f;
    mat[3] = 0.0f;
    mat[4] = 0.0f;
    mat[5] = temp / temp3;
    mat[6] = 0.0f;
    mat[7] = 0.0f;
    mat[8] = (right + left) / temp2;
    mat[9] = (top + bottom) / temp3;
    mat[10] = (-zfar - znear) / temp4;
    mat[11] = -1.0f;
    mat[12] = 0.0f;
    mat[13] = 0.0f;
    mat[14] = (-temp * zfar) / temp4;
    mat[15] = 0.0f;
  }

  static void Perspective(GLfloat* mat, GLfloat fovyInDegrees,
                          GLfloat aspectRatio, GLfloat znear, GLfloat zfar) {
    float ymax, xmax;
    ymax = znear * tanf(fovyInDegrees * 3.14f / 360.0f);
    xmax = ymax * aspectRatio;
    Frustum(mat, -xmax, xmax, -ymax, ymax, znear, zfar);
  }

  static void Identity(GLfloat* mat) {
    for (int i = 0; i < 16; i++) mat[i] = 0;
    mat[0] = 1.0;
    mat[5] = 1.0;
    mat[10] = 1.0;
    mat[15] = 1.0;
  }

  static void Multiply(const GLfloat* a, const GLfloat* b, GLfloat* mat) {
    // Generate to a temporary first in case the output matrix and input
    // matrix are thes same.
    GLfloat out[16];

    out[0] = a[0] * b[0] + a[4] * b[1] + a[8] * b[2] + a[12] * b[3];
    out[1] = a[1] * b[0] + a[5] * b[1] + a[9] * b[2] + a[13] * b[3];
    out[2] = a[2] * b[0] + a[6] * b[1] + a[10] * b[2] + a[14] * b[3];
    out[3] = a[3] * b[0] + a[7] * b[1] + a[11] * b[2] + a[15] * b[3];

    out[4] = a[0] * b[4] + a[4] * b[5] + a[8] * b[6] + a[12] * b[7];
    out[5] = a[1] * b[4] + a[5] * b[5] + a[9] * b[6] + a[13] * b[7];
    out[6] = a[2] * b[4] + a[6] * b[5] + a[10] * b[6] + a[14] * b[7];
    out[7] = a[3] * b[4] + a[7] * b[5] + a[11] * b[6] + a[15] * b[7];

    out[8] = a[0] * b[8] + a[4] * b[9] + a[8] * b[10] + a[12] * b[11];
    out[9] = a[1] * b[8] + a[5] * b[9] + a[9] * b[10] + a[13] * b[11];
    out[10] = a[2] * b[8] + a[6] * b[9] + a[10] * b[10] + a[14] * b[11];
    out[11] = a[3] * b[8] + a[7] * b[9] + a[11] * b[10] + a[15] * b[11];

    out[12] = a[0] * b[12] + a[4] * b[13] + a[8] * b[14] + a[12] * b[15];
    out[13] = a[1] * b[12] + a[5] * b[13] + a[9] * b[14] + a[13] * b[15];
    out[14] = a[2] * b[12] + a[6] * b[13] + a[10] * b[14] + a[14] * b[15];
    out[15] = a[3] * b[12] + a[7] * b[13] + a[11] * b[14] + a[15] * b[15];

    for (int i = 0; i < 16; i++) mat[i] = out[i];
  }

  static void RotateY(GLfloat yRad, GLfloat* mat) {
    Identity(mat);
    mat[0] = cosf(yRad);
    mat[2] = sinf(yRad);
    mat[8] = -mat[2];
    mat[10] = mat[0];
  }

  static void Translate(GLfloat x, GLfloat y, GLfloat z, GLfloat* mat) {
    Identity(mat);
    mat[12] += x;
    mat[13] += y;
    mat[14] += z;
  }
};

class SimpleOpenGLInstance : public pp::Instance {
 private:
  GLuint m_positionLoc;
  GLuint m_colorLoc;
  GLuint m_MVPLoc;

  GLuint m_programObj;
  GLuint m_vertexShader;
  GLuint m_fragmentShader;

  GLuint m_verticesBuffer;
  GLuint m_indicesBuffer;

 protected:
  pp::InstanceHandle m_instHandle;
  pp::CompletionCallbackFactory<SimpleOpenGLInstance> m_factory;
  pp::Graphics3D* m_graphics;

  // OpenGL related methods
  void InitOpenGL(const pp::View& view) {
    int32_t attribs[] = {
        PP_GRAPHICS3DATTRIB_ALPHA_SIZE, 8, PP_GRAPHICS3DATTRIB_DEPTH_SIZE, 24,
        PP_GRAPHICS3DATTRIB_STENCIL_SIZE, 8, PP_GRAPHICS3DATTRIB_SAMPLES, 0,
        PP_GRAPHICS3DATTRIB_SAMPLE_BUFFERS, 0, PP_GRAPHICS3DATTRIB_WIDTH, 640,
        PP_GRAPHICS3DATTRIB_HEIGHT, 480, PP_GRAPHICS3DATTRIB_NONE};

    m_graphics = new pp::Graphics3D(m_instHandle, attribs);
    int32_t success = BindGraphics(*m_graphics);
    if (success == PP_FALSE) {
      glSetCurrentContextPPAPI(0);
      printf("Failed to set context.\n");
      return;
    }
    glSetCurrentContextPPAPI(m_graphics->pp_resource());

    glViewport(0, 0, 640, 480);
    glClearColor(0.0f, 0.0f, 0.0f, 1.0f);
  }

  GLuint CompileShader(GLenum type, const char* data) {
    const char* shaderStrings[1];
    shaderStrings[0] = data;

    GLuint shader = glCreateShader(type);
    glShaderSource(shader, 1, shaderStrings, NULL);
    glCompileShader(shader);
    return shader;
  }

  void InitProgram() {
    char vShaderStr[] =
        "attribute vec4 a_position;   \n"
        "attribute vec4 a_color;      \n"
        "uniform mat4 u_MVP;          \n"
        "varying vec4 v_color;        \n"
        "void main()                  \n"
        "{                            \n"
        "   gl_Position = u_MVP * a_position; \n"
        "   v_color = a_color; \n"
        "}                            \n";

    char fShaderStr[] =
        "precision mediump float;                            \n"
        "varying vec4 v_color;                               \n"
        "void main()                                         \n"
        "{                                                   \n"
        "  gl_FragColor = v_color;   \n"
        "}                                                   \n";

    m_vertexShader = CompileShader(GL_VERTEX_SHADER, vShaderStr);
    m_fragmentShader = CompileShader(GL_FRAGMENT_SHADER, fShaderStr);

    m_programObj = glCreateProgram();
    glAttachShader(m_programObj, m_vertexShader);
    glAttachShader(m_programObj, m_fragmentShader);
    glLinkProgram(m_programObj);

    m_positionLoc = glGetAttribLocation(m_programObj, "a_position");
    m_colorLoc = glGetAttribLocation(m_programObj, "a_color");
    m_MVPLoc = glGetUniformLocation(m_programObj, "u_MVP");

    GLfloat vertices[] = {
        -0.5f, -0.5f, 0.0f,  // Position 0
        1.0f,  0.0f,  0.0f,  // Color 0
        0.5f,  -0.5f, 0.0f,  // Position 1
        1.0f,  1.0f,  1.0f,  // Color 1
        0.0f,  0.5f,  0.0f,  // Position 2
        0.0f,  0.0f,  1.0f,  // Color 2
    };

    glGenBuffers(1, &m_verticesBuffer);
    glBindBuffer(GL_ARRAY_BUFFER, m_verticesBuffer);
    glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);

    GLushort indices[] = {0, 1, 2};

    glGenBuffers(1, &m_indicesBuffer);
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, m_indicesBuffer);
    glBufferData(GL_ELEMENT_ARRAY_BUFFER, sizeof(indices), indices, GL_STATIC_DRAW);
  }

  void Render(int32_t result) {

    static float rot = 0.0;

    rot += 0.1f;
    if (rot >= 360.0f) rot = 0.0;

    glClear(GL_COLOR_BUFFER_BIT);

    // set what program to use
    glUseProgram(m_programObj);

    // create our perspective matrix
    float mMpv[16];
    float mTrs[16];
    float mRot[16];

    MatrixHelper::Identity(mMpv);
    MatrixHelper::Perspective(mMpv, 45.0f, 640.0f / 480.0f, 1, 10);

    MatrixHelper::Translate(0, 0, -3.0, mTrs);
    MatrixHelper::RotateY(rot, mRot);
    MatrixHelper::Multiply(mTrs, mRot, mTrs);
    MatrixHelper::Multiply(mMpv, mTrs, mMpv);
    glUniformMatrix4fv(m_MVPLoc, 1, GL_FALSE, (GLfloat*)mMpv);

    glBindBuffer(GL_ARRAY_BUFFER, m_verticesBuffer);
    // Load the vertex position
    glVertexAttribPointer(m_positionLoc, 3, GL_FLOAT, GL_FALSE,
                          6 * sizeof(GLfloat), (GLvoid*)0);
    glVertexAttribPointer(m_colorLoc, 3, GL_FLOAT, GL_FALSE,
                          6 * sizeof(GLfloat), (GLvoid*)(3 * sizeof(GLfloat)));

    glEnableVertexAttribArray(m_positionLoc);
    glEnableVertexAttribArray(m_colorLoc);

    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, m_indicesBuffer);
    glDrawElements(GL_TRIANGLES, 3, GL_UNSIGNED_SHORT, 0);

    // do real rendering here
    m_graphics->SwapBuffers(
        m_factory.NewCallback(&SimpleOpenGLInstance::Render));
  }

 public:
  explicit SimpleOpenGLInstance(PP_Instance instance)
      : pp::Instance(instance),
        m_instHandle(this),
        m_factory(this) {
    // Prevents showing on-screen keyboard in Tizen 3.0
    // TODO: implement PPB_TextInputController in pepper.js
    //pp::TextInputController textInputController(this);
    //textInputController.SetTextInputType(PP_TEXTINPUT_TYPE_NONE);

    m_graphics = 0;
  }

  virtual ~SimpleOpenGLInstance() {
    if (m_graphics != 0) delete m_graphics;
  }

  virtual void HandleMessage(const pp::Var& var_message) {}

  virtual void DidChangeView(const pp::View& view) {
    if (m_graphics == 0) {
      InitOpenGL(view);
      InitProgram();
      Render(PP_OK);
    }
  }
};

class SimpleOpenGLModule : public pp::Module {
 public:
  SimpleOpenGLModule() : pp::Module() {}
  virtual ~SimpleOpenGLModule() { glTerminatePPAPI(); }

  virtual bool Init() {
    if (!glInitializePPAPI(get_browser_interface())) return false;
    return true;
  }

  virtual pp::Instance* CreateInstance(PP_Instance instance) {
    return new SimpleOpenGLInstance(instance);
  }
};

namespace pp {
Module* CreateModule() { return new SimpleOpenGLModule(); }
}
