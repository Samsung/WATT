(function () {
    "use strict";

    var fs = require("fs"),
        swPrecache = require("sw-precache"),
        validate = require("web-app-manifest-validator"),
        WebpackPwaManifest = require("webpack-pwa-manifest");

    var _domainManager;

    function generateServiceWorker(id, list, projectPath, callback) {
        const swPath = `${projectPath}service-worker.js`;

        let selectedFiles = [];
        list.forEach(function(filename) {
            selectedFiles.push(`${projectPath}${filename}`);
        });

        swPrecache.write(swPath, {
            staticFileGlobs: selectedFiles,
            stripPrefix: projectPath,
            runtimeCaching: [{
                handler: "networkFirst",
                urlPattern: /$/,
            }],
        }, function(error) {
            callback(null, error);
        });
    }

    function validateManifest(id, files, callback) {
        let mod = files;
        let manifest = require(mod);
        const result = validate(manifest);
        delete require.cache[require.resolve(mod)];
        callback(null, result);
    }

    function generateManifest(id, projectName, projectPath, callback) {
        const options = {
            "name": projectName,
            "short_name": projectName,
            "description": "A Progressive Web App powered by WATT."
        };
        let _webpackPwaManifest = new WebpackPwaManifest(options);
        let result = _webpackPwaManifest.apply();
        fs.writeFile(projectPath + _webpackPwaManifest.config.filename, result, function(err) {
            if (err) {
                callback(null, false);
            }
        });
        callback(null, true);
    }

    function enablePush(id, projectPath, callback) {
        const templatePath = `${process.cwd()}/libs/brackets-server/embedded-ext/pwe/template/`;
        fs.readdir(templatePath, function(err, files) {
            files.map(function(file) {
                if (file) {
                    var data = fs.readFileSync(`${templatePath}${file}`, "utf-8");
                    var result = fs.writeFileSync(`${projectPath}${file}`, data);
                    callback(null, result);
                }
            });
        });
    }

    function init(domainManager) {
        _domainManager = domainManager;
        if (!_domainManager.hasDomain("pwe")) {
            _domainManager.registerDomain("pwe", {major: 0, minor: 1});
        }

        _domainManager.registerCommand(
            "pwe",
            "generate",
            generateManifest,
            true,
            "generate a new manifest file",
            [
                {name: "id", type: "string"},
                {name: "projectName", type: "string"},
                {name: "projectPath", type: "string"},
            ],
            [
                {name: "data", type: "string"},
            ]
        );

        _domainManager.registerCommand(
            "pwe",
            "validate",
            validateManifest,
            true,
            "validate existing manifest file",
            [
                {name: "id", type: "string"},
                {name: "files", type: "string"},
            ],
            [
                {name: "data", type: "string"},
            ]
        );

        _domainManager.registerCommand(
            "pwe",
            "enablePush",
            enablePush,
            true,
            "enable push event",
            [
                {name: "id", type: "string"},
                {name: "projectPath", type: "string"},
            ],
            [
                {name: "data", type: "string"},
            ]
        );

        _domainManager.registerCommand(
            "pwe",
            "generateServiceWorker",
            generateServiceWorker,
            true,
            "Generate Service Worker",
            [
                {name: "id", type: "string"},
                {name: "projectPath", type: "string"},
                {name: "fileList", type: "string"},
            ],
            [
                {name: "data", type: "string"},
            ]
        );

    }

    exports.init = init;
}());
