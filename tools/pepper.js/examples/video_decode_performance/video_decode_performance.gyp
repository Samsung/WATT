# Copyright (c) 2014 Samsung Electronics. All rights reserved.

{
  'targets': [
    {
      'target_name': 'video_decode_performance',
      'type': '<(ppapi_target_type)',
      'sources': [
        'decoder.cc',
        'video_data.cc',
        'video_decode_instance.cc',
      ],
      'cflags_cc': [
        '-std=gnu++11',
      ],
      'dependencies': [
        '<(DEPTH)/build/nacl_pnacl/sdk_libs.gyp:nacl_io',
        '<(DEPTH)/build/nacl_pnacl/sdk_libs.gyp:ppapi_cpp',
        '<(DEPTH)/build/nacl_pnacl/sdk_libs.gyp:ppapi_gles2',
        '<(DEPTH)/logger/logger.gyp:logger_library',
      ],
    },
    {
      'target_name': 'video_decode_performance_widget',
      'type': 'none',
      'variables': {
        'widget_name': 'video_decode_performance',
        'input_html_path': 'index.html',
         'target_files': [
           'h264',
         ],
        'pepper_permissions': [
           'Internet',
           'PPB_FileIO',
           'PPB_FileRef',
           'PPB_FileSystem',
           'RemoteController',
         ],
      },
      'includes': [
        '../build/nacl_pnacl/simple_target.gypi'
      ],
    },
  ],
}
