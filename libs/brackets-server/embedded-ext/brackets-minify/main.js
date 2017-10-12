define(function(require, exports, module) {
    "use strict";

    var CommandManager  = brackets.getModule("command/CommandManager"),
        Menus           = brackets.getModule("command/Menus"),
        EditorManager   = brackets.getModule("editor/EditorManager"),
        DocumentManager = brackets.getModule("document/DocumentManager"),
        FileUtils       = brackets.getModule("file/FileUtils"),
        FileSystem      = brackets.getModule("filesystem/FileSystem"),
        ProjectManager  = brackets.getModule("project/ProjectManager"),
        ExtensionUtils  = brackets.getModule("utils/ExtensionUtils"),
        NodeDomain      = brackets.getModule("utils/NodeDomain"),
        LanguageManager = brackets.getModule("language/LanguageManager"),
        Strings         = require("strings");

    var cssAction     = new NodeDomain("minifycss", ExtensionUtils.getModulePath(module, "node/minifycss")),
        jsAction      = new NodeDomain("minifyjs", ExtensionUtils.getModulePath(module, "node/minifyjs"));

    $("#status-indicators").prepend('<div id="min-status" style="text-align: right;"></div>');
    var tunnel = $("#min-status");

    var mainProjectPath,
        excludedFolders;

    function stripSlashes(str, leaveBack) {
        if (leaveBack) {
            return str.replace(/^\//, "").replace(/^\\/, "");
        }

        return str.replace(/^\/+|\/+$/, "").replace(/^\\+|\\+$/, "");
    }

    function statusUpdate(text, errorLevel, length) {
        if (errorLevel === 0) {
            tunnel.css("color", "#000");
        } else if (errorLevel === 1) {
            tunnel.css("color", "#B47612");
        } else if (errorLevel === 2) {
            tunnel.css("color", "#D8000C");
        }

        tunnel.text(text);

        if (length !== 0) {
            setTimeout(function() {
                tunnel.text("");
                tunnel.css("color", "#000");
            }, length);
        }
    }

    function minifyJS(currentPath, path, customPath) {
        jsAction.exec("goMinifyJS", currentPath, path, customPath, true, true)
            .done(function() {
                statusUpdate(Strings.MINIFIED, 0, 1750);
                ProjectManager.refreshFileTree();
            })
            .fail(function(err) {
                console.log(err.toString());
                statusUpdate(Strings.GENERAL_ERROR, 2, 3000);
            });
    }

    function minifyCSS(currentPath, path, customPath) {
        cssAction.exec("goMinifyCSS", currentPath, path, customPath)
            .done(function() {
                statusUpdate(Strings.MINIFIED, 0, 1750);
                ProjectManager.refreshFileTree();
            })
            .fail(function(err) {
                statusUpdate(Strings.GENERAL_ERROR, 2, 3000);
            });
    }

    function process(lan, file) {
        var customPath = "",
            mainPath   = FileUtils.convertToNativePath((file.fullPath).replace(".".concat(lan), ".min.".concat(lan)));

        if (customPath !== "" && mainPath.indexOf(mainProjectPath) === 0) {
            mainPath = mainProjectPath;
            customPath = FileUtils.convertToNativePath(stripSlashes(customPath).concat("/").concat(FileUtils.getBaseName(file.fullPath.replace(".".concat(lan), ".min.".concat(lan)))));
        }

        if (lan === "js") {
            minifyJS(file.fullPath, mainPath, customPath);
        } else if (lan === "css") {
            minifyCSS(file.fullPath, mainPath, customPath);
        } else {
            console.log(Strings.NOT_MINIFIABLE);
        }
    }
    
    function processAfterSave(fileLanguage, currentDocument) {
        if(currentDocument === undefined) {
            return;
        }

        if (currentDocument.isDirty) {
            FileUtils.writeText(FileSystem.getFileForPath(currentDocument.file.fullPath), currentDocument.getText(), true)
                .done(function() {
                    currentDocument.notifySaved();
                    process(fileLanguage, currentDocument.file);
                }).fail(function(err) {
                    console.log(err.toString());
                    statusUpdate(Strings.FILE_ERROR, 2, 3000);
                });
        } else {
            process(fileLanguage, currentDocument.file);
        }
    }
    
    function compileCurrent() {
        mainProjectPath = FileUtils.convertToNativePath(ProjectManager.getProjectRoot().fullPath);
        var editor = EditorManager.getActiveEditor();
        if (!editor) {
            return;
        }

        var fileLanguage = editor.document.file.name.split('.').pop();
        if (editor.document.file.name.match(new RegExp("\\.min\\." + fileLanguage))) {
            statusUpdate(Strings.ALREADY_MINIFIED, 0, 1750);
            return;
        }
        statusUpdate(Strings.MINIFYING, 0, 0);
        if (fileLanguage !== "js" && fileLanguage !== "css") {
            statusUpdate(Strings.NOT_MINIFIABLE, 0, 1750);
            return;
        }
        processAfterSave(fileLanguage, editor.document);
    }

    var menu               = Menus.getMenu(Menus.AppMenuBar.EDIT_MENU),
        contextMenu        = Menus.getContextMenu(Menus.ContextMenuIds.EDITOR_MENU),
        cmd_min_id         = "minifier.min";

    CommandManager.register(Strings.MINIFY, cmd_min_id, compileCurrent);
    menu.addMenuDivider();
    menu.addMenuItem(cmd_min_id, [{ "key": "Ctrl-M" }, { "key": "Ctrl-Alt-M"}]); //Keeping existing Ctrl-M key binding for Windows users. Will be removed in future versions.
});