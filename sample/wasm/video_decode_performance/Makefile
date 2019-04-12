# Copyright (c) 2012 The Chromium Authors. All rights reserved.
# Use of this source code is governed by a BSD-style license that can be
# found in the LICENSE file.

#
# GNU Make based build file.  For details on GNU Make see:
#   http://www.gnu.org/software/make/manual/make.html
#
#

#
# Default configuration
#
# By default we will build a Debug configuration using the GCC newlib toolcahin
# to override this, specify TOOLCHAIN=newlib|glibc or CONFIG=Debug|Release on
# the make command-line or in this file prior to including common.mk.  The
# toolchain we use by default will be the first valid one listed
VALID_TOOLCHAINS:=emscripten newlib pnacl

export NACL_SDK_ROOT ?= $(abspath ../../../nacl_sdk/pepper_49)
PEPPERJS_SRC_ROOT:=../../tools/pepper.js
include $(PEPPERJS_SRC_ROOT)/tools/common.mk

ifneq (,$(findstring $(TOOLCHAIN),emscripten))
NACL_LDFLAGS+=-s TOTAL_MEMORY=100663296
endif

# For hermetic sdk_util
#INC_PATHS:=$(PEPPERJS_SRC_ROOT)/examples $(INC_PATHS)

#
# Target Name
#
# The base name of the final NEXE, also the name of the NMF file containing
# the mapping between architecture and actual NEXE.
#
TARGET=video_decode_performance

#
# List of sources to compile
#
SOURCES= \
  decoder.cc \
  video_data.cc \
  video_decode_instance.cc \
#  ../sdk_util/thread_pool.cc \

#
# List of libraries to link against.  Unlike some tools, the GCC and LLVM
# based tools require libraries to be specified in the correct order.  The
# order should be symbol reference followed by symbol definition, with direct
# sources to the link (object files) are left most.  In this case:
#    hello_world -> ppapi_main -> ppapi_cpp -> ppapi -> pthread -> libc
# Notice that libc is implied and come last through standard compiler/link
# switches.
#
# We break this list down into two parts, the set we need to rebuild (DEPS)
# and the set we do not.  This example does not havea any additional library
# dependencies.
#
DEPS=ppapi ppapi_cpp ppapi_gles2
LIBS=$(DEPS) pthread

NACL_CXXFLAGS+=-std=gnu++11

#
# Use the library dependency macro for each dependency
#
$(foreach dep,$(DEPS),$(eval $(call DEPEND_RULE,$(dep))))

#
# Use the compile macro for each source.
#
$(foreach src,$(SOURCES),$(eval $(call COMPILE_RULE,$(src),)))

ifneq (,$(findstring $(TOOLCHAIN),emscripten))
FILE_DATA=(OUTBASE)/data/file.data $(OUTDIR)/file.js
all: $(FILE_DATA)
$(FILE_DATA):
	$(EM_FILE) $(OUTBASE)/data/file.data --preload $(OUTBASE)/data/h264@h264 --js-output=$(OUTDIR)/file.js
NACL_LDFLAGS+= --post-js $(OUTDIR)/file.js
endif

#
# Use the link macro for this target on the list of sources.
#
ifeq ($(CONFIG),Release)
$(eval $(call LINK_RULE,$(TARGET)_unstripped,$(SOURCES),$(LIBS),$(DEPS)))
$(eval $(call STRIP_RULE,$(TARGET),$(TARGET)_unstripped))
else
$(eval $(call LINK_RULE,$(TARGET),$(SOURCES),$(LIBS),$(DEPS)))
endif

#
# Specify the NMF to be created with no additional arugments.
#
$(eval $(call NMF_RULE,$(TARGET),))
