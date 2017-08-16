"use strict";

var ConnectionManager = require("./ConnectionManager"),
    DomainManager     = require("./DomainManager");

function init(srv) {
    var root = srv.httpRoot + "-ext";

    var namespace = srv.io.of(root);

    // Check new listener whether it is existed or not
    namespace.once("newListener", function(event, listener) {
        var listeners = namespace.listeners(event);
        if (listeners.indexOf(listener) !== -1) {
            namespace.removeListener(event, listener);
        }
    });

    namespace.on("connection", ConnectionManager.createConnection);

    DomainManager.httpRoot = srv.httpRoot;
    DomainManager.supportDir = srv.supportDir;
    DomainManager.projectsDir = srv.projectsDir;
    DomainManager.samplesDir = srv.samplesDir;
    DomainManager.allowUserDomains = srv.allowUserDomains;
    DomainManager.loadDomainModulesFromPaths(["./BaseDomain"]);
}

exports.init = init;
