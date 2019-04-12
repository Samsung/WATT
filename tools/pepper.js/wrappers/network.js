/*
 * Copyright (c) 2018 Samsung Electronics.
 * All Rights Reserved.
 *
 * This source code is based on the pepper.js source code.
 *
 * Use of this source code is governed by a BSD-style license that can be
 * found in the LICENSE file.
 */

(function() {
/******************************************************************************
 * stuff for PPB_NetAddress
 * ***************************************************************************/

  var PP_NetAddress_Family = {
    PP_NETADDRESS_FAMILY_UNSPECIFIED: 0,
    PP_NETADDRESS_FAMILY_IPV4: 1,
    PP_NETADDRESS_FAMILY_IPV6: 2
  };

  var PPNA_Family = PP_NetAddress_Family;

  var PP_NetAddress_IPv4_Length = 6;
  var PP_NetAddress_IPv6_Length = 18;

  const NETWORK_BYTE_ORDER = false;

  function create_net_address_from_ip_port(address_family, ip_bytes, port) {
    var port_bytes = new Uint8Array(2);
    (new DataView(port_bytes.buffer)).setUint16(0, port, NETWORK_BYTE_ORDER);
    return create_net_address_from_bytes(
      address_family,
      Uint8Array.of(...port_bytes, ...ip_bytes));
  }

  function create_net_address_from_bytes(address_family, pp_address_bytes) {
    return resources.register(NET_ADDRESS_RESOURCE, {
      address_family: address_family,
      pp_address: pp_address_bytes.slice(),
      get port() {
        var port_dv = new DataView(this.pp_address.buffer, 0, 2);
        return port_dv.getUint16(0, NETWORK_BYTE_ORDER);
      },
      get ip_bytes() {
        return this.pp_address.subarray(2);
      }
    });
  }

  var NetAddress_CreateFromIPv4Address = function(instance, ipv4_addr_ptr) {
    return create_net_address_from_bytes(
      PPNA_Family.PP_NETADDRESS_FAMILY_IPV4,
      HEAPU8.subarray(ipv4_addr_ptr, ipv4_addr_ptr + PP_NetAddress_IPv4_Length));
  }

  var NetAddress_CreateFromIPv6Address = function(instance, ipv6_addr_ptr) {
    return create_net_address_from_bytes(
      PPNA_Family.PP_NETADDRESS_FAMILY_IPV6,
      HEAPU8.subarray(ipv6_addr_ptr, ipv6_addr_ptr + PP_NetAddress_IPv6_Length));
  }

  var NetAddress_IsNetAddress = function(resource) {
    return resources.is(resource, NET_ADDRESS_RESOURCE);
  }

  var NetAddress_GetFamily = function(netAddressResource) {
    var net_addr = resources.resolve(netAddressResource, NET_ADDRESS_RESOURCE);
    if (net_addr === undefined) {
      return PPNA_Family.PP_NETADDRESS_FAMILY_UNSPECIFIED;
    }
    return net_addr.address_family;
  }

  var NetAddress_DescribeAsString = function(result, netAddressResource, include_port) {
    var resource = resources.resolve(netAddressResource, NET_ADDRESS_RESOURCE);
    if (resource !== undefined) {
      var ip_addr_str = "";
      if (resource.address_family === PPNA_Family.PP_NETADDRESS_FAMILY_IPV4) {
        ip_addr_str = resource.ip_bytes.join(".");
        if (include_port) {
          ip_addr_str += ":" + resource.port;
        }
      } else {
        // For ipv6 we only support one string representation with leading
        // zeros omitted in each field, but without omitting all-zero fields.
        // See rfc4291#2.2 [1] for possible text representation of ipv6 address.
        //
        // TODO: follow rfc5952#4 [2] recommendation for text representation of
        // ipv6 address.
        //
        // [1] https://tools.ietf.org/html/rfc4291#section-2.2
        // [2] https://tools.ietf.org/html/rfc5952#section-4
        var dataview = new DataView(resource.ip_bytes.buffer, resource.ip_bytes.byteOffset);
        var fieldarray = [];
        for (var i = 0; i < 16; i += 2) {
          fieldarray.push(dataview.getUint16(i, NETWORK_BYTE_ORDER).toString(16));
        }
        ip_addr_str = fieldarray.join(":");
        if (include_port) {
          ip_addr_str = "[" + ip_addr_str + "]:" + resource.port;
        }
      }
      glue.jsToMemoryVar(ip_addr_str, result);
      return;
    } else {
      glue.jsToMemoryVar(null, result);
      return;
    }
  }

  var NetAddress_DescribeAsIPv4Address = function(netAddressResource, ipv4_addr_out_ptr) {
    var net_addr = resources.resolve(netAddressResource, NET_ADDRESS_RESOURCE);
    if (net_addr === undefined) {
      return PP_FALSE;
    }
    if (net_addr.address_family === PPNA_Family.PP_NETADDRESS_FAMILY_IPV4) {
      HEAPU8.set(net_addr.pp_address, ipv4_addr_out_ptr);
      return PP_TRUE;
    }
    return PP_FALSE;
  }

  var NetAddress_DescribeAsIPv6Address = function(netAddressResource, ipv6_addr_out_ptr) {
    var net_addr = resources.resolve(netAddressResource, NET_ADDRESS_RESOURCE);
    if (net_addr === undefined) {
      return PP_FALSE;
    }
    if (net_addr.address_family === PPNA_Family.PP_NETADDRESS_FAMILY_IPV6) {
      HEAPU8.set(net_addr.pp_address, ipv6_addr_out_ptr);
      return PP_TRUE;
    }
    return PP_FALSE;
  }

  registerInterface("PPB_NetAddress;1.0", [
    NetAddress_CreateFromIPv4Address,
    NetAddress_CreateFromIPv6Address,
    NetAddress_IsNetAddress,
    NetAddress_GetFamily,
    NetAddress_DescribeAsString,
    NetAddress_DescribeAsIPv4Address,
    NetAddress_DescribeAsIPv6Address
  ]);

/******************************************************************************
 * stuff for PPB_NetworkList
 * ***************************************************************************/

  // Enums copied from ppb_network_list.h
  // PP_NetworkList_Type
  var PP_NETWORKLIST_TYPE_UNKNOWN = 0;
  var PP_NETWORKLIST_TYPE_ETHERNET = 1;
  var PP_NETWORKLIST_TYPE_WIFI = 2;
  var PP_NETWORKLIST_TYPE_CELLULAR = 3;

  // PP_NetworkList_State
  var PP_NETWORKLIST_STATE_DOWN = 0;
  var PP_NETWORKLIST_STATE_UP = 1;

  var NetworkList_IsNetworkList = function(resource) {
    return resources.is(resource, NETWORK_LIST_RESOURCE);
  };

  var NetworkList_GetCount = function(network_list) {
    var resource = resources.resolve(network_list, NETWORK_LIST_RESOURCE);
    if (resource !== undefined) {
      return resource.count;
    } else {
      return 0;
    }
  };

  var NetworkList_GetName = function(result, network_list, index) {
    var resource = resources.resolve(network_list, NETWORK_LIST_RESOURCE);
    if (resource !== undefined && index < resource.list.length) {
      glue.jsToMemoryVar(resource.list[index].name, result);
      return;
    } else {
      glue.jsToMemoryVar(null, result);
      return;
    }
  };

  var NetworkList_GetType = function(network_list, index) {
    var resource = resources.resolve(network_list, NETWORK_LIST_RESOURCE);
    if (resource !== undefined && index < resource.list.length) {
      return resource.list[index].type;
    } else {
      return PP_NETWORKLIST_TYPE_UNKNOWN;
    }
  };

  var NetworkList_GetState = function(network_list, index) {
    var resource = resources.resolve(network_list, NETWORK_LIST_RESOURCE);
    if (resource !== undefined && index < resource.list.length) {
      return resource.list[index].state;
    } else {
      return PP_NETWORKLIST_STATE_DOWN;
    }
  };

  var NetworkList_GetIpAddress = function(network_list, index, output) {
    var resource = resources.resolve(network_list, NETWORK_LIST_RESOURCE);
    if (resource === undefined) {
      return ppapi.PP_ERROR_BADRESOURCE;
    } else if (index >= resource.list.length) {
      return ppapi.PP_ERROR_BADARGUMENT;
    } else {
      // `output` is PP_ArrayOutput struct, which is composed of
      // `GetDataBuffer` callback for allocating output arrary memory and
      // `user_data` which is passed to the callback.
      //
      // Assume that `GetDataBuffer` function pointer is at `output` memory
      // address and `user_data` is 4 bytes farther (both are assumed to be 4
      // byte ints used as pointers).
      var GetDataBuffer = getValue(output, "i32");
      var user_data = getValue(output + 4, "i32");
      var ipAddresses = resource.list[index].ipAddresses;
      // Assume that PP_Resource is 4 byte integer id
      var net_address_ref_size = 4;
      var net_address_count = ipAddresses.length;
      var memory = dynCall("iiii", GetDataBuffer, [user_data, net_address_count, net_address_ref_size]);
      if (memory === 0) {
        return ppapi.PP_ERROR_NOMEMORY;
      }
      for (var i = 0; i < net_address_count; i++) {
        setValue(memory + i * net_address_ref_size, ipAddresses[i], "i32");
        resources.addRef(ipAddresses[i]);
      }
      return ppapi.PP_OK;
    }
  };

  var NetworkList_GetDisplayName = function(result, network_list, index) {
    var resource = resources.resolve(network_list, NETWORK_LIST_RESOURCE);
    if (resource !== undefined && index < resource.list.length) {
      glue.jsToMemoryVar(resource.list[index].displayName, result);
      return;
    } else {
      glue.jsToMemoryVar(null, result);
      return;
    }
  };

  var NetworkList_GetMTU = function(network_list, index) {
    var resource = resources.resolve(network_list, NETWORK_LIST_RESOURCE);
    if (resource !== undefined && index < resource.list.length) {
      return resource.list[index].MTU;
    } else {
      return 0;
    }
  };

  registerInterface("PPB_NetworkList;1.0", [
    NetworkList_IsNetworkList,
    NetworkList_GetCount,
    NetworkList_GetName,
    NetworkList_GetType,
    NetworkList_GetState,
    NetworkList_GetIpAddress,
    NetworkList_GetDisplayName,
    NetworkList_GetMTU
  ]);

/******************************************************************************
 * stuff for PPB_NetworkMonitor
 * ***************************************************************************/

  var getNetworkList = function() {
    // This is a pretty bare implementation. Samsung Tizen TV javascript API
    // restricts us to only one network and incomplete information about its
    // state and name. If there is serious need for more information, this
    // should be reimplemented as a crosswalk plugin using Tizen C API.
    //
    // See [1] for details of Samsunt Tizen TV javascript API.
    //
    // [1] http://developer.samsung.com/tv/develop/api-references/samsung-product-api-references/network-api
    var type = [PP_NETWORKLIST_TYPE_UNKNOWN, PP_NETWORKLIST_TYPE_WIFI,
                PP_NETWORKLIST_TYPE_CELLULAR, PP_NETWORKLIST_TYPE_ETHERNET][webapis.network.getActiveConnectionType()];
    var state = (type === PP_NETWORKLIST_TYPE_UNKNOWN) ?
                PP_NETWORKLIST_STATE_DOWN : PP_NETWORKLIST_STATE_UP;
    var name = "";
    if (type === PP_NETWORKLIST_TYPE_WIFI) {
      try {
        name = webapis.network.getWiFiSsid();
      } catch (e) {
        console.warn(e);
      }
    }
    var displayName = name;
    // Assume that getIp() always returns IPv4 address. Otherwise we would have
    // to include a full-blown IPv6 parser here.
    // TODO: accept IPv6 here
    var ip_addr = new Uint8Array(PP_NetAddress_IPv4_Length);
    if (type !== PP_NETWORKLIST_TYPE_UNKNOWN) {
      try {
        ip_addr = parseIPv4(webapis.network.getIp());
      } catch(e) {
        console.warn(e);
      }
    }
    var net_addr = create_net_address_from_ip_port(PPNA_Family.PP_NETADDRESS_FAMILY_IPV4, ip_addr, 0);

    return resources.register(NETWORK_LIST_RESOURCE, {
      count: 1,
      list: [
        {
          type: type,
          state: state,
          name: name,
          displayName: displayName,
          ipAddresses: [ net_addr ]
        }
      ]
    });
  };

  var NetworkMonitor_Create = function(instance) {
    return resources.register(NETWORK_MONITOR_RESOURCE, { firstRun: true });
  };

  var NetworkMonitor_UpdateNetworkList = function(network_monitor, network_list_ptr, callback_ptr) {
    var resource = resources.resolve(network_monitor, NETWORK_MONITOR_RESOURCE);
    if (resource !== undefined) {
      if (resource.listenerID !== undefined) {
        setValue(network_list_ptr, 0, "i32");
        return ppapi.PP_ERROR_INPROGRESS;
      }

      var networkCallback = glue.getCompletionCallback(callback_ptr);
      // On the first call we have to run the callback as soon as network info
      // is available.
      if (resource.firstRun) {
        resource.firstRun = false;
        setValue(network_list_ptr, getNetworkList(), "i32");
        glue.defer(function() { networkCallback(ppapi.PP_OK); });
      // Each subsequent call waits for network state change before running the
      // callback
      } else {
        resource.listenerID = webapis.network.addNetworkStateChangeListener(function() {
          setValue(network_list_ptr, getNetworkList(), "i32");
          webapis.network.removeNetworkStateChangeListener(resource.listenerID);
          resource.listenerID = undefined;
          networkCallback(ppapi.PP_OK);
        });
      }
      return ppapi.PP_OK_COMPLETIONPENDING;
    } else {
      setValue(network_list_ptr, 0, "i32");
      return ppapi.PP_ERROR_BADRESOURCE;
    }
  };

  var NetworkMonitor_IsNetworkMonitor = function(resource) {
    return resources.is(resource, NETWORK_MONITOR_RESOURCE);
  };

  registerInterface("PPB_NetworkMonitor;1.0", [
    NetworkMonitor_Create,
    NetworkMonitor_UpdateNetworkList,
    NetworkMonitor_IsNetworkMonitor
  ]);

  var PP_HostResolver_Flag = {
    PP_HOSTRESOLVER_FLAG_CANONNAME: 1,
  };

  var HostResolver_Create = function(instance) {
    return resources.register(HOST_RESOLVER_RESOURCE, {
      ready: false,
      canonical_name: "",
      net_addresses: [],
      destroy: function() {
        for (var i = 0; i < this.net_addresses.length; i++) {
          resources.release(this.net_addresses[i]);
        }
        this.canonical_name = "";
        this.net_addresses = [];
        this.ready = false;
      }
    });
  };

  var HostResolver_IsHostResolver = function(resource) {
    return resources.is(resource, HOST_RESOLVER_RESOURCE);
  };

  // TODO: use a real parser
  function parseIPv4(ip_str) {
    // Can't just pass 'parseInt' here, because 'map' calls the provided
    // function with three parameters. Second argument is happily used by
    // 'parseInt' as radix so we get bogus results.
    // Using 'x => parseInt(x)' lets us drop the superfluous arguments.
    return new Uint8Array(ip_str.split(".").map(x => parseInt(x)));
  }

  // TODO: use a real parser
  function parseIPv6(ip_str) {
    var ip_fields = ip_str.split(":");
    var lacking = 8 - ip_fields.filter(x => x !== "").length;
    var field_values = [];
    for (var i = 0; i < ip_fields.length; i++) {
      var field = ip_fields[i];
      if (field === "") {
        for (var j = 0; j < lacking; j++) {
          field_values.push(0);
        }
        lacking = 0;
      } else {
        field_values.push(parseInt(field, 16));
      }
    }
    var ipv6 = new Uint8Array(16);
    for (var i = 0; i < field_values.length; i++) {
      ipv6[i*2] = Math.trunc(field_values[i] >> 8);
      ipv6[i*2+1] = field_values[i] & 0xff;
    }
    return ipv6;
  }

  // TODO: what happens (and what should happen) when this function is called
  // again before the last call is finished?
  var HostResolver_Resolve = function(resource, host, port_in_result, hint_struct_ptr, callback_struct) {
    var host_resolver_resource = resources.resolve(resource, HOST_RESOLVER_RESOURCE);
    if (resource === undefined) {
      return ppapi.PP_ERROR_BADRESOURCE;
    }
    // Prepare arguments
    var host_str = Pointer_stringify(host);
    var completion_callback = glue.getCompletionCallback(callback_struct);
    // TODO: Should we treat pointer to struct differently?
    // For "struct PP_CompletionCallback" we use getValue(struct_arg) so for
    // "const struct PP_HostResolver_Hint *" we should use double dereference?
    var family = getValue(hint_struct_ptr + 0, "i32");
    var flags = getValue(hint_struct_ptr + 4, "i32");

    // Use google dns service for now
    // TODO: use native dns resolver
    var google_dns_url = "https://dns.google.com/resolve?";
    // Don't use CNAME record type, because A and AAAA gets CNAME anyway
    var record_type = "A";
    // TODO: If PP_NetAddress_Family is a bitfield then we should make it
    // possible to ask for both A and AAAA records, but does that make any
    // sense?
    if (family === PP_NetAddress_Family.PP_NETADDRESS_FAMILY_IPV6) {
      record_type = "AAAA";
    }
    // Prepare host_resolver_resource for new data or clean before error state.
    // TODO: check if we can clear this data already, or should it still be
    // usable until callback is called
    host_resolver_resource.destroy();
    // TODO: support IDNs by converting host to punycode, as required by google
    // dns service
    fetch(google_dns_url + "name=" + host_str + "&type=" + record_type).then((response) => {
      if (!response.ok) {
        return Promise.reject();
      }
      return response.json();
    }).then((json) => {
      if (!("Answer" in json)) {
        return Promise.reject();
      }
      for (var answer of json.Answer) {
        // No need to check what was the requested netaddress family here, we
        // should get the correct answer anyway.
        // "A" dns record == 1 == IPv4
        if (answer.type === 1) {
          host_resolver_resource.net_addresses.push(
            create_net_address_from_ip_port(
              PPNA_Family.PP_NETADDRESS_FAMILY_IPV4,
              parseIPv4(answer.data),
              port_in_result));
        // "AAAA" dns record == 28 == IPv6
        } else if (answer.type === 28) {
          host_resolver_resource.net_addresses.push(
            create_net_address_from_ip_port(
              PPNA_Family.PP_NETADDRESS_FAMILY_IPV6,
              parseIPv6(answer.data),
              port_in_result));
        // "CNAME" dns record == 5 == canonical name
        } else if (answer.type === 5) {
          host_resolver_resource.canonical_name = answer.data;
        }
      }
      if (host_resolver_resource.net_addresses.length === 0) {
        return Promise.reject();
      }
      // Canonical name should be cleared if the flag was not set, even if we
      // receive it anyway.
      if (flags & PP_HostResolver_Flag.PP_HOSTRESOLVER_FLAG_CANONNAME === 0) {
        host_resolver_resource.canonical_name = "";
      }
      host_resolver_resource.ready = true;
      completion_callback(ppapi.PP_OK);
    }).catch(() => {
      // Clear host resolver again just to be sure
      host_resolver_resource.destroy();
      completion_callback(ppapi.PP_ERROR_NAME_NOT_RESOLVED);
    });
    return ppapi.PP_OK_COMPLETIONPENDING;
  };

  var HostResolver_GetCanonicalName = function(result, resource) {
    var host_resolver_resource = resources.resolve(resource, HOST_RESOLVER_RESOURCE);
    if (host_resolver_resource !== undefined && host_resolver_resource.ready) {
      glue.jsToMemoryVar(host_resolver_resource.canonical_name, result);
      return;
    } else {
      glue.jsToMemoryVar(null, result);
      return;
    }
  };

  var HostResolver_GetNetAddressCount = function(resource) {
    var host_resolver_resource = resources.resolve(resource, HOST_RESOLVER_RESOURCE);
    if (host_resolver_resource !== undefined && host_resolver_resource.ready) {
      return host_resolver_resource.net_addresses.length;
    } else {
      return 0;
    }
  };

  var HostResolver_GetNetAddress = function(resource, index) {
    var host_resolver_resource = resources.resolve(resource, HOST_RESOLVER_RESOURCE);
    if (host_resolver_resource !== undefined && host_resolver_resource.ready
      && index < host_resolver_resource.net_addresses.length) {
      var net_address_ref = host_resolver_resource.net_addresses[index];
      resources.addRef(net_address_ref);
      return net_address_ref;
    } else {
      return 0;
    }
  };

  registerInterface("PPB_HostResolver;1.0", [
    HostResolver_Create,
    HostResolver_IsHostResolver,
    HostResolver_Resolve,
    HostResolver_GetCanonicalName,
    HostResolver_GetNetAddressCount,
    HostResolver_GetNetAddress
  ]);

/******************************************************************************
 * stuff for PPB_TCPSocket
 * ***************************************************************************/
  var PP_Socket_State = {
    PP_SOCKET_NONE: 0,
    PP_SOCKET_CONNECTING: 1,
    PP_SOCKET_BINDING: 2,
    PP_SOCKET_START_LISTENING: 3,
    PP_SOCKET_ACCEPTING: 4
  };

  var PP_TCPSocket_Option = {
    PP_TCPSOCKET_OPTION_NO_DELAY: 0,
    PP_TCPSOCKET_OPTION_SEND_BUFFER_SIZE: 1,
    PP_TCPSOCKET_OPTION_RECV_BUFFER_SIZE: 2
  };

  var TcpSocket_Create = function(instance) {
    return resources.register(TCP_SOCKET_RESOURCE, {
      socket_fd: null,
      remote_addr: null,
      local_addr: null,
      addr_family: null,
      connect_callback: null,
      read_callback: null,
      write_callback: null,
      backlog: 0,
      connected: false,
      bound: false,
      listening: false,
      pending_state: PP_Socket_State.PP_SOCKET_NONE,
      destroy: function () {
        if (this.remote_addr !== null) {
          resources.release(this.remote_addr);
        }
        if (this.local_addr !== null) {
          resources.release(this.local_addr);
        }
      }
    });
  };

  var TcpSocket_CreateFromIPv4Connection = function(socket_fd, remote_addr_res, local_addr_res, is_connected) {
    resources.addRef(remote_addr_res);
    resources.addRef(local_addr_res);
    return resources.register(TCP_SOCKET_RESOURCE, {
      socket_fd: socket_fd,
      remote_addr: remote_addr_res,
      local_addr: local_addr_res,
      addr_family: PPNA_Family.PP_NETADDRESS_FAMILY_IPV4,
      connect_callback: null,
      read_callback: null,
      write_callback: null,
      backlog: 0,
      connected: is_connected,
      bound: false,
      listening: false,
      pending_state: PP_Socket_State.PP_SOCKET_NONE,
      destroy: function () {
        if (this.remote_addr !== null) {
          resources.release(this.remote_addr);
        }
        if (this.local_addr !== null) {
          resources.release(this.local_addr);
        }
      }
    });
  };

  var TcpSocket_IsTCPSocket = function(resource) {
    return resources.is(resource, TCP_SOCKET_RESOURCE);
  };

  var TcpSocket_Bind = function(socketResource, addr_res, callback_ptr) {
    var socket = resources.resolve(socketResource, TCP_SOCKET_RESOURCE);
    if (socket === undefined) {
      return ppapi.PP_ERROR_BADRESOURCE;
    }
    if (socket.connected || socket.listening || socket.bound ||
        socket.pending_state != PP_Socket_State.PP_SOCKET_NONE) {
      return ppapi.PP_ERROR_FAILED;
    }

    var net_addr = resources.resolve(addr_res, NET_ADDRESS_RESOURCE);
    if (net_addr === undefined) {
      return ppapi.PP_ERROR_BADRESOURCE;
    }
    resources.addRef(addr_res);
    socket.local_addr = addr_res;
    socket.addr_family = net_addr.address_family;
    socket.pending_state = PP_Socket_State.PP_SOCKET_BINDING;
    var bind_callback = glue.getCompletionCallback(callback_ptr);
    var cleanup_on_error = function(error_code) {
      if (error_code === undefined) {
        error_code = ppapi.PP_ERROR_FAILED;
      }
      socket.pending_state = PP_Socket_State.PP_SOCKET_NONE;
      resources.release(socket.local_addr);
      socket.local_addr = null;
      socket.addr_family = null;
      bind_callback(error_code);
    };

    if (net_addr.address_family === PPNA_Family.PP_NETADDRESS_FAMILY_IPV4) {
      var net_addr_array = Array.prototype.slice.call(net_addr.pp_address);
      tizen.tcpsocket.bind(net_addr_array, net_addr.address_family, function(socket_fd) {
        socket.socket_fd = socket_fd;
        socket.pending_state = PP_Socket_State.PP_SOCKET_NONE;
        socket.bound = true;
        bind_callback(ppapi.PP_OK);
      }, function(error_code) {
        var status_code = ppapi.PP_ERROR_FAILED;
        if (error_code == 98) {
          status_code = ppapi.PP_ERROR_ADDRESS_IN_USE;
        }
        cleanup_on_error(status_code);
      });
    } else if (net_addr.address_family === PPNA_Family.PP_NETADDRESS_FAMILY_IPV6) {
      console.warn("TcpSocket_Bind ERROR IPv6 is not supported");
      setTimeout(function() { cleanup_on_error(); }, 0);
    } else {
      console.warn("TcpSocket_Bind ERROR unknown protocol");
      setTimeout(function() { cleanup_on_error(); }, 0);
    }
    return ppapi.PP_OK_COMPLETIONPENDING;
  };

  var TcpSocket_Connect = function(socketResource, addr_res, callback_ptr) {
    var socket = resources.resolve(socketResource, TCP_SOCKET_RESOURCE);
    if (socket === undefined) {
      return ppapi.PP_ERROR_BADRESOURCE;
    }
    if (socket.connected || socket.listening ||
        socket.pending_state != PP_Socket_State.PP_SOCKET_NONE) {
      return ppapi.PP_ERROR_INPROGRESS;
    }
    var net_addr = resources.resolve(addr_res, NET_ADDRESS_RESOURCE);
    if (net_addr === undefined) {
      return ppapi.PP_ERROR_BADRESOURCE;
    }
    socket.pending_state = PP_Socket_State.PP_SOCKET_CONNECTING;

    resources.addRef(addr_res);
    socket.remote_addr = addr_res;
    socket.addr_family = net_addr.address_family;
    socket.connect_callback = glue.getCompletionCallback(callback_ptr);

    var cleanup_on_error = function() {
      socket.pending_state = PP_Socket_State.PP_SOCKET_NONE;
      resources.release(resources.remote_addr);
      socket.remote_addr = null;
      socket.addr_family = null;
      socket.connect_callback(ppapi.PP_ERROR_FAILED);
      socket.connect_callback = null;
    };

    if (net_addr.address_family === PPNA_Family.PP_NETADDRESS_FAMILY_IPV4) {
      var net_addr_array = Array.prototype.slice.call(net_addr.pp_address);
      tizen.tcpsocket.connect(net_addr_array, net_addr.address_family, function(socket_fd, local_addr) {
        var local_addr_resource = create_net_address_from_bytes(PPNA_Family.PP_NETADDRESS_FAMILY_IPV4, local_addr);
        socket.local_addr = local_addr_resource;
        socket.socket_fd = socket_fd;
        socket.pending_state = PP_Socket_State.PP_SOCKET_NONE;
        socket.connected = true;
        socket.connect_callback(ppapi.PP_OK);
        socket.connect_callback = null;
      }, function() {
        cleanup_on_error();
      });
    } else if (net_addr.address_family === PPNA_Family.PP_NETADDRESS_FAMILY_IPV6) {
      console.warn("TcpSocket_Connect ERROR IPv6 is not supported");
      setTimeout(function() { cleanup_on_error(); }, 0);
    } else {
      console.warn("TcpSocket_Connect ERROR unknown protocol");
      setTimeout(function() { cleanup_on_error(); }, 0);
    }
    return ppapi.PP_OK_COMPLETIONPENDING;
  };

  var TcpSocket_GetLocalAddress = function(socketResource) {
    var socket = resources.resolve(socketResource, TCP_SOCKET_RESOURCE);
    if (socket === undefined) {
      return ppapi.PP_ERROR_BADRESOURCE;
    }
    if (socket.local_addr !== null) {
      resources.addRef(socket.local_addr);
      return socket.local_addr;
    }
    return 0;
  };

  var TcpSocket_GetRemoteAddress = function(socketResource) {
    var socket = resources.resolve(socketResource, TCP_SOCKET_RESOURCE);
    if (socket === undefined) {
      return ppapi.PP_ERROR_BADRESOURCE;
    }
    if (socket.remote_addr !== null) {
      resources.addRef(socket.remote_addr);
      return socket.remote_addr;
    }
    return 0;
  };

  var TcpSocket_Read = function(socketResource, buffer_ptr, bytes_to_read, callback_ptr) {
    var socket = resources.resolve(socketResource, TCP_SOCKET_RESOURCE);
    if (socket === undefined) {
      return ppapi.PP_ERROR_BADRESOURCE;
    }
    if (!socket.connected) {
      return ppapi.PP_ERROR_FAILED;
    }
    if (socket.read_callback !== null) {
      // TODO consider case where read can be called many times before completion
      console.warn("TcpSocket_Read: read before completion previous read");
      return ppapi.PP_ERROR_FAILED;
    }
    socket.read_callback = glue.getCompletionCallback(callback_ptr);
    var _buffer_ptr = buffer_ptr;
    var _bytes_to_read = bytes_to_read;

    var cleanup_on_error = function() {
      socket.pending_state = PP_Socket_State.PP_SOCKET_NONE;
      socket.read_callback(ppapi.PP_ERROR_FAILED);
      socket.read_callback = null;
    };

    if (socket.addr_family === PPNA_Family.PP_NETADDRESS_FAMILY_IPV4) {
      tizen.tcpsocket.read(socket.socket_fd, _bytes_to_read,
          function(_buffer_read, _bytes_read) {
            var read_callback = socket.read_callback;
            socket.read_callback = null;
            if (socket.connected) {
              HEAP8.set(_buffer_read, _buffer_ptr);
              read_callback(_bytes_read);
            } else {
              read_callback(ppapi.PP_ERROR_ABORTED);
            }
          },
          function() {
            cleanup_on_error();
            socket.connected = false;
          });
    }
    else if (socket.addr_family === PPNA_Family.PP_NETADDRESS_FAMILY_IPV6) {
      console.warn("TcpSocket_Read ERROR IPv6 is not supported");
      setTimeout(function() { cleanup_on_error(); }, 0);
    }
    else {
      console.warn("TcpSocket_Read ERROR unknown protocol");
      setTimeout(function() { cleanup_on_error(); }, 0);
    }
    return ppapi.PP_OK_COMPLETIONPENDING;
  };

  var TcpSocket_Write = function(socketResource, buffer_ptr, bytes_to_write, callback_ptr) {
    let socket = resources.resolve(socketResource, TCP_SOCKET_RESOURCE);
    if (socket === undefined) {
      return ppapi.PP_ERROR_BADRESOURCE;
    }
    if (!socket.connected) {
      return ppapi.PP_ERROR_FAILED;
    }
    if (socket.write_callback !== null) {
      // TODO consider case where write can be called many times before completion
      console.warn("TcpSocket_Write: write before completion previous write");
      return ppapi.PP_ERROR_FAILED;
    }
    socket.write_callback = glue.getCompletionCallback(callback_ptr);
    var _bytes_to_write = bytes_to_write;

    var buffer = HEAP8.subarray(buffer_ptr, buffer_ptr + bytes_to_write);
    var write_buffer = Array.prototype.slice.call(buffer);

    var cleanup_on_error = function() {
      socket.pending_state = PP_Socket_State.PP_SOCKET_NONE;
      socket.write_callback(ppapi.PP_ERROR_FAILED);
      socket.write_callback = null;
    };

    if (socket.addr_family === PPNA_Family.PP_NETADDRESS_FAMILY_IPV4) {
      tizen.tcpsocket.write(socket.socket_fd, write_buffer, _bytes_to_write,
          function(_bytes_written) {
            var write_callback = socket.write_callback;
            socket.write_callback = null;
            if (socket.connected) {
              write_callback(_bytes_written);
            } else {
              write_callback(ppapi.PP_ERROR_ABORTED);
            }
          },
          function() {
            cleanup_on_error();
            socket.connected = false;
          });
    }
    else if (socket.addr_family === PPNA_Family.PP_NETADDRESS_FAMILY_IPV6) {
      console.warn("TcpSocket_Write ERROR IPv6 is not supported");
      setTimeout(function() { cleanup_on_error(); }, 0);
    }
    else {
      console.warn("TcpSocket_Write ERROR unknown protocol");
      setTimeout(function() { cleanup_on_error(); }, 0);
    }
    return ppapi.PP_OK_COMPLETIONPENDING;
  };

  var TcpSocket_Listen = function(socketResource, backlog, callback_ptr) {
    var socket = resources.resolve(socketResource, TCP_SOCKET_RESOURCE);
    if (socket === undefined) {
      return ppapi.PP_ERROR_BADRESOURCE;
    }
    socket.backlog = backlog;
    var listen_callback = glue.getCompletionCallback(callback_ptr);

    if (socket.connected || socket.listening || !socket.bound ||
        socket.pending_state != PP_Socket_State.PP_SOCKET_NONE) {
      return ppapi.PP_ERROR_FAILED;
    }

    socket.pending_state = PP_Socket_State.PP_SOCKET_START_LISTENING;
    var bind_callback = glue.getCompletionCallback(callback_ptr);

    var cleanup_on_error = function(status_code) {
      if (status_code === undefined) {
        status_code = ppapi.PP_ERROR_FAILED;
      }
      socket.pending_state = PP_Socket_State.PP_SOCKET_NONE;
      bind_callback(status_code);
    };

    if (socket.addr_family === PPNA_Family.PP_NETADDRESS_FAMILY_IPV4) {
      tizen.tcpsocket.listen(socket.socket_fd, backlog, function() {
        socket.pending_state = PP_Socket_State.PP_SOCKET_NONE;
        socket.listening = true;
        bind_callback(ppapi.PP_OK);
      }, function(error_code) {
        var status_code = ppapi.PP_ERROR_FAILED;
        if (error_code == 98) {
          status_code = ppapi.PP_ERROR_ADDRESS_IN_USE;
        }
        cleanup_on_error(status_code);
      });
    } else if (socket.addr_family === PPNA_Family.PP_NETADDRESS_FAMILY_IPV6) {
      console.warn("TcpSocket_Listen ERROR IPv6 is not supported");
      setTimeout(function() { cleanup_on_error(); }, 0);
    } else {
      console.warn("TcpSocket_Listen ERROR unknown protocol");
      setTimeout(function() { cleanup_on_error(); }, 0);
    }
    return ppapi.PP_OK_COMPLETIONPENDING;
  };

  var TcpSocket_Accept = function(socketResource, accepted_tcp_socket_ptr, callback_ptr) {
    var socket = resources.resolve(socketResource, TCP_SOCKET_RESOURCE);
    if (socket === undefined) {
      return ppapi.PP_ERROR_BADRESOURCE;
    }
    if (!socket.listening || socket.pending_state != PP_Socket_State.PP_SOCKET_NONE) {
      return ppapi.PP_ERROR_FAILED;
    }
    var accept_callback = glue.getCompletionCallback(callback_ptr);
    socket.pending_state = PP_Socket_State.PP_SOCKET_ACCEPTING;

    var cleanup_on_error = function() {
      socket.pending_state = PP_Socket_State.PP_SOCKET_NONE;
      accept_callback(ppapi.PP_ERROR_FAILED);
    };

    if (socket.addr_family === PPNA_Family.PP_NETADDRESS_FAMILY_IPV4) {
      tizen.tcpsocket.accept(socket.socket_fd, function(socket_fd, addr_family, remote_addr, local_addr) {
        socket.pending_state = PP_Socket_State.PP_SOCKET_NONE;
        if ( socket_fd < 0 || addr_family !== PPNA_Family.PP_NETADDRESS_FAMILY_IPV4) {
          accept_callback(ppapi.PP_ERROR_FAILED);
          return;
        }
        var remote_addr_resource = create_net_address_from_bytes(PPNA_Family.PP_NETADDRESS_FAMILY_IPV4, remote_addr);
        var local_addr_resource = create_net_address_from_bytes(PPNA_Family.PP_NETADDRESS_FAMILY_IPV4, local_addr);
        var remote_socket_resource = TcpSocket_CreateFromIPv4Connection(socket_fd, remote_addr_resource, local_addr_resource, true);
        var remote_socket = resources.resolve(remote_socket_resource, TCP_SOCKET_RESOURCE);
        HEAP32[accepted_tcp_socket_ptr>>2] = remote_socket_resource;
        accept_callback(ppapi.PP_OK);
      }, function() { cleanup_on_error(); });
    } else if (socket.addr_family === PPNA_Family.PP_NETADDRESS_FAMILY_IPV6) {
      console.warn("TcpSocket_Accept ERROR IPv6 is not supported");
      setTimeout(function() { cleanup_on_error(); }, 0);
    } else {
      console.warn("TcpSocket_Accept ERROR unknown protocol");
      setTimeout(function() { cleanup_on_error(); }, 0);
    }
  };

  var TcpSocket_Close = function(socketResource) {
    var socket = resources.resolve(socketResource, TCP_SOCKET_RESOURCE);
    if (socket === undefined) {
      return ppapi.PP_ERROR_BADRESOURCE;
    }
    tizen.tcpsocket.close(socket.socket_fd);
    socket.pending_state = PP_Socket_State.PP_SOCKET_NONE;
    socket.connected = false;
    socket.listening  = false;
    socket.bound = false;
    if (socket.remote_addr !== null) {
      resources.release(socket.remote_addr);
      socket.remote_addr = null;
    }
    if (socket.local_addr !== null) {
      resources.release(socket.local_addr);
      socket.local_addr = null;
    }
  };

  var TcpSocket_SetOption = function(socketResource, name, value, callback) {
    // TODO Consider to add buffer for read and write and then implement
    // support for buffer size options
    var socket = resources.resolve(socketResource, TCP_SOCKET_RESOURCE);
    if (socket === undefined)
      return ppapi.PP_ERROR_BADRESOURCE;

    var var_type = glue.getVarType(value);
    var js_obj = glue.memoryToJSVar(value);
    var set_option_callback = glue.getCompletionCallback(callback_ptr);

    if (name === PP_TCPSocket_Option.PP_TCPSOCKET_OPTION_NO_DELAY) {
      if (var_type !== ppapi.PP_VARTYPE_BOOL) {
        return ppapi.PP_ERROR_BADARGUMENT;
      }
      if (js_obj) {
        // data are always send without delay
        setTimeout(function() { set_option_callback(ppapi.PP_OK); }, 0);
      } else {
        // There is no buffering mechanism in pepper js
        setTimeout(function() { set_option_callback(ppapi.PP_ERROR_NOTSUPPORTED); }, 0);
      }
    } else if (name === PP_TCPSocket_Option.PP_TCPSOCKET_OPTION_SEND_BUFFER_SIZE) {
      if (var_type !== ppapi.PP_VARTYPE_INT32) {
        return ppapi.PP_ERROR_BADARGUMENT;
      }
      // There is no buffering mechanism in pepper js
      setTimeout(function() { set_option_callback(ppapi.PP_ERROR_NOTSUPPORTED); }, 0);
    } else if (name === PP_TCPSocket_Option.PP_TCPSOCKET_OPTION_RECV_BUFFER_SIZE) {
      if (var_type !== ppapi.PP_VARTYPE_INT32) {
        return ppapi.PP_ERROR_BADARGUMENT;
      }
      // There is no buffering mechanism in pepper js
      setTimeout(function() { set_option_callback(ppapi.PP_ERROR_NOTSUPPORTED); }, 0);
    } else {
      console.error("TcpSocket_SetOption got unknown option " + name);
      return ppapi.PP_ERROR_FAILED;
    }
    return ppapi.PP_OK_COMPLETIONPENDING;
  };

  registerInterface("PPB_TCPSocket;1.0", [
    TcpSocket_Create,
    TcpSocket_IsTCPSocket,
    TcpSocket_Connect,
    TcpSocket_GetLocalAddress,
    TcpSocket_GetRemoteAddress,
    TcpSocket_Read,
    TcpSocket_Write,
    TcpSocket_Close,
    TcpSocket_SetOption
  ]);
  registerInterface("PPB_TCPSocket;1.1", [
    TcpSocket_Create,
    TcpSocket_IsTCPSocket,
    TcpSocket_Bind,
    TcpSocket_Connect,
    TcpSocket_GetLocalAddress,
    TcpSocket_GetRemoteAddress,
    TcpSocket_Read,
    TcpSocket_Write,
    TcpSocket_Listen,
    TcpSocket_Accept,
    TcpSocket_Close,
    TcpSocket_SetOption
  ]);
  registerInterface("PPB_TCPSocket;1.2", [
    TcpSocket_Create,
    TcpSocket_IsTCPSocket,
    TcpSocket_Bind,
    TcpSocket_Connect,
    TcpSocket_GetLocalAddress,
    TcpSocket_GetRemoteAddress,
    TcpSocket_Read,
    TcpSocket_Write,
    TcpSocket_Listen,
    TcpSocket_Accept,
    TcpSocket_Close,
    TcpSocket_SetOption
  ]);

/******************************************************************************
 * stuff for PPB_UdpSocket
 * ***************************************************************************/

  var PP_UDPSocket_Option = {
    PP_UDPSOCKET_OPTION_ADDRESS_REUSE: 0,
    PP_UDPSOCKET_OPTION_BROADCAST: 1,
    PP_UDPSOCKET_OPTION_SEND_BUFFER_SIZE: 2,
    PP_UDPSOCKET_OPTION_RECV_BUFFER_SIZE: 3,
    PP_UDPSOCKET_OPTION_MULTICAST_LOOP: 4,
    PP_UDPSOCKET_OPTION_MULTICAST_TTL: 5
  };

  var UdpSocket_Create = function(instance) {
    return resources.register(UDP_SOCKET_RESOURCE, {
      socket_fd: null,
      bound_addr: null,
      addr_family: null,
      bound: false,
      pending_recv: false,
      pending_send: false,
      option_address_reuse: 0,
      option_broadcast: 0,
      pending_state: PP_Socket_State.PP_SOCKET_NONE,
      destroy: function () {
        if (this.bound_addr !== null) {
          resources.release(this.bound_addr);
        }
      }
    });
  };

  var UdpSocket_IsUDPSocket = function(resource) {
    return resources.is(resource, UDP_SOCKET_RESOURCE);
  };

  var UdpSocket_Bind = function(socketResource, addr_res, callback_ptr) {
    var socket = resources.resolve(socketResource, UDP_SOCKET_RESOURCE);
    if (socket === undefined) {
      return ppapi.PP_ERROR_BADRESOURCE;
    }

    if(socket.bound || socket.pending_state != PP_Socket_State.PP_SOCKET_NONE) {
       return ppapi.PP_ERROR_FAILED;
    }

    var net_addr = resources.resolve(addr_res, NET_ADDRESS_RESOURCE);
    if (net_addr === undefined) {
      return ppapi.PP_ERROR_BADRESOURCE;
    }
    resources.addRef(addr_res);
    socket.bound_addr = addr_res;
    socket.addr_family = net_addr.address_family;
    socket.pending_state = PP_Socket_State.PP_SOCKET_BINDING;
    var bind_callback = glue.getCompletionCallback(callback_ptr);
    var cleanup_on_error = function(error_code) {
      if (error_code === undefined) {
        error_code = ppapi.PP_ERROR_FAILED;
      }
      socket.pending_state = PP_Socket_State.PP_SOCKET_NONE;
      resources.release(socket.bound_addr);
      socket.bound_addr = null;
      socket.addr_family = null;
      bind_callback(error_code);
    };

    if (net_addr.address_family === PPNA_Family.PP_NETADDRESS_FAMILY_IPV4) {
      var net_addr_array = Array.prototype.slice.call(net_addr.pp_address);
      tizen.udpsocket.bind(net_addr_array,
          net_addr.address_family,
          socket.option_address_reuse, socket.option_broadcast,
          function(socket_fd) {
            socket.socket_fd = socket_fd;
            socket.pending_state = PP_Socket_State.PP_SOCKET_NONE;
            socket.bound = true;
            bind_callback(ppapi.PP_OK);
          }, function(error_code) {
            var status_code = ppapi.PP_ERROR_FAILED;
            if(error_code == 98) {
              status_code = ppapi.PP_ERROR_ADDRESS_IN_USE;
            }
            cleanup_on_error(status_code);
          });
    } else if (net_addr.address_family === PPNA_Family.PP_NETADDRESS_FAMILY_IPV6) {
      console.warn("UdpSocket_Bind ERROR IPv6 is not supported");
      setTimeout(function() { cleanup_on_error(ppapi.PP_ERROR_NOTSUPPORTED); }, 0);
    } else {
      console.warn("UdpSocket_Bind ERROR unknown protocol");
      setTimeout(function() { cleanup_on_error(); }, 0);
    }
    return ppapi.PP_OK_COMPLETIONPENDING;
  };

  var UdpSocket_GetBoundAddress = function(socketResource) {
    var socket = resources.resolve(socketResource, UDP_SOCKET_RESOURCE);
    if (socket === undefined) {
      return ppapi.PP_ERROR_BADRESOURCE;
    }
    if (socket.bound_addr !== null) {
      resources.addRef(socket.bound_addr);
      return socket.bound_addr;
    }
    return 0;
  };

  var UdpSocket_RecvFrom = function(socketResource, buffer_ptr, bytes_to_read, addr_ptr, callback_ptr) {
    var socket = resources.resolve(socketResource, UDP_SOCKET_RESOURCE);
    if (socket === undefined) {
      return ppapi.PP_ERROR_BADRESOURCE;
    }
    if(!socket.bound) {
      return ppapi.PP_ERROR_FAILED;
    }
    if(socket.pending_recv) {
      console.warn("UdpSocket_RecvFrom: recv before completion previous recv");
      return ppapi.PP_ERROR_FAILED;
    }

    var recvfrom_callback = glue.getCompletionCallback(callback_ptr);
    var _buffer_ptr = buffer_ptr;
    var _bytes_to_read = bytes_to_read;
    socket.pending_recv = true;

    var cleanup_on_error = function(error_code) {
      if (error_code === undefined) {
        error_code = ppapi.PP_ERROR_FAILED;
      }
      socket.pending_state = PP_Socket_State.PP_SOCKET_NONE;
      socket.pending_recv = false;
      recvfrom_callback(error_code);
    };

    if(socket.addr_family === PPNA_Family.PP_NETADDRESS_FAMILY_IPV4) {
      tizen.udpsocket.recvfrom(socket.socket_fd, _bytes_to_read,
          function(_buffer_read, _bytes_read, _remote_addr) {
            socket.pending_recv = false;
            if (socket.bound) {
              var remote_addr_resource = create_net_address_from_bytes(PPNA_Family.PP_NETADDRESS_FAMILY_IPV4, _remote_addr);
              HEAP32[addr_ptr>>2] = remote_addr_resource;
              HEAP8.set(_buffer_read, _buffer_ptr);
              socket.pending_recv = false;
              recvfrom_callback(_bytes_read);
            } else {
              recvfrom_callback(ppapi.PP_ERROR_ABORTED);
            }
          },
          function() {
            cleanup_on_error();
            socket.bound = false;
          });
    }
    else if (socket.addr_family === PPNA_Family.PP_NETADDRESS_FAMILY_IPV6) {
      console.warn("TcpSocket_Read ERROR IPv6 is not supported");
      setTimeout(function() { cleanup_on_error(ppapi.PP_ERROR_NOTSUPPORTED); }, 0);
    }
    else {
      console.warn("TcpSocket_Read ERROR unknown protocol");
      setTimeout(function() { cleanup_on_error(); }, 0);
    }
    return ppapi.PP_OK_COMPLETIONPENDING;
  }

  var UdpSocket_SendTo = function(socketResource, buffer_ptr, bytes_to_write, addr_res, callback_ptr) {
    let socket = resources.resolve(socketResource, UDP_SOCKET_RESOURCE);
    if (socket === undefined) {
      return ppapi.PP_ERROR_BADRESOURCE;
    }
    if(!socket.bound) {
       return ppapi.PP_ERROR_FAILED;
    }
    if(socket.pending_send) {
      console.warn("UdpSocket_SendTo: send before completion previous send");
      return ppapi.PP_ERROR_FAILED;
    }

    var net_addr = resources.resolve(addr_res, NET_ADDRESS_RESOURCE);
    if (net_addr === undefined) {
      return ppapi.PP_ERROR_BADRESOURCE;
    }
    socket.pending_send = true;
    var sendto_callback = glue.getCompletionCallback(callback_ptr);
    var _bytes_to_write = bytes_to_write;

    var buffer = HEAP8.subarray(buffer_ptr, buffer_ptr + bytes_to_write);
    var send_buffer = Array.prototype.slice.call(buffer);

    var cleanup_on_error = function(error_code) {
      if (error_code === undefined) {
        error_code = ppapi.PP_ERROR_FAILED;
      }
      socket.pending_state = PP_Socket_State.PP_SOCKET_NONE;
      socket.pending_send = false;
      sendto_callback(error_code);
    };

    if(socket.addr_family === PPNA_Family.PP_NETADDRESS_FAMILY_IPV4 && net_addr.address_family === socket.addr_family) {
      var net_addr_array = Array.prototype.slice.call(net_addr.pp_address);
      tizen.udpsocket.sendto(socket.socket_fd, send_buffer, _bytes_to_write, net_addr_array, net_addr.address_family,
          function(_bytes_written) {
            socket.pending_send = false;
            if (socket.bound) {
              sendto_callback(_bytes_written);
            } else {
              sendto_callback(ppapi.PP_ERROR_ABORTED);
            }
          },
          function() {
            cleanup_on_error();
            socket.bound = false;
          });
    }
    else if (socket.addr_family === PPNA_Family.PP_NETADDRESS_FAMILY_IPV6) {
      console.warn("TcpSocket_Write ERROR IPv6 is not supported");
      setTimeout(function() { cleanup_on_error(ppapi.PP_ERROR_NOTSUPPORTED); }, 0);
    }
    else {
      console.warn("TcpSocket_Write ERROR unknown protocol");
      setTimeout(function() { cleanup_on_error(); }, 0);
    }
    return ppapi.PP_OK_COMPLETIONPENDING;
  };

  var UdpSocket_Close = function(socketResource) {
    var socket = resources.resolve(socketResource, UDP_SOCKET_RESOURCE);
    if (socket === undefined) {
      return ppapi.PP_ERROR_BADRESOURCE;
    }
    tizen.udpsocket.close(socket.socket_fd);
    socket.pending_state = PP_Socket_State.PP_SOCKET_NONE;
    socket.bound = false;
    socket.pending_recv = false;
    socket.pending_send = false;
    if (socket.bound_addr !== null) {
      resources.release(socket.bound_addr);
      socket.bound_addr = null;
    }
  };

  var UdpSocket_SetOption = function(socketResource, name, value, callback_ptr) {
    var socket = resources.resolve(socketResource, UDP_SOCKET_RESOURCE);
    if (socket === undefined) {
      return ppapi.PP_ERROR_BADRESOURCE;
    }
    var var_type = glue.getVarType(value);
    var js_obj = glue.memoryToJSVar(value);
    var set_option_callback = glue.getCompletionCallback(callback_ptr);

    if (name === PP_UDPSocket_Option.PP_UDPSOCKET_OPTION_ADDRESS_REUSE) {
      if (var_type !== ppapi.PP_VARTYPE_BOOL) {
        return ppapi.PP_ERROR_BADARGUMENT;
      }
      if (socket.bound) {
        return ppapi.PP_ERROR_FAILED;
      }
      socket.option_address_reuse = js_obj;
      setTimeout(function() { set_option_callback(ppapi.PP_OK); }, 0);
    }
    else if (name === PP_UDPSocket_Option.PP_UDPSOCKET_OPTION_BROADCAST) {
      if (var_type !== ppapi.PP_VARTYPE_BOOL) {
        return ppapi.PP_ERROR_BADARGUMENT;
      }
      socket.option_broadcast = js_obj;
      if (socket.bound) {
        tizen.udpsocket.setoption(socket.socket_fd, "BROADCAST", js_obj,
          function() {
            set_option_callback(ppapi.PP_OK);
          },
          function() {
            set_option_callback(ppapi.PP_ERROR_FAILED);
          });
      } else {
        setTimeout(function() { set_option_callback(ppapi.PP_OK); }, 0);
      }
    }
    else if (name === PP_UDPSocket_Option.PP_UDPSOCKET_OPTION_SEND_BUFFER_SIZE) {
      if (var_type !== ppapi.PP_VARTYPE_INT32) {
        return ppapi.PP_ERROR_BADARGUMENT;
      }
      // There is no buffering mechanism in pepper js
      setTimeout(function() { set_option_callback(ppapi.PP_ERROR_NOTSUPPORTED); }, 0);
    }
    else if (name === PP_UDPSocket_Option.PP_UDPSOCKET_OPTION_RECV_BUFFER_SIZE) {
      if (var_type !== ppapi.PP_VARTYPE_INT32) {
        return ppapi.PP_ERROR_BADARGUMENT;
      }
      // There is no buffering mechanism in pepper js
      setTimeout(function() { set_option_callback(ppapi.PP_ERROR_NOTSUPPORTED); }, 0);
    }
    else if (name === PP_UDPSocket_Option.PP_UDPSOCKET_OPTION_MULTICAST_LOOP) {
      if (var_type !== ppapi.PP_VARTYPE_BOOL) {
        return ppapi.PP_ERROR_BADARGUMENT;
      }
      // option PP_UDPSOCKET_OPTION_MULTICAST_LOOP is used for groups
      console.error("UdpSocket_SetOption PP_UDPSOCKET_OPTION_MULTICAST_LOOP is not supported");
      setTimeout(function() { set_option_callback(ppapi.PP_ERROR_NOTSUPPORTED); }, 0);
    }
    else if (name === PP_UDPSocket_Option.PP_UDPSOCKET_OPTION_MULTICAST_TTL) {
      if (var_type !== ppapi.PP_VARTYPE_INT32) {
        return ppapi.PP_ERROR_BADARGUMENT;
      }
      if (js_obj < 0 || js_obj > 255) {
        return ppapi.PP_ERROR_BADARGUMENT;
      }
      // option PP_UDPSOCKET_OPTION_MULTICAST_TTL is used for groups
      console.error("UdpSocket_SetOption PP_UDPSOCKET_OPTION_MULTICAST_TTL is not supported");
      setTimeout(function() { set_option_callback(ppapi.PP_ERROR_NOTSUPPORTED); }, 0);
    }
    else {
      console.error("UdpSocket_SetOption got unknown option " + name);
      return ppapi.PP_ERROR_FAILED;
    }
    return ppapi.PP_OK_COMPLETIONPENDING;
  };

  var UdpSocket_JoinGroup = function(socketResource, group, callback_ptr) {
    throw "UdpSocket_JoinGroup not implemented";
  };

  var UdpSocket_LeaveGroup = function(socketResource, group, callback_ptr) {
    throw "UdpSocket_LeaveGroup not implemented";
  };

  registerInterface("PPB_UDPSocket;1.0", [
    UdpSocket_Create,
    UdpSocket_IsUDPSocket,
    UdpSocket_Bind,
    UdpSocket_GetBoundAddress,
    UdpSocket_RecvFrom,
    UdpSocket_SendTo,
    UdpSocket_Close,
    UdpSocket_SetOption,
  ]);

  registerInterface("PPB_UDPSocket;1.1", [
    UdpSocket_Create,
    UdpSocket_IsUDPSocket,
    UdpSocket_Bind,
    UdpSocket_GetBoundAddress,
    UdpSocket_RecvFrom,
    UdpSocket_SendTo,
    UdpSocket_Close,
    UdpSocket_SetOption,
  ]);

  registerInterface("PPB_UDPSocket;1.2", [
    UdpSocket_Create,
    UdpSocket_IsUDPSocket,
    UdpSocket_Bind,
    UdpSocket_GetBoundAddress,
    UdpSocket_RecvFrom,
    UdpSocket_SendTo,
    UdpSocket_Close,
    UdpSocket_SetOption,
    UdpSocket_JoinGroup,
    UdpSocket_LeaveGroup,
  ]);
})();
