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

var ocfDevice;
var className = "Light";
var capabilities = [capabilitySwitch, capabilitySwitchLevel, capabilityColorTemperature];
var inlineStyle;

window.onload = function () {
	console.log("version : 0.0.1");
	init();

	inlineStyle = document.createElement('style');
	document.body.appendChild(inlineStyle);
};

function init() {
	console.log("-----------init-----------");
	scplugin.manager.getOCFDevices(getOCFDeviceCB);
}

function getOCFDeviceCB(devices) {
	console.log("getOCFDeviceCB : " + devices.length);

	for (var i in devices) {
		console.log("deviceHandle: " + devices[i].deviceHandle);
		console.log("deviceName: " + devices[i].deviceName);
		console.log("deviceType: " + devices[i].deviceType);
		console.log("metadata: " + devices[i].metadata);
	}
	setMainDevice(devices[0]);
	ocfDevice.subscribe(onRepresentCallback);

	for (var i = 0; i < capabilities.length; i++) {
		capabilities[i].update();
	}
}

function onRepresentCallback(result, deviceHandle, uri, rcsJsonString) {
    for (var i = 0; i < capabilities.length; i++) {
        if ( capabilities[i].href == uri) {
            capabilities[i].onRepresentCallback(result, deviceHandle, uri, rcsJsonString);
        }
    }
}

function setMainDevice(device) {
	scplugin.log.debug(className, arguments.callee.name, "set ocf device : " + device.deviceName);
	ocfDevice = device;
}

function backAction() {
  scplugin.manager.close();
}

function onPowerBtnClicked() {
	capabilitySwitch.powerToggle();
}

function InputDimmer(rangeId, rangeValue) {
	capabilitySwitchLevel.set(parseInt(rangeValue));
}

// Dropdowns

function getAll(selector) {
	return Array.prototype.slice.call(document.querySelectorAll(selector), 0);
}

var $dropdowns = getAll('.dropdown:not(.is-hoverable)');

if ($dropdowns.length > 0) {
	$dropdowns.forEach(function ($el) {
		$el.addEventListener('click', function (event) {
			event.stopPropagation();
			$el.classList.toggle('is-active');
		});
	});

	document.addEventListener('click', function (event) {
		closeDropdowns();
	});
}

function closeDropdowns() {
	$dropdowns.forEach(function ($el) {
		$el.classList.remove('is-active');
	});
}