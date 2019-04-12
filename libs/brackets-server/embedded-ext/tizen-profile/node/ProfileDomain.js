(function () {
    "use strict";

    const promisify = require("promisify-node");

    // couldn't get 'promisify(require("child_process").exec)' to work, so use a third-party wrapper
    const exec = require("child-process-promise").exec;
    // Don't call `promisify(require("fs"))` because it changes the module
    // and causes other code to fail.
    // For details see: https://github.com/nodegit/promisify-node/issues/17
    // FIXME: Look for a foolproof library for wrapping callbacks in promises
    const fs = promisify("fs");
    const nodePath = require("path");
    const tmp = require("tmp-promise");

    const Project = require("mongoose").model("Project");
    const User = require("mongoose").model("User");

    let _domainManager;

    function getCurrentCertData(projectId, callback) {
        Project.findOne({"_id": projectId}).then((project) => {
            const userId = project.user;
            return User.findOne({"_id" : userId});
        }).then((user) => {
            callback(null, JSON.stringify(user.local.certificate));
        }).catch((error) => {
            console.error(error);
            callback(JSON.stringify(error), null);
        });
    }

    function generateCertForProfile(projectId, optionsJSON, callback) {
        let options;
        try {
            options = JSON.parse(optionsJSON);
        } catch (error) {
            console.error(error);
            callback(JSON.stringify(error), null);
            return;
        }

        let user = null;
        let dirPath = null;
        let dirCleanupCallback = () => {};
        Project.findOne({"_id": projectId}).then((project) => {
            const userId = project.user;
            return Promise.all([User.findOne({"_id" : userId}), tmp.dir({"unsafeCleanup": true})]);
        }).then((values) => {
            user = values[0];
            dirPath = values[1].path;
            dirCleanupCallback = values[1].cleanup;
            let command = "tizen certificate";
            for (const option of options) {
                // obviously we should to sanitize user-provided values here
                command += " " + option[0] + " \"" + option[2] + "\"";
            }
            command += " --filename \"" + user._id + "\"";
            command += " -- \"" + dirPath + "\"";
            return exec(command);
        }).then(() => {
            return fs.readFile(nodePath.join(dirPath, user._id + ".p12"));
        }).then((data) => {
            const certificate = {
                "data" : data
            };
            for (const option of options) {
                certificate[option[1]] = option[2];
            }
            user.local.certificate = certificate;
            return user.save();
        }).then(() => {
            callback(null, true);
        }).catch((error) => {
            console.error(error);
            callback(JSON.stringify(error), null);
        // poor man's 'Promise.prototype.finally', until there is browser support
        }).then(() => {
            dirCleanupCallback();
        });
    }

    function init(domainManager) {
        _domainManager = domainManager;
        if (!_domainManager.hasDomain("profileNodeDomain")) {
            _domainManager.registerDomain("profileNodeDomain", {major: 0, minor: 1});
        }

        _domainManager.registerCommand(
            "profileNodeDomain",
            "getCurrentCertData",
            getCurrentCertData,
            true,
            "Get current certificate data",
            [
                {name: "projectId", type: "string"},
            ],
            [
                {name: "data", type: "string"},
            ]
        );
        _domainManager.registerCommand(
            "profileNodeDomain",
            "generateCertForProfile",
            generateCertForProfile,
            true,
            "Generate certificate with this options",
            [
                {name: "projectId", type: "string"},
                {name: "optionsJSON", type: "string"},
            ],
            [
                {name: "data", type: "string"},
            ]
        );

    }

    exports.init = init;
}());
