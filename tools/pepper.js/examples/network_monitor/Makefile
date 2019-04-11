# Copyright (c) 2012 The Chromium Authors. All rights reserved.
# Use of this source code is governed by a BSD-style license that can be
# found in the LICENSE file.

#
# GNU Make based build file.  For details on GNU Make see:
#   http://www.gnu.org/software/make/manual/make.html
#
#

VALID_TOOLCHAINS:=emscripten newlib pnacl

PEPPERJS_SRC_ROOT:=../..
include $(PEPPERJS_SRC_ROOT)/tools/common.mk

TARGET = network_monitor

# For hermetic sdk_util
INC_PATHS:=$(PEPPERJS_SRC_ROOT)/examples $(INC_PATHS)

LIBS=$(DEPS)

DEPS=ppapi_cpp ppapi

SOURCES=network_monitor.cc

$(foreach dep,$(DEPS),$(eval $(call DEPEND_RULE,$(dep))))

$(foreach src,$(SOURCES),$(eval $(call COMPILE_RULE,$(src),)))


ifeq ($(CONFIG),Release)
$(eval $(call LINK_RULE,$(TARGET)_unstripped,$(SOURCES),$(LIBS),$(DEPS)))
$(eval $(call STRIP_RULE,$(TARGET),$(TARGET)_unstripped))
else
$(eval $(call LINK_RULE,$(TARGET),$(SOURCES),$(LIBS),$(DEPS)))
endif

$(eval $(call NMF_RULE,$(TARGET),))
