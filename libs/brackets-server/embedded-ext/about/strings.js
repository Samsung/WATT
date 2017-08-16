/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, camelcase: false */
/*global define, $, brackets */

define(function (require, exports, module) {
    "use strict";

    var _           = brackets.getModule("thirdparty/lodash"),
        strings     = require("i18n!nls/strings"),
        stringsApp  = require("i18n!nls/strings-app"),
        urls        = require("i18n!nls/urls"),
        wattJSON    = require("text!../../../../package.json");

    // just for initialization of Global
    brackets.getModule("utils/Global");

    var metadata = JSON.parse(wattJSON);

    // Add URLs as additional globals
    var additionalGlobals = $.extend({}, urls);

    additionalGlobals.APP_NAME      = strings.APP_NAME;
    additionalGlobals.APP_TITLE     = strings.APP_TITLE;

    // Need to implement by considering metadata of WATT for versioning later
    // However, current version is 0.3.3
    var parsedVersion = /([0-9]+)\.([0-9]+)\.([0-9]+)/.exec(metadata.version);
    additionalGlobals.VERSION_MAJOR = parsedVersion[1];
    additionalGlobals.VERSION_MINOR = parsedVersion[2];
    additionalGlobals.VERSION_PATCH = parsedVersion[3];

    additionalGlobals.BUILD_TYPE = strings.DEVELOPMENT_BUILD;

    // Insert application strings
    _.forEach(strings, function (value, key) {
        _.forEach(additionalGlobals, function (item, name) {
            strings[key] = strings[key].replace(new RegExp("{" + name + "}", "g"), additionalGlobals[name]);
        });
    });

    // Append or overlay additional, product-specific strings
    _.forEach(stringsApp, function (value, key) {
        _.forEach(additionalGlobals, function (item, name) {
            stringsApp[key] = stringsApp[key].replace(new RegExp("{" + name + "}", "g"), additionalGlobals[name]);
        });
        strings[key] = stringsApp[key];
    });

    module.exports = strings;
});
