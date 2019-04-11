"use strict";
var cmd = require("node-cmd"),
	fs = require("fs"),
	fs = require('fs-extra'),
	os = require("os"),
	path = require("path"),
	stlib = require("./stlib"),
	currentPath = __dirname,
	homeDir = os.homedir(),
	stCmd = path.join(currentPath, "st"),
	install,
	cwd = process.cwd(),

	// Run promise queue
	deviceName = "AC2",

	projectName = "smartthings",
	bracketsProject = "5ad5f019c108544aa1987dd4",
	projectPath = path.join(homeDir, `/gerrit-WATT/WATT/projects/`, bracketsProject),
	distPath = path.join(projectPath, "dist"),

	getCertForDevice = function (deviceName, projectName) {
		return new Promise(function (resolve, reject) {
			try {
				console.log(`CMD> node ${stCmd} request device-crt --device-name ${deviceName} --out-dir ./${projectName}`);
				cmd.get(
					`node ${stCmd} request device-crt --device-name ${deviceName} --out-dir ./${projectName}`,
					function (err, data, stderr) {
						if (err) {
							reject({"getCertForDevice": err});
						} else {
							console.log("Result> getCertForDevice: ", data);
							resolve(data);
						}
					}
				);
			} catch (err) {
				reject(err);
			}
		});
	},
	publishDevice = function (deviceName, projectName) {
		return new Promise(function (resolve, reject) {
			try {
				console.log(`CMD> node ${stCmd} publish device --name ${deviceName} --device-profile-path ./${projectName}/device-profile.json`);
				cmd.get(
					`node ${stCmd} publish device --name ${deviceName} --device-profile-path ./${projectName}/device-profile.json`,
					function (err, data, stderr) {
						if (err) {
							reject({"publishDevice": err});
						} else {
							console.log("Result> publishDevice: ", data);
							resolve(data);
						}
					}
				);
			} catch (err) {
				reject(err);
			}
		});
	};

install = new Promise(function (resolve, reject) {
	resolve("start");
}).then(() => {
	cwd = process.cwd();
	return process.chdir(distPath);
// }).then(() => {
// 	return getCertForDevice(deviceName, projectName);
}).then(() => {
	return publishDevice(deviceName, projectName);
}).then(() => {
	return process.chdir(cwd);
}).then(() => {
	console.log("All correct");
}).catch((err) => {
	console.log("Installation fail: ", err);
});


/*
 Publish device with custom plugin

Get custom plugin ID
> node st list device-profile --category custom
28018ab8-7afd-416a-9ef0-883b31218250 AirConditioner capability custom

Delete old device profile
> node st delete device-profile --id 28018ab8-7afd-416a-9ef0-883b31218250

Create device profile
> node st create device-profile --in ./Sample2/device-profile.json

Check device profile for custom plugin
> node st list device-profile --category custom
28018ab8-7afd-416a-9ef0-883b31218250 AirConditioner capability custom


Required steps:

Create device crt for device
> node st request device-crt --device-name AC101 --out-dir ./Sample2

Publish device
> node st publish device --name AC101 --device-profile-path ./Sample2/device-profile.json


*/

