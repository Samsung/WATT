/* globals describe: false, it: false, Promise */
"use strict";

process.env.NODE_ENV = "test";

const assert = require("chai").assert;
const cwd = require("cwd");
const expect = require("chai").expect;
const fc = require("file-compare");
const fs = require("fs");
const pathNode = require("path");
const project = require("../node/CompileDomain");
// TODO: consider replacing it with a proper fixture library
const tmp = require("tmp");

// TODO: consider moving makefile contents to a separate file
const makefileNormal =
`# TODO: add error when mixing C/CC/CPP files in one project
CC=emcc
CXX=emcc
CCFLAGS=-s WASM=1
CCFLAGS_OPT=
SOURCES=calculator.cpp
OBJECTS_CC=$(SOURCES:.cc=.o)
OBJECTS_CPP=$(SOURCES:.cpp=.o)
OBJECTS=$(OBJECTS_CC:.c=.o)
TARGET=main.html

all: $(TARGET)

$(TARGET): $(OBJECTS)
    $(CC) -o $@ $^ $(CCFLAGS) $(CCFLAGS_OPT)

%.o: %.cc %.h
    $(CC) -c $< -o $@

%.o: %.c %.h
    $(CC) -c $< -o $@

%.o: %.cc
    $(CC) -c $< -o $@

%.o: %.c
    $(CC) -c $< -o $@

clean:
    rm -f $(shell find . -name "*.o") *.wasm *.wast *.js $(TARGET)
`;

function prepareMakefile(makefileContents) {
    return new Promise((resolve, reject) => {
        tmp.dir({"unsafeCleanup": true}, (error, dirPath, cleanupCallback) => {
            if (error) {
                reject(error);
                return;
            }
            fs.writeFile(pathNode.join(dirPath, "makefile"), makefileContents, (error) => {
                if (error) {
                    cleanupCallback();
                    reject(error);
                    return;
                }
                resolve([dirPath, cleanupCallback]);
            });
        });
    });
}

const cleanupDirFunc = function(cleanupFun, path) {
    return new Promise(resolve => {
        cleanupFun(function() {
            resolve("deleted");
        });
    });
};


describe("'project' extension", () => {
    describe(".wgt packaging", () => {
        it("should be able to check packaging availability", (done) => {
            project.checkBuildWGT((result) => {
                expect(result).to.equal(true);
                done();
            });
        });

        //getTempDir test
        it("should be able to check geting temporary directory", async () => {
            const result = await project.getTempDir();
            expect(result.tmpDirPath).to.be.a("string").that.is.not.empty;
            expect(fs.existsSync(result.tmpDirPath)).to.be.true;
            expect(result.tmpDirCleanup).to.be.a("function");
            const resultCleanup = await cleanupDirFunc(result.tmpDirCleanup);
            expect(resultCleanup).to.be.a("string");
            expect(resultCleanup).to.equal("deleted");
            expect(fs.existsSync(result.tmpDirPath)).to.be.false;
        });

        //patchIndexFile test
        //TODO: change to async - await approach after node upgrade to 7.6 or later
        it("should be able to replace local values to provided ones", () => {
            const sampleFile = pathNode.join(cwd(), "libs/brackets-server/embedded-ext/project/test/sample/replace.html");
            const sampleFileTmp = sampleFile + ".tmp";
            const sampleFileRef = sampleFile + ".ok";

            fs.writeFileSync(sampleFileTmp, fs.readFileSync(sampleFile));
            const replacementList = [];
            replacementList.push({
                originalPath: "./wasm/unreal.wasm",
                devicePath: "file:///home/owner/share/tizen-unrealjs/latest/unreal.wasm"
            });
            replacementList.push({
                originalPath: "./js/unreal.js",
                devicePath: "file:///home/owner/share/tizen-unrealjs/latest/unreal.js"
            });
            const patchPromise = project.patchIndexFile(sampleFileTmp, replacementList);
            expect (patchPromise).to.be.a("promise");
            return patchPromise.then ( (result) => {
                fc.compare(sampleFileRef, sampleFileTmp, (copied, err) => {
                    expect(copied).to.be.true;
                });
                fs.unlinkSync(sampleFileTmp);
            });
        });
    });
    describe("build files management", () => {
        it("should get build files", (done) => {
            prepareMakefile(makefileNormal).then(([dirPath, cleanupCallback]) => {
                // FIXME: getBuiltFiles fails if we pass false for makefileInProject
                // because it expects "SOURCES=..." and default makefile has "SOURCES =..."
                project.getBuiltFiles(null, true, dirPath, (error, resultJSON) => {
                    /* jshint expr: true */
                    // FIXME: error is always null
                    expect(error).to.be.null;
                    const result = JSON.parse(resultJSON);
                    // FIXME: result.error should be null, not string "null"
                    expect(result.error).to.equal("null");
                    expect(result.stdout).to.equal("SOURCES=calculator.cpp\n");
                    expect(result.stderr).to.equal("");
                    cleanupCallback();
                    done();
                });
            }).catch((error) => {
                assert.fail("Test setup failed or uncaught exception: " + error);
            });
        });
        it("should update build files", (done) => {
            prepareMakefile(makefileNormal).then(([dirPath, cleanupCallback]) => {
                const newFiles = "main.cpp library.cpp";
                project.updateBuiltFiles(null, true, newFiles, dirPath, (error, resultJSON) => {
                    /* jshint expr: true */
                    // FIXME: error is always null
                    expect(error).to.be.null;
                    const result = JSON.parse(resultJSON);
                    // FIXME: result.error should be null, not string "null"
                    expect(result.error).to.equal("null");
                    expect(result.stdout).to.equal("");
                    expect(result.stderr).to.equal("");
                    project.getBuiltFiles(null, true, dirPath, (error, resultJSON) => {
                        // FIXME: error is always null
                        expect(error).to.be.null;
                        const result = JSON.parse(resultJSON);
                        // FIXME: result.error should be null, not string "null"
                        expect(result.error).to.equal("null");
                        expect(result.stdout).to.equal("SOURCES=" + newFiles + "\n");
                        expect(result.stderr).to.equal("");
                        cleanupCallback();
                        done();
                    });
                });
            }).catch((error) => {
                assert.fail("Test setup failed or uncaught exception: " + error);
            });
        });
    });
});
