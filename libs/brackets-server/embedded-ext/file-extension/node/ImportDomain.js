(function () {
    "use strict";

    var fs = require("fs"),
        fse = require("fs-extra"),
        path = require("path"),
        readline = require("readline");

    var _domainManager;

    function init(domainManager) {
        _domainManager = domainManager;
        if (!_domainManager.hasDomain("importNode")) {
            _domainManager.registerDomain("importNode", {major: 0, minor: 1});
        }

        // Get shared project from share
        function getSharedProject(callback) {
            var sharedPath = path.join(process.cwd(), "share");
            fs.readdir(sharedPath, function(error, files) {
                callback(null, files);
            });
        }

        function getSharedFile(projectName, callback) {
            var fileName;
            var sharedPath = path.join(process.cwd(), "share", projectName);

            // Get target name from makefile
            var makePath = path.join(sharedPath, "makefile");
            if (fs.existsSync(makePath)) {
                var lineReader = readline.createInterface({
                    input: fs.createReadStream(makePath)
                });

                lineReader.on("line", function(line) {
                    if (line.startsWith("TARGET")) {
                        var file = line.split("=")[1].trim();
                        fileName = file.split(".")[0];
                    }
                });

                lineReader.on("close", function() {
                    // FIXME: We just checked wasm and js whether it was exsited
                    //        or not. We need a way to find correct result file.
                    var wasmPath = path.join(sharedPath, fileName + ".wasm");
                    var loaderPath = path.join(sharedPath, fileName + ".js");

                    var fileList = [];
                    if (fs.existsSync(wasmPath) && fs.existsSync(loaderPath)) {
                        fileList.push(fileName + ".wasm");
                        fileList.push(fileName + ".js");
                        callback(null, fileList);
                    } else {
                        callback("Not found wasm");
                    }
                });
            } else {
                callback("Not found makefile");
            }
        }

        function copySharedFile(projectName, fileList, targetId, callback) {
            var sharedPath = path.join(process.cwd(), "share", projectName);
            var destPath = path.join(process.cwd(), "projects", targetId);

            // Copy files to the target project
            fileList.forEach(function(file) {
                var sourcePath = path.join(sharedPath, file);
                if (fs.existsSync(sourcePath)) {
                    var destFilePath = path.join(destPath, file);
                    try {
                        fse.copySync(sourcePath, destFilePath);
                    } catch (error) {
                        return callback("Fail to copy files");
                    }
                }
            });

            callback(null);
        }

        function copyFile(projectId, src, name, dest, callback) {
            const sourcePath = path.join(process.cwd(), "projects", projectId, src, name);
            const destPath = path.join(process.cwd(), "projects", projectId, dest, name);

            fse.copy(sourcePath, destPath, (err) => {
                if (err) {
                    return callback(err);
                }

                callback();
            });
        }

        function moveFile(projectId, src, name, dest, callback) {
            const sourcePath = path.join(process.cwd(), "projects", projectId, src, name);
            const destPath = path.join(process.cwd(), "projects", projectId, dest, name);

            fse.move(sourcePath, destPath, (err) => {
                if (err) {
                    return callback(err);
                }

                callback();
            });
        }

        _domainManager.registerCommand(
            "importNode",
            "getSharedProject",
            getSharedProject,
            true,
            "Get Shared Project",
            null,
            [
                {name: "data", type: "array"}
            ]
        );

        _domainManager.registerCommand(
            "importNode",
            "getSharedFile",
            getSharedFile,
            true,
            "Get Shared File",
            [
                {name: "projectName", type: "string"}
            ],
            [
                {name: "result", type: "array"}
            ]
        );

        _domainManager.registerCommand(
            "importNode",
            "copySharedFile",
            copySharedFile,
            true,
            "Copy Shared File",
            [
                {name: "projectName", type: "string"},
                {name: "fileList", type: "array"},
                {name: "targetId", type: "string"}
            ],
            []
        );

        _domainManager.registerCommand(
            "importNode",
            "COPY",
            copyFile,
            true,
            "Copy File",
            [
                {name: "projectId", type: "string"},
                {name: "src", type: "string"},
                {name: "name", type: "string"},
                {name: "dest", type: "string"}
            ],
            []
        );

        _domainManager.registerCommand(
            "importNode",
            "CUT",
            moveFile,
            true,
            "Move File",
            [
                {name: "projectId", type: "string"},
                {name: "src", type: "string"},
                {name: "name", type: "string"},
                {name: "dest", type: "string"}
            ],
            []
        );
    }

    exports.init = init;
}());
