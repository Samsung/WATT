/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, sub: true, esnext: true */
/*global define */

define(function (require, exports, module) {
    "use strict";

    // default values
    var platform = "mobile";
    var version = "3.0";

    var bgCategories =
        {
            "mobile": {
                "media": {"since": "2.4", "used": false},
                "download": {"since": "2.4", "used": false},
                "background-network": {"since": "2.4", "used": false},
                "location": {"since": "2.4", "used": false},
                "sensor": {"since": "2.4", "used": false},
                "iot-communication": {"since": "2.4", "used": false}
            },
            "wearable": {
                "media": {"since": "2.4", "used": false},
                "background-network": {"since": "2.4", "used": false},
                "location": {"since": "2.4", "used": false},
                "sensor": {"since": "2.4", "used": false},
                "iot-communication": {"since": "2.4", "used": false}

            }
        };

    var categories =
        {
            "mobile": {
                // Tizen Studio allows for this category for mobile...
                "http://tizen.org/category/wearable_clock": {"since": "2.3", "used": false}
            },
            "wearable": {
                "http://tizen.org/category/wearable_clock": {"since": "2.3", "used": false}

            }
        };

    function SetPlatformType(platformType) {
        // Should be mobile or wearable
        platform = platformType;
    }

    function SetPlatformVersion(platformVersion) {
        // Should be "2.2.1", "2.3", "2.3.1", "2.4", "3.0"...
        version = platformVersion;
    }

    // Background Category sections
    function GetBgCategorySelectText(filter) {
        let text = "";

        for (let category in bgCategories[platform]) {
            if (category.search(filter) !== -1 && bgCategories[platform][category]["used"] === false && bgCategories[platform][category]["since"] <= version) {
                text += '<input class="bgCategoryCheck" id="' + category + '" type="checkbox" value="' + category + '" />' +
                        '<label style="display: inline-block;" for="' + category + '">' + category + '</label></br>';
            }
        }
        text += "</br>";

        return text;
    }

    function AddBgCategory(categoryName) {
        if (!bgCategories[platform][categoryName]) {
            bgCategories[platform][categoryName] = {"since": version, "used": false};
        }

        bgCategories[platform][categoryName]["used"] = true;
    }

    function RemoveBgCategory(categoryName) {
        if (!bgCategories[platform][categoryName]) {
            bgCategories[platform][categoryName] = {"since": version, "used": false};
        }

        bgCategories[platform][categoryName]["used"] = false;
    }

    function GetBgCategoryListText() {
        let text = "";
        for (let category in bgCategories[platform]) {
            if (bgCategories[platform][category]["used"]) {
                text += "<option value='" + category + "'>" + category + "</option>";
            }
        }
        text += "</br>";

        return text;
    }

    function ClearAddedBgCategories() {
        for (let category in bgCategories[platform]) {
            if (bgCategories[platform][category]["used"]) {
                bgCategories[platform][category]["used"] = false;
            }
        }
    }

    // Category sections
    function GetCategorySelectText(filter) {
        let text = "";

        for (let category in categories[platform]) {
            if (category.search(filter) !== -1 && categories[platform][category]["used"] === false && categories[platform][category]["since"] <= version) {
                text += '<input class="categoryCheck" id="' + category + '" type="checkbox" value="' + category + '" />' +
                        '<label style="display: inline-block;" for="' + category + '">' + category + '</label></br>';
            }
        }
        text += "</br>";

        return text;
    }

    function AddCategory(categoryName) {
        if (!categories[platform][categoryName]) {
            categories[platform][categoryName] = {"since": version, "used": false};
        }

        categories[platform][categoryName]["used"] = true;
    }

    function RemoveCategory(categoryName) {
        if (!categories[platform][categoryName]) {
            categories[platform][categoryName] = {"since": version, "used": false};
        }

        categories[platform][categoryName]["used"] = false;
    }

    function GetCategoryListText(removeUsed) {
        let text = "";
        for (let category in categories[platform]) {
            if (categories[platform][category]["used"] !== removeUsed) {
                text += "<option value='" + category + "'>" + category + "</option>";
            }
        }
        text += "</br>";

        return text;
    }

    function ClearAddedCategories() {
        for (let category in categories[platform]) {
            if (categories[platform][category]["used"]) {
                categories[platform][category]["used"] = false;
            }
        }
    }

    exports.SetPlatformType = SetPlatformType;
    exports.SetPlatformVersion = SetPlatformVersion;

    exports.GetBgCategorySelectText = GetBgCategorySelectText;
    exports.GetBgCategoryListText = GetBgCategoryListText;
    exports.AddBgCategory = AddBgCategory;
    exports.RemoveBgCategory = RemoveBgCategory;
    exports.ClearAddedBgCategories = ClearAddedBgCategories;

    exports.GetCategorySelectText = GetCategorySelectText;
    exports.GetCategoryListText = GetCategoryListText;
    exports.AddCategory = AddCategory;
    exports.RemoveCategory = RemoveCategory;
    exports.ClearAddedCategories = ClearAddedCategories;
});
