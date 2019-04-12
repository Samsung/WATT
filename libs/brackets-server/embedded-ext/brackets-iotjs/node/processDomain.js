(function () {
    "use strict";

    const exec = require("child_process").exec,
        path = require("path"),
        treekill = require("treekill");

    const DOMAIN_NAME = "brackets-iotjs";

    let child = null,
        domain = null;

    function cmdStartProcess(projectId, filePath, flags, cb) {
        if (child !== null) {
            treekill(child.pid);
        }

        const iotjs_root = process.env.IOT_JS_ROOT;
        const iotjs_bin = path.join(iotjs_root, "iotjs");
        const project_path = path.join(process.cwd(), "projects", projectId);
        const file_path = path.join(project_path, filePath);

        const command = iotjs_bin + " " + flags + " " + file_path;

        child = exec(command, { cwd: project_path });

        // Send data to the client
        const send = (data) => {
            domain.emitEvent(DOMAIN_NAME, "output", data);
        };

        child.stdout.on("data", send);
        child.stderr.on("data", send);

        child.on("exit", (code) => {
            cb(null, code);
        });

        child.on("error", (err) => {
            cb(err);
        });
    }

    function cmdStopProcess() {
        if (child !== null) {
            treekill(child.pid);
        }
    }

    function init(domainManager) {
        domain = domainManager;

        if (!domainManager.hasDomain(DOMAIN_NAME)) {
            domainManager.registerDomain(DOMAIN_NAME, {
                major: 0,
                minor: 0
            });
        }

        domainManager.registerCommand(
            DOMAIN_NAME,
            "startProcess",
            cmdStartProcess,
            true,
            "Starts the process",
            [
                {
                    name: "projectId",
                    type: "string"
                },
                {
                    name: "filePath",
                    type: "string"
                },
                {
                    name: "flags",
                    type: "string"
                }
            ]
        );

        domainManager.registerCommand(
            DOMAIN_NAME,
            "stopProcess",
            cmdStopProcess,
            false,
            "Stops the process if one is already started",
            []
        );

        domainManager.registerEvent(
            DOMAIN_NAME,
            "output",
            [
                {
                    name: "output",
                    type: "string"
                }
            ]
        );
    }

    exports.init = init;
}());
