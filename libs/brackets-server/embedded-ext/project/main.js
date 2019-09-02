define(function (require, exports, module) {
    "use strict";

    const PreferencesManager = brackets.getModule("preferences/PreferencesManager");
    const type = PreferencesManager.getViewState("projectType");
    if (type === "iotjs") {
        return;
    }

    var Commands                    = brackets.getModule("command/Commands"),
        CommandManager              = brackets.getModule("command/CommandManager"),
        DefaultDialogs              = brackets.getModule("widgets/DefaultDialogs"),
        Dialogs                     = brackets.getModule("widgets/Dialogs"),
        ExtensionUtils              = brackets.getModule("utils/ExtensionUtils"),
        FileSystem                  = brackets.getModule("filesystem/FileSystem"),
        FileUtils                   = brackets.getModule("file/FileUtils"),
        Menus                       = brackets.getModule("command/Menus"),
        NodeDomain                  = brackets.getModule("utils/NodeDomain"),
        ProjectManager              = brackets.getModule("project/ProjectManager"),
        Strings                     = brackets.getModule("strings");

    var APIPickingDialogTemplate    = require("text!htmlContent/API-Picking-Dialog.html"),
        CompileFileDialogTemplate   = require("text!htmlContent/Compile-Dialog.html"),
        CompileOptionsTemplate      = require("text!htmlContent/SelectCompileOptions-Dialog.html"),
        ExtensionStrings            = require("strings"),
        ReplaceResourcesTemplate    = require("text!htmlContent/resourceReplacementDialog.html");

    var _domainPath = ExtensionUtils.getModulePath(module, "node/CompileDomain"),
        _nodeDomain = new NodeDomain("compileEmscripten", _domainPath);

    var _typeTable;
    ExtensionUtils.loadFile(module, "data/idlType.json")
        .done(function(data) {
            _typeTable = data;
        });

    ProjectManager.on("projectOpen", function () {
        // if this is project with config.xml
        const file = FileSystem.getFileForPath(ProjectManager.getProjectRoot().fullPath + "config.xml");
        file.exists(function (err, exists) {
            if (err) {
                console.log("Error opening config.xml: " + err);
            }
            else if (exists) {
                FileUtils.readAsText(file).done((text, readTimestamp) => {
                    // try to extract "content" field describing main project file
                    const parser = new DOMParser();
                    const xmlDoc = parser.parseFromString(text, "text/xml");
                    const elements = xmlDoc.getElementsByTagNameNS("http://www.w3.org/ns/widgets", "content");
                    if (elements.length > 0) {
                        const content = elements[0].attributes["src"].nodeValue;
                        if (!!content) {
                            const htmlPath = ProjectManager.getProjectRoot().fullPath + content;
                            // open main project file
                            CommandManager.execute(Commands.FILE_OPEN, { fullPath:  htmlPath});
                        }
                    }
                })
            }
        });
    });

    let _configuration;

    function loadConfiguration() {
        return new Promise((resolve, reject) => {
            if (_configuration !== undefined) {
                resolve(_configuration);
            } else {
                ExtensionUtils.loadFile(module, "configuration.json").done(
                    configuration => {
                        _configuration = configuration;
                        resolve(configuration);
                    }
                ).fail(reject);
            }
        });
    }

    var PROJECT_MENU = "project-menu";
    var PROJECT_API_PICKING = "project.API-Picking";
    var PROJECT_COMPILE_FILE = "project.compile";
    var PROJECT_SELECT_FILES = "project.selectFiles";
    var PROJECT_SELECT_OPTIONS = "project.selectOptions";
    var PROJECT_COMPILE_PROJECT = "project.compileProject";
    var PROJECT_CLEAN_PROJECT = "project.cleanProject";
    var PROJECT_PACK_WGT = "project.packWGT";
    var PROJECT_PACK_CRX = "project.packCRX";
    var PROJECT_INSTALL_WGT = "project.installWGT";
    var PROJECT_BUILD_UNITY = "project.buildUnity";
    var PROJECT_REPLACE_RESOURCES = "project.replaceResources";

    var _documentsDir = brackets.app.getUserDocumentsDirectory();

    function convertUnixPathToWindowsPath(path) {
        if (brackets.platform === "win") {
            path = path.replace(new RegExp(/\//g), "\\");
        }
        return path;
    }

    function convertWindowsPathToUnixPath(path) {
        return FileUtils.convertWindowsPathToUnixPath(path);
    }

    function showProgressDialog(title) {
        return Dialogs.showModalDialog(
            DefaultDialogs.DIALOG_ID_INFO,
            title,
            require("text!htmlContent/Loading-Dialog.html"),
            []
        );
    }

    function filterMakefileFile(file) {
        return file._name.toLowerCase() === "makefile";
    }

    function isSourceFile(file) {
        var fileName = file._name.toLowerCase();
        var allowedExtensions = [".cpp", ".c", ".cc", ".h"];
        return allowedExtensions.some(function (element/*, index, array*/) {
            return fileName.endsWith(element);
        });
    }

    function handleSelectFiles() {
        var projectManager = brackets.test.ProjectManager;
        var makefileInProject = 0;
        var projectId = PreferencesManager.getViewState("projectId");
        var currentlyCompiledFiles = [];
        var dialogText = "Select files for building:</br></br>" +
            "<select multiple=\'multiple\' id=\'my-select\' style=\'width: 550px; height: 150px; background: white;\'>";

        projectManager.getAllFiles(true).then(function(files) {
            files.forEach(function(file) {
                if (file._name.toLowerCase() === "makefile") {
                    makefileInProject = 1;
                }
            });

            // first of all, let's get list of files already included into makefile
            _nodeDomain.exec("getCompiledFiles", projectId, makefileInProject)
                .done(function(data) {
                    var commandOutout = JSON.parse(data);
                    currentlyCompiledFiles = commandOutout.stdout.substr("SOURCES=".length);
                    // remove trailing new line sign and split to separate files
                    currentlyCompiledFiles = currentlyCompiledFiles.substr(0, currentlyCompiledFiles.length - 1).split(" ");

                    // files already included into makefile should be inially selected
                    files.forEach(function(file) {
                        var textToAdd = "";
                        if (currentlyCompiledFiles.indexOf(file._path.substr(10)) !== -1) {
                            textToAdd = "selected";
                        }

                        // only source code files can should be added to the list
                        if (isSourceFile(file)) {
                            dialogText += "<option value='" + file._path.substr(10) + "' " + textToAdd + ">" + file._path.substr(10) + "</option>";
                        }
                    });
                    dialogText += "</select></br>NOTE: No changes will be applied when no files are selected. Hold Ctrl to select/deselect files.";

                    // finally, show dialog with select picker
                    var dialog = Dialogs.showModalDialog(
                        DefaultDialogs.DIALOG_ID_INFO,
                        ExtensionStrings.MENU_TITLE_FILE_SELECT,
                        dialogText
                    );

                    var $dlg = dialog.getElement();
                    var $select = $("#my-select", $dlg);

                    dialog.done(function (/*buttonId*/) {
                        var readyText = $select.val() ? $select.val().join(" ") : "";

                        _nodeDomain.exec("updateCompiledFiles", projectId, makefileInProject, readyText)
                            .done(function(/*data*/) {
                                Dialogs.showModalDialog(
                                    DefaultDialogs.DIALOG_ID_INFO,
                                    ExtensionStrings.COMPILATION_SUCCESS,
                                    "Build file list succesfully updated!"
                                );
                                // Needed for changes to be visible in makefile
                                projectManager.refreshFileTree();
                            });
                    });
                });
        });
    }

    function makeErrorMessage(msg) {
        return "<div class=compile-err-msg>" + msg + "</div>";
    }

    function handleCleanProject() {
        var projectManager = brackets.test.ProjectManager;
        var makefileInProject = 0;
        projectManager.getAllFiles(filterMakefileFile).then(function(makefileFile) {
            makefileInProject = makefileFile.length;

            var projectId = PreferencesManager.getViewState("projectId");
            var infoDialog = showProgressDialog(ExtensionStrings.COMPILING_DIALOG_TITLE);

            _nodeDomain.exec("cleanWithMakefile", projectId, makefileInProject)
                .done(function(data) {
                    infoDialog.close();
                    var compileOutput = JSON.parse(data);
                    if (compileOutput.error !== "null") {
                        Dialogs.showModalDialog(
                            DefaultDialogs.DIALOG_ID_INFO,
                            ExtensionStrings.COMPILATION_FAILED,
                            "Cleaning failed due to following error:<br><br>" + makeErrorMessage(compileOutput.error)
                        );
                    } else {
                        Dialogs.showModalDialog(
                            DefaultDialogs.DIALOG_ID_INFO,
                            ExtensionStrings.COMPILATION_SUCCESS,
                            "Cleaning finished successfully!"
                        );
                    }
                    FileSystem.clearAllCaches();
                }).fail(function(err) {
                    infoDialog.close();
                    Dialogs.showModalDialog(
                        DefaultDialogs.DIALOG_ID_INFO,
                        ExtensionStrings.COMPILATION_FAILED,
                        "Cleaning failed! <br><br>" + makeErrorMessage(err)
                    );
                });
        });
    }

    function handleCompileProject() {
        var projectManager = brackets.test.ProjectManager;
        var makefileInProject = 0;
        projectManager.getAllFiles(filterMakefileFile).then(function(makefileFile) {
            makefileInProject = makefileFile.length;

            var projectId = PreferencesManager.getViewState("projectId");
            var infoDialog = showProgressDialog(ExtensionStrings.COMPILING_DIALOG_TITLE);

            _nodeDomain.exec("compileWithMakefile", projectId, makefileInProject)
                .done(function(data) {
                    infoDialog.close();
                    var compileOutput = JSON.parse(data);
                    if (compileOutput.error !== "null") {
                        Dialogs.showModalDialog(
                            DefaultDialogs.DIALOG_ID_INFO,
                            ExtensionStrings.COMPILATION_FAILED,
                            "Compilation failed due to following error:<br><br>" + makeErrorMessage(compileOutput.error)
                        );
                    } else {
                        Dialogs.showModalDialog(
                            DefaultDialogs.DIALOG_ID_INFO,
                            ExtensionStrings.COMPILATION_SUCCESS,
                            "Compilation finished successfully!"
                        );
                    }
                    FileSystem.clearAllCaches();
                }).fail(function(err) {
                    infoDialog.close();
                    Dialogs.showModalDialog(
                        DefaultDialogs.DIALOG_ID_INFO,
                        ExtensionStrings.COMPILATION_FAILED,
                        "Compilation failed! <br><br>" + makeErrorMessage(err)
                    );
                });
        });
    }

    function handleCompileFile() {
        var $changeFileBtn,
            $compileFileInput,
            $compileOptionInput,
            $compileTypeSelect,
            $dlg,
            $OkBtn,
            projectFolder = _documentsDir;

        var context = {
            Strings: Strings,
            ExtensionStrings: ExtensionStrings
        };

        var getSelectedCompileType = function () {
            var index = $compileTypeSelect[0].selectedIndex;
            var $el = $compileTypeSelect.children("option").eq(index);
            var compileType = ($el && $el.length === 1) ? $el[0].innerText || "" : "";
            return compileType;
        };

        var dialog = Dialogs.showModalDialogUsingTemplate(Mustache.render(CompileFileDialogTemplate, context));

        dialog.done(function (buttonId) {
            if (buttonId === "ok") {
                var compileFile = convertWindowsPathToUnixPath($compileFileInput.val()),
                    compileOption = $compileOptionInput.val(),
                    compileType = getSelectedCompileType();

                var projectId = PreferencesManager.getViewState("projectId");

                var infoDialog = showProgressDialog(ExtensionStrings.COMPILING_DIALOG_TITLE);

                _nodeDomain.exec("compile", projectId, compileFile, compileType, compileOption)
                    .done(function(data) {
                        infoDialog.close();
                        var compileOutput = JSON.parse(data);
                        if (compileOutput.error !== "null") {
                            Dialogs.showModalDialog(
                                DefaultDialogs.DIALOG_ID_INFO,
                                ExtensionStrings.COMPILATION_FAILED,
                                "Compilation failed due to following error:<br><br>" + makeErrorMessage(compileOutput.error)
                            );
                        } else {
                            Dialogs.showModalDialog(
                                DefaultDialogs.DIALOG_ID_INFO,
                                ExtensionStrings.COMPILATION_SUCCESS,
                                "Compilation finished successfully!"
                            );
                        }
                        FileSystem.clearAllCaches();
                    }).fail(function(err) {
                        infoDialog.close();
                        Dialogs.showModalDialog(
                            DefaultDialogs.DIALOG_ID_INFO,
                            ExtensionStrings.COMPILATION_FAILED,
                            "Compilation failed! <br><br>" + makeErrorMessage(err)
                        );
                    });

            }
        });

        $dlg = dialog.getElement();
        $OkBtn = $dlg.find(".dialog-button[data-button-id='ok']");
        $changeFileBtn = $("#change-file", $dlg);
        $compileFileInput = $("#compile-file", $dlg);
        $compileTypeSelect = $("#compile-type-option", $dlg);
        $compileOptionInput = $("#compile-option", $dlg);

        $changeFileBtn.click(function (e) {
            FileSystem.showOpenDialog(false, false, Strings.OPEN_FILE, projectFolder, null,
                function (error, files) {
                    if (!error && files && files.length > 0 && files[0].length > 0) {
                        $compileFileInput.val(convertUnixPathToWindowsPath(files[0]));
                    }
                });

            e.preventDefault();
            e.stopPropagation();
        });

    }

    // These values are not saved to the DB, so they will be lost between runs.
    const replacementValues = new Map();
    replacementValues.set("replace_wasm_enabled", false);
    replacementValues.set("replace_wasm_original_path", "./wasm/unreal.wasm");
    replacementValues.set("replace_wasm_devices_path", "file:///home/owner/share/tizen-unrealjs/latest/unreal.wasm");
    replacementValues.set("replace_js_enabled", false);
    replacementValues.set("replace_js_original_path", "./js/unreal.js");
    replacementValues.set("replace_js_devices_path", "file:///home/owner/share/tizen-unrealjs/latest/unreal.js");
    replacementValues.set("replace_symbols_enabled", false);
    replacementValues.set("replace_symbols_original_path", "./js/unreal.js.symbols");
    replacementValues.set("replace_symbols_devices_path", "file:///home/owner/share/tizen-unrealjs/latest/unreal.js.symbols");

    function handleReplaceResources() {
        const fields = [
            {
                "id": "replace_wasm_enabled",
                "description": ExtensionStrings.DIALOG_USE_DEVICES_WASM_LABEL,
                "type": "checkbox"
            },
            {
                "id": "replace_wasm_original_path",
                "description": ExtensionStrings.DIALOG_WASM_ORIG_PATH_LABEL,
                "type": "text"
            },
            {
                "id": "replace_wasm_devices_path",
                "description": ExtensionStrings.DIALOG_WASM_DEVICE_PATH_LABEL,
                "type": "text"
            },
            {
                "id": "replace_js_enabled",
                "description": ExtensionStrings.DIALOG_USE_DEVICES_JS_LABEL,
                "type": "checkbox"
            },
            {
                "id": "replace_js_original_path",
                "description": ExtensionStrings.DIALOG_JS_ORIG_PATH_LABEL,
                "type": "text"
            },
            {
                "id": "replace_js_devices_path",
                "description": ExtensionStrings.DIALOG_JS_DEVICE_PATH_LABEL,
                "type": "text"
            },
            {
                "id": "replace_symbols_enabled",
                "description": ExtensionStrings.DIALOG_USE_DEVICES_SYMBOLS_LABEL,
                "type": "checkbox"
            },
            {
                "id": "replace_symbols_original_path",
                "description": ExtensionStrings.DIALOG_SYMBOLS_ORIG_PATH_LABEL,
                "type": "text"
            },
            {
                "id": "replace_symbols_devices_path",
                "description": ExtensionStrings.DIALOG_SYMBOLS_DEVICE_PATH_LABEL,
                "type": "text"
            },
        ];

        // Write current values in a way which can be rendered by html template.
        for (const field of fields) {
            if (field["type"] === "checkbox") {
                field["value"] = (replacementValues.get(field["id"]) ? "checked=\"checked\"" : "");
            } else {
                field["value"] = "value=\"" + replacementValues.get(field["id"]) + "\"";
            }
        }

        const context = {
            "fields": fields,
            "Strings": Strings,
            "ExtensionStrings": ExtensionStrings
        };

        const dialog = Dialogs.showModalDialogUsingTemplate(Mustache.render(ReplaceResourcesTemplate, context));
        const $dlg = dialog.getElement();

        // Read values from the popup.
        dialog.done((buttonId) => {
            if (buttonId === "ok") {
                for (const field of fields) {
                    const $element = $("#"+field.id, $dlg);
                    if (field["type"] === "checkbox") {
                        replacementValues.set(field.id, $element.is(":checked"));
                    } else {
                        replacementValues.set(field.id, $element.val());
                    }
                }
            }
        });
    }

    function handlePackWGT() {
        console.log("handlePackWGT");
        const projectId = PreferencesManager.getViewState("projectId");
        const loadingDialog = showProgressDialog(ExtensionStrings.PACKAGING_DIALOG_TITLE);
        const replacementList = [];
        if (replacementValues.get("replace_wasm_enabled")) {
            replacementList.push({
                "originalPath": replacementValues.get("replace_wasm_original_path"),
                "devicePath": replacementValues.get("replace_wasm_devices_path")
            });
        }
        if (replacementValues.get("replace_js_enabled")) {
            replacementList.push({
                "originalPath": replacementValues.get("replace_js_original_path"),
                "devicePath": replacementValues.get("replace_js_devices_path")
            });
        }
        if (replacementValues.get("replace_symbols_enabled")) {
            replacementList.push({
                "originalPath": replacementValues.get("replace_symbols_original_path"),
                "devicePath": replacementValues.get("replace_symbols_devices_path")
            });
        }
        _nodeDomain.exec("packWGT", projectId, JSON.stringify(replacementList)).done(function() {
            loadingDialog.close();
            Dialogs.showModalDialog(
                DefaultDialogs.DIALOG_ID_OK,
                ExtensionStrings.PACKING_SUCCESS,
                "Package has been successfully built"
            ).done(() => {
                ProjectManager.refreshFileTree();  // show .wgt file
            });
        }).fail((error) => {
            loadingDialog.close();
            const result = JSON.parse(error);
            Dialogs.showModalDialog(
                DefaultDialogs.DIALOG_ID_ERROR,
                ExtensionStrings.PACKING_FAILURE,
                `Couldn't build WGT package: "${result.message}", details: "${JSON.stringify(result.details)}"`
            );
        });
    }

    function handlePackCRX() {
        const projectId = PreferencesManager.getViewState("projectId");
        const projectName = PreferencesManager.getViewState("projectName");

        const loadingDialog = showProgressDialog(ExtensionStrings.PACKAGING_DIALOG_TITLE);

        _nodeDomain.exec("packCRX", projectId, projectName).done((value) => {
            loadingDialog.close();

            Dialogs.showModalDialog(
                DefaultDialogs.DIALOG_ID_OK,
                ExtensionStrings.INSTALLATION_SUCCESS,
                "Install Success"
            ).done(() => {
                ProjectManager.refreshFileTree();  // show .crx file
            });
        }).fail((err) => {
            loadingDialog.close();

            Dialogs.showModalDialog(
                DefaultDialogs.DIALOG_ID_ERROR,
                ExtensionStrings.INSTALLATION_FAILURE,
                "Install Fail"
            );
        });
    }

    function handleInstallWGT() {
        const projectId = PreferencesManager.getViewState("projectId");
        const projectName = PreferencesManager.getViewState("projectName");

        FileSystem.resolve("/" + projectName + ".wgt", (Found) => {
            if (Found) {
                _nodeDomain.exec("installWGT", projectId).done(() => {
                    Dialogs.showModalDialog(
                        DefaultDialogs.DIALOG_ID_OK,
                        ExtensionStrings.INSTALLATION_SUCCESS,
                        "Install Success"
                    );
                }).fail((err) => {
                    Dialogs.showModalDialog(
                        DefaultDialogs.DIALOG_ID_ERROR,
                        ExtensionStrings.INSTALLATION_FAILURE,
                        "Install Fail"
                    );
                });
            } else {
                Dialogs.showModalDialog(
                    DefaultDialogs.DIALOG_ID_ERROR,
                    ExtensionStrings.INSTALLATION_FAILURE,
                    "wgt file not exist. After Build WGT Package and try to install."
                );
            }
        });
    }

    function handleBuildUnity() {
        const projectId = PreferencesManager.getViewState("projectId");

        const infoDialog = showProgressDialog(ExtensionStrings.COMPILING_DIALOG_TITLE);

        _nodeDomain.exec("buildUnity", projectId).done(function() {
            infoDialog.close();
            ProjectManager.refreshFileTree();
        }).fail(() => {
            infoDialog.close();
            ProjectManager.refreshFileTree();
            Dialogs.showModalDialog(
                DefaultDialogs.DIALOG_ID_ERROR,
                ExtensionStrings.MENU_TITLE_BUILD_UNITY,
                ExtensionStrings.COMPILATION_FAILED
            );
        });
    }

    function toEmccOptionByValue(select) {
        return "-" + select.val();
    }

    function toEmccOptionByValueS(name) {
        return function(select) {
            return "-s " + name + "=" + select.val();
        };
    }

    function toEmccOptionByValueSConvert(name, conversion) {
        return function(select) {
            return "-s " + name + "=" + conversion(select.val());
        };
    }

    function toEmccOptionBool(name) {
        return function(checkbox) {
            return "--" + name + " " + (checkbox.is(":checked") ? "1" : "0");
        };
    }

    function toEmccOptionBoolS(name) {
        return function(checkbox) {
            return "-s " + name + "=" + (checkbox.is(":checked") ? "1" : "0");
        };
    }

    function renderOption(option, overrideValue) {
        let currentValue = overrideValue ? overrideValue : option.default;
        currentValue = (currentValue === true) ? "1" : currentValue;
        let optionString = "";
        switch (option.type) {
        case "select":
            optionString += "<select id='" + option.id + "'>";
            for (const value of option.values) {
                optionString += "<option" + ((value === currentValue) ? " selected='selected'" : "" ) + ">" + value + "</option>";
            }
            optionString += "</select>";
            break;
        case "bool":
            optionString += "<input id='" + option.id + "' type='checkbox'" + ((currentValue === "1") ? " checked='checked'" : "") + ">";
            break;
        }
        return optionString;
    }

    const emscriptenOptions = [
        {
            id: "opt", description: "Optimization level",
            type: "select", values: ["O0", "O2", "O3", "Os", "Oz"], default: "O0",
            toValue: toEmccOptionByValue
        },
        {
            id: "llvm-lto", description: "Link time optimization",
            type: "bool", default: false, toValue: toEmccOptionBool("llvm-lto")
        },
        {
            id: "closure", description: "Closure compiler",
            type: "bool", default: false, toValue: toEmccOptionBool("closure")
        },
        {
            id: "TOTAL_MEMORY", description: "Total memory in MB",
            type: "select", default: "16", values: ["16", "32", "64", "128"],
            toValue: toEmccOptionByValueSConvert("TOTAL_MEMORY", (x) => {return parseInt(x)*1024*1024;})
        },
        {
            id: "NO_EXIT_RUNTIME", description: "No exit runtime",
            type: "bool", default: false, toValue: toEmccOptionBoolS("NO_EXIT_RUNTIME")
        },
        {
            id: "NO_FILESYSTEM", description: "No filesystem",
            type: "bool", default: false, toValue: toEmccOptionBoolS("NO_FILESYSTEM")
        },
        {
            id: "NO_DYNAMIC_EXECUTION", description: "No dynamic execution",
            type: "bool", default: false, toValue: toEmccOptionBoolS("NO_DYNAMIC_EXECUTION"),
            warning: "<span style='font-weight: bold; font-size: x-large;' title='\"-s NO_DYNAMIC_EXECUTION=1\" cannot be used with \"--closure 1\"'>&#9888;</span>" 
        },
        {
            id: "ELIMINATE_DUPLICATE_FUNCTIONS", description: "Eliminate duplicate functions",
            type: "bool", default: false, toValue: toEmccOptionBoolS("ELIMINATE_DUPLICATE_FUNCTIONS")
        },
        {
            id: "AGGRESIVE_VARIABLE_ELIMINATION", description: "Aggresive variable elimination",
            type: "bool", default: false, toValue: toEmccOptionBoolS("AGGRESIVE_VARIABLE_ELIMINATION")
        },
        {
            id: "DISABLE_EXCEPTION_CATCHING", description: "Disable exception catching",
            type: "bool", default: false, toValue: toEmccOptionBoolS("DISABLE_EXCEPTION_CATCHING")
        },
        {
            id: "FUNCTION_POINTER_ALIGNMENT", description: "Function pointer alignment",
            type: "select", values: ["1", "2"], default: "2",
            toValue: toEmccOptionByValueS("FUNCTION_POINTER_ALIGNMENT")
        },
        {
            id: "RUNNING_JS_OPS", description: "Running js ops",
            type: "bool", default: false, toValue: toEmccOptionBoolS("RUNNING_JS_OPS")
        },
        {
            id: "ALIASING_FUNCTION_POINTERS", description: "Aliasing function pointers",
            type: "bool", default: false, toValue: toEmccOptionBoolS("ALIASING_FUNCTION_POINTERS")
        },
        {
            id: "EMULATED_FUNCTION_POINTERS", description: "Emulated function pointers",
            type: "select", values: ["0", "1", "2"], default: "0", toValue: toEmccOptionByValueS("EMULATED_FUNCTION_POINTERS")
        },
        {
            id: "LEGACY_GL_EMULATION", description: "Legacy OpenGL emulation",
            type: "bool", default: false, toValue: toEmccOptionBoolS("LEGACY_GL_EMULATION")
        },
        {
            id: "GL_UNSAFE_OPTS", description: "OpenGL unsafe optimizations",
            type: "bool", default: true, toValue: toEmccOptionBoolS("GL_UNSAFE_OPTS")
        },
        {
            id: "GL_FFP_ONLY", description: "OpenGL fixed function pipeline only",
            type: "bool", default: false, toValue: toEmccOptionBoolS("GL_FFP_ONLY")
        },
    ];

    function mapOptions(option) {
        const optimizationOptions = ["O0", "O2", "O3", "Os", "Oz"];
        const doubleDashOptions = ["llvm-lto", "closure"];
        const sOptions = [
            "NO_EXIT_RUNTIME",
            "NO_FILESYSTEM",
            "NO_DYNAMIC_EXECUTION",
            "ELIMINATE_DUPLICATE_FUNCTIONS",
            "AGGRESIVE_VARIABLE_ELIMINATION",
            "DISABLE_EXCEPTION_CATCHING",
            "FUNCTION_POINTER_ALIGNMENT",
            "RUNNING_JS_OPS",
            "ALIASING_FUNCTION_POINTERS",
            "LEGACY_GL_EMULATION",
            "GL_UNSAFE_OPTS",
            "GL_FFP_ONLY",
            "TOTAL_MEMORY",
            "EMULATED_FUNCTION_POINTERS",
        ];
        const allowedBoolOptions = ["0", "1"];
        const allowedEFPOptions = ["0", "1", "2"];
        const allowedFPAOptions = ["1", "2"];
        const allowedMemoryOptions = ["16", "32", "64", "128"];

        if (option.type === "single_dash_option") {
            if (optimizationOptions.indexOf(option.name) > -1) {
                return ["opt", option.name];
            }
        } else if (option.type === "double_dash_option") {
            if (doubleDashOptions.indexOf(option.name) > -1 && allowedBoolOptions.indexOf(option.value) > -1) {
                return [option.name, option.value];
            }
        } else if (option.type === "s_option" && sOptions.indexOf(option.name) > -1) {
            if (option.name === "TOTAL_MEMORY") {
                const memoryValue = (parseInt(option.value, 10) / (1024*1024)).toString();
                if (allowedMemoryOptions.indexOf(memoryValue) > -1) {
                    return [option.name, memoryValue];
                }
            } else if (option.name === "FUNCTION_POINTER_ALIGNMENT" && allowedFPAOptions.indexOf(option.value) > -1) {
                return [option.name, option.value];
            } else if (option.name === "EMULATED_FUNCTION_POINTERS" && allowedEFPOptions.indexOf(option.value) > -1) {
                return [option.name, option.value];
            } else if (allowedBoolOptions.indexOf(option.value) > -1) {
                return [option.name, option.value];
            }
        }
        console.log("Unsupported option: " + option);
        return null;
    }

    function getDialogText(parsedOptions) {
        const cleanOptions = {};
        for (const opt of parsedOptions) {
            const option = mapOptions(opt);
            if (option !== null) {
                cleanOptions[option[0]] = option[1];
            }
        }
        let dialogText = "Select emscripten options for building:</br></br>";
        dialogText += "<ul>";
        for (let option of emscriptenOptions) {
            const warningHtml = (option.hasOwnProperty("warning") ? (" " + option.warning) : "");
            dialogText += "<li>";
            dialogText += option.description;
            dialogText += " (default '" + option.default + "')" + warningHtml + ": ";
            if (cleanOptions.hasOwnProperty(option.id)) {
                dialogText += renderOption(option, cleanOptions[option.id]);
            } else {
                dialogText += renderOption(option);
            }
            dialogText += "</li>";
        }
        dialogText += "</ul>";
        return dialogText;
    }

    function generateOptionString($dlg) {
        let optionString = "";
        for (let option of emscriptenOptions) {
            const $optElement = $("#" + option.id, $dlg);
            optionString += option.toValue($optElement);
            optionString += " ";
        }
        return optionString;
    }

    function handleSelectOptions() {
        ProjectManager.getAllFiles((file) => {
            return file.name === "makefile";
        }).done((files) => {
            if (files.length !== 1) {
                Dialogs.showModalDialog(
                    DefaultDialogs.DIALOG_ID_ERROR,
                    ExtensionStrings.MENU_TITLE_OPTIONS_SELECT,
                    "\"makefile\" not found. Please select build files first."
                );
                return;
            }
            files[0].read((err, data) => {
                if (err)  {
                    Dialogs.showModalDialog(
                        DefaultDialogs.DIALOG_ID_ERROR,
                        ExtensionStrings.MENU_TITLE_OPTIONS_SELECT,
                        "Couldn't read makefile: " + err
                    );
                    return;
                }
                const match = data.match(/^CCFLAGS_OPT=(.*)$/m);
                if (match === null) {
                    Dialogs.showModalDialog(
                        DefaultDialogs.DIALOG_ID_ERROR,
                        ExtensionStrings.MENU_TITLE_OPTIONS_SELECT,
                        "Couldn't find CCFLAGS_OPT in makefile"
                    );
                    return;
                }

                function parse(data) {
                    /*
                     * This function parses emscripten command line options.
                     * Here is a rough EBNF grammar of the allowed options forms:
                     *
                     * OPTIONS = ( { OPTION , WHITESPACE } , OPTION ) | [ WHITESPACE ]  ;
                     * OPTION = ONE_DASH_OPTION | TWO_DASH_OPTION | S_OPTION ;
                     * ONE_DASH_OPTION = "-" , NAME ;
                     * TWO_DASH_OPTION = "--" , NAME , "=" , VALUE ;
                     * S_OPTION = "-s " , NAME , "=" , VALUE ;
                     * NAME = ALPHA , { IDENT_CHAR } ;
                     * VALUE = NUMERIC , { NUMERIC } ;
                     * IDENT_CHAR = ALPHA | NUMERIC | "-" | "_" ;
                     *
                     * Note that later we restrict options to some arbitrarily
                     * chosen set.
                     */
                    if (!data) {
                        return [];
                    }

                    const alphaRegex = /^[a-zA-Z]$/;
                    const nameRegex = /^[a-zA-Z][a-zA-Z0-9-_]*/;
                    const valueRegex = /^[0-9]+/;

                    let i = 0;
                    let peek = data[i];

                    function advanceParsingState(n) {
                        if (n === undefined) {
                            n = 1;
                        }
                        i += n;
                        if (i > data.length) {
                            throw "Input string overrun";
                        } else if (i === data.length) {
                            peek = "";
                        } else {
                            peek = data[i];
                        }
                    }

                    function parseIdent() {
                        const name = data.substr(i).match(nameRegex);
                        if (!name) {
                            throw "Expected an identifier";
                        }
                        advanceParsingState(name[0].length);
                        return name[0];
                    }

                    function parseNumval() {
                        const value = data.substr(i).match(valueRegex);
                        if (!value) {
                            throw "Expected a numeric value";
                        }
                        advanceParsingState(value[0].length);
                        return value[0];
                    }

                    function parseOpt() {
                        const ident = parseIdent();
                        if (peek !== " " && peek !== "") {
                            throw "Option without value has to be followed by a space or EOF";
                        }
                        return ident;
                    }

                    function parseValueOpt(separator) {
                        const ident = parseIdent();
                        if (peek !== separator) {
                            throw "value option has to have a value";
                        }
                        advanceParsingState();
                        const val = parseNumval();
                        return [ident, val];
                    }

                    const options = [];

                    function saveOption(type, option, value="") {
                        options.push({
                            type: type,
                            name: option,
                            value: value
                        });
                    }

                    while (true) {
                        if (peek === "-") {
                            advanceParsingState();
                            if (peek === "s") {
                                advanceParsingState();
                                if (peek === " ") {
                                    advanceParsingState();
                                    saveOption("s_option", ...parseValueOpt("="));
                                } else if (peek.match(alphaRegex)) {
                                    saveOption("single_dash_option", parseOpt());
                                } else {
                                    throw "'-s' not followed by space or alpha character ('-s;' or '-s1')";
                                }
                            } else if (peek === "-") {
                                advanceParsingState();
                                saveOption("double_dash_option", ...parseValueOpt(" "));
                            } else if (peek.match(alphaRegex)) {
                                saveOption("single_dash_option", parseOpt());
                            } else {
                                throw "'-' not followed by 's' or alpha or another '-'";
                            }
                        } else if (peek === " ") {
                            advanceParsingState();
                        } else if (peek === "" || peek === "\n") {
                            break;
                        } else {
                            throw "Unexpected token";
                        }
                    }
                    return options;
                }

                try {
                    const options = parse(match[1]);
                    const context = {
                        title: ExtensionStrings.MENU_TITLE_OPTIONS_SELECT,
                        message: getDialogText(options),
                        buttons: [
                            {
                                className: "primary",
                                id: "ok",
                                text: Strings.OK
                            }
                        ]
                    };
                    const dialog = Dialogs.showModalDialogUsingTemplate(Mustache.render(CompileOptionsTemplate, context));

                    dialog.done(() => {
                        const optionString = generateOptionString(dialog.getElement());
                        const newMakefile = data.replace(/^CCFLAGS_OPT=.*$/m,
                            "CCFLAGS_OPT=" + optionString);
                        files[0].write(newMakefile, (writeFileError) => {
                            if (writeFileError) {
                                Dialogs.showModalDialog(
                                    DefaultDialogs.DIALOG_ID_ERROR,
                                    ExtensionStrings.MENU_TITLE_OPTIONS_SELECT,
                                    "Couldn't write makefile: " + writeFileError
                                );
                                return;
                            } else {
                                Dialogs.showModalDialog(
                                    DefaultDialogs.DIALOG_ID_INFO,
                                    ExtensionStrings.MENU_TITLE_OPTIONS_SELECT,
                                    "Options saved correctly"
                                );
                                return;
                            }
                        });
                    });
                } catch (parseError) {
                    Dialogs.showModalDialog(
                        DefaultDialogs.DIALOG_ID_ERROR,
                        ExtensionStrings.MENU_TITLE_OPTIONS_SELECT,
                        "Option parsing error: \"" + parseError + "\"<br>" + "Did you modify CCFLAGS_OPT by hand?"
                    );
                    return;
                }
            });
        });
    }

    function handleAPIPicking() {
        var projectManager = brackets.test.ProjectManager;

        var context = {
            Strings: Strings,
            ExtensionStrings: ExtensionStrings
        };

        var apiJSON;
        var dialog = Dialogs.showModalDialogUsingTemplate(Mustache.render(APIPickingDialogTemplate, context));
        var divGroup;

        dialog.done(function (buttonId) {
            if (buttonId === "ok") {
                var $group = $(divGroup);
                if (apiJSON === undefined) {
                    console.error("[ERROR] API-Grepper is not worked properly.");
                    return;
                }

                var recurContextsCheck = function myself (contextInfo, $contents, checked) {
                    var $input = $("> input", $contents);
                    contextInfo.checked = $input.prop("checked") || checked;

                    switch (contextInfo.ContextType) {
                    case "Namespace":
                    case "Class":
                        var $children = $("> ol > li", $contents);
                        for (var i = 0; i < contextInfo.Contexts.length; i++) {
                            myself(contextInfo.Contexts[i], $children.get(i), contextInfo.checked);
                        }
                        break;
                    }
                };

                if (apiJSON.Contexts) {
                    var $global = $("> ol > li", $group);
                    for (var i = 0; i < apiJSON.Contexts.length; i++) {
                        recurContextsCheck(apiJSON.Contexts[i], $global.get(i), false);
                    }
                    console.log(apiJSON);

                    // build IDL
                    var idlData = "";
                    var contextQueue = [];

                    var processNamespace = function (context) {
                        context.Contexts.forEach(function (child) {
                            switch (child.ContextType) {
                            case "Namespace":
                            case "Class":
                            case "Enumeration":
                                contextQueue.push(child);
                                break;
                            case "Method":
                            case "Attribute":
                                console.error("[ERROR] Wrong context is inserted.");
                                break;
                            };
                        });
                    };

                    var processClass = function (context) {
                        var memberIDL = "";
                        context.Contexts.forEach(function (child) {
                            switch (child.ContextType) {
                            case "Namespace":
                            case "Class":
                            case "Enumeration":
                                contextQueue.push(child);
                                break;
                            case "Method":
                            case "Attribute":
                                if (child.checked) {
                                    memberIDL += "  " + child.IDL + "\n";
                                }
                                break;
                            };
                        });

                        if (memberIDL === "") {
                            return;
                        }
                        // print class prefix
                        if (context.Prefix && context.Prefix !== "") {
                            idlData += context.Prefix + "\n";
                        }

                        // print class info
                        idlData += context.IDL + "{\n";
                        idlData += memberIDL;
                        idlData += "};\n";
                        // print class postfix
                        if (context.Postfix && context.Postfix !== "") {
                            idlData += context.Postfix + "\n";
                        }
                    };

                    var processEnum = function (context) {
                        if (context.checked === false) {
                            return;
                        }
                        // print class prefix
                        if (context.Prefix && context.Prefix !== "") {
                            idlData += context.Prefix + "\n";
                        }
                        // print class info
                        idlData += context.IDL + "{\n";

                        context.Contexts.forEach(function (child, i) {
                            if (child.ContextType !== "EnumerationConst") {
                                console.error("[ERROR] Wrong context is inserted in Enum Context.");
                                return;
                            }
                            idlData += "  \"" + child.IDL + "\"";
                            if (i !== context.Contexts.length - 1) {
                                idlData += ",";
                            }
                            idlData += "\n";
                        });
                        idlData += "};\n";
                    };

                    // global namespace
                    processNamespace(apiJSON);

                    while (contextQueue.length) {
                        var current = contextQueue.shift();
                        switch (current.ContextType) {
                        case "Namespace":
                            processNamespace(current);
                            break;
                        case "Class":
                            processClass(current);
                            break;
                        case "Enumeration":
                            processEnum(current);
                            break;
                        case "Method":
                        case "Attribute":
                            console.error("[ERROR] Wrong context is inserted in Context Queue.");
                            break;
                        }
                    }

                    console.log("[Picked]");
                    console.log(idlData);
                }

                var writeDataFile = function (filename, data) {
                    var createDataFile = function (filename, data) {
                        projectManager.createNewItem("", filename, true, false).then(function(file) {
                            file.write(data, function (err) {
                                if (err) {
                                    console.log("File Write Error: " + filename);
                                    console.log(err);
                                }
                            });
                        });
                    };
                    var fileExisted = false;
                    projectManager.getAllFiles(true).then(function(files) {
                        files.every(function(file) {
                            if (file._name.toLowerCase() === filename.toLowerCase()) {
                                fileExisted = true;
                                projectManager.deleteItem(file)
                                    .done(function () {
                                        createDataFile(filename, data);
                                    });
                                return false;
                            }
                            return true;
                        });
                        if (!fileExisted) {
                            createDataFile(filename, data);
                        }
                    });
                };
                writeDataFile("WASM.idl", idlData);

                projectManager.refreshFileTree();
            }
        });

        var fillPickingDialog = function(apiJSON) {
            var startGroupElement = function (contextInfo, checkable = true) {
                var ret = "<li>";
                ret += "<input name='" + contextInfo.name + "' type='checkbox' id='" + contextInfo.CPP + "' class='hidden-checkbox'/>";
                ret += "<label for='" + contextInfo.CPP + "' class='option-label group-label'>" + contextInfo.CPP + "</label>";
                ret += "<ol class='group-children'>";

                return ret;
            };

            var endGroupElement = function () {
                return "</ol></li>";
            };

            var methodElement = function (contextInfo) {
                var ret = "<li>";
                ret += "<input name='" + contextInfo.name + "' type='checkbox' id='" + contextInfo.name + "' class='hidden-checkbox'/>";
                ret += "<label for='" + contextInfo.name + "' class='option-label'>" + contextInfo.CPP + "</label></li>";
                return ret;
            };

            var enumElement = function (contextInfo) {
                var ret = "<li>";
                ret += "<input name='" + contextInfo.name + "' type='checkbox' id='" + contextInfo.name + "' class='hidden-checkbox'/>";
                ret += "<label for='" + contextInfo.name + "' class='option-label'>" + contextInfo.CPP;
                if (contextInfo.Contexts) {
                    ret += "<br>";
                    contextInfo.Contexts.forEach(function(c, i) {
                        if (i !== 0 && contextInfo.Contexts.length > 1) {
                            ret += ", ";
                        }
                        ret += c.CPP;
                    });
                }
                ret += "</label></li>";
                ret += "</li>";
                return ret;
            };

            var recurContexts = function (contextInfo) {
                switch (contextInfo.ContextType) {
                case "Namespace":
                case "Class":
                    items += startGroupElement(contextInfo, contextInfo.ContextType === "Class");
                    if (contextInfo.Contexts) {
                        contextInfo.Contexts.forEach(recurContexts);
                    }
                    items += endGroupElement();
                    break;
                case "Method":
                case "Attribute":
                    items += methodElement(contextInfo);
                    break;
                case "Enumeration":
                    items += enumElement(contextInfo);
                    break;
                }
            };

            divGroup = document.getElementById("group-list");
            var items = "<ol class='select select-tree select-one'>";
            if (apiJSON.Contexts) {
                apiJSON.Contexts.forEach(recurContexts);
            }
            divGroup.innerHTML = items + "</ol>";
        };

        projectManager.getAllFiles(true).then(function(files) {
            var projectId = PreferencesManager.getViewState("projectId");
            // [TODO] take files referred in makefile.

            // no makefile is found.
            var cppFiles = [];
            files.forEach(function(file) {
                if (file._isFile && file._name.substr(file._name.length - 3).toLowerCase() === "cpp") {
                    if (file._name !== "glue.cpp") {
                        var n = file._path.indexOf("/", 1) + 1;
                        cppFiles.push(file._path.substr(n));
                    }
                }
            });
            if (cppFiles.length) {
                _nodeDomain.exec("grepAPI", projectId, cppFiles, "WASM.api.json")
                    .done(function(data) {
                        try {
                            var output = JSON.parse(data);
                            console.log("error: " + output.error);
                            console.log("stdout: " + output.stdout);
                            console.log("stderr: " + output.stderr);
                        } catch(e) {
                            console.error("[ERROR] grepAPI: " + e);
                            return;
                        }

                        projectManager.refreshFileTree();

                        _nodeDomain.exec("catGreppedAPI", projectId, "WASM.api.json")
                            .done(function(data) {
                                try {
                                    var output = JSON.parse(data);
                                    apiJSON = JSON.parse(output.stdout);
                                    fillPickingDialog(apiJSON);
                                } catch(e) {
                                    console.error("[ERROR] catGreppedAPI: " + e);
                                }
                            });
                    });

            }
        });
    }


    function checkReplaceResourcesEnabled() {
        return loadConfiguration().then(configuration => {
            const replaceResourcesEnabledFileList = configuration.replaceResourcesEnabledFileList || [];
            return new Promise((resolve, reject) => {
                const checkReplaceResourcesOnProjectManager = () => {
                    ProjectManager.off("projectOpen", checkReplaceResourcesOnProjectManager);
                    ProjectManager.getAllFiles().done(files => {
                        resolve(files.some(file => replaceResourcesEnabledFileList.indexOf(file._name) !== -1));
                    }).fail(reject);
                };
                ProjectManager.on("projectOpen", checkReplaceResourcesOnProjectManager);
            });
        });
    }

    ExtensionUtils.loadStyleSheet(module, "styles/styles.css");

    CommandManager.register(ExtensionStrings.API_PICKING_MENU_TITLE, PROJECT_API_PICKING, handleAPIPicking);
    CommandManager.register(ExtensionStrings.MENU_TITLE, PROJECT_COMPILE_FILE, handleCompileFile);
    CommandManager.register(ExtensionStrings.MENU_TITLE_PROJECT, PROJECT_COMPILE_PROJECT, handleCompileProject);
    CommandManager.register(ExtensionStrings.MENU_TITLE_PROJECT_CLEAN, PROJECT_CLEAN_PROJECT, handleCleanProject);
    CommandManager.register(ExtensionStrings.MENU_TITLE_FILE_SELECT, PROJECT_SELECT_FILES, handleSelectFiles);
    CommandManager.register(ExtensionStrings.MENU_TITLE_OPTIONS_SELECT, PROJECT_SELECT_OPTIONS, handleSelectOptions);
    var packWGTCommand = CommandManager.register(ExtensionStrings.MENU_TITLE_PACK_WGT, PROJECT_PACK_WGT, handlePackWGT);
    _nodeDomain.exec("checkPackWGT").done(function(canBuild) { packWGTCommand.setEnabled(canBuild); });
    var packCRXCommand = CommandManager.register(ExtensionStrings.MENU_TITLE_PACK_CRX, PROJECT_PACK_CRX, handlePackCRX);
    _nodeDomain.exec("checkPackCRX").done(function (canBuild) {
        packCRXCommand.setEnabled(canBuild);
    });
    const buildUnityCmd = CommandManager.register(ExtensionStrings.MENU_TITLE_BUILD_UNITY, PROJECT_BUILD_UNITY, handleBuildUnity);
    CommandManager.register(ExtensionStrings.MENU_TITLE_INSTALL_WGT, PROJECT_INSTALL_WGT, handleInstallWGT);
    const replaceResourcesCommand = CommandManager.register(ExtensionStrings.MENU_TITLE_REPLACE_RESOURCES, PROJECT_REPLACE_RESOURCES, handleReplaceResources);

    var menu = Menus.getMenu(PROJECT_MENU);
    if (!menu) {
        menu = Menus.addMenu(ExtensionStrings.PROJECT_MENU, PROJECT_MENU, Menus.AFTER, Menus.AppMenuBar.NAVIGATE_MENU);
    }

    // menu items
    if (type === "wasm") {
        menu.addMenuItem(PROJECT_API_PICKING);
        menu.addMenuItem(PROJECT_COMPILE_FILE);
        menu.addMenuItem(Menus.DIVIDER);
        menu.addMenuItem(PROJECT_SELECT_FILES);
        menu.addMenuItem(PROJECT_SELECT_OPTIONS);
        menu.addMenuItem(PROJECT_COMPILE_PROJECT);
        menu.addMenuItem(PROJECT_CLEAN_PROJECT);
        menu.addMenuItem(Menus.DIVIDER);
        menu.addMenuItem(PROJECT_PACK_WGT);
    } else if (type === "crx") {
        menu.addMenuItem(PROJECT_PACK_CRX);
    } else if (type === "web" || type === "sthings" || type === "demo") {
        menu.addMenuItem(PROJECT_PACK_WGT);

        if (PreferencesManager.getViewState("projectExtension") === "unity") {
            // Add unity build menu if the project state is unity extension.
            menu.addMenuItem(PROJECT_BUILD_UNITY);
            _nodeDomain.exec("checkUnity").done((exist) => {
                // Enable unity build menu if the unity SDK is installed.
                buildUnityCmd.setEnabled(exist);
            });
        }
        checkReplaceResourcesEnabled().then(enabled => {
            menu.addMenuItem(PROJECT_REPLACE_RESOURCES);
            replaceResourcesCommand.setEnabled(enabled);
        }).catch(error => {
            console.error("Couldn't check if resource replacement should be added");
            console.error(error);
        });
    }
});
