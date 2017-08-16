/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, sub: true, esnext: true */
/*global define */

define(function (require, exports, module) {
    "use strict";

    // default values
    var platform = "mobile";
    var version = "3.0";

    var features =
        {
            "mobile": {
                "http://tizen.org/feature/camera": {"since": "2.2.1", "used": false},
                "http://tizen.org/feature/database.encryption": {"since": "2.2.1", "used": false},
                "http://tizen.org/feature/datasync": {"since": "2.3", "used": false},
                "http://tizen.org/feature/fmradio": {"since": "2.2.1", "used": false},
                "http://tizen.org/feature/humanactivitymonitor": {"since": "2.3", "used": false},
                "http://tizen.org/feature/iot.ocf": {"since": "3.0", "used": false},
                "http://tizen.org/feature/led": {"since": "2.4", "used": false},
                "http://tizen.org/feature/location.batch": {"since": "2.3", "used": false},
                "http://tizen.org/feature/location.gps": {"since": "2.2.1", "used": false},
                "http://tizen.org/feature/microphone": {"since": "2.2.1", "used": false},
                "http://tizen.org/feature/network.bluetooth": {"since": "2.2.1", "used": false},
                "http://tizen.org/feature/network.bluetooth.audio.media": {"since": "2.3", "used": false},
                "http://tizen.org/feature/network.bluetooth.health": {"since": "2.3", "used": false},
                "http://tizen.org/feature/network.bluetooth.le": {"since": "2.3", "used": false},
                "http://tizen.org/feature/network.net_proxy": {"since": "3.0", "used": false},
                "http://tizen.org/feature/network.nfc": {"since": "2.2.1", "used": false},
                "http://tizen.org/feature/network.nfc.card_emulation": {"since": "2.3", "used": false},
                "http://tizen.org/feature/network.nfc.card_emulation.hce": {"since": "2.3.1", "used": false},
                "http://tizen.org/feature/network.nfc.p2p": {"since": "2.3.1", "used": false},
                "http://tizen.org/feature/network.nfc.tag": {"since": "2.3.1", "used": false},
                "http://tizen.org/feature/network.push": {"since": "2.2.1", "used": false},
                "http://tizen.org/feature/network.secure_element": {"since": "2.2.1", "used": false},
                "http://tizen.org/feature/network.telephony": {"since": "2.2.1", "used": false},
                "http://tizen.org/feature/network.telephony.mms": {"since": "2.2.1", "used": false},
                "http://tizen.org/feature/network.telephony.sms": {"since": "2.4", "used": false},
                "http://tizen.org/feature/network.wifi": {"since": "2.2.1", "used": false},
                "http://tizen.org/feature/screen.size.all": {"since": "2.2.1", "used": false},
                "http://tizen.org/feature/screen.size.normal": {"since": "2.2.1", "used": false},
                "http://tizen.org/feature/screen.size.normal.1080.1920": {"since": "2.2.1", "used": false},
                "http://tizen.org/feature/screen.size.normal.240.400": {"since": "2.2.1", "used": false},
                "http://tizen.org/feature/screen.size.normal.320.320": {"since": "2.3", "used": false},
                "http://tizen.org/feature/screen.size.normal.320.480": {"since": "2.2.1", "used": false},
                "http://tizen.org/feature/screen.size.normal.360.360": {"since": "2.3.2", "used": false},
                "http://tizen.org/feature/screen.size.normal.360.480": {"since": "2.3", "used": false},
                "http://tizen.org/feature/screen.size.normal.480.800": {"since": "2.2.1", "used": false},
                "http://tizen.org/feature/screen.size.normal.540.960": {"since": "2.2.1", "used": false},
                "http://tizen.org/feature/screen.size.normal.600.1024": {"since": "2.2.1", "used": false},
                "http://tizen.org/feature/screen.size.normal.720.1280": {"since": "2.2.1", "used": false},
                "http://tizen.org/feature/sensor.accelerometer": {"since": "2.2.1", "used": false},
                "http://tizen.org/feature/sensor.barometer": {"since": "2.2.1", "used": false},
                "http://tizen.org/feature/sensor.gyroscope": {"since": "2.2.1", "used": false},
                "http://tizen.org/feature/sensor.gyroscope_rotation_vector": {"since": "2.4", "used": false},
                "http://tizen.org/feature/sensor.heart_rate_monitor": {"since": "2.3", "used": false},
                "http://tizen.org/feature/sensor.heart_rate_monitor.led_green": {"since": "2.3.1", "used": false},
                "http://tizen.org/feature/sensor.heart_rate_monitor.led_ir": {"since": "2.3.1", "used": false},
                "http://tizen.org/feature/sensor.heart_rate_monitor.led_red": {"since": "2.3.1", "used": false},
                "http://tizen.org/feature/sensor.magnetometer": {"since": "2.2.1", "used": false},
                "http://tizen.org/feature/sensor.pedometer": {"since": "2.3", "used": false},
                "http://tizen.org/feature/sensor.photometer": {"since": "2.2.1", "used": false},
                "http://tizen.org/feature/sensor.proximity": {"since": "2.2.1", "used": false},
                "http://tizen.org/feature/sensor.sleep_monitor": {"since": "3.0", "used": false},
                "http://tizen.org/feature/sensor.ultraviolet": {"since": "2.3", "used": false},
                "http://tizen.org/feature/sensor.wrist_up": {"since": "2.3", "used": false},
                "http://tizen.org/feature/shell.appwidget": {"since": "2.2.1", "used": false},
                "http://tizen.org/feature/speech.synthesis": {"since": "2.2.1", "used": false}
            },
            "wearable": {
                "http://tizen.org/feature/camera": {"since": "2.2.1", "used": false},
                "http://tizen.org/feature/database.encryption": {"since": "2.2.1", "used": false},
                "http://tizen.org/feature/download": {"since": "2.3", "used": false},
                "http://tizen.org/feature/humanactivitymonitor": {"since": "2.3", "used": false},
                "http://tizen.org/feature/input.rotating_bezel": {"since": "2.3.1", "used": false},
                "http://tizen.org/feature/iot.ocf": {"since": "3.0", "used": false},
                "http://tizen.org/feature/led": {"since": "2.4", "used": false},
                "http://tizen.org/feature/location.batch": {"since": "2.3", "used": false},
                "http://tizen.org/feature/location.gps": {"since": "2.2.1", "used": false},
                "http://tizen.org/feature/media.audio_recording": {"since": "2.3", "used": false},
                "http://tizen.org/feature/media.image_capture": {"since": "2.3", "used": false},
                "http://tizen.org/feature/media.video_recording": {"since": "2.3", "used": false},
                "http://tizen.org/feature/microphone": {"since": "2.2.1", "used": false},
                "http://tizen.org/feature/network.bluetooth": {"since": "2.2.1", "used": false},
                "http://tizen.org/feature/network.bluetooth.audio.media": {"since": "2.3", "used": false},
                "http://tizen.org/feature/network.bluetooth.health": {"since": "2.3", "used": false},
                "http://tizen.org/feature/network.bluetooth.le": {"since": "2.3", "used": false},
                "http://tizen.org/feature/network.internet": {"since": "2.3.1", "used": false},
                "http://tizen.org/feature/network.net_proxy": {"since": "3.0", "used": false},
                "http://tizen.org/feature/network.nfc": {"since": "2.2.1", "used": false},
                "http://tizen.org/feature/network.nfc.card_emulation": {"since": "2.3", "used": false},
                "http://tizen.org/feature/network.nfc.card_emulation.hce": {"since": "2.3.1", "used": false},
                "http://tizen.org/feature/network.nfc.p2p": {"since": "2.3.1", "used": false},
                "http://tizen.org/feature/network.nfc.tag": {"since": "2.3.1", "used": false},
                "http://tizen.org/feature/network.push": {"since": "2.2.1", "used": false},
                "http://tizen.org/feature/network.secure_element": {"since": "2.2.1", "used": false},
                "http://tizen.org/feature/network.telephony": {"since": "2.2.1", "used": false},
                "http://tizen.org/feature/network.telephony.sms": {"since": "2.4", "used": false},
                "http://tizen.org/feature/network.wifi": {"since": "2.2.1", "used": false},
                "http://tizen.org/feature/screen.shape.circle": {"since": "2.3.1", "used": false},
                "http://tizen.org/feature/screen.shape.rectangle": {"since": "2.3.1", "used": false},
                "http://tizen.org/feature/screen.size.all": {"since": "2.2.1", "used": false},
                "http://tizen.org/feature/screen.size.normal": {"since": "2.2.1", "used": false},
                "http://tizen.org/feature/screen.size.normal.320.320": {"since": "2.3", "used": false},
                "http://tizen.org/feature/screen.size.normal.360.360": {"since": "2.3.2", "used": false},
                "http://tizen.org/feature/screen.size.normal.360.480": {"since": "2.3", "used": false},
                "http://tizen.org/feature/sensor.accelerometer": {"since": "2.2.1", "used": false},
                "http://tizen.org/feature/sensor.barometer": {"since": "2.2.1", "used": false},
                "http://tizen.org/feature/sensor.gyroscope": {"since": "2.2.1", "used": false},
                "http://tizen.org/feature/sensor.gyroscope_rotation_vector": {"since": "2.4", "used": false},
                "http://tizen.org/feature/sensor.heart_rate_monitor": {"since": "2.3", "used": false},
                "http://tizen.org/feature/sensor.heart_rate_monitor.led_green": {"since": "2.3.1", "used": false},
                "http://tizen.org/feature/sensor.heart_rate_monitor.led_ir": {"since": "2.3.1", "used": false},
                "http://tizen.org/feature/sensor.heart_rate_monitor.led_red": {"since": "2.3.1", "used": false},
                "http://tizen.org/feature/sensor.magnetometer": {"since": "2.2.1", "used": false},
                "http://tizen.org/feature/sensor.pedometer": {"since": "2.3", "used": false},
                "http://tizen.org/feature/sensor.photometer": {"since": "2.2.1", "used": false},
                "http://tizen.org/feature/sensor.proximity": {"since": "2.2.1", "used": false},
                "http://tizen.org/feature/sensor.sleep_monitor": {"since": "3.0", "used": false},
                "http://tizen.org/feature/sensor.ultraviolet": {"since": "2.3", "used": false},
                "http://tizen.org/feature/sensor.wrist_up": {"since": "2.3", "used": false},
                "http://tizen.org/feature/shell.appwidget": {"since": "2.2.1", "used": false},
                "http://tizen.org/feature/speech.synthesis": {"since": "2.2.1", "used": false},
                "http://tizen.org/feature/web.service": {"since": "2.3", "used": false}
            }
        };

    function compareVersions(v1, v2) {
        let v1split = v1.split('.');
        let v2split = v2.split('.');

        v1split = v1split.map(Number);
        v2split = v2split.map(Number);

        for (let i = 0; i < v1split.length; i++) {
            if (v2split.length === i) {
                return 1;
            }

            if (v1split[i] > v2split[i]) {
                return 1;
            } else {
                if (v1split[i] < v2split[i]) {
                    return -1;
                }
            }
        }

        if (v1split.length !== v2split.length) {
            return -1;
        }

        return 0;
    }

    function SetPlatformType(platformType) {
        // mobile or wearable
        platform = platformType;
    }

    function SetPlatformVersion(platformVersion) {
        // "2.2.1", "2.3", "2.3.1", "2.4", "3.0"...
        version = platformVersion;
    }

    function GetFeatureSelectText(filter) {
        let text = "";

        for (let feature in features[platform]) {
            if (feature.search(filter) !== -1 && features[platform][feature]["used"] === false && compareVersions(features[platform][feature]["since"], version) <= 0) {
                text += '<input class="featureCheck" id="' + feature + '" type="checkbox" value="' + feature + '" />' +
                        '<label style="display: inline-block;" for="' + feature + '">' + feature + '</label></br>';
            }
        }
        text += "</br>";

        return text;
    }

    function AddFeature(featureName) {
        if (!features[platform][featureName]) {
            features[platform][featureName] = {"since": version, "used": false};
        }

        features[platform][featureName]["used"] = true;
    }

    function RemoveFeature(featureName) {
        if (!features[platform][featureName]) {
            features[platform][featureName] = {"since": version, "used": false};
        }

        features[platform][featureName]["used"] = false;
    }

    function GetFeatureListText() {
        let text = "";
        for (let feature in features[platform]) {
            if (features[platform][feature]["used"]) {
                text += "<option value='" + feature + "'>" + feature + "</option>";
            }
        }
        text += "</br>";

        return text;
    }

    function ClearAddedFeatures() {
        for (let feature in features[platform]) {
            if (features[platform][feature]["used"]) {
                features[platform][feature]["used"] = false;
            }
        }
    }

    exports.SetPlatformType = SetPlatformType;
    exports.SetPlatformVersion = SetPlatformVersion;

    exports.GetFeatureSelectText = GetFeatureSelectText;
    exports.GetFeatureListText = GetFeatureListText;
    exports.AddFeature = AddFeature;
    exports.RemoveFeature = RemoveFeature;
    exports.ClearAddedFeatures = ClearAddedFeatures;
});
