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

var capabilityDishwasherOperatingState = {
	'href' : "/capability/dishwasherOperatingState/main/0",
	'state' : "stop",

	'update' : function() {
		ocfDevice.getRemoteRepresentation(this.href, this.onRepresentCallback);
	},

	'onRepresentCallback' : function(result, deviceHandle, uri, rcsJsonString) {
		scplugin.log.debug(className, arguments.callee.name, result);
		scplugin.log.debug(className, arguments.callee.name, uri);
		if (result == "OCF_OK" || result == "OCF_RESOURCE_CHANGED" || result == "OCF_RES_ALREADY_SUBSCRIBED") {
			if(rcsJsonString["machineState"] === undefined) return;
			if (rcsJsonString["machineState"] == "run") {
				document.getElementById("state").src = "res/washer_ic_pause.png";
				document.getElementById("cancel_button").style.visibility = "visible";
				document.getElementById("ready_text1").style.display = "none";
				document.getElementById("ready_text2").style.display = "none";
				document.getElementById("run_text1").style.display = "inherit";
				document.getElementById("run_text2").style.display = "inherit";
				document.getElementById("run_text3").style.display = "inherit";
				capabilityDishwasherOperatingState.state = "run";
			} else if (rcsJsonString["machineState"] == "pause") {
				document.getElementById("state").src = "res/washer_ic_run.png";
				document.getElementById("cancel_button").style.visibility = "visible";
				document.getElementById("ready_text1").style.display = "none";
				document.getElementById("ready_text2").style.display = "none";
				document.getElementById("run_text1").style.display = "inherit";
				document.getElementById("run_text2").style.display = "inherit";
				document.getElementById("run_text3").style.display = "inherit";
				capabilityDishwasherOperatingState.state = "pause";
			} else if (rcsJsonString["machineState"] == "stop") {
				document.getElementById("state").src = "res/washer_ic_run.png";
				document.getElementById("cancel_button").style.visibility = "hidden";
				document.getElementById("ready_text1").style.display = "inherit";
				document.getElementById("ready_text2").style.display = "inherit";
				document.getElementById("run_text1").style.display = "none";
				document.getElementById("run_text2").style.display = "none";
				document.getElementById("run_text3").style.display = "none";
				capabilityDishwasherOperatingState.state = "stop";
			}
		}
	},

	'set' : function(machineState) {
		scplugin.log.debug(className, arguments.callee.name, "machineState : " + machineState);
		var setRcsJson = {};
		setRcsJson["machineState"] = machineState;
		ocfDevice.setRemoteRepresentation(this.href, setRcsJson, this.onRepresentCallback);
	},

	'setState' : function() {
		if (this.state == "run")
			this.set("pause");
		else if (this.state == "pause")
			this.set("run");
		else if (this.state == "stop")
			this.set("run");
	}
}
