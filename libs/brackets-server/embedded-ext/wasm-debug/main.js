define(function (require, exports, module) {
    "use strict";

    const PreferencesManager = brackets.getModule("preferences/PreferencesManager");
    // Return extension when project type is not equal with wasm
    if (PreferencesManager.getViewState("projectType") !== "wasm"
            && PreferencesManager.getViewState("projectType") !== "sthings") {
        return;
    }

    // Brackets modules
    const CommandManager         = brackets.getModule("command/CommandManager"),
        Commands                 = brackets.getModule("command/Commands"),
        DefaultDialogs           = brackets.getModule("widgets/DefaultDialogs"),
        Dialogs                  = brackets.getModule("widgets/Dialogs"),
        ExtensionUtils           = brackets.getModule("utils/ExtensionUtils"),
        FileSystem               = brackets.getModule("filesystem/FileSystem"),
        FileUtils                = brackets.getModule("file/FileUtils"),
        Menus                    = brackets.getModule("command/Menus"),
        NodeDomain               = brackets.getModule("utils/NodeDomain"),
        ProjectManager           = brackets.getModule("project/ProjectManager");

    const _domainPath = ExtensionUtils.getModulePath(module, "node/DebugDomain"),
        _nodeDomain = new NodeDomain("debugDomain", _domainPath);

    const ExtensionStrings = require("strings");

    const DEBUG_WASM2WAST = "debug.wasm2wast";
    const DEBUG_WAST2WASM = "debug.wast2wasm";
    const DEBUG_INSTALL = "debug.install";

    function showErrorDialog(message) {
        Dialogs.showModalDialog(
            DefaultDialogs.DIALOG_ID_ERROR,
            "Error",
            message
        );
    }
    
    function showSuccessDialog(message) {
        Dialogs.showModalDialog(
            DefaultDialogs.DIALOG_ID_SUCCESS,
            "Success",
            message
        );
    }

    function handleWasm2Wast() {
        const item = ProjectManager.getSelectedItem();
        if (!item) {
            showErrorDialog(ExtensionStrings.ERROR_FILE_NOT_FOUND);
            return;
        }

        if (FileUtils.getFileExtension(item.fullPath) !== "wasm") {
            showErrorDialog(ExtensionStrings.ERROR_NOT_WASM_FILE);
            return;
        }

        const basename = FileUtils.getFilenameWithoutExtension(item.fullPath);
        FileSystem.resolve(basename + ".wast", (notFound) => {
            if (notFound) {
                const projectId = PreferencesManager.getViewState("projectId");
                _nodeDomain.exec("wasm2wast", projectId, brackets.app.convertRelativePath(item.fullPath)).done(() => {
                    ProjectManager.refreshFileTree();
                }).fail((err) => {
                    showErrorDialog(ExtensionStrings.ERROR_TRANSLATE_WASM);
                    console.error(err);
                });
            } else {
                showErrorDialog(ExtensionStrings.ERROR_EXIST_WAST_FILE);
            }
        });
    }

    function handleWast2Wasm() {
        const item = ProjectManager.getSelectedItem();
        if (!item) {
            showErrorDialog(ExtensionStrings.ERROR_FILE_NOT_FOUND);
            return;
        }

        if (FileUtils.getFileExtension(item.fullPath) !== "wast") {
            showErrorDialog(ExtensionStrings.ERROR_NOT_WAST_FILE);
            return;
        }

        const basename = FileUtils.getFilenameWithoutExtension(item.fullPath);
        FileSystem.resolve(basename + ".wasm", (notFound) => {
            if (notFound) {
                const projectId = PreferencesManager.getViewState("projectId");
                _nodeDomain.exec("wast2wasm", projectId, brackets.app.convertRelativePath(item.fullPath)).done(() => {
                    ProjectManager.refreshFileTree();
                }).fail((err) => {
                    showErrorDialog(ExtensionStrings.ERROR_TRANSLATE_WAST);
                    console.error(err);
                });
            } else {
                showErrorDialog(ExtensionStrings.ERROR_EXIST_WASM_FILE);
            }
        });
    }
    
    function install() {
        const projectId = PreferencesManager.getViewState("projectId");
        const projectName = PreferencesManager.getViewState("projectName");

        FileSystem.resolve("/" + projectName + ".wgt", (Found) => {
            if (Found) {
                console.error("Install Start");
                _nodeDomain.exec("install", projectId).done(() => {
                    showSuccessDialog("Install Success.");
                }).fail((err) => {
                    console.error("error : ", err);
                    showErrorDialog("Install Fail.");
                });
                console.error("Install End");
            } else {
                showErrorDialog("wgt file does not exist. Please check.");
            }
        });
    }

    CommandManager.register("wasm -> wast", DEBUG_WASM2WAST, handleWasm2Wast);
    CommandManager.register("wast -> wasm", DEBUG_WAST2WASM, handleWast2Wasm);
    CommandManager.register("install", DEBUG_INSTALL, install);

    const menu = Menus.getMenu("debug-menu");

    menu.addMenuDivider();
    menu.addMenuItem(DEBUG_WASM2WAST);
    menu.addMenuItem(DEBUG_WAST2WASM);
    if (PreferencesManager.getViewState("projectType") === "sthings") {
        menu.addMenuItem(DEBUG_INSTALL);
    }
});
