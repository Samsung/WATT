// Copyright (c) 2018 Samsung. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include <string>

#include "ppapi/cpp/host_resolver.h"
#include "ppapi/cpp/instance.h"
#include "ppapi/cpp/module.h"
#include "ppapi/utility/completion_callback_factory.h"

class HostResolverInstance : public pp::Instance {
 public:
  explicit HostResolverInstance(PP_Instance instance)
      : pp::Instance(instance),
        callback_factory_(this) { }

  ~HostResolverInstance() { }

  virtual bool Init(uint32_t argc, const char* argn[], const char* argv[]) {
    host_resolver_ = pp::HostResolver(this);
    return true;
  }

  virtual void HandleMessage(const pp::Var& message) {
    if (message.is_string()) {
      std::string domain(message.AsString());
      PP_HostResolver_Hint hint;
      hint.family = PP_NETADDRESS_FAMILY_IPV4;
      hint.flags = 0;
      host_resolver_.Resolve(domain.c_str(), 80, hint,
          callback_factory_.NewCallback(&HostResolverInstance::OnResolveDone, domain));
    }
  }

  void OnResolveDone(int32_t result, std::string domain) {
    std::string response(domain);
    if (result == PP_OK) {
      response += ":";
      uint32_t count = host_resolver_.GetNetAddressCount();
      for (int i = 0; i < count; i++) {
        response += " ";
        response += host_resolver_.GetNetAddress(i).DescribeAsString(false).AsString();
      }
      PostMessage(pp::Var(response));
    } else if (result == PP_ERROR_NOACCESS) {
      PostMessage(pp::Var("alert:NO ACCESS"));
    } else if (result == PP_ERROR_NAME_NOT_RESOLVED) {
      response += ": couldn't be resolved";
      PostMessage(pp::Var(response));
    } else {
      response += ": unknown error";
      PostMessage(pp::Var(response));
    }
  }

 private:
  pp::HostResolver host_resolver_;
  pp::CompletionCallbackFactory<HostResolverInstance> callback_factory_;
};

class HostResolverModule : public pp::Module {
 public:
  HostResolverModule() : pp::Module() {}
  virtual ~HostResolverModule() {}

  virtual pp::Instance* CreateInstance(PP_Instance instance) {
    return new HostResolverInstance(instance);
  }
};

namespace pp {
Module* CreateModule() { return new HostResolverModule(); }
}  // namespace pp
