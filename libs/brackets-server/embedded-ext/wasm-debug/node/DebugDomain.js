(function () {
    "use strict";

    const exec = require("child_process").exec,
        path = require("path");

    const DEBUG_DOMAIN = "debugDomain";

    let _domainManager;

    function init(domainManager) {
        _domainManager = domainManager;
        if (!_domainManager.hasDomain(DEBUG_DOMAIN)) {
            _domainManager.registerDomain(DEBUG_DOMAIN, {major: 0, minor: 1});
        }

        function handleWasm2Wast(projectId, src, callback) {
            const sourcePath = path.join(process.cwd(), "projects", projectId);
            const source = path.join(sourcePath, src);
            const output = path.join(path.dirname(source), path.basename(src, ".wasm") + ".wast");

            const wabtPath = path.join(process.cwd(), "tools", "wabt");
            const wasm2wastBin = path.join(wabtPath, "bin", "wasm2wast");

            const command = wasm2wastBin + " " + source + " -o " + output;

            let child = exec(command, { cwd: sourcePath });

            child.on("exit", () => {
                callback(null);
            });

            child.on("error", (err) => {
                callback(err);
            });
        }

        _domainManager.registerCommand(
            DEBUG_DOMAIN,
            "wasm2wast",
            handleWasm2Wast,
            true,
            "Translate wasm to wast",
            [
                {name: "projectId", type: "string"},
                {name: "src", type: "string"}
            ],
            []
        );
    }

    exports.init = init;
}());
