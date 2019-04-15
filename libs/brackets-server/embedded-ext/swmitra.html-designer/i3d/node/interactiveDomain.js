(function() {
    "use strict";

    const async = require("async");
    const cheerio = require("cheerio");
    const download = require("download");
    const extract = require("extract-zip");
    const fs = require("fs-extra");
    const path = require("path");
    const requestPromise = require("request-promise");
    const urljoin = require("url-join");

    const polyURL = "https://poly.google.com";
    const supportPath = path.join(process.cwd(), "projects", "support");

    function init(domainManager) {
        if (!domainManager.hasDomain("interactiveDomain")) {
            domainManager.registerDomain("interactiveDomain", {major: 0, minor: 1});
        }

        function isInstalled(projectId, id) {
            const modelPath = path.join(supportPath, projectId, "models");
            return fs.existsSync(path.join(modelPath, id));
        }

        function searchModel(projectId, name) {
            return new Promise((resolve, reject) => {
                // Request 3D model data from poly
                requestPromise({
                    uri: urljoin(polyURL, "search", name),
                    transform: (body) => {
                        return cheerio.load(body);
                    }
                }).then($ => {
                    const models = [];
                    // "div.J9cSnd-rymPhb" is magic string to parse model data from poly
                    const results = $("div.J9cSnd-rymPhb").children();

                    results.each((index, result) => {
                        if (result.childNodes[0]) {
                            const child = result.childNodes[0];
                            if (child.tagName === "a" && child.attribs && child.attribs.href) {
                                const model = {};

                                model.id = path.basename(child.attribs.href);
                                model.title = child.childNodes[0].attribs.title;
                                model.imgSrc = child.childNodes[0].childNodes[0].attribs.src;

                                // Check whether the project is installed or not
                                if (isInstalled(projectId, model.id)) {
                                    model.installed = true;
                                } else {
                                    model.installed = false;
                                }

                                model.objects = [];

                                models.push(model);
                            }
                        }
                    });

                    resolve(models);
                }).catch(err => {
                    reject(err);
                });
            });
        }

        function search(projectId, name, callback) {
            searchModel(projectId, name).then(models => {
                const result = JSON.stringify(models);
                callback(null, result);
            });
        }

        // Get 3D model path from user support folder
        function getModelDataPath(projectId) {
            return path.join(supportPath, projectId, "models", "models.json");
        }

        // Get 3D model data from user support folder
        function getModelDataSync(projectId) {
            const dataPath = getModelDataPath(projectId);
            if (!fs.existsSync(dataPath)) {
                const model = [];

                fs.ensureFileSync(dataPath);
                fs.writeJsonSync(dataPath, model);
            }

            return fs.readJsonSync(dataPath);
        }

        // Save 3D model data to user project folder
        function saveModelDataSync(projectId, model) {
            const data = getModelDataSync(projectId);
            data.push(model);
            fs.writeJsonSync(getModelDataPath(projectId), data, {spaces: 2});
        }

        function installModel(projectId, model) {
            const modelPath = path.join(supportPath, projectId, "models");
            return new Promise((resolve, reject) => {
                // Request 3D model data from poly
                requestPromise({
                    uri: urljoin(polyURL, "view", model.id),
                    transform: body => {
                        return cheerio.load(body);
                    }
                }).then($ => {
                    // "div.uyYuVb.oJeWuf[jsname='O4kc2b']" is magic string to parse model data from poly
                    const results = $("div.uyYuVb.oJeWuf[jsname='O4kc2b']");
                    async.each(results, (result, callback) => {
                        const url = result.attribs["data-value"];
                        const parsedUrl = url.split("/");

                        const id = parsedUrl[parsedUrl.length-2];
                        const file = parsedUrl[parsedUrl.length-1];

                        const downloadPath = path.join(modelPath, model.id, id);
                        download(url, downloadPath, {filename: file}).then(() => {
                            const object = {};
                            object.id = id;
                            object.type = "obj";
                            object.files = [];

                            const ext = path.extname(file);
                            if (ext === ".zip") {
                                const zipPath = path.join(downloadPath, file);
                                extract(zipPath, {dir: downloadPath}, extractErr => {
                                    if (extractErr) {
                                        return callback(extractErr);
                                    }

                                    const files = fs.readdirSync(downloadPath);
                                    for (const value of files) {
                                        if (path.extname(value) === ".fbx") {
                                            object.type = "fbx";
                                            object.files.push({
                                                type: object.type,
                                                file: value
                                            });
                                            break;
                                        } else if (path.extname(value) === ".obj") {
                                            object.type = "obj";
                                            object.files.push({
                                                type: "obj",
                                                file: value
                                            });
                                        } else if (path.extname(value) === ".mtl") {
                                            object.files.push({
                                                type: "mtl",
                                                file: value
                                            });
                                        }
                                    }

                                    model.objects.push(object);
                                    // Remove zip file after unzip
                                    fs.unlink(zipPath, callback);
                                });
                            } else {
                                if (ext === ".fbx") {
                                    object.type = "fbx";
                                    object.files.push({
                                        type: "fbx",
                                        file: file
                                    });
                                } else if (ext === ".obj") {
                                    object.type = "obj";
                                    object.files.push({
                                        type: "obj",
                                        file: file
                                    });
                                }

                                model.objects.push(object);
                                callback();
                            }
                        }, downloadErr => {
                            callback(downloadErr);
                        });
                    }, error => {
                        if (error) {
                            return console.error(error);
                        }

                        if (model.objects.length !== 0) {
                            download(model.imgSrc, path.join(modelPath, model.id), {filename: "model.png"}).then(() => {
                                saveModelDataSync(projectId, model);
                                resolve(true);
                            });
                        } else {
                            resolve(false);
                        }
                    });
                }).catch(requestErr => {
                    reject(requestErr);
                });
            });
        }

        function install(projectId, model, callback) {
            const parsedModel = JSON.parse(model);

            installModel(projectId, parsedModel).then(success => {
                callback(null, success);
            }, error => {
                callback(error);
            });
        }

        function installSeedModel(projectId, callback) {
            // Predefined seed model ID
            const seedModelID = "aBbkSypwa62";

            // Check whether seed model is already installed or not
            if (isInstalled(projectId, seedModelID)) {
                return callback();
            }

            var seedModel = {
                id: seedModelID,
                title: "Tiger",
                installed: true,
                objects: [
                    {
                        id: "bBbkHyswa62",
                        type: "fbx",
                        files: [
                            {
                                type: "fbx",
                                file: "tiger_run.fbx"
                            }
                        ]
                    }
                ]
            };

            const modelPath = path.join(process.cwd(), "libs", "i3d", "models", seedModelID);
            const destPath = path.join(supportPath, projectId, "models", seedModelID);

            fs.copy(modelPath, destPath, err => {
                if (err) {
                    return callback(err);
                }

                saveModelDataSync(projectId, seedModel);
                callback();
            });
        }

        function getModelDataPath(projectId) {
            return path.join(process.cwd(), "projects", "support", projectId, "models", "models.json");
        }

        function getModelDataSync(projectId) {
            const dataPath = getModelDataPath(projectId);
            if (!fs.existsSync(dataPath)) {
                const model = [];

                fs.ensureFileSync(dataPath);
                fs.writeJsonSync(dataPath, model);
            }

            return fs.readJsonSync(dataPath);
        }

        function getModel(projectId, callback) {
            const models = getModelDataSync(projectId);
            callback(null, JSON.stringify(models));
        }

        function copyModel(projectId, basePath, modelId, callback) {
            const projectPath = path.join(process.cwd(), "projects", projectId);
            const modelsPath = path.join(process.cwd(), "projects", "support", projectId, "models");

            var sourcePath = path.join(modelsPath, modelId);
            var destPath = path.join(projectPath, basePath, "i3d", "models", modelId);

            fs.copy(sourcePath, destPath, err => {
                if (err) {
                    return callback(err);
                }

                callback();
            });
        }
 
        function copyLibrary(projectId, format, callback) {
            const projectPath = path.join(process.cwd(), "projects", projectId);

            const libraryPath = path.join(process.cwd(), "libs", "i3d", format);
            const destPath = path.join(projectPath, "i3d", "js");

            fs.copy(libraryPath, destPath, err => {
                if (err) {
                    return callback(err);
                }

                callback();
            });
        }

        domainManager.registerCommand(
            "interactiveDomain",
            "search",
            search,
            true,
            "Search 3D model data from poly",
            [
                {name: "projectId", type: "string"},
                {name: "name", type: "string"}
            ],
            [
                {name: "result", type: "boolean"}
            ]
        );

        domainManager.registerCommand(
            "interactiveDomain",
            "install",
            install,
            true,
            "Install 3D model data",
            [
                {name: "projectId", type: "string"},
                {name: "model", type: "string"}
            ],
            [
                {name: "result", type: "string"}
            ]
        );

        domainManager.registerCommand(
            "interactiveDomain",
            "installSeedModel",
            installSeedModel,
            true,
            "Install seed model data",
            [
                {name: "projectId", type: "string"}
            ],
            []
        );

        domainManager.registerCommand(
            "interactiveDomain",
            "getModel",
            getModel,
            true,
            "Get 3D model data from user folder",
            [
                {name: "projectId", type: "string"}
            ],
            [
                {name: "result", type: "string"}
            ]
        );

        domainManager.registerCommand(
            "interactiveDomain",
            "copyModel",
            copyModel,
            true,
            "Copy 3D model data to user folder ",
            [
                {name: "projectId", type: "string"},
                {name: "basePath", type: "string"},
                {name: "modelId", type: "string"}
            ],
            [
                {name: "result", type: "string"}
            ]
        );

        domainManager.registerCommand(
            "interactiveDomain",
            "copyLibrary",
            copyLibrary,
            true,
            "Copy necessary libraries to user folder ",
            [
                {name: "projectId", type: "string"},
                {name: "format", type: "string"},
            ],
            [
                {name: "result", type: "string"}
            ]
        );
    }

    exports.init = init;
}());