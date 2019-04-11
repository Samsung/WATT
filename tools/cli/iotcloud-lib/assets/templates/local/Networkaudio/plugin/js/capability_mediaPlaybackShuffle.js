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

var capabilityMediaPlaybackShuffle = {
	'href' : "/capability/mediaPlaybackShuffle/main/0",
	'value' : "enabled",

	'update' : function() {
		ocfDevice.getRemoteRepresentation(this.href, this.onRepresentCallback);
	},

	'onRepresentCallback' : function(result, deviceHandle, uri, rcsJsonString) {
		scplugin.log.debug(className, arguments.callee.name, result);
		scplugin.log.debug(className, arguments.callee.name, uri);

		if (result == "OCF_OK" || result == "OCF_RESOURCE_CHANGED" || result == "OCF_RES_ALREADY_SUBSCRIBED") {
			if(rcsJsonString["mode"] === undefined) return;
			capabilityMediaPlaybackShuffle.value = rcsJsonString["mode"];
			if(capabilityMediaPlaybackShuffle.value == "enabled") {
				document.getElementById("shuffle_check").checked = true;
				document.getElementById("shuffle").style.color = "#3695dd";
				document.getElementById("shuffle").style.opacity = "1";
				document.getElementById("shuffle").innerHTML = "On";
			}
			else {
				document.getElementById("shuffle_check").checked = false;
				document.getElementById("shuffle").style.color = "#252525";
				document.getElementById("shuffle").style.opacity = "0.9";
				document.getElementById("shuffle").innerHTML = "Off";
			}

		}
	},

	'set' : function(shffle) {
		scplugin.log.debug(className, arguments.callee.name, "shffle : " + shffle);
		var setRcsJson = {};
		setRcsJson["mode"] = shffle;
		ocfDevice.setRemoteRepresentation(this.href, setRcsJson, this.onRepresentCallback);
	}
}
