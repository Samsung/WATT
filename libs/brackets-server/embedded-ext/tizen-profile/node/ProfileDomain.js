(function () {
    "use strict";

    const exec = require("child_process").exec;
    const fs = require("fs");
    const nodePath = require("path");
    const tmp = require("tmp");

    const Project = require("mongoose").model("Project");
    const User = require("mongoose").model("User");

    let _domainManager;

    function getCurrentCertData(projectId, callback) {
        Project.findOne({"_id": projectId}, function(error, project) {
            if (error) {
                callback(JSON.Stringify(error), null);
                return;
            }
            const userId = project.user;
            User.findOne({"_id" : userId}, function(error, user) {
                if (error) {
                    callback(JSON.Stringify(error), null);
                    return;
                }
                callback(null, JSON.stringify(user.local.certificate));
            });
        });
    }

    function generateCertForProfile(projectId, optionsJSON, callback) {
        let options;
        try {
            options = JSON.parse(optionsJSON);
        } catch (error) {
            callback(JSON.Stringify(error), null);
            return;
        }
        Project.findOne({"_id": projectId}, function(error, project) {
            if (error) {
                callback(JSON.Stringify(error), null);
                return;
            }
            const userId = project.user;
            User.findOne({"_id" : userId}, function(error, user) {
                if (error) {
                    callback(JSON.Stringify(error), null);
                    return;
                }
                tmp.dir({"unsafeCleanup": true}, (error, dirPath, cleanupCallback) => {
                    if (error) {
                        callback(JSON.Stringify(error), null);
                        return;
                    }
                    let command = "tizen certificate";
                    for (const option of options) {
                        // obviously we should to sanitize user-provided values here
                        command += " " + option[0] + " \"" + option[2] + "\"";
                    }
                    command += " --filename \"" + user._id + "\"";
                    command += " -- \"" + dirPath + "\"";
                    exec(command, (error, stdout, stderr) => {
                        if (error) {
                            const output = {
                                "error": error,
                                "stdout": stdout,
                                "stderr": stderr
                            };
                            callback(JSON.stringify(output), null);
                        } else {
                            fs.readFile(nodePath.join(dirPath, user._id + ".p12"), (error, data) => {
                                if (error) {
                                    cleanupCallback();
                                    callback(JSON.Stringify(error), null);
                                    return;
                                }
                                const certificate = {
                                    "data" : data
                                };
                                for (const option of options) {
                                    certificate[option[1]] = option[2];
                                }
                                user.local.certificate = certificate;
                                user.save((error) => {
                                    if (error) {
                                        cleanupCallback();
                                        callback(JSON.Stringify(error), null);
                                    } else {
                                        cleanupCallback();
                                        callback(null, true);
                                    }
                                });
                            });
                        }
                    });
                });
            });
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
