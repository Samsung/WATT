/*global Set*/
(function () {
    "use strict";

    var cmd = require("node-cmd"),
        copyGlob = require("copy"),  // TODO: maybe use fs-extra's 'copy' with a filter?
        exec = require("child_process").exec,
        execSync = require("child_process").execSync,
        fs = require("fs-extra"),  // fs-extra is compatible with fs, but also provides recursive copy
        nodePath = require("path"),  // avoid conflicts with many uses of 'path' variable name
        os = require("os"),
        process = require("process"),
        replaceExt = require("replace-ext"),
        tmp = require("tmp");

    const Project = require("mongoose").model("Project");
    const User = require("mongoose").model("User");

    var _domainManager;

    function cmdCompile(id, file, type, options, callback) {
        var compiler = "emcc";

        exec(compiler + " " + file + " -s WASM=1 -o " + replaceExt(file, ".html") + " " + options, {}, function (error, stdout, stderr) {
            var resultObj = {
                "error": `${error}`,
                "stdout": `${stdout}`,
                "stderr": `${stderr}`,
            };

            var resultStr = JSON.stringify(resultObj);
            callback(null, resultStr);
        });
    }

    function addDefaultMakefile(path) {
        console.log("WARNING! Adding default makefile!");

        var command = "cd " + path + "; echo '" + "# TODO: add error when mixing C/CC/CPP files in one project\r\n" +
            "CC=emcc\r\n" +
            "CXX=emcc\r\n" +
            "CCFLAGS=-s WASM=1\r\n" +
            "CCFLAGS_OPT=\r\n" +
            "SOURCES = \$(shell find . -name \"*.cc\" -o -name \"*.cpp\" -o -name \"*.c\")\r\n" +
            "OBJECTS_CC=\$\(SOURCES:.cc=.o)\r\n" +
            "OBJECTS_CPP=\$\(SOURCES:.cpp=.o)\r\n" +
            "OBJECTS=\$\(OBJECTS_CC:.c=.o)\r\n" +
            "TARGET=main.html\r\n" +
            "\r\n" +
            "all: \$(TARGET)\r\n" +
            "\t\t\r\n" +
            "\$\(TARGET): \$\(OBJECTS)\r\n" +
            "\t\t\$\(CC) -o \$\@ \$\^ \$\(CCFLAGS) \$\(CCFLAGS_OPT\)\r\n" +
            "\r\n" +
            "%.o: %.cc %.h\r\n" +
            "\t\t\$\(CC) -c \$\< -o \$\@\r\n" +
            "\r\n" +
            "%.o: %.c %.h\r\n" +
            "\t\t\$\(CC) -c \$\< -o \$\@\r\n" +
            "\r\n" +
            "%.o: %.cc\r\n" +
            "\t\t\$\(CC) -c \$\< -o \$\@\r\n" +
            "\r\n" +
            "%.o: %.c\r\n" +
            "\t\t\$\(CC) -c \$\< -o \$\@\r\n" +
            " \r\n" +
            "clean:\r\n" +
            "\t\trm -f \$\(shell find . -name \"*.o\") *.wasm *.wast *.js \$\(TARGET)\r\n" +
            " ' > makefile";

        exec(command, {}, function (/*error, stdout, stderr*/) {
        });
    }


    function updateBuiltFiles(id, makefileInProject, files, path, callback) {
        if (files === "") {
            return;
        }

        if (!makefileInProject) {
            addDefaultMakefile(path);
        }

        var command = "cd " + path + "; sed -i '/^SOURCES/c\SOURCES=" + files + "' makefile";

        exec(command, {}, function (error, stdout, stderr) {
            var resultObj = {
                "error": `${error}`,
                "stdout": `${stdout}`,
                "stderr": `${stderr}`,
            };

            var resultStr = JSON.stringify(resultObj);
            callback(null, resultStr);
        });
    }

    function getBuiltFiles(id, makefileInProject, path, callback) {
        if (!makefileInProject) {
            addDefaultMakefile(path);
        }

        var command = "cd " + path + "; grep 'SOURCES=' makefile";

        exec(command, {}, function (error, stdout, stderr) {
            var resultObj = {
                "error": `${error}`,
                "stdout": `${stdout}`,
                "stderr": `${stderr}`,
            };

            var resultStr = JSON.stringify(resultObj);
            callback(null, resultStr);
        });
    }

    function checkBuildWGT(callback) {
        exec("tizen version", (error/*, stdout, stderr*/) => {
            callback(!error);
        });
    }

    function getPackagingCertData(projectId) {
        // Authors' certificates are stored inside the database.
        return new Promise(function (resolve, reject) {
            Project.findOne({"_id": projectId}, function (error, project) {
                if (error) {
                    reject({
                        "message": `Couldn't find project with id: ${projectId}`,
                        "details": error
                    });
                    return;
                }
                const userId = project.user;
                User.findOne({"_id": userId}, function (error, user) {
                    if (error) {
                        reject({
                            "message": `Couldn't find user with id: ${userId}`,
                            "details": error
                        });
                        return;
                    }
                    const keyPassword = user.local.certificate.password;
                    const keyFileData = user.local.certificate.data;
                    const userId = user._id;
                    if (!keyFileData) {
                        reject({
                            "message": "No author certificate found, please generate one first",
                            "details": null
                        });
                        return;
                    }
                    resolve({"keyPassword": keyPassword, "keyFileData": keyFileData, "userId": userId});
                });
            });
        });
    }

    function getTempDir() {
        return new Promise(function (resolve, reject) {
            tmp.dir({"unsafeCleanup": true}, (error, dirPath, cleanupCallback) => {
                if (error) {
                    reject({
                        "message": "Couldn't create temporary directory",
                        "details": error
                    });
                    return;
                }
                resolve({"tmpDirPath": dirPath, "tmpDirCleanup": cleanupCallback});
            });
        });
    }

    function writeCertFile(keyFilePath, keyFileData) {
        return new Promise((resolve, reject) => {
            fs.writeFile(keyFilePath, keyFileData, (error) => {
                if (error) {
                    reject({
                        "message": "Couldn't write certificate file",
                        "details": error
                    });
                    return;
                }
                resolve();
            });
        });
    }

    function copyPackageFiles(projectPath, workDir, fileFilter) {
        return new Promise((resolve, reject) => {
            fs.copy(projectPath, workDir, {filter: fileFilter}, (error) => {
                if (error) {
                    reject({
                        "message": "Couldn't copy project dir",
                        "details": error
                    });
                    return;
                }
                resolve();
            });
        });
    }

    function patchIndexFile(indexFile, replacementList) {
        // nothing to patch, we can skip this
        if (replacementList.length === 0) {
            return;
        }
        return new Promise((resolve, reject) => {
            fs.readFile(indexFile, "utf8", (indexFileReadError, data) => {
                if (indexFileReadError) {
                    reject({
                        "message": "Couldn't read index.html",
                        "details": indexFileReadError
                    });
                    return;
                }
                for (const {originalPath, devicePath} of replacementList) {
                    data = data.replace(new RegExp("([\"'])" + originalPath + "\\1", "g"), "$1" + devicePath + "$1");
                }
                fs.writeFile(indexFile, data, (indexFileWriteError) => {
                    if (indexFileWriteError) {
                        reject({
                            "message": "Couldn't write index.html",
                            "details": indexFileWriteError
                        });
                        return;
                    }
                    resolve();
                });
            });
        });
    }

    function buildPackage(workDirPath, resultPath, keyFilePath, keyPassword, userId, packageType) {
        console.log("buildPackage", workDirPath);
        return new Promise((resolve, reject) => {
            // Tizen studio distributor's certificate password is not really a
            // secret. Distributor's certificate file is shared among all users.
            const certDir = process.cwd() + "/sample-certs";
            const authorCAPath = certDir + "/tizen-developer-ca.cer";
            const distributorCertPath = certDir + "/tizen-distributor-signer.p12";
            const distributorCertPassword = "tizenpkcs12passfordsigner";
            const distributorCAPath = certDir + "/tizen-distributor-ca.cer";
            // In docker, latest Tizen Studio CLI (3.2) produces the following error while packing:
            // java.lang.IllegalStateException: org.tizen.common.sign.exception.CertificationException: Invaild password
            // Tizen 2.5 does not have such issue.
            const tizenCommand = process.env.NODE_ENV == "docker" ?  nodePath.join(os.homedir(), "tizen-studio-2.5", "tools", "ide", "bin", "tizen") : "tizen";

            const addProfileCommand = `${tizenCommand} security-profiles add --name "${userId}" -a ${keyFilePath} --password ${keyPassword} --ca ${authorCAPath} --dist ${distributorCertPath} --dist-password ${distributorCertPassword} --dist-ca ${distributorCAPath}`;
            console.log("workDirPath", workDirPath);
            const buildPackageCommand = `${tizenCommand} package --type wgt --sign "${userId}" -- ${workDirPath}`;
            const removeProfileCommand = `${tizenCommand} security-profiles remove --name "${userId}"`;
            exec(addProfileCommand, (error, stdout, stderr) => {
                if (error) {
                    reject({
                        "message": "Error adding security profile",
                        "details": {
                            "error": error,
                            "stdout": stdout,
                            "stderr": stderr
                        }
                    });
                    return;
                }
                exec(buildPackageCommand, (error, stdout, stderr) => {
                    // removeProfileCommand is of fire and forget kind, no need to
                    // check the result
                    exec(removeProfileCommand);
                    if (error) {
                        reject({
                            "message": "Error during packaging",
                            "details": {
                                "error": error,
                                "stdout": stdout,
                                "stderr": stderr
                            }
                        });
                        return;
                    }
                    copyGlob(nodePath.join(workDirPath, "*." + packageType), resultPath, (error, _) => {
                        if (error) {
                            reject({
                                "message": `Error copying back .${packageType} file`,
                                "details": error
                            });
                            return;
                        }
                        resolve();
                    });
                });
            });
        });
    }

    // This function is used by the S-Things Framework.
    // Used only in Demo.
    function installWGT(projectId, callback) {
        const sourcePath = process.cwd() + "projects" + projectId;
        var command = sourcePath + "/install.sh";
        let child = exec(command, {cwd: sourcePath});

        child.on("error", (err) => {
            console.error("Error");
            callback(err);
        });
    }

    function packPPK(projectId, callback) {
        console.log("Installing project: " + projectId);
        var install = new Promise(function (resolve, reject) {
            cmd.get(
                `node tools/cli/installPlugin.js ${projectId}`,
                function (err, data, stderr) {
                    if (err) {
                        console.log(stderr)
                        reject(stderr);
                    } else {
                        console.log("Result> installPlugin: ", data);
                        resolve(data);
                    }
                }
            );
        }).then(() => {
            callback(null, JSON.stringify("success"));
        }).catch((errorData) => {
            callback(JSON.stringify(errorData), null);
        });
    }

    function packCRX(projectId, appName, callback) {
        console.log("Pack Chromium extension : " + projectId + "/" + appName);
        var install = new Promise(function (resolve, reject) {
            cmd.get(
                `node tools/crx/bin/crx pack projects/${projectId} -o projects/${projectId}/${appName}.crx`,
                function (err, data, stderr) {
                    if (err) {
                        reject({"packCRX": err});
                    } else {
                        console.log("Result> pack result: ", data);
                        resolve(data);
                    }
                }
            );
        }).then(() => {
            callback(null, JSON.stringify("success"));
        }).catch((errorData) => {
            callback(JSON.stringify(errorData), null);
        });
    }

    function packWGT(projectId, replacementValues, callback) {
        console.log("packWGT");
        const projectPath = nodePath.join(process.cwd(), "projects", projectId);

        replacementValues = JSON.parse(replacementValues);

        let tmpDirCleanup = () => {
        };
        let keyFileData, keyPassword, userId;
        let tmpDirPath;
        let keyFilePath;
        let wgtWorkDir;
        Promise.all([
            getPackagingCertData(projectId),
            getTempDir()
        ]).then(values => {
            ({keyPassword, keyFileData, userId} = values[0]);
            ({tmpDirPath, tmpDirCleanup} = values[1]);
            keyFilePath = nodePath.join(tmpDirPath, userId + ".p12");
            return writeCertFile(keyFilePath, keyFileData);
        }).then(() => {
            const replacementPathList = replacementValues.map(
                ({originalPath}) => {
                    return nodePath.normalize(nodePath.join(projectPath, originalPath));
                });
            // Every file copied to wgt temporary directory will be included in the final wgt file,
            // so we want to skip files in two cases:
            //   1. We don't want to copy resources for which user decided that they are provided by system.
            //   2. We also don't want to copy existing wgt (to avoid matryoshka doll effect).
            const fileFilter = (src, dst) => {
                if (replacementPathList.some(originalPath => nodePath.normalize(src) === originalPath)) {
                    return false;
                }
                if (src.endsWith(".wgt")) {
                    return false;
                }
                return true;
            };
            wgtWorkDir = nodePath.join(tmpDirPath, nodePath.parse(projectPath).base);
            return copyPackageFiles(projectPath, wgtWorkDir, fileFilter);
        }).then(() => {
            // We have to patch file to use new paths (system instead of package).
            // Currently we only patch index.html.
            const indexFile = nodePath.join(wgtWorkDir, "index.html");
            return patchIndexFile(indexFile, replacementValues);
        }).then(() => {
            return buildPackage(wgtWorkDir, projectPath, keyFilePath, keyPassword, userId, "wgt");
        }).then(() => {
            tmpDirCleanup();
            callback(null, JSON.stringify("success"));
        }).catch((errorData) => {
            tmpDirCleanup();
            callback(JSON.stringify(errorData), null);
        });
    }

    function checkUnity(callback) {
        let unityPath;
        const platform = os.platform();
        if (platform === "darwin") {
            // FIXME: If you know how to find installed application path, fix me to find correct path using CLI
            unityPath = nodePath.join("/Applications", "Unity", "Unity.app", "Contents", "MacOS", "Unity");
        } else if (platform === "linux") {
            // FIXME: If you know how to find installed application path, fix me to find correct path using CLI
            unityPath = nodePath.join("/opt", "Unity", "Editor", "Unity");
        }

        if (fs.existsSync(unityPath)) {
            return callback(null, true);
        }

        return callback(null, false);
    }

    function cmdBuildUnity(projectId, callback) {
        const projectPath = nodePath.join(process.cwd(), "projects", projectId);
        // FIXME: If you know how to find installed application path, fix me to find correct path using CLI

        let unityPath;
        const platform = os.platform();
        if (platform === "darwin") {
            unityPath = nodePath.join("/Applications", "Unity", "Unity.app", "Contents", "MacOS", "Unity");
        } else if (platform === "linux") {
            unityPath = nodePath.join("/opt", "Unity", "Editor", "Unity");
        }

        const unityBuildCommand = unityPath + " -quit -batchmode -projectPath \'" + projectPath + "\' -executeMethod BuildScript.PerformWebGLBuild -buildTarget webgl";

        exec(unityBuildCommand, {}, function (error, stdout, stderr) {
            if (error) {
                return callback(error);
            }

            callback(null);
        });
    };

    function addHeaders(projectPath, contexts, headers) {
        contexts.forEach(c => {
            if (c.path) {
                headers.add(nodePath.relative(projectPath, c.path));
            }
            if (c.hasOwnProperty("Contexts")) {
                addHeaders(projectPath, c.Contexts, headers);
            }
        });
    }

    function cmdCompileProject(id, makefileInProject, callback) {
        const projectPath = nodePath.join(process.cwd(), "projects", id);

        if (!makefileInProject) {
            addDefaultMakefile(projectPath);
        }

        var idlName = "WASM.idl";
        var idlPath = nodePath.join(projectPath, idlName);
        var hasIDL = true;
        try {
            execSync("ls " + idlPath);
        } catch (e) {
            hasIDL = false;
        }

        if (hasIDL) {
            execSync("GenerateWebIDLBinding -d " + idlPath);
            const apiInfo = JSON.parse(execSync("cat " + nodePath.join(projectPath, "WASM.api.json")).toString());
            let headers = new Set();
            if (apiInfo.hasOwnProperty("Contexts")) {
                addHeaders(projectPath, apiInfo.Contexts, headers);
            }
            let headerStr = "";
            headers.forEach(h => headerStr += "#include \"" + h + "\"\\n");
            execSync("sed -i \'1s;^;" + headerStr + ";\' " + nodePath.join(projectPath, "glue.cpp"));
            execSync("sed -i \'/^CCFLAGS=/c\CCFLAGS=-s WASM=1 --post-js glue.js \' " + nodePath.join(projectPath, "makefile"));
        }

        var command = "cd " + projectPath + "; make";

        exec(command, {}, function (error, stdout, stderr) {
            var resultObj = {
                "error": `${error}`,
                "stdout": `${stdout}`,
                "stderr": `${stderr}`,
            };

            var resultStr = JSON.stringify(resultObj);
            callback(null, resultStr);
        });
    }

    function cmdCleanProject(id, makefileInProject, callback) {
        const projectPath = nodePath.join(process.cwd(), "projects", id);

        if (!makefileInProject) {
            addDefaultMakefile(projectPath);
        }

        var command = "cd " + projectPath + "; make clean";

        exec(command, {}, function (error, stdout, stderr) {
            var resultObj = {
                "error": `${error}`,
                "stdout": `${stdout}`,
                "stderr": `${stderr}`,
            };

            var resultStr = JSON.stringify(resultObj);
            callback(null, resultStr);
        });
    }

    function cmdGrepAPI(id, cppFiles, jsonFile, callback) {
        const projectPath = nodePath.join(process.cwd(), "projects", id);
        var grepper = "API-Grepper";

        for (var i = 0; i < cppFiles.length; i++) {
            grepper += " " + nodePath.join(projectPath, cppFiles[i]);
        }
        grepper += " -project-path " + projectPath;
        grepper += " -json-file " + jsonFile;

        exec(grepper, {}, function (error, stdout, stderr) {
            var result = {
                "error": `${error}`,
                "stdout": `${stdout}`,
                "stderr": `${stderr}`,
            };

            var resultStr = JSON.stringify(result);
            callback(null, resultStr);
        });
    }

    function cmdCatGreppedAPI(id, jsonFile, callback) {
        const projectPath = nodePath.join(process.cwd(), "projects", id);
        var cmd = "cat " + nodePath.join(projectPath, jsonFile);

        exec(cmd, {}, function (error, stdout, stderr) {
            var result = {
                "error": `${error}`,
                "stdout": `${stdout}`,
                "stderr": `${stderr}`,
            };

            var resultStr = JSON.stringify(result);
            callback(null, resultStr);
        });
    }

    function init(domainManager) {
        _domainManager = domainManager;
        if (!_domainManager.hasDomain("compileEmscripten")) {
            _domainManager.registerDomain("compileEmscripten", {major: 0, minor: 1});
        }

        _domainManager.registerCommand(
            "compileEmscripten",
            "compile",
            cmdCompile,
            true,
            "Compile the native code",
            [
                {name: "id", type: "string"},
                {name: "file", type: "string"},
                {name: "type", type: "string"},
                {name: "options", type: "string"}
            ],
            [
                {name: "data", type: "string"},
            ]
        );

        _domainManager.registerCommand(
            "compileEmscripten",
            "compileWithMakefile",
            cmdCompileProject,
            true,
            "Compile the native code with makefile",
            [
                {name: "id", type: "string"},
                {name: "makefileInProject", type: "number"}
            ],
            [
                {name: "data", type: "string"},
            ]
        );

        _domainManager.registerCommand(
            "compileEmscripten",
            "cleanWithMakefile",
            cmdCleanProject,
            true,
            "Clean with makefile",
            [
                {name: "id", type: "string"},
                {name: "makefileInProject", type: "number"}
            ],
            [
                {name: "data", type: "string"},
            ]
        );

        _domainManager.registerCommand(
            "compileEmscripten",
            "updateCompiledFiles",
            updateBuiltFiles,
            true,
            "Update compiled files",
            [
                {name: "id", type: "string"},
                {name: "makefileInProject", type: "number"},
                {name: "files", type: "string"},
                {name: "path", type: "string"}
            ],
            [
                {name: "data", type: "string"},
            ]
        );

        _domainManager.registerCommand(
            "compileEmscripten",
            "getCompiledFiles",
            getBuiltFiles,
            true,
            "Get list of compiled files",
            [
                {name: "id", type: "string"},
                {name: "makefileInProject", type: "number"},
                {name: "path", type: "string"}
            ],
            [
                {name: "data", type: "string"},
            ]
        );

        _domainManager.registerCommand(
            "compileEmscripten",
            "grepAPI",
            cmdGrepAPI,
            true,
            "Execute API-Grepper",
            [
                {name: "id", type: "string"},
                {name: "cppFiles", type: "array"},
                {name: "jsonFileName", type: "string"}
            ],
            [
                {name: "data", type: "string"}
            ]
        );

        _domainManager.registerCommand(
            "compileEmscripten",
            "catGreppedAPI",
            cmdCatGreppedAPI,
            true,
            "Cat JSON Data",
            [
                {name: "id", type: "string"},
                {name: "jsonFileName", type: "string"}
            ],
            [
                {name: "data", type: "string"}
            ]
        );

        _domainManager.registerCommand(
            "compileEmscripten",
            "checkBuildWGT",
            checkBuildWGT,
            true,
            "Check can build WGT package",
            [],
            [
                {name: "canBuild", type: "boolean"},
            ]
        );

        _domainManager.registerCommand(
            "compileEmscripten",
            "packWGT",
            packWGT,
            true,
            "Build WGT package from project",
            [
                {name: "projectId", type: "string"},
                {name: "replacementValues", type: "string"}
            ],
            [
                {name: "data", type: "string"},
            ]
        );

        _domainManager.registerCommand(
            "compileEmscripten",
            "packPPK",
            packPPK,
            true,
            "Build Plugin package from project",
            [
                {name: "projectId", type: "string"},
                {name: "replacementValues", type: "string"}
            ],
            [
                {name: "data", type: "string"},
            ]
        );

        _domainManager.registerCommand(
            "compileEmscripten",
            "packCRX",
            packCRX,
            true,
            "Build Chrome extension from project",
            [
                {name: "projectId", type: "string"},
                {name: "appName", type: "string"}
            ],
            [
                {name: "data", type: "string"},
            ]
        );

        _domainManager.registerCommand(
            "compileEmscripten",
            "checkUnity",
            checkUnity,
            true,
            "Check Untiy whether it is existed",
            [],
            [
                {name: "exist", type: "boolean"},
            ]
        );

        _domainManager.registerCommand(
            "compileEmscripten",
            "buildUnity",
            cmdBuildUnity,
            true,
            "Build Untiy from project",
            [
                {name: "projectId", type: "string"},
            ],
            [
                {name: "data", type: "string"},
            ]
        );
    }

    if (process.env.NODE_ENV === "test") {
        exports.checkBuildWGT = checkBuildWGT;
        exports.getBuiltFiles = getBuiltFiles;
        exports.updateBuiltFiles = updateBuiltFiles;
        exports.getTempDir = getTempDir;
        exports.patchIndexFile = patchIndexFile;
    }
    exports.init = init;
}());
