/*global define, brackets, window, $, Mustache, FileReader */

define(function (require, exports, module) {
    "use strict";

    // Brackets modules
    const Commands               = brackets.getModule("command/Commands"),
        CommandManager           = brackets.getModule("command/CommandManager"),
        DefaultDialogs           = brackets.getModule("widgets/DefaultDialogs"),
        Dialogs                  = brackets.getModule("widgets/Dialogs"),
        ExtensionUtils           = brackets.getModule("utils/ExtensionUtils"),
        FileSystem               = brackets.getModule("filesystem/FileSystem"),
        KeyBindingManager        = brackets.getModule("command/KeyBindingManager"),
        Menus                    = brackets.getModule("command/Menus"),
        NodeDomain               = brackets.getModule("utils/NodeDomain"),
        PreferencesManager       = brackets.getModule("preferences/PreferencesManager"),
        ProjectManager           = brackets.getModule("project/ProjectManager"),
        Strings                  = brackets.getModule("strings");

    const ExtensionStrings             = require("strings"),
        ImportFileDialogTemplate       = require("text!htmlContent/Import-File.html"),
        ImportSharedFileDialogTemplate = require("text!htmlContent/Import-Shared-File.html"),
        KeyboardPrefs                  = JSON.parse(require("text!keyboard.json"));

    const _domainPath = ExtensionUtils.getModulePath(module, "node/ImportDomain"),
        _nodeDomain = new NodeDomain("importNode", _domainPath);


    const FILE_COPY_FILE = "file.copy.file";
    const FILE_CUT_FILE = "file.cut.file";
    const FILE_DOWNLOAD = "file.download";
    const FILE_IMPORT_FILE = "file.import.file";
    const FILE_IMPORT_SHARED_FILE = "file.import.shared.file";
    const FILE_PASTE_FILE = "file.paste.file";
    let operation, selected, selectedFile, $fileListOutput;

    function showErrorDialog(message) {
        Dialogs.showModalDialog(
            DefaultDialogs.DIALOG_ID_ERROR,
            ExtensionStrings.ERROR_DIALOG_TITLE,
            message
        );
    }

    // Add '/' to the path when last char is not '/'.
    function cannonicalizeDirectoryPath(path) {
        if (path && path.length) {
            var lastChar = path[path.length - 1];
            if (lastChar !== "/") {
                path += "/";
            }
        }
        return path;
    }

    function convertUnixPathToWindowsPath(path) {
        if (brackets.platform === "win") {
            path = path.replace(new RegExp(/\//g), "\\");
        }
        return path;
    }

    // Add file name to file list when you select the files on your browser
    function handleFileSelect(event) {
        var files = event.target.files;
        var output = [];
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            output.push("<li>" + file.name+ "</li>");
        }

        $fileListOutput[0].innerHTML = "<ul>" + output.join("") + "</ul>";
    }

    function handleImportFile() {
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            var $dlg,
                $OkBtn,
                $importFileInput,
                $intoFolderInput,
                $changeFolderBtn,
                baseDirEntry;

            var selected = ProjectManager.getSelectedItem();

            if (!selected) {
                selected = ProjectManager.getProjectRoot();
            }

            if (selected.isFile) {
                baseDirEntry = FileSystem.getDirectoryForPath(selected.parentPath);
            }

            baseDirEntry = baseDirEntry || selected;

            // Get a string for the base path from directory object
            baseDirEntry = baseDirEntry.fullPath;

            var context = {
                Strings: Strings,
                ExtensionStrings: ExtensionStrings
            };

            var dialog = Dialogs.showModalDialogUsingTemplate(Mustache.render(ImportFileDialogTemplate, context));

            dialog.done(function (buttonId) {
                if (buttonId === "ok") {
                    var files = $importFileInput[0].files;

                    if (!files.length) {
                        showErrorDialog(ExtensionStrings.ERROR_MSG_SELECT_FILE);
                        return;
                    }

                    const loaded = function(file) {
                        return function(event) {
                            if (event.target.readyState === FileReader.DONE) {
                                var filePath = baseDirEntry + file.name;
                                var newFile = FileSystem.getFileForPath(filePath);
                                newFile.write(event.target.result);
                                ProjectManager.refreshFileTree();
                            }
                        };
                    };

                    // Write the selected files to the server
                    for (var i = 0; i < files.length; i++) {
                        var file = files[i];
                        var reader = new FileReader();

                        // Closure to capture the file information
                        reader.onloadend = loaded(file);
                        reader.readAsArrayBuffer(file);
                    }
                }
            });

            $dlg = dialog.getElement();
            $OkBtn = $dlg.find(".dialog-button[data-button-id='ok']");
            $importFileInput = $("#import-file", $dlg);
            $intoFolderInput = $("#into-folder", $dlg);
            $changeFolderBtn = $("#change-folder", $dlg);
            $fileListOutput = $("#file-list", $dlg);

            $importFileInput.on("change", handleFileSelect);

            $intoFolderInput.val(convertUnixPathToWindowsPath(baseDirEntry));

            $changeFolderBtn.click(function (e) {
                FileSystem.showOpenDialog(false, true, Strings.CHOOSE_FOLDER, baseDirEntry, null,
                    function (error, files) {
                        if (error) {
                            showErrorDialog(ExtensionStrings.ERROR_MSG_FOLDER_CHANGE);
                            return;
                        }

                        if (!error && files && files.length > 0 && files[0].length > 0) {
                            baseDirEntry = cannonicalizeDirectoryPath(files[0]);
                            $intoFolderInput.val(convertUnixPathToWindowsPath(baseDirEntry));
                        }
                    });

                e.preventDefault();
                e.stopPropagation();
            });
        } else {
            showErrorDialog(ExtensionStrings.ERROR_MSG_FILE_API);
        }
    }

    function handleImportSharedFile() {
        var $dlg,
            $OkBtn,
            $projectSelect,
            $fileListOutput,
            selectedProject,
            fileList;

        _nodeDomain.exec("getSharedProject").done(function(data) {
            var context = {
                Strings: Strings,
                ExtensionStrings: ExtensionStrings
            };

            var dialog = Dialogs.showModalDialogUsingTemplate(Mustache.render(ImportSharedFileDialogTemplate, context));

            $dlg = dialog.getElement();
            $OkBtn = $dlg.find(".dialog-button[data-button-id='ok']");
            $projectSelect = $("#project-select", $dlg);
            $fileListOutput = $("#file-list", $dlg);

            var options = [];
            data.forEach(function(project) {
                options.push("<option>" + project + "</option>");
            });
            $projectSelect[0].innerHTML = options.join("");

            function handleProjectSelect() {
                var options = $projectSelect[0].options;
                var selected = options[options.selectedIndex];
                selectedProject = selected.innerText;
                _nodeDomain.exec("getSharedFile", selectedProject).done(function(result) {
                    $OkBtn[0].disabled = false;
                    fileList = result;

                    var files = [];
                    result.forEach(function(file) {
                        files.push("<li>" + file + "</li>");
                    });
                    $fileListOutput[0].innerHTML = "<ul>"+files.join("")+"</ul>";

                }).fail(function() {
                    $OkBtn[0].disabled = true;

                    $fileListOutput[0].innerHTML = "Not found files";
                });
            }

            $projectSelect.on("change", handleProjectSelect);

            var selectedOtions = $projectSelect[0].options;
            if (selectedOtions.length) {
                $projectSelect.trigger("change");
            }

            dialog.done(function (buttonId) {
                if (buttonId === "ok") {
                    var projectId = PreferencesManager.getViewState("projectId");
                    if (!$OkBtn[0].disabled) {
                        _nodeDomain.exec("copySharedFile", selectedProject, fileList, projectId)
                            .done(function() {
                                ProjectManager.refreshFileTree();
                            }).fail(function(error) {
                                console.error(error);
                            });
                    }
                }
            });
        });
    }

    function handleCopyFile() {
        selectedFile = selected;
        operation = "COPY";
    }

    function handleCutFile() {
        selectedFile = selected;
        operation = "CUT";
    }

    // Remove unnecessary prefix path
    function convertRelativePath(path) {
        var newPath = path.split("/");
        newPath.splice(0, 2);
        return newPath.join("/");
    }

    function handlePasteFile() {
        selected = ProjectManager.getSelectedItem();
        if (selected) {
            let selectedPath = "";
            if (selected.isFile) {
                selectedPath = selected.parentPath;
            } else {
                selectedPath = selected.fullPath;
            }

            // Check incorrect copy
            if (selectedPath.startsWith(selectedFile.fullPath)) {
                return showErrorDialog(ExtensionStrings.ERROR_MSG_INCORRECT_COPY);
            }

            FileSystem.resolve(selectedFile.fullPath, (resolveError, entry) => {
                if (resolveError) {
                    return showErrorDialog(resolveError);
                }

                const projectId = PreferencesManager.getViewState("projectId");
                const sourcePath = convertRelativePath(entry.parentPath);
                const destPath = convertRelativePath(selectedPath);

                _nodeDomain.exec(operation, projectId, sourcePath, entry.name, destPath)
                    .done(() => {
                        ProjectManager.refreshFileTree();
                    }).fail((error) => {
                        console.error(error);
                    });

                selectedFile = null;
            });
        }
    }

    function handleDownloadFile() {
        const selected = ProjectManager.getSelectedItem();

        if (selected && selected.isFile) {
            const projectId = PreferencesManager.getViewState("projectId");
            const filePath = brackets.app.convertFilePathToServerPath(selected.fullPath, projectId);
            const anchor = document.createElement("a");
            anchor.href = filePath;
            anchor.download = selected.name;
            anchor.click();
        }
    }

    ExtensionUtils.loadStyleSheet(module, "styles/styles.css");

    CommandManager.register(ExtensionStrings.IMPORT_FILE_MENU_TITLE, FILE_IMPORT_FILE, handleImportFile);
    CommandManager.register(ExtensionStrings.IMPORT_SHARED_FILE_MENU_TITLE, FILE_IMPORT_SHARED_FILE, handleImportSharedFile);

    const copyCmd = CommandManager.register(ExtensionStrings.COPY_FILE, FILE_COPY_FILE, handleCopyFile);
    const cutCmd = CommandManager.register(ExtensionStrings.CUT_FILE, FILE_CUT_FILE, handleCutFile);
    const downloadCmd = CommandManager.register(ExtensionStrings.DOWNLOAD_FILE, FILE_DOWNLOAD, handleDownloadFile);
    const pasteCmd = CommandManager.register(ExtensionStrings.PASTE_FILE, FILE_PASTE_FILE, handlePasteFile);

    KeyBindingManager.addBinding(FILE_IMPORT_FILE, KeyboardPrefs.importfile);

    const contextMenu = Menus.getContextMenu(Menus.ContextMenuIds.PROJECT_MENU);
    contextMenu.addMenuItem(FILE_IMPORT_FILE, undefined, Menus.AFTER, Commands.FILE_NEW_FOLDER);

    contextMenu.addMenuItem(FILE_PASTE_FILE, undefined, Menus.AFTER, Commands.FILE_DELETE);
    contextMenu.addMenuItem(FILE_CUT_FILE, undefined, Menus.AFTER, Commands.FILE_DELETE);
    contextMenu.addMenuItem(FILE_COPY_FILE, undefined, Menus.AFTER, Commands.FILE_DELETE);
    contextMenu.addMenuDivider(Menus.AFTER, Commands.FILE_DELETE);

    contextMenu.addMenuItem(FILE_DOWNLOAD, undefined, Menus.AFTER, Commands.FILE_RENAME);
    contextMenu.addMenuDivider(Menus.AFTER, Commands.FILE_RENAME);

    function updateEnabledState() {
        selected = ProjectManager.getSelectedItem();

        copyCmd.setEnabled(selected);
        cutCmd.setEnabled(selected);
        downloadCmd.setEnabled(selected && selected.isFile);
        pasteCmd.setEnabled(selected && selectedFile);
    }

    contextMenu.on("beforeContextMenuOpen", updateEnabledState);

    const fileMenu = Menus.getMenu(Menus.AppMenuBar.FILE_MENU);
    fileMenu.addMenuItem(FILE_IMPORT_FILE, undefined, Menus.AFTER, Commands.FILE_OPEN);

    const projectType = PreferencesManager.getViewState("projectType");
    if (projectType === "web") {
        fileMenu.addMenuItem(FILE_IMPORT_SHARED_FILE, undefined, Menus.AFTER, FILE_IMPORT_FILE);
    }
});
