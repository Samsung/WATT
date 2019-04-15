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

var capabilityOdorSensor = {
	'href' : "/capability/odorSensor/main/0",

	'update' : function() {
		ocfDevice.getRemoteRepresentation(this.href, this.onRepresentCallback);
	},

	'onRepresentCallback' : function(result, deviceHandle, uri, rcsJsonString) {
		scplugin.log.debug(className, arguments.callee.name, result);
		scplugin.log.debug(className, arguments.callee.name, uri);

		if (result == "OCF_OK" || result == "OCF_RESOURCE_CHANGED" || result == "OCF_RES_ALREADY_SUBSCRIBED") {
			if(rcsJsonString["odorLevel"] === undefined) return;
			if (rcsJsonString["odorLevel"] <= 1)
				document.getElementById("odorLevel").innerHTML = "Good";
			else if (rcsJsonString["odorLevel"] <= 2)
				document.getElementById("odorLevel").innerHTML = "Normal";
			else if (rcsJsonString["odorLevel"] <= 3)
				document.getElementById("odorLevel").innerHTML = "Poor";
			else
				document.getElementById("odorLevel").innerHTML = "Very poor";
		}
	}
}
