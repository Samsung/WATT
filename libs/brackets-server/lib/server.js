/*jshint -W086 */

"use strict";

// NOTE: Brackets doesn't fully support browsers yet and we need some workarounds. Workarounds will be marked with "HACK:" label.

var http        = require("http"),
    https       = require("https"),
    path        = require("path"),
    send        = require("send"),
    socket      = require("socket.io"),
    urlUtil     = require("url"),
    util        = require("util");

var domains     = require("./domains/socket"),
    files       = require("./files");

var brckDist    = {root: path.join(__dirname, "..", "brackets-dist")},
    defaultPort = 6800,
    zipped      = { ".js": "application/javascript", ".css": "text/css"};

require("./shim");

function removeTrailingSlash(path) {
    return path[path.length - 1] === "/" ? path.substr(0, path.length - 1) : path;
}

function createHttpServer(inst, port) {
    inst.httpServer = http.createServer(function (req, res) {
        if (req.url === "/") {
            res.writeHead(302, {Location: inst.httpRoot + "/"});
            res.end();
        } else {
            res.writeHead(304);
            res.end("Not found");
        }
    });
    inst.io = socket(inst.httpServer);
    inst.httpServer.listen(port);
    console.log(util.format("\n  listening on port %d\n", port));
}

function attachStatic(inst) {
    var root    = inst.httpRoot,
        srv     = inst.httpServer;

    var evs     = srv.listeners("request").slice(0),
        extDir  = { root: path.join(inst.supportDir, "extensions")} ;

    srv.removeAllListeners("request");
    srv.on("request", function(req, res) {
        if (req.url.startsWith(root)) {
            var url = req.url.substr(root.length);

            if (url === "") {
                res.writeHead(301, {Location: inst.httpRoot + "/"});
                res.end();
                return;
            }

            if (url === "/") {
                url = "/index.html";
            }

            if (url.startsWith("/proxy/")) {
                var reqUrl      = decodeURIComponent(url.substr("/proxy/".length));
                var options     = urlUtil.parse(reqUrl);
                var httpClient  = options.protocol === "http" ? http : https;

                delete options.protocol;
                options.method = "GET";

                req.pause();
                var connector = httpClient.request(options, function(_res) {
                    _res.pause();
                    res.writeHead(_res.statusCode, _res.headers);
                    _res.pipe(res);
                    _res.resume();
                });
                req.pipe(connector);
                req.resume();
                return;
            }

            var cntType = zipped[path.extname(url)];
            if (cntType) {
                send(req, url + ".gz", brckDist)
                    .on("headers", function (_res) {
                        _res.setHeader("Content-Encoding", "gzip");
                        _res.setHeader("Content-Type", cntType);
                    })
                    .pipe(res);
                return;
            }

            send(req, url, brckDist).pipe(res);
        } else if (req.url.startsWith("/support/extensions/")) {
            try {
                return send(req, req.url.substr("/support/extensions".length), extDir).pipe(res);
            } catch (e) {
                res.writeHead(500, {
                    "Content-Length": e.message.length,
                    "Content-Type": "text/plain"
                });
                res.end(e.message);
            }
        } else {
            for (var i = 0; i < evs.length; i++) {
                evs[i].call(srv, req, res);
            }
        }
    });
}

function Server(srv, wss, opts) {
    if (!(this instanceof Server)) {
        return new Server(srv, wss, opts);
    }

    opts = opts || {};

    this.httpRoot = removeTrailingSlash(opts.httpRoot || "/brackets");
    this.supportDir = removeTrailingSlash(opts.supportDir || path.resolve("./brackets"));
    this.projectsDir = removeTrailingSlash(opts.projectsDir || path.resolve("./projects"));
    this.samplesDir = removeTrailingSlash(opts.samplesDir || path.join(brckDist.root, "samples"));
    this.allowUserDomains = opts.allowUserDomains || false;

    this.defaultExtensions = path.join(brckDist.root, "extensions");
    this.fileSystem = require("./file-sys/native");
    this.httpServer = srv;
    this.io = wss;

    var that = this;
    this.fileSystem.mkdir(this.projectsDir, function (err) {
        if (err && err.code !== "EEXIST") {
            throw err;
        }

        // Attach file system methods to socket.io.
        files.init(that);

        // Attach Brackets domians.
        domains.init(that);
    });
}

module.exports = Server;
