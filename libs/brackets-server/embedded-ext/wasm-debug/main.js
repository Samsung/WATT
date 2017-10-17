define(function (require, exports, module) {
    "use strict";

    // Brackets modules
    const Commands               = brackets.getModule("command/Commands"),
        CommandManager           = brackets.getModule("command/CommandManager"),
        DefaultDialogs           = brackets.getModule("widgets/DefaultDialogs"),
        Dialogs                  = brackets.getModule("widgets/Dialogs"),
        ExtensionUtils           = brackets.getModule("utils/ExtensionUtils"),
        FileUtils                = brackets.getModule("file/FileUtils"),
        Menus                    = brackets.getModule("command/Menus"),
        NodeDomain               = brackets.getModule("utils/NodeDomain"),
        PreferencesManager       = brackets.getModule("preferences/PreferencesManager"),
        ProjectManager           = brackets.getModule("project/ProjectManager");

    const _domainPath = ExtensionUtils.getModulePath(module, "node/DebugDomain"),
        _nodeDomain = new NodeDomain("debugDomain", _domainPath);

    const ExtensionStrings = require("strings");

    const DEBUG_WASM2WAST = "debug.wasm2wast";

    function showErrorDialog(message) {
        Dialogs.showModalDialog(
            DefaultDialogs.DIALOG_ID_ERROR,
            "Error",
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

        const projectId = PreferencesManager.getViewState("projectId");
        _nodeDomain.exec("wasm2wast", projectId, brackets.app.convertRelativePath(item.fullPath)).done(() => {
            ProjectManager.refreshFileTree();
        }).fail((err) => {
            showErrorDialog(ExtensionStrings.ERROR_TRANSLATE_WASM);
            console.log(err);
        });
    }

    CommandManager.register("wasm -> wast", DEBUG_WASM2WAST, handleWasm2Wast);

    const menu = Menus.getMenu("debug-menu");

    menu.addMenuDivider();
    menu.addMenuItem(DEBUG_WASM2WAST);
});
