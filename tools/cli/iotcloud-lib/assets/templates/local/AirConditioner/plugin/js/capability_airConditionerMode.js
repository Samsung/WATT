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

var capabilityAirConditionerMode = {
	'href' : "/capability/airConditionerMode/main/0",

	'update' : function() {
		ocfDevice.getRemoteRepresentation(this.href, this.onRepresentCallback);
	},

	'onRepresentCallback' : function(result, deviceHandle, uri, rcsJsonString) {
		scplugin.log.debug(className, arguments.callee.name, result);
		scplugin.log.debug(className, arguments.callee.name, uri);

		if (result == "OCF_OK" || result == "OCF_RESOURCE_CHANGED" || result == "OCF_RES_ALREADY_SUBSCRIBED") {
			var mode = [];
			mode = rcsJsonString["modes"];
			switch(mode[0]) {
				case 'auto': document.getElementById("valueMode").innerHTML = "Auto" ; break;
				case 'cool': document.getElementById("valueMode").innerHTML = "Cool" ; break;
				case 'coolClean': document.getElementById("valueMode").innerHTML = "CoolClean" ; break;
				case 'dry': document.getElementById("valueMode").innerHTML = "Dry" ; break;
				case 'dryClean': document.getElementById("valueMode").innerHTML = "DryClean" ; break;
				case 'fanOnly': document.getElementById("valueMode").innerHTML = "FanOnly" ; break;
				case 'heat': document.getElementById("valueMode").innerHTML = "Heat" ; break;
				case 'heatClean': document.getElementById("valueMode").innerHTML = "HeatClean" ; break;
				case 'notSupported': document.getElementById("valueMode").innerHTML = "NotSupported" ; break;
			}
		}
	},

	'set' : function(mode) {
		console.log ("mode: " + mode);
		var setRcsJson = {};
		switch(mode) {
			case 'Auto': setRcsJson["modes"] = ["auto"] ; break;
			case 'Cool': setRcsJson["modes"] = ["cool"] ; break;
			case 'CoolClean': setRcsJson["modes"] = ["coolClean"] ; break;
			case 'Dry': setRcsJson["modes"] = ["dry"] ; break;
			case 'DryClean': setRcsJson["modes"] = ["dryClean"] ; break;
			case 'FanOnly': setRcsJson["modes"] = ["fanOnly"] ; break;
			case 'Heat': setRcsJson["modes"] = ["heat"] ; break;
			case 'HeatClean': setRcsJson["modes"] = ["heatClean"] ; break;
			case 'NotSupported': setRcsJson["modes"] = ["notSupported"] ; break;
		}

		scplugin.log.debug(className, arguments.callee.name, setRcsJson);
		ocfDevice.setRemoteRepresentation(this.href, setRcsJson, this.onRepresentCallback);
	}
}
