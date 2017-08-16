/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, sub: true, esnext: true */
/*global define */

define(function (require, exports, module) {
    "use strict";

    // default values
    var platform = "mobile";
    var version = "3.0";

    // list taken from https://developer.tizen.org/development/training/web-application/understanding-tizen-programming/security-and-api-privileges
    var privileges =
        {
            "mobile": {
                "http://tizen.org/privilege/account.read": {"level": "public", "since": "2.3", "privacy": "Account", "description": "The application can read accounts.", "used": false}, 
                "http://tizen.org/privilege/account.write": {"level": "public", "since": "2.3", "privacy": "Account", "description": "The application can create, edit, and delete accounts.", "used": false}, 
                "http://tizen.org/privilege/alarm": {"level": "public", "since": "2.2.1", "privacy": "", "description": "The application can manage alarms by retrieving saved alarms and waking the device up at scheduled times.", "used": false},
                "http://tizen.org/privilege/application.info": {"level": "public", "since": "2.2.1", "privacy": "", "description": "The application can retrieve information related to other applications.", "used": false},
                "http://tizen.org/privilege/application.launch": {"level": "public", "since": "2.2.1", "privacy": "", "description": "The application can open other applications using the application ID or application control.", "used": false},
                "http://tizen.org/privilege/appmanager.certificate": {"level": "partner", "since": "2.2.1", "privacy": "", "description": "The application can retrieve specified application certificates.", "used": false},
                "http://tizen.org/privilege/appmanager.kill": {"level": "partner", "since": "2.2.1", "privacy": "", "description": "The application can close other applications.", "used": false}, 
                "http://tizen.org/privilege/bluetooth": {"level": "public", "since": "2.4", "privacy": "", "description": "The application can perform unrestricted actions using Bluetooth, such as scanning for and connecting to other devices.", "used": false},
                "http://tizen.org/privilege/bluetooth.admin": {"level": "public", "since": "2.2.1", "privacy": "", "description": "The application can change Bluetooth settings, such as switching Bluetooth on or off and setting the device name. Deprecated since 2.4. Use http://tizen.org/privilege/bluetooth instead.", "used": false},
                "http://tizen.org/privilege/bluetooth.gap": {"level": "public", "since": "2.2.1", "privacy": "", "description": "The application can use the Bluetooth Generic Access Profile (GAP) to, for example, scan for and pair with devices. Deprecated since 2.4. Use http://tizen.org/privilege/bluetooth instead.", "used": false},
                "http://tizen.org/privilege/bluetooth.health": {"level": "public", "since": "2.2.1", "privacy": "", "description": "The application can use the Bluetooth Health Device Profile (HDP) to, for example, send health information. Deprecated since 2.4. Use http://tizen.org/privilege/bluetooth instead.", "used": false},
                "http://tizen.org/privilege/bluetooth.spp": {"level": "public", "since": "2.2.1", "privacy": "", "description": "The application can use the Bluetooth Serial Port Profile (SPP) to, for example, send serial data. Deprecated since 2.4. Use http://tizen.org/privilege/bluetooth instead.", "used": false},
                "http://tizen.org/privilege/bluetoothmanager": {"level": "platform", "since": "2.2.1", "privacy": "", "description": "The application can change Bluetooth system settings related to privacy and security, such as the visibility mode.", "used": false},
                "http://tizen.org/privilege/bookmark.read": {"level": "platform", "since": "2.2.1", "privacy": "Bookmark", "description": "The application can read bookmarks.", "used": false}, 
                "http://tizen.org/privilege/bookmark.write": {"level": "platform", "since": "2.2.1", "privacy": "Bookmark", "description": "The application can create, edit, and delete bookmarks.", "used": false},
                "http://tizen.org/privilege/calendar.read": {"level": "public", "since": "2.2.1", "privacy": "Calendar", "description": "The application can read events and tasks.", "used": false},
                "http://tizen.org/privilege/calendar.write": {"level": "public", "since": "2.2.1", "privacy": "Calendar", "description": "The application can create, update, and delete events and tasks.", "used": false},
                "http://tizen.org/privilege/call": {"level": "public", "since": "2.3", "privacy": "Call", "description": "The application can make phone calls to numbers when they are tapped without further confirmation. This can result in additional charges depending on the user's payment plan.", "used": false},
                "http://tizen.org/privilege/callhistory.read": {"level": "public", "since": "2.2.1", "privacy": "Contacts and User history", "description": "The application can read call log items.", "used": false},
                "http://tizen.org/privilege/callhistory.write": {"level": "public", "since": "2.2.1", "privacy": "Contacts and User history", "description": "The application can create, update, and delete call log items.", "used": false},
                "http://tizen.org/privilege/contact.read": {"level": "public", "since": "2.2.1", "privacy": "Contacts", "description": "The application can read the user profile, contacts, and contact history. Contact history can include social network activity.", "used": false},
                "http://tizen.org/privilege/contact.write": {"level": "public", "since": "2.2.1", "privacy": "Contacts", "description": "The application can create, update, and delete the user profile, contacts, and any contact history that is related to this application. Contact history can include social network activity.", "used": false},
                "http://tizen.org/privilege/content.read": {"level": "public", "since": "2.2.1", "privacy": "", "description": "The application can read media content information.", "used": false},
                "http://tizen.org/privilege/content.write": {"level": "public", "since": "2.2.1", "privacy": "", "description": "The application can create, update, and delete media content information.", "used": false},
                "http://tizen.org/privilege/d2d.datasharing": {"level": "public", "since": "3.0", "privacy": "", "description": "The application can share data with other devices.", "used": false},
                "http://tizen.org/privilege/datacontrol.consumer": {"level": "public", "since": "2.2.1", "privacy": "", "description": "The application can read data exported by data control providers.", "used": false},
                "http://tizen.org/privilege/datasync": {"level": "public", "since": "2.2.1", "privacy": "", "description": "The application can synchronize device data, such as contacts and calendar events, using the OMA DS 1.2 protocol.", "used": false},
                "http://tizen.org/privilege/download": {"level": "public", "since": "2.2.1", "privacy": "", "description": "The application can manage HTTP downloads.", "used": false},
                "http://tizen.org/privilege/filesystem.read": {"level": "public", "since": "2.2.1", "privacy": "", "description": "The application can read file systems.", "used": false},
                "http://tizen.org/privilege/filesystem.write": {"level": "public", "since": "2.2.1", "privacy": "", "description": "The application can write to file systems.", "used": false},
                "http://tizen.org/privilege/healthinfo": {"level": "public", "since": "2.3", "privacy": "Sensor", "description": "The application can read the user's health information gathered by device sensors, such as pedometer or heart rate monitor.", "used": false},
                "http://tizen.org/privilege/ime": {"level": "public", "since": "2.4", "privacy": "", "description": "The application can provide users with a way to enter characters and symbols into an associated text field.", "used": false},
                "http://tizen.org/privilege/led": {"level": "public", "since": "2.4", "privacy": "", "description": "The application can switch LEDs on or off, such as the LED on the front of the device and the camera flash.", "used": false},
                "http://tizen.org/privilege/mediacontroller.client": {"level": "public", "since": "2.4", "privacy": "", "description": "The application can receive information about currently playing media from applications that are allowed to send it, and can control those applications remotely.", "used": false},
                "http://tizen.org/privilege/mediacontroller.server": {"level": "public", "since": "2.4", "privacy": "", "description": "The application can send information about currently playing media to applications that are allowed to receive it, and can be controlled remotely by those applications.", "used": false},
                "http://tizen.org/privilege/messaging.read": {"level": "public", "since": "2.2.1", "privacy": "Message", "description": "The application can retrieve messages from message boxes or receive messages.", "used": false},
                "http://tizen.org/privilege/messaging.write": {"level": "public", "since": "2.2.1", "privacy": "Message", "description": "The application can write, send, sync, and remove text messages, multimedia messages, and emails.", "used": false},
                "http://tizen.org/privilege/networkbearerselection": {"level": "partner", "since": "2.2.1", "privacy": "", "description": "The application can request and release a specific network connection.", "used": false},
                "http://tizen.org/privilege/nfc.admin": {"level": "public", "since": "2.2.1", "privacy": "", "description": "The application can change NFC settings, such as switching NFC on or off.", "used": false},
                "http://tizen.org/privilege/nfc.cardemulation": {"level": "public", "since": "2.3", "privacy": "", "description": "The application can access smart card details, such as credit card details, and allow users to make payments through NFC.", "used": false},
                "http://tizen.org/privilege/nfc.common": {"level": "public", "since": "2.2.1", "privacy": "", "description": "The application can use common NFC features.", "used": false},
                "http://tizen.org/privilege/nfc.p2p": {"level": "public", "since": "2.2.1", "privacy": "", "description": "The application can push NFC messages to other devices.", "used": false},
                "http://tizen.org/privilege/nfc.tag": {"level": "public", "since": "2.2.1", "privacy": "", "description": "The application can read and write NFC tag information.", "used": false},
                "http://tizen.org/privilege/package.info": {"level": "public", "since": "2.2.1", "privacy": "", "description": "The application can retrieve information about installed packages.", "used": false},
                "http://tizen.org/privilege/packagemanager.install": {"level": "platform", "since": "2.2.1", "privacy": "", "description": "The application can install or uninstall application packages.", "used": false},
                "http://tizen.org/privilege/power": {"level": "public", "since": "2.2.1", "privacy": "", "description": "The application can control power-related settings, such as dimming the screen.", "used": false},
                "http://tizen.org/privilege/push": {"level": "public", "since": "2.2.1", "privacy": "", "description": "The application can receive notifications from the Internet.", "used": false},
                "http://tizen.org/privilege/secureelement": {"level": "public", "since": "2.2.1", "privacy": "", "description": "The application can access secure smart card chips, such as UICC/SIM, embedded secure elements, and secure SD cards.", "used": false},
                "http://tizen.org/privilege/setting": {"level": "public", "since": "2.2.1", "privacy": "", "description": "The application can change and read user settings.", "used": false},
                "http://tizen.org/privilege/system": {"level": "public", "since": "2.2.1", "privacy": "", "description": "The application can read system information.", "used": false},
                "http://tizen.org/privilege/systemmanager": {"level": "partner", "since": "2.2.1", "privacy": "", "description": "The application can read secure system information. Deprecated since 2.3.1. Use http://tizen.org/privilege/telephony instead.", "used": false},
                "http://tizen.org/privilege/telephony": {"level": "public", "since": "2.3.1", "privacy": "", "description": "The application can retrieve telephony information, such as the network and SIM card used, the IMEI, and the status of calls.", "used": false},
                "http://tizen.org/privilege/volume.set": {"level": "public", "since": "2.3", "privacy": "", "description": "The application can adjust the volume for different features, such as notification alerts, ringtones, and media.", "used": false},
                "http://tizen.org/privilege/websetting": {"level": "public", "since": "2.2.1", "privacy": "", "description": "The application can change its Web application settings, including deleting cookies. Deprecated since 2.4.", "used": false},
                "http://tizen.org/privilege/widget.viewer": {"level": "public", "since": "3.0", "privacy": "", "description": "The application can show widgets, and information from their associated applications, on the home screen.", "used": false},
                "http://tizen.org/privilege/internet": {"level": "public", "since": "2.3", "privacy": "", "description": "The application can access the Internet using the WebSocket, XMLHttpRequest Level 2, Server-Sent Events, HTML5 Application caches, and Cross-Origin Resource Sharing APIs.", "used": false},
                "http://tizen.org/privilege/mediacapture": {"level": "public", "since": "2.2.1", "privacy": "Camera and Microphone", "description": "The application can manipulate streams from cameras and microphones using the getUserMedia API.", "used": false},
                "http://tizen.org/privilege/unlimitedstorage": {"level": "public", "since": "2.2.1", "privacy": "", "description": "The application can use the storage with unlimited size with the File API: Directories and System, File API: Writer, Indexed Database, and Web SQL Database APIs.", "used": false},
                "http://tizen.org/privilege/notification": {"level": "public", "since": "2.2.1", "privacy": "", "description": "The application can display simple notifications using the Web Notifications API.", "used": false},
                "http://tizen.org/privilege/location": {"level": "public", "since": "2.2.1", "privacy": "Location", "description": "The application can access geographic locations using the Geolocation API.", "used": false},
                "http://tizen.org/privilege/fullscreen": {"level": "public", "since": "2.2.1", "privacy": "", "description":   "The application can display in the full-screen mode using the FullScreen API - Mozilla API.", "used": false},
            },
            "wearable": {
                "http://tizen.org/privilege/alarm": {"level": "public", "since": "2.2.1", "privacy": "", "description": "The application can set alarms and wake up the device at scheduled times.", "used": false},
                "http://tizen.org/privilege/application.info": {"level": "public", "since": "2.2.1", "privacy": "", "description": "The application can retrieve information related to other applications.", "used": false},
                "http://tizen.org/privilege/application.launch": {"level": "public", "since": "2.2.1", "privacy": "", "description": "The application can open other applications using the application ID or application control.", "used": false},
                "http://tizen.org/privilege/appmanager.certificate": {"level": "partner", "since": "2.2.1", "privacy": "", "description": "The application can retrieve specified application certificates.", "used": false},
                "http://tizen.org/privilege/appmanager.kill": {"level": "partner", "since": "2.2.1", "privacy": "", "description": "The application can close other applications.", "used": false},
                "http://tizen.org/privilege/bluetooth": {"level": "public", "since": "2.4", "privacy": "", "description": "The application can perform unrestricted actions using Bluetooth, such as scanning for and connecting to other devices.", "used": false},
                "http://tizen.org/privilege/bluetooth.admin": {"level": "public", "since": "2.3.1", "privacy": "", "description": "The application can change Bluetooth settings, such as switching Bluetooth on or off and setting the device name. Deprecated since 3.0. Use http://tizen.org/privilege/bluetooth instead.", "used": false},
                "http://tizen.org/privilege/bluetooth.gap": {"level": "public", "since": "2.3.1", "privacy": "", "description": "The application can use the Bluetooth Generic Access Profile (GAP) to, for example, scan for and pair with devices. Deprecated since 3.0. Use http://tizen.org/privilege/bluetooth instead.", "used": false},
                "http://tizen.org/privilege/bluetooth.health": {"level": "public", "since": "2.3.1", "privacy": "", "description": "The application can use the Bluetooth Health Device Profile (HDP) to, for example, send health information. Deprecated since 3.0. Use http://tizen.org/privilege/bluetooth instead.", "used": false},
                "http://tizen.org/privilege/bluetooth.spp": {"level": "public", "since": "2.3.1", "privacy": "", "description": "The application can use the Bluetooth Serial Port Profile (SPP) to, for example, send serial data. Deprecated since 3.0. Use http://tizen.org/privilege/bluetooth instead.", "used": false},
                "http://tizen.org/privilege/bluetoothmanager": {"level": "platform", "since": "2.3.1", "privacy": "", "description": "The application can change Bluetooth system settings related to privacy and security, such as the visibility mode.", "used": false},
                "http://tizen.org/privilege/call": {"level": "public", "since": "2.2.1", "privacy": "Call", "description": "The application can make phone calls to numbers when they are tapped without further confirmation.", "used": false},
                "http://tizen.org/privilege/content.read": {"level": "public", "since": "2.2.1", "privacy": "", "description": "The application can read media content information.", "used": false},
                "http://tizen.org/privilege/content.write": {"level": "public", "since": "2.2.1", "privacy": "", "description": "The application can create, update, and delete media content information.", "used": false},
                "http://tizen.org/privilege/d2d.datasharing": {"level": "public", "since": "3.0", "privacy": "", "description": "The application can share data with other devices.", "used": false},
                "http://tizen.org/privilege/datacontrol.consumer": {"level": "public", "since": "2.3.2", "privacy": "", "description": "The application can read data exported by data control providers.", "used": false},
                "http://tizen.org/privilege/download": {"level": "public", "since": "2.2.1", "privacy": "", "description": "The application can manage HTTP downloads.", "used": false},
                "http://tizen.org/privilege/filesystem.read": {"level": "public", "since": "2.2.1", "privacy": "", "description": "The application can read file systems.", "used": false},
                "http://tizen.org/privilege/filesystem.write": {"level": "public", "since": "2.2.1", "privacy": "", "description": "The application can write to file systems.", "used": false},
                "http://tizen.org/privilege/healthinfo": {"level": "public", "since": "2.2.1", "privacy": "Sensor", "description": "The application can read the user's health information gathered by device sensors, such as pedometer or heart rate monitor.", "used": false},
                "http://tizen.org/privilege/ime": {"level": "public", "since": "3.0", "privacy": "", "description": "The application can provide users with a way to enter characters and symbols into an associated text field.", "used": false},
                "http://tizen.org/privilege/led": {"level": "public", "since": "3.0", "privacy": "", "description": "The application can switch LEDs on or off, such as the LED on the front of the device and the camera flash.", "used": false},
                "http://tizen.org/privilege/mediacontroller.client": {"level": "public", "since": "2.4", "privacy": "", "description": "The application can receive information about currently playing media from applications that are allowed to send it, and can control those applications remotely.", "used": false},
                "http://tizen.org/privilege/mediacontroller.server": {"level": "public", "since": "2.4", "privacy": "", "description": "The application can send information about currently playing media to applications that are allowed to receive it, and can be controlled remotely by those applications.", "used": false},
                "http://tizen.org/privilege/nfc.admin": {"level": "public", "since": "2.3.1", "privacy": "", "description": "The application can change NFC settings, such as switching NFC on or off.", "used": false},
                "http://tizen.org/privilege/nfc.cardemulation": {"level": "public", "since": "2.3.1", "privacy": "", "description": "The application can access smart card details, such as credit card details, and allow users to make payments through NFC.", "used": false},
                "http://tizen.org/privilege/nfc.common": {"level": "public", "since": "2.3.1", "privacy": "", "description": "The application can use common NFC features.", "used": false},
                "http://tizen.org/privilege/nfc.p2p": {"level": "public", "since": "2.3.1", "privacy": "", "description": "The application can push NFC messages to other devices.", "used": false},
                "http://tizen.org/privilege/nfc.tag": {"level": "public", "since": "2.3.1", "privacy": "", "description": "The application can read and write NFC tag information.", "used": false},
                "http://tizen.org/privilege/notification": {"level": "public", "since": "2.2.1", "privacy": "", "description": "The application can show and hide its own notifications and badges.", "used": false},
                "http://tizen.org/privilege/package.info": {"level": "public", "since": "2.2.1", "privacy": "", "description": "The application can retrieve information about installed packages.", "used": false},
                "http://tizen.org/privilege/packagemanager.install": {"level": "platform", "since": "2.2.1", "privacy": "", "description": "The application can install or uninstall application packages.", "used": false},
                "http://tizen.org/privilege/power": {"level": "public", "since": "2.2.1", "privacy": "", "description": "The application can control power-related settings, such as dimming the screen.", "used": false},
                "http://tizen.org/privilege/push": {"level": "public", "since": "2.2.1", "privacy": "", "description": "The application can receive notifications from the Internet.", "used": false},
                "http://tizen.org/privilege/secureelement": {"level": "public", "since": "2.3.1", "privacy": "", "description": "The application can access secure smart card chips, such as UICC/SIM, embedded secure elements, and secure SD cards.", "used": false},
                "http://tizen.org/privilege/setting": {"level": "public", "since": "2.2.1", "privacy": "", "description": "The application can change and read user settings.", "used": false},
                "http://tizen.org/privilege/system": {"level": "public", "since": "2.2.1", "privacy": "", "description": "The application can read system information.", "used": false},
                "http://tizen.org/privilege/systemmanager": {"level": "partner", "since": "2.2.1", "privacy": "", "description": "The application can read secure system information. Deprecated since 2.3.1. Use http://tizen.org/privilege/telephony instead.", "used": false},
                "http://tizen.org/privilege/telephony": {"level": "public", "since": "2.3.1", "privacy": "", "description": "The application can retrieve telephony information, such as the network and SIM card used, the IMEI, and the status of calls.", "used": false},
                "http://tizen.org/privilege/volume.set": {"level": "public", "since": "2.2.1", "privacy": "", "description": "The application can adjust the volume for different features, such as notification alerts, ringtones, and media.", "used": false},
                "http://tizen.org/privilege/widget.viewer": {"level": "public", "since": "2.3.2", "privacy": "", "description": "The application can show widgets, and information from their associated applications, on the home screen.", "used": false},
                "http://tizen.org/privilege/internet": {"level": "public", "since": "2.2.1", "privacy": "", "description": "The application can access the Internet using the WebSocket, XMLHttpRequest Level 1, and Cross-Origin Resource Sharing APIs.", "used": false},
                "http://tizen.org/privilege/mediacapture": {"level": "public", "since": "2.2.1", "privacy": "Camera and Microphone", "description": "The application can manipulate streams from cameras and microphones using the getUserMedia API.", "used": false},
                "http://tizen.org/privilege/unlimitedstorage": {"level": "public", "since": "2.2.1", "privacy": "", "description": "The application can use the storage with unlimited size with the Indexed Database API.", "used": false},
                "http://tizen.org/privilege/location": {"level": "public", "since": "2.2.1", "privacy": "Location", "description": "The application can access geographic locations using the Geolocation API.", "used": false},
                "http://tizen.org/privilege/camera": {"level": "public", "since": "2.2.1", "privacy": "Camera and Microphone", "description": "The application can capture video and image on a target device using the Camera API (Tizen Extension) (Video Recording and Image Capture) API.", "used": false},
                "http://tizen.org/privilege/audiorecorder": {"level": "public", "since": "2.2.1", "privacy": "Microphone", "description": "The application can record an audio stream on a target device using the Camera API (Tizen Extension) (Audio Recording) API.", "used": false}
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

    function GetPrivilegeDescriptionText(privilegeName) {
        return privileges[platform][privilegeName].level + " level; " + privileges[platform][privilegeName].description;
    }

    function GetPrivilegeSelectText(filter) {
        let text = "";

        for (let privilege in privileges[platform]) {
            if (privilege.search(filter) !== -1 && privileges[platform][privilege]["used"] === false && compareVersions(privileges[platform][privilege]["since"], version) <= 0) {
                text += '<input class="privilegeCheck" id="' + privilege + '" type="checkbox" value="' + privilege + '" />' +
                        '<label style="display: inline-block;" for="' + privilege + '">' + privilege + '</label></br>';
            }
        }
        text += "</br>";

        return text;
    }

    function AddPrivilege(privilegeName) {
        if (!privileges[platform][privilegeName]) {
            privileges[platform][privilegeName] = {"level": "custom", "since": version, "privacy": "", "description": "Custom privilege defined by user", "used": false};
        }

        privileges[platform][privilegeName]["used"] = true;
    }

    function RemovePrivilege(privilegeName) {
        if (!privileges[platform][privilegeName]) {
            privileges[platform][privilegeName] = {"level": "custom", "since": version, "privacy": "", "description": "Custom privilege defined by user", "used": false};
        }

        privileges[platform][privilegeName]["used"] = false;
    }

    function GetPrivilegeListText() {
        let text = "";
        for (let privilege in privileges[platform]) {
            if (privileges[platform][privilege]["used"]) {
                text += "<option value='" + privilege + "'>" + privilege + "</option>";
            }
        }
        text += "</br>";

        return text;
    }

    function ClearAddedPrivileges() {
        for (let privilege in privileges[platform]) {
            if (privileges[platform][privilege]["used"]) {
                privileges[platform][privilege]["used"] = false;
            }
        }
    }

    exports.SetPlatformType = SetPlatformType;
    exports.SetPlatformVersion = SetPlatformVersion;

    exports.GetPrivilegeSelectText = GetPrivilegeSelectText;
    exports.GetPrivilegeListText = GetPrivilegeListText;
    exports.GetPrivilegeDescriptionText = GetPrivilegeDescriptionText;
    exports.AddPrivilege = AddPrivilege;
    exports.RemovePrivilege = RemovePrivilege;
    exports.ClearAddedPrivileges = ClearAddedPrivileges;
});
