define(function (require, exports, module) {
    "use strict";

    var CommandManager              = brackets.getModule("command/CommandManager"),
        DefaultDialogs              = brackets.getModule("widgets/DefaultDialogs"),
        Dialogs                     = brackets.getModule("widgets/Dialogs"),
        ExtensionUtils              = brackets.getModule("utils/ExtensionUtils"),
        FileSystem                  = brackets.getModule("filesystem/FileSystem"),
        FileUtils                   = brackets.getModule("file/FileUtils"),
        Menus                       = brackets.getModule("command/Menus"),
        NodeDomain                  = brackets.getModule("utils/NodeDomain"),
        PreferencesManager          = brackets.getModule("preferences/PreferencesManager"),
        ProjectManager              = brackets.getModule("project/ProjectManager"),
        Strings                     = brackets.getModule("strings");

    var APIPickingDialogTemplate    = require("text!htmlContent/API-Picking-Dialog.html"),
        CompileFileDialogTemplate   = require("text!htmlContent/Compile-Dialog.html"),
        CompileOptionsTemplate      = require("text!htmlContent/SelectCompileOptions-Dialog.html"),
        ExtensionStrings            = require("strings");

    var _domainPath = ExtensionUtils.getModulePath(module, "node/CompileDomain"),
        _nodeDomain = new NodeDomain("compileEmscripten", _domainPath);

    var _typeTable;
    ExtensionUtils.loadFile(module, "data/idlType.json")
        .done(function(data) {
            _typeTable = data;
        });

    var PROJECT_MENU = "project-menu";
    var PROJECT_API_PICKING = "project.API-Picking";
    var PROJECT_COMPILE_FILE = "project.compile";
    var PROJECT_SELECT_FILES = "project.selectFiles";
    var PROJECT_SELECT_OPTIONS = "project.selectOptions";
    var PROJECT_COMPILE_PROJECT = "project.compileProject";
    var PROJECT_CLEAN_PROJECT = "project.cleanProject";
    var PROJECT_BUILD_WGT = "project.buildWGT";

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

    function showLoadingDialog() {
        return Dialogs.showModalDialog(
            DefaultDialogs.DIALOG_ID_INFO,
            ExtensionStrings.COMPILING_DIALOG_TITLE,
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
            _nodeDomain.exec("getCompiledFiles", projectId, makefileInProject, "/projects/")
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

                        _nodeDomain.exec("updateCompiledFiles", projectId, makefileInProject, readyText, "/projects/")
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
            var infoDialog = showLoadingDialog();

            _nodeDomain.exec("cleanWithMakefile", projectId, makefileInProject, "/projects/")
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
            var infoDialog = showLoadingDialog();

            _nodeDomain.exec("compileWithMakefile", projectId, makefileInProject, "/projects/")
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

                var infoDialog = showLoadingDialog();

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

    function handleBuildWGT() {
        const projectId = PreferencesManager.getViewState("projectId");
        const loadingDialog = showLoadingDialog();
        _nodeDomain.exec("buildWGT", projectId, "/projects/").done(function() {
            loadingDialog.close();
            Dialogs.showModalDialog(
                DefaultDialogs.DIALOG_ID_OK,
                ExtensionStrings.MENU_TITLE_OPTIONS_SELECT,
                "Package has been successfully built"
            ).done(() => {
                ProjectManager.refreshFileTree();  // show .wgt file
            });
        }).fail((error) => {
            loadingDialog.close();
            const result = JSON.parse(error);
            Dialogs.showModalDialog(
                DefaultDialogs.DIALOG_ID_ERROR,
                ExtensionStrings.MENU_TITLE_OPTIONS_SELECT,
                `Couldn't build WGT package: "${result.message}", details: "${result.details}"`
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
            type: "select", values: ["O0", "O2", "O3", "Oz"], default: "O0",
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
        const optimizationOptions = ["O0", "O2", "O3", "Oz"];
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
                var $classElement, $methodElement;
                if (apiJSON.interfaces === undefined) {
                    return;
                }
                // gather check info
                apiJSON.interfaces.forEach(function(classInfo) {
                    $classElement = $("#I_" + classInfo.name, $group);
                    classInfo.checked = $classElement.prop("checked");
                    if (!classInfo.checked) {
                        classInfo.checkedChild = false;
                        if (classInfo.methods) {
                            classInfo.methods.forEach(function(methodInfo) {
                                $methodElement = $("#M_" + classInfo.name + "_" + methodInfo.name, $group);
                                methodInfo.checked = $methodElement.prop("checked");
                                if (methodInfo.checked) {
                                    classInfo.checkedChild = true;
                                }
                            });
                        }
                    }
                });

                var convertToIDLType = function (cxxType) {
                    var ret = "";
                    if (cxxType.isConst === true && cxxType.isRef === true) {
                        ret += "[Const, Ref] ";
                    } else if (cxxType.isConst === true) {
                        ret += "[Const] ";
                    } else if (cxxType.isRef === true) {
                        ret += "[Ref] ";
                    }

                    if(_typeTable.hasOwnProperty(cxxType.type)) {
                        ret += _typeTable[cxxType.type];
                    } else {
                        ret += cxxType.type;
                    }
                    return ret;
                };

                var generateMethodIDL = function (methodInfo) {
                    var ret = "  ";
                    ret += convertToIDLType(methodInfo.type) + " ";
                    ret += methodInfo.name + "(";
                    if (methodInfo.params) {
                        methodInfo.params.forEach(function(paramInfo, paramIndex, params) {
                            ret += convertToIDLType(paramInfo.type);
                            ret += " " + paramInfo.name;
                            if (params.length !== 1 && paramIndex !== params.length - 1) {
                                ret += ", ";
                            }
                        });
                    }
                    ret += ");\n";
                    return ret;
                };

                var generateTitle = function (title) {
                    return "\"" + title + "\":";
                };

                var generateAttribute = function (title, value) {
                    return generateTitle(title) + "\"" + value + "\"";
                };

                var generatePair = function (title, value) {
                    return "\"" + title + "\":" + value;
                };

                var generateParamJSON = function (paramInfo) {
                    var ret = "{";
                    ret += generateAttribute("name", paramInfo.name);
                    ret += ", ";
                    ret += generatePair("type", JSON.stringify(paramInfo.type));
                    ret += "}";
                    return ret;
                };

                var generateMethodJSON = function (methodInfo) {
                    var ret = "{";
                    ret += generateAttribute("name", methodInfo.name);
                    ret += ", ";
                    ret += generatePair("type", JSON.stringify(methodInfo.type));
                    if (methodInfo.params) {
                        ret += ", ";
                        ret += generateTitle("params");
                        ret += "[";
                        methodInfo.params.forEach(function(paramInfo, paramIndex, params) {
                            ret += generateParamJSON(paramInfo);
                            if (params.length !== 1 && paramIndex !== params.length - 1) {
                                ret += ", ";
                            }
                        });
                        ret += "]";
                    }
                    ret += "}";
                    return ret;
                };

                var generateClassJSON = function (classInfo) {
                    var ret = "{";
                    ret += generateAttribute("name", classInfo.name);
                    ret += ", ";
                    ret += generateAttribute("path", classInfo.path);
                    ret += ", ";
                    ret += generatePair("nodelete", classInfo.nodelete ? "true" : "false");
                    if (classInfo.methods) {
                        ret += ", ";
                        ret += generateTitle("methods");
                        ret += "[";
                        var isFirst = true;
                        classInfo.methods.forEach(function(methodInfo) {
                            if (classInfo.checked || methodInfo.checked) {
                                if (isFirst) {
                                    isFirst = false;
                                }
                                else {
                                    ret += ", ";
                                }
                                ret += generateMethodJSON(methodInfo);
                            }
                        });
                        ret += "]";
                    }
                    ret += "}";
                    return ret;
                };

                // make picked things to json
                var jsonData = "{" + generateAttribute("Path", apiJSON.Path);
                jsonData += ", ";
                jsonData += generateTitle("interfaces") + "[";
                if (apiJSON.interfaces) {
                    var isFirst = true;
                    apiJSON.interfaces.forEach(function(classInfo) {
                        if (classInfo.checked || classInfo.checkedChild) {
                            if (isFirst === true) {
                                isFirst = false;
                            }
                            else {
                                jsonData += ", ";
                            }
                            jsonData += generateClassJSON(classInfo);
                        }
                    });
                }
                jsonData += "]";
                jsonData += "}";

                // make idl data
                var idlData = "";
                apiJSON.interfaces.forEach(function(classInfo) {
                    if (classInfo.checked || classInfo.checkedChild) {
                        if (classInfo.nodelete) {
                            idlData += "[NoDelete]\n";
                        }
                        idlData += "interface " + classInfo.name + " {\n";
                        if (classInfo.methods) {
                            classInfo.methods.forEach(function(methodInfo) {
                                if (classInfo.checked || methodInfo.checked) {
                                    idlData += generateMethodIDL(methodInfo);
                                }
                            });
                        }
                        idlData += "};\n";
                    }
                });

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
                        files.every(function(file/*, index*/) {
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
                writeDataFile("WASM.json", jsonData);

                projectManager.refreshFileTree();
            }
        });

        var fillPickingDialog = function(apiJSON) {
            var refineTypeElement = function (type) {
                type.type = type.name;
                if (type.isConst === true) {
                    if (type.type.startsWith("const")) {
                        type.type = type.type.substring("const".length).trim();
                    }
                }
                if (type.isRef === true) {
                    if (type.type.search("&") === type.type.length - 1) {
                        type.type = type.type.substring(0, type.type.length - 1).trim();
                    }
                }
            };

            var startClassElement = function (classIndex, className, classPath) {
                var ret = "";
                ret += "<li>";
                ret += "<input name='I_" + className + "' type='checkbox' id='I_" + className + "' class='hidden-checkbox' data-classIndex='" + classIndex + "' data-path='" + classPath +"'/>";
                ret += "<label for='I_" + className + "' class='option-label group-label'>" + className + "</label>";
                ret += "<ol class='group-children'>";

                return ret;
            };

            var endclassElement = function () {
                return "</ol></li>";
            };

            var startMethodElement = function (className, methodIndex, methodName, methodType) {
                var ret = "";
                ret += "<li>";
                ret += "<input name='M_" + className + "_" + methodName + "' type='checkbox' id='M_" + className + "_" + methodName + "' class='hidden-checkbox' data-methodIndex='" + methodIndex + "'/>";
                ret += "<label for='M_" + className + "_" + methodName + "' class='option-label'>" + methodType.name + " " + methodName + "(";
                return ret;
            };

            var endMethodElement = function () {
                return ")</label></li>";
            };

            var addParamElement = function (paramName, paramType, paramIndex) {
                return (paramIndex !== 0 ? ", " : "") + paramType.name + " " + paramName;
            };

            divGroup = document.getElementById("group-list");
            var items = "<ol class='select select-tree select-one'>";
            if (apiJSON.interfaces) {
                apiJSON.interfaces.forEach(function(classInfo, classIndex) {
                    items += startClassElement(classIndex, classInfo.name, classInfo.path);
                    if (classInfo.methods) {
                        classInfo.methods.forEach(function(methodInfo, methodIndex) {
                            refineTypeElement(methodInfo.type);
                            items += startMethodElement(classInfo.name, methodIndex, methodInfo.name, methodInfo.type);
                            if (methodInfo.params) {
                                methodInfo.params.forEach(function(paramInfo, paramIndex) {
                                    refineTypeElement(paramInfo.type);
                                    items += addParamElement(paramInfo.name, paramInfo.type, paramIndex);
                                });
                            }
                            items += endMethodElement();
                        });
                    }
                    items += endclassElement();
                });
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
                _nodeDomain.exec("grepAPI", projectId, cppFiles, "/projects/", "WASM.api.json")
                    .done(function(data) {
                        try {
                            var output = JSON.parse(data);
                            console.log("error: " + output.error);
                            console.log("stdout: " + output.stdout);
                            console.log("stderr: " + output.stderr);
                        } catch(e) {
                            console.log("[ERR] " + e);
                        }

                        projectManager.refreshFileTree();

                        _nodeDomain.exec("catGreppedAPI", projectId, "WASM.api.json", "/projects/")
                            .done(function(data) {
                                try {
                                    var output = JSON.parse(data);
                                    apiJSON = JSON.parse(output.stdout);

                                    fillPickingDialog(apiJSON);
                                } catch(e) {
                                    console.log("[ERR] " + e);
                                }
                            });

                    });

            }
        });
    }

    ExtensionUtils.loadStyleSheet(module, "styles/styles.css");

    CommandManager.register(ExtensionStrings.API_PICKING_MENU_TITLE, PROJECT_API_PICKING, handleAPIPicking);
    CommandManager.register(ExtensionStrings.MENU_TITLE, PROJECT_COMPILE_FILE, handleCompileFile);
    CommandManager.register(ExtensionStrings.MENU_TITLE_PROJECT, PROJECT_COMPILE_PROJECT, handleCompileProject);
    CommandManager.register(ExtensionStrings.MENU_TITLE_PROJECT_CLEAN, PROJECT_CLEAN_PROJECT, handleCleanProject);
    CommandManager.register(ExtensionStrings.MENU_TITLE_FILE_SELECT, PROJECT_SELECT_FILES, handleSelectFiles);
    CommandManager.register(ExtensionStrings.MENU_TITLE_OPTIONS_SELECT, PROJECT_SELECT_OPTIONS, handleSelectOptions);
    var buildWGTCommand = CommandManager.register(ExtensionStrings.MENU_TITLE_BUILD_WGT, PROJECT_BUILD_WGT, handleBuildWGT);
    _nodeDomain.exec("checkBuildWGT").done(function(canBuild) { buildWGTCommand.setEnabled(canBuild); });

    var menu = Menus.addMenu(ExtensionStrings.PROJECT_MENU, PROJECT_MENU, Menus.AFTER, Menus.AppMenuBar.NAVIGATE_MENU);

    // menu items
    const type = PreferencesManager.getViewState("projectType");
    if (type === "wasm") {
        menu.addMenuItem(PROJECT_API_PICKING);
        menu.addMenuItem(PROJECT_COMPILE_FILE);
        menu.addMenuItem(Menus.DIVIDER);
        menu.addMenuItem(PROJECT_SELECT_FILES);
        menu.addMenuItem(PROJECT_SELECT_OPTIONS);
        menu.addMenuItem(PROJECT_COMPILE_PROJECT);
        menu.addMenuItem(PROJECT_CLEAN_PROJECT);
    } else if (type === "web") {
        menu.addMenuItem(PROJECT_BUILD_WGT);
    }
});
