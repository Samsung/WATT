/*
 * Copyright (c) 2015 - 2017 Samsung Electronics Co., Ltd All Rights Reserved
 *
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an AS IS BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var capabilitySwitch = {
	'href' : "/capability/switch/main/0",
	'powerState' : "on",

	'update' : function() {
		ocfDevice.getRemoteRepresentation(this.href, this.onRepresentCallback);
	},

	'onRepresentCallback' : function(result, deviceHandle, uri, rcsJsonString) {
		scplugin.log.debug(className, arguments.callee.name, result);
		scplugin.log.debug(className, arguments.callee.name, uri);

		if (result == "OCF_OK" || result == "OCF_RESOURCE_CHANGED" || result == "OCF_RES_ALREADY_SUBSCRIBED") {
			capabilitySwitch.powerState = rcsJsonString["power"];

			var image = document.getElementById("power_icon_back_circle");
			if (capabilitySwitch.powerState == "on") {
				image.style.background="#3695dd";
		    image.style.opacity="1";
			} else {
				image.style.background="#3695dd";
		    image.style.opacity="0.2";
			}
		}
	},

	'set' : function(state) {
		scplugin.log.debug(className, arguments.callee.name, "power : " + state);
		var setRcsJson = {};
		setRcsJson["power"] = state;
		ocfDevice.setRemoteRepresentation(this.href, setRcsJson, this.onRepresentCallback);
	},

	'powerToggle' : function() {
		if (this.powerState == "on") {
			this.set("off");
		} else {
			this.set("on");
		}
	}
}
