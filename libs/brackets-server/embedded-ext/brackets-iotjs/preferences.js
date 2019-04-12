define(function main(require, exports, module) {
    const PreferencesManager = brackets.getModule("preferences/PreferencesManager"),
        prefs = PreferencesManager.getExtensionPrefs("brackets-iotjs");

    // Default settings
    prefs.definePreference("autoscroll", "boolean", true);
    prefs.definePreference("iotjs-flags", "string", "");

    if ("iotjs-flags" in localStorage) {
        prefs.set("iotjs-flags", localStorage["iotjs-flags"]);
        localStorage.removeItem("iotjs-flags");
    }

    prefs.save();

    module.exports = prefs;
});