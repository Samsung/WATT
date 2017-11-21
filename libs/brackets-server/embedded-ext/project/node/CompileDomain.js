/*global Set*/
(function () {
    "use strict";

    var exec = require("child_process").exec,
        execSync = require("child_process").execSync,
        fs = require("fs"),
        nodePath = require("path"),  // avoid conflicts with many uses of 'path' variable name
        process = require("process"),
        replaceExt = require("replace-ext"),
        tmp = require("tmp");

    const Project = require("mongoose").model("Project");
    const User = require("mongoose").model("User");

    var _domainManager;

    function cmdCompile(id, file, type, options, callback) {
        var compiler = "emcc";

        exec(compiler +" "+file + " -s WASM=1 -o "+replaceExt(file, ".html") + " " + options, {}, function(error, stdout, stderr) {
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

        exec(command, {}, function(/*error, stdout, stderr*/) {});
    }


    function updateBuiltFiles(id, makefileInProject, files, callback) {
        if (files === "") {
            return;
        }

        const projectPath = nodePath.join(process.cwd(), "projects", id);

        if (!makefileInProject) {
            addDefaultMakefile(projectPath);
        }

        var command = "cd " + projectPath + "; sed -i '/^SOURCES/c\SOURCES="+ files + "' makefile";

        exec(command, {}, function(error, stdout, stderr) {
            var resultObj = {
                "error": `${error}`,
                "stdout": `${stdout}`,
                "stderr": `${stderr}`,
            };

            var resultStr = JSON.stringify(resultObj);
            callback(null, resultStr);
        });
    }

    function getBuiltFiles(id, makefileInProject, callback) {
        const projectPath = nodePath.join(process.cwd(), "projects", id);

        if (!makefileInProject) {
            addDefaultMakefile(projectPath);
        }

        var command = "cd " + projectPath + "; grep 'SOURCES=' makefile";

        exec(command, {}, function(error, stdout, stderr) {
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

    function buildWGT(projectId, callback) {
        const projectPath = nodePath.join(process.cwd(), "projects", projectId);

        // Tizen studio distributor's certificate password is not really a
        // secret. Distributor's certificate file is shared among all users.
        const certDir = process.cwd() + "/sample-certs";
        const authorCAPath = certDir + "/tizen-developer-ca.cer";
        const distributorCertPath = certDir + "/tizen-distributor-signer.p12";
        const distributorCertPassword = "tizenpkcs12passfordsigner";
        const distributorCAPath = certDir + "/tizen-distributor-ca.cer";

        // Authors' certificates are stored inside the database.
        Project.findOne({"_id": projectId}, function(error, project) {
            if (error) {
                const result = {
                    "message": `Couldn't find project with id: ${projectId}`,
                    "details": error
                };
                callback(JSON.stringify(result), null);
                return;
            }
            const userId = project.user;
            User.findOne({"_id" : userId}, function(error, user) {
                if (error) {
                    const result = {
                        "message": `Couldn't find user with id: ${userId}`,
                        "details": error
                    };
                    callback(JSON.stringify(result), null);
                    return;
                }
                const password = user.local.certificate.password;
                const keyFile = user.local.certificate.data;
                if (!keyFile) {
                    const result = {
                        "message": "No author certificate found, please generate one first",
                        "details": null
                    };
                    callback(JSON.stringify(result), null);
                    return;
                }
                tmp.dir({"unsafeCleanup": true}, (error, dirPath, cleanupCallback) => {
                    if (error) {
                        const result = {
                            "message": "Couldn't create temporary directory",
                            "details": error
                        };
                        callback(JSON.stringify(result), null);
                        return;
                    }
                    const certFile = nodePath.join(dirPath, user._id + ".p12");
                    fs.writeFile(certFile, keyFile, (error) => {
                        if (error) {
                            cleanupCallback();
                            const result = {
                                "message": "Couldn't write certificate file",
                                "details": error
                            };
                            callback(JSON.stringify(result), null);
                            return;
                        }
                        const addProfileCommand = `tizen security-profiles add --name "${user._id}" -a ${certFile} --password ${password} --ca ${authorCAPath} --dist ${distributorCertPath} --dist-password ${distributorCertPassword} --dist-ca ${distributorCAPath}`;
                        const buildPackageCommand = `tizen package --type wgt --sign ${user._id} -- ${projectPath}`;
                        const removeProfileCommand = `tizen security-profiles remove --name ${user._id}`;
                        // removeProfileCommand is of fire and forget kind, no need to
                        // check the result
                        const removeProfileCallback = () => { exec(removeProfileCommand); };
                        exec(addProfileCommand, (error, stdout, stderr) => {
                            if (error) {
                                const output = {
                                    "error": error,
                                    "stdout": stdout,
                                    "stderr": stderr
                                };
                                cleanupCallback();
                                const result = {
                                    "message": "Error adding security profile",
                                    "details": output
                                };
                                callback(JSON.stringify(result), null);
                                return;
                            } else {
                                exec(buildPackageCommand, (error, stdout, stderr) => {
                                    const output = {
                                        "error": error,
                                        "stdout": stdout,
                                        "stderr": stderr
                                    };
                                    if (error) {
                                        removeProfileCallback();
                                        cleanupCallback();
                                        const result = {
                                            "message": "Error adding security profile",
                                            "details": output
                                        };
                                        callback(JSON.stringify(result), null);
                                        return;
                                    } else {
                                        // Remove generated files, which are packaged in the .wgt and
                                        // are useless to the WATT user.
                                        const generatedFiles = [
                                            "author-signature.xml",
                                            "signature1.xml",
                                            ".manifest.tmp"
                                        ];
                                        // Error callback only logs failure, because there is
                                        // not much we can do anyway.
                                        const unlinkCallback = (error) => {
                                            if (error) {
                                                console.error(error);
                                            }
                                        };
                                        for (const filepath of generatedFiles) {
                                            fs.unlink(nodePath.join(projectPath, filepath), unlinkCallback);
                                        }
                                        removeProfileCallback();
                                        cleanupCallback();
                                        callback(null, JSON.stringify(output));
                                        return;
                                    }
                                });
                            }
                        });
                    });
                });
            });
        });
    }

    function cmdCompileProject(id, makefileInProject, callback) {
        const projectPath = nodePath.join(process.cwd(), "projects", id);

        if (!makefileInProject) {
            addDefaultMakefile(projectPath);
        }

        var idlName = "WASM.idl";
        var idlPath = projectPath + idlName;
        var hasIDL = true;
        try {
            execSync("ls " + idlPath);
        } catch(e) { hasIDL = false; }

        if (hasIDL) {
            execSync("GenerateWebIDLBinding -d " + idlPath);
            const apiInfo = JSON.parse(execSync("cat " + projectPath + "WASM.json").toString());
            let headers = new Set();
            for (const i of apiInfo.interfaces) {
                headers.add(i.path);
            }
            let headerStr = "";
            for (const h of headers) {
                headerStr += "#include \"" + h + "\"\\\n";
            }
            execSync("sed -i \'1s/^/" + headerStr + "/\' " + projectPath + "glue.cpp");
            execSync("sed -i \'/^CCFLAGS=/c\CCFLAGS=-s WASM=1 --post-js glue.js \' " + projectPath + "makefile");
        }

        var command = "cd " + projectPath + "; make";

        exec(command, {}, function(error, stdout, stderr) {
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

        exec(command, {}, function(error, stdout, stderr) {
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
            grepper += " " + projectPath + cppFiles[i];
        }
        grepper += " -project-path " + projectPath;
        grepper += " -json-file " + jsonFile;

        exec(grepper, {}, function(error, stdout, stderr) {
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
        var cmd = "cat " + projectPath + jsonFile;

        exec(cmd, {}, function(error, stdout, stderr) {
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
                {name: "files", type: "string"}
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
                {name: "makefileInProject", type: "number"}
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
            "buildWGT",
            buildWGT,
            true,
            "Build WGT package from project",
            [
                {name: "projectId", type: "string"}
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
    }
    exports.init = init;
}());
