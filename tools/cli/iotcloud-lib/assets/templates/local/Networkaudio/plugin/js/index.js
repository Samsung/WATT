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
var className = "NetworkAudio";
var capabilities = [capabilitySwitch, capabilityAudioTrackData, capabilityAudioVolume, capabilityMediaPlayback, capabilityMediaPlaybackRepeat, capabilityMediaPlaybackShuffle, capabilityMediaInputSource, capabilityMediaTrackControl];
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

	document.getElementById("buttonMode").addEventListener("click", function(){
		var modalData = '<div class="box">'
		modalData += '<div class="has-text-weight-bold">MODE</div>';
		var modes = ["AM", "CD", "FM", "HDMI", "HDMI2", "USB", "YouTube", "aux", "bluetooth", "digital", "melon", "wifi"];
		var btnMode = document.getElementById('valueMode')

		var arrayLength = modes.length;
		for (var i = 0; i < arrayLength; i++) {
			modalData += '<div class="margin-top-s margin-bottom-s'
			if (btnMode.innerHTML === modes[i])
				modalData += ' has-text-link"';
			else
				modalData += '"';

			modalData += 'onclick="onSelectMode(\'' + modes[i] + '\')">' + modes[i] + '</div>'
		}

		modalData += '<div onClick="closeBottomSheet()" class="has-text-right has-text-weight-bold has-text-link">Cancel</div>';
		modalData += '<div id="bottomSheetLoading" class="modal" style="position: absolute;"><div class="modal-background" style="background-color: rgba(255,255,255,0.6);"></div><div class="loader modal-content"></div></div>'
		modalData += '</div>'
		document.getElementById("bottomSheetContent").innerHTML = modalData
		document.getElementById("bottomSheetBody").classList.add('is-active')
	});

	document.getElementById("buttonRepeat").addEventListener("click", function(){
		var modalData = '<div class="box">'
		modalData += '<div class="has-text-weight-bold">REPEAT</div>';
		var modes = ["All", "One", "Off"];
		var btnMode = document.getElementById('repeat')

		var arrayLength = modes.length;
		for (var i = 0; i < arrayLength; i++) {
			modalData += '<div class="margin-top-s margin-bottom-s'
			if (btnMode.innerHTML === modes[i])
				modalData += ' has-text-link"';
			else
				modalData += '"';

			modalData += 'onclick="onSelectRepeat(\'' + modes[i] + '\')">' + modes[i] + '</div>'
		}

		modalData += '<div onClick="closeBottomSheet()" class="has-text-right has-text-weight-bold has-text-link">Cancel</div>';
		modalData += '<div id="bottomSheetLoading" class="modal" style="position: absolute;"><div class="modal-background" style="background-color: rgba(255,255,255,0.6);"></div><div class="loader modal-content"></div></div>'
		modalData += '</div>'
		document.getElementById("bottomSheetContent").innerHTML = modalData
		document.getElementById("bottomSheetBody").classList.add('is-active')
	});

}

function showLoading()
{
	document.getElementById("bottomSheetLoading").classList.add('is-active')
}

function hideLoading()
{
	document.getElementById("bottomSheetLoading").classList.remove('is-active')
}

function closeBottomSheet()
{
	document.getElementById("bottomSheetBody").classList.remove('is-active')
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
			if (capabilities[i] === capabilityMediaInputSource || capabilities[i] === capabilityMediaPlaybackRepeat)
			{
				hideLoading()
				closeBottomSheet()
			}
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

function onSelectSource(selectedItem) {
    capabilityMediaInputSource.set(selectedItem.value);
}

function onPrevClicked() {
	capabilityMediaTrackControl.set("previous");
}

function onPlayClicked() {
	capabilityMediaPlayback.toggle();
}

function onNextClicked() {
	capabilityMediaTrackControl.set("next");
}

function InputVolume(rangeId, rangeValue) {
	capabilityAudioVolume.setVolume(parseInt(rangeValue));
}

function onSelectRepeat(selectedRepeat)
{
	showLoading();
	capabilityMediaPlaybackRepeat.set(selectedRepeat.toLowerCase());
}

function onClickShuffle(suffleMode) {
	if(suffleMode.checked == true) {
		capabilityMediaPlaybackShuffle.set("enabled");
		suffleMode.checked = false;
	}
	else {
		capabilityMediaPlaybackShuffle.set("disabled");
		suffleMode.checked = true;
	}
}

function onSelectMode(selectedMode) {
	showLoading();
	capabilityMediaInputSource.set(selectedMode);
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