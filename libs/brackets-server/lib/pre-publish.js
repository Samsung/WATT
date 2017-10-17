"use strict";

var fs      = require("fs"),
    glob    = require("glob"),
    path    = require("path");

var conts;
var logFile = "./install.log";
var exists  = fs.existsSync(logFile);

var opts = {
    cwd: path.join(__dirname, "..", "brackets-srv")
};

if (exists) {
    conts = fs.readFileSync(logFile, { encoding: "utf8" });
    fs.unlinkSync(logFile);
}

if (!conts) {
    glob("**/node_modules", opts, function (err, files) {
        if (err) {
            throw err;
        }

        if (files) {
            files.sort(function (a, b) {
                return  b.length - a.length;
            });

            files.forEach(function (file) {
                file = path.join(opts.cwd, file);
                fs.renameSync(file, file + "_");
                console.log("file: " + file + "_");
            });
        }
    });
}
