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

var capabilityMediaPlaybackRepeat = {
	'href' : "/capability/mediaPlaybackRepeat/main/0",
	'value' : "all",

	'update' : function() {
		ocfDevice.getRemoteRepresentation(this.href, this.onRepresentCallback);
	},

	'onRepresentCallback' : function(result, deviceHandle, uri, rcsJsonString) {
		scplugin.log.debug(className, arguments.callee.name, result);
		scplugin.log.debug(className, arguments.callee.name, uri);

		if (result == "OCF_OK" || result == "OCF_RESOURCE_CHANGED" || result == "OCF_RES_ALREADY_SUBSCRIBED") {
			if(rcsJsonString["modes"] === undefined) return;
			capabilityMediaPlaybackRepeat.value = rcsJsonString["modes"];
			if(capabilityMediaPlaybackRepeat.value == "off") {
				document.getElementById("repeat").style.color = "#252525";
				document.getElementById("repeat").style.opacity = "0.9";
				document.getElementById("repeat").innerHTML = "Off";
			}
			else if (capabilityMediaPlaybackRepeat.value == "one") {
				document.getElementById("repeat").style.color = "#3695dd";
				document.getElementById("repeat").style.opacity = "1";
				document.getElementById("repeat").innerHTML = "One";
			}
			else if (capabilityMediaPlaybackRepeat.value == "all") {
				document.getElementById("repeat").style.color = "#3695dd";
				document.getElementById("repeat").style.opacity = "1";
				document.getElementById("repeat").innerHTML = "All";
			}

		}
	},

	'set' : function(repeat) {
		scplugin.log.debug(className, arguments.callee.name, "repeat : " + repeat);
		var setRcsJson = {};
		setRcsJson["modes"] = repeat;
		ocfDevice.setRemoteRepresentation(this.href, setRcsJson, this.onRepresentCallback);
	}
}
