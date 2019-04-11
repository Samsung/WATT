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

var capabilityThermostatCoolingSetpoint = {
	'href' : "/capability/thermostatCoolingSetpoint/main/0",
	'desieredTemperature' : 25,
	'unit' : "C",

	'update' : function() {
		ocfDevice.getRemoteRepresentation(this.href, this.onRepresentCallback);
	},

	'onRepresentCallback' : function(result, deviceHandle, uri, rcsJsonString) {
		scplugin.log.debug(className, arguments.callee.name, result);
		scplugin.log.debug(className, arguments.callee.name, uri);

		if (result == "OCF_OK" || result == "OCF_RESOURCE_CHANGED" || result == "OCF_RES_ALREADY_SUBSCRIBED") {
			if(rcsJsonString["temperature"] === undefined) return;
			capabilityThermostatCoolingSetpoint.desieredTemperature = rcsJsonString["temperature"];
			capabilityThermostatCoolingSetpoint.unit = rcsJsonString["units"];
			document.getElementById("coolingsetTemp").innerHTML = capabilityThermostatCoolingSetpoint.desieredTemperature;

			if (rcsJsonString["units"] == "K") {
				document.getElementById("coolingsetUnit").innerHTML = "°K";
			}
			else if (rcsJsonString["units"] == "F") {
				document.getElementById("coolingsetUnit").innerHTML = "°F";
			}
			else {
				document.getElementById("coolingsetUnit").innerHTML = "°C";
			}
		}
	},

	'increase' : function() {
		console.log ("increase: " + this.desieredTemperature);
		if (this.desieredTemperature == 100) return;
		this.desieredTemperature += 1;
		this.set(this.desieredTemperature,this.unit);
	},

	'decrease' : function() {
		console.log ("decrease: " + this.desieredTemperature);
		if (this.desieredTemperature == 0) return;
		this.desieredTemperature -= 1;
		this.set(this.desieredTemperature,this.unit);
	},

	'set' : function(temperature,unit) {
		console.log ("cooling set point: " + temperature);
		var setRcsJson = {};
		setRcsJson["temperature"] = temperature;
		setRcsJson["units"] = unit;
		scplugin.log.debug(className, arguments.callee.name, setRcsJson);
		ocfDevice.setRemoteRepresentation(this.href, setRcsJson, this.onRepresentCallback);
	}
}
