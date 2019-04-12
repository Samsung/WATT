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

var capabilityMediaInputSource = {
	'href' : "/capability/mediaInputSource/main/0",

	'update' : function() {
		ocfDevice.getRemoteRepresentation(this.href, this.onRepresentCallback);
	},

	'onRepresentCallback' : function(result, deviceHandle, uri, rcsJsonString) {
		scplugin.log.debug(className, arguments.callee.name, result);
		scplugin.log.debug(className, arguments.callee.name, uri);

		if (result == "OCF_OK" || result == "OCF_RESOURCE_CHANGED" || result == "OCF_RES_ALREADY_SUBSCRIBED") {
			if(rcsJsonString["modes"] === undefined) return;
			var mode = [];
			mode = rcsJsonString["modes"];
			switch(mode[0]) {
				case 'AM': document.getElementById("valueMode").innerHTML = "AM" ; break;
				case 'CD': document.getElementById("valueMode").innerHTML = "CD" ; break;
				case 'FM': document.getElementById("valueMode").innerHTML = "FM" ; break;
				case 'HDMI': document.getElementById("valueMode").innerHTML = "HDMI" ; break;
				case 'HDMI2': document.getElementById("valueMode").innerHTML = "HDMI2" ; break;
				case 'USB': document.getElementById("valueMode").innerHTML = "USB" ; break;
				case 'YouTube': document.getElementById("valueMode").innerHTML = "YouTube" ; break;
				case 'aux': document.getElementById("valueMode").innerHTML = "aux" ; break;
				case 'bluetooth': document.getElementById("valueMode").innerHTML = "bluetooth" ; break;
				case 'digital': document.getElementById("valueMode").innerHTML = "digital" ; break;
				case 'melon': document.getElementById("valueMode").innerHTML = "melon" ; break;
				case 'wifi': document.getElementById("valueMode").innerHTML = "wifi" ; break;
			}
		}
	},

	'set' : function(mode) {
		console.log ("mode: " + mode);
		var setRcsJson = {};
		switch(mode) {
			case 'AM': setRcsJson["modes"] = ["AM"] ; break;
			case 'CD': setRcsJson["modes"] = ["CD"] ; break;
			case 'FM': setRcsJson["modes"] = ["FM"] ; break;
			case 'HDMI': setRcsJson["modes"] = ["HDMI"] ; break;
			case 'HDMI2': setRcsJson["modes"] = ["HDMI2"] ; break;
			case 'USB': setRcsJson["modes"] = ["USB"] ; break;
			case 'YouTube': setRcsJson["modes"] = ["YouTube"] ; break;
			case 'aux': setRcsJson["modes"] = ["aux"] ; break;
			case 'bluetooth': setRcsJson["modes"] = ["bluetooth"] ; break;
			case 'digital': setRcsJson["modes"] = ["digital"] ; break;
			case 'melon': setRcsJson["modes"] = ["melon"] ; break;
			case 'wifi': setRcsJson["modes"] = ["wifi"] ; break;
		}

		scplugin.log.debug(className, arguments.callee.name, setRcsJson);
		ocfDevice.setRemoteRepresentation(this.href, setRcsJson, this.onRepresentCallback);
	}
}
